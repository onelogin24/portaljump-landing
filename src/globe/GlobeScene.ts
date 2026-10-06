// Lazy-loaded: pulls in Three.js. Everything is imported by name so the bundler can tree-shake.
import {
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  LinearMipmapLinearFilter,
  LinearFilter,
  RepeatWrapping,
  ClampToEdgeWrapping,
} from 'three';
import { CAM_DIST, FOV_DEG } from './projection';

export type GlobeApi = {
  render(lonCenter: number, tilt: number): void;
  resize(cssSize: number, dpr: number): void;
  dispose(): void;
};

const RAD = Math.PI / 180;

const globeVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

// Colour (ocean #3B7FD0 -> shallows, soft greens, sand, ice) and hillshaded terrain are baked into the albedo by
// scripts/build-assets.mjs, so this shader only does lighting, limb darkening and the thin rim.
const globeFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uAlbedo;
  uniform vec3 uLight;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;

  void main() {
    vec3 col = texture2D(uAlbedo, vUv).rgb;

    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    vec3 L = normalize(uLight);

    // light from the upper left with a soft terminator
    float lit = smoothstep(-0.4, 0.7, dot(N, L));
    col *= mix(0.6, 1.07, lit);

    // limb: ocean/land drift toward #2A5FB0 at the edge
    float nv = max(dot(N, V), 0.0);
    col = mix(col, vec3(0.165, 0.373, 0.69), pow(1.0 - nv, 2.4) * 0.55);

    // thin, soft atmospheric rim
    col += vec3(0.5, 0.76, 1.0) * pow(1.0 - nv, 5.0) * 0.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const atmoVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

// Drawn first, under the opaque globe: only a thin ring (~4% of the radius) outside the silhouette stays visible.
// Colour is unpremultiplied; three blends with SRC_ALPHA and the canvas is premultiplied, which is correct.
const atmoFrag = /* glsl */ `
  precision highp float;
  uniform float uThresh;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float nz = max(dot(normalize(vN), normalize(vV)), 0.0);
    float a = pow(smoothstep(0.0, uThresh, nz), 1.7) * 0.5;
    gl_FragColor = vec4(0.62, 0.82, 1.0, a);
  }
`;

export async function createGlobe(canvas: HTMLCanvasElement, opts: { albedoUrl: string; antialias: boolean }): Promise<GlobeApi> {
  const renderer = new WebGLRenderer({ canvas, antialias: opts.antialias, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV_DEG, 1, 0.1, 30);
  camera.position.set(0, 0, CAM_DIST);

  const albedo = await new Promise<import('three').Texture>((resolve, reject) => {
    new TextureLoader().load(opts.albedoUrl, resolve, undefined, reject);
  });
  albedo.wrapS = RepeatWrapping;
  albedo.wrapT = ClampToEdgeWrapping;
  albedo.minFilter = LinearMipmapLinearFilter;
  albedo.magFilter = LinearFilter;
  albedo.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  albedo.needsUpdate = true;

  const geo = new SphereGeometry(1, 96, 64);
  const globeMat = new ShaderMaterial({
    vertexShader: globeVert,
    fragmentShader: globeFrag,
    uniforms: { uAlbedo: { value: albedo }, uLight: { value: new Vector3(-0.62, 0.5, 0.6) } },
    transparent: true, // keeps draw order explicit relative to the atmosphere
  });
  const globe = new Mesh(geo, globeMat);
  globe.renderOrder = 1;

  const atmoScale = 1.04;
  const atmoMat = new ShaderMaterial({
    vertexShader: atmoVert,
    fragmentShader: atmoFrag,
    uniforms: { uThresh: { value: Math.sqrt(1 - 1 / (atmoScale * atmoScale)) } },
    transparent: true,
    depthWrite: false,
  });
  const atmo = new Mesh(new SphereGeometry(atmoScale, 64, 48), atmoMat);
  atmo.renderOrder = 0;

  scene.add(atmo, globe);

  return {
    render(lonCenter, tilt) {
      globe.rotation.set(tilt * RAD, -(90 + lonCenter) * RAD, 0);
      renderer.render(scene, camera);
    },
    resize(cssSize, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(cssSize, cssSize, false);
    },
    dispose() {
      geo.dispose();
      atmo.geometry.dispose();
      globeMat.dispose();
      atmoMat.dispose();
      albedo.dispose();
      renderer.dispose();
    },
  };
}
