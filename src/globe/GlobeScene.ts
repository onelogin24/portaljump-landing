// Lazy-loaded: pulls in Three.js. Everything is imported by name so the bundler can tree-shake.
import {
  Matrix3,
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
  type Texture,
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

// Shared lighting. Colour is the painted albedo baked by scripts/build-assets.mjs; this adds a soft key light from the
// upper left with a gentle terminator (the dark side never drops below 0.5). textureGrad lets the glass shell sample with
// explicit gradients, so the seam of its computed UVs never shows.
const shadeChunk = /* glsl */ `
  uniform sampler2D uAlbedo;
  uniform vec3 uLight;

  vec3 shade(vec2 uv, vec2 dx, vec2 dy, vec3 N) {
    vec3 col = textureGrad(uAlbedo, uv, dx, dy).rgb;
    float ndl = dot(N, normalize(uLight));
    return col * mix(0.5, 1.06, smoothstep(-0.3, 0.65, ndl));
  }
`;

const globeFrag = /* glsl */ `
  precision highp float;
  ${shadeChunk}
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    vec3 col = shade(vUv, dFdx(vUv), dFdy(vUv), N);
    // a breath of atmosphere inside the limb, continuous with the outer halo
    float nv = max(dot(N, V), 0.0);
    col += vec3(0.806, 0.849, 0.912) * pow(1.0 - nv, 4.5) * 0.3;
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

// Drawn first, under the opaque globe: a thin (2.5%) Fresnel halo, #9CC8FF, fading smoothly to nothing outward.
const atmoFrag = /* glsl */ `
  precision highp float;
  uniform float uThresh;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float nz = max(dot(normalize(vN), normalize(vV)), 0.0);
    float a = pow(smoothstep(0.0, uThresh, nz), 2.2) * 0.6;
    gl_FragColor = vec4(0.612, 0.784, 1.0, a);
  }
`;

// Glass shell at 1.06: a lens, not a bubble. Each rim fragment re-traces its view ray onto the globe with the
// direction bent by the Fresnel term (refraction), per colour channel (fringe), plus one soft highlight at 45 degrees.
const shellVert = /* glsl */ `
  varying vec3 vP;
  varying vec3 vNo;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vP = position;
    vNo = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const shellFrag = /* glsl */ `
  precision highp float;
  ${shadeChunk}
  uniform vec3 uCamObj;
  uniform mat3 uRot;
  uniform float uRefract;
  uniform float uFringe;
  varying vec3 vP;
  varying vec3 vNo;
  varying vec3 vN;
  varying vec3 vV;

  // uv on the unit sphere, same layout as three's SphereGeometry; gradients stay continuous across the seam
  void sphereUv(vec3 p, out vec2 uv, out vec2 dx, out vec2 dy) {
    float u0 = atan(p.z, -p.x) / 6.2831853;
    float u1 = fract(u0);
    bool useU1 = fwidth(u1) < fwidth(u0);
    uv = vec2(u1, 0.5 + asin(clamp(p.y, -1.0, 1.0)) / 3.14159265);
    // clamped: neighbouring pixels that miss the globe would otherwise blow the gradients up and smear the mip level
    dx = clamp(vec2(useU1 ? dFdx(u1) : dFdx(u0), dFdx(uv.y)), -0.003, 0.003);
    dy = clamp(vec2(useU1 ? dFdy(u1) : dFdy(u0), dFdy(uv.y)), -0.003, 0.003);
  }

  // globe colour at point p (object space), lit from the shell fragment's view direction
  vec3 globeAt(vec3 p) {
    vec2 uv; vec2 dx; vec2 dy;
    sphereUv(normalize(p), uv, dx, dy);
    return shade(uv, dx, dy, normalize(uRot * normalize(p)));
  }

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    float nv = max(dot(N, V), 0.0);
    float fres = pow(1.0 - nv, 3.0);

    // refraction: bend the view ray by the Fresnel term, then find where it lands on the globe
    vec3 d = normalize(vP - uCamObj);
    vec3 dir = normalize(d - normalize(vNo) * fres * uRefract * 0.45);
    float bq = dot(uCamObj, dir);
    float disc = bq * bq - (dot(uCamObj, uCamObj) - 1.0);
    float hit = disc >= 0.0 ? 1.0 : 0.0;
    vec3 p = uCamObj + dir * (-bq - sqrt(max(disc, 0.0)));

    // colour fringe: red and blue sample a hair either side along the rim's outward direction
    vec3 t = normalize(vNo) - p * dot(normalize(vNo), p);
    vec3 off = t * fres * uFringe * 0.12;
    vec3 refr = vec3(globeAt(p + off).r, globeAt(p).g, globeAt(p - off).b);

    // only the edge refracts: nothing at the centre, full strength toward the rim, gone again outside the globe's silhouette
    float edge = (1.0 - smoothstep(0.3, 0.62, nv)) * smoothstep(0.33, 0.5, nv);
    float a = edge * hit * 0.85;

    // one soft highlight, upper left at 45 degrees, composited over the refracted rim
    vec3 Hh = normalize(vec3(-0.7071, 0.7071, 0.55));
    float hl = pow(max(dot(N, Hh), 0.0), 90.0) * 0.32;
    float outA = a * (1.0 - hl) + hl;
    vec3 col = (refr * a * (1.0 - hl) + vec3(hl)) / max(outA, 0.0001);
    gl_FragColor = vec4(col, outA);
  }
`;

export async function createGlobe(canvas: HTMLCanvasElement, opts: { albedoUrl: string; albedoUrlHi?: string; antialias: boolean }): Promise<GlobeApi> {
  const renderer = new WebGLRenderer({ canvas, antialias: opts.antialias, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV_DEG, 1, 0.1, 30);
  camera.position.set(0, 0, CAM_DIST);

  const loader = new TextureLoader();
  const load = (url: string) => new Promise<Texture>((resolve, reject) => loader.load(url, resolve, undefined, reject));
  // the 8192 map is only fetched when the GPU can hold it; everything else gets the regular one
  const useHi = !!opts.albedoUrlHi && renderer.capabilities.maxTextureSize >= 8192;
  const albedo = await load(useHi ? opts.albedoUrlHi! : opts.albedoUrl);
  albedo.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  albedo.wrapS = RepeatWrapping;
  albedo.wrapT = ClampToEdgeWrapping;
  albedo.minFilter = LinearMipmapLinearFilter;
  albedo.magFilter = LinearFilter;
  albedo.needsUpdate = true;

  const sharedUniforms = {
    uAlbedo: { value: albedo },
    uLight: { value: new Vector3(-0.62, 0.5, 0.6) },
  };

  const geo = new SphereGeometry(1, 96, 64);
  const globeMat = new ShaderMaterial({
    vertexShader: globeVert,
    fragmentShader: globeFrag,
    uniforms: { ...sharedUniforms },
    transparent: true, // keeps draw order explicit relative to the atmosphere
  });
  const globe = new Mesh(geo, globeMat);
  globe.renderOrder = 1;

  const atmoScale = 1.025;
  const atmoMat = new ShaderMaterial({
    vertexShader: atmoVert,
    fragmentShader: atmoFrag,
    uniforms: { uThresh: { value: Math.sqrt(1 - 1 / (atmoScale * atmoScale)) } },
    transparent: true,
    depthWrite: false,
  });
  const atmo = new Mesh(new SphereGeometry(atmoScale, 64, 48), atmoMat);
  atmo.renderOrder = 0;

  const uRot = { value: new Matrix3() };
  const uCamObj = { value: new Vector3() };
  const shellMat = new ShaderMaterial({
    vertexShader: shellVert,
    fragmentShader: shellFrag,
    uniforms: { ...sharedUniforms, uRot, uCamObj, uRefract: { value: 0.035 }, uFringe: { value: 0.15 } },
    transparent: true,
    depthWrite: false,
  });
  const shell = new Mesh(new SphereGeometry(1.06, 96, 64), shellMat);
  shell.renderOrder = 2;

  scene.add(atmo, globe, shell);

  const tmp = new Vector3();
  return {
    render(lonCenter, tilt) {
      globe.rotation.set(tilt * RAD, -(90 + lonCenter) * RAD, 0);
      shell.rotation.copy(globe.rotation);
      globe.updateMatrixWorld();
      // the camera has no rotation, so view-space = world-space rotation; the shell traces rays in globe space
      uRot.value.setFromMatrix4(globe.matrixWorld);
      uCamObj.value.copy(globe.worldToLocal(tmp.copy(camera.position)));
      renderer.render(scene, camera);
    },
    resize(cssSize, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(cssSize, cssSize, false);
    },
    dispose() {
      geo.dispose();
      atmo.geometry.dispose();
      shell.geometry.dispose();
      globeMat.dispose();
      atmoMat.dispose();
      shellMat.dispose();
      albedo.dispose();
      renderer.dispose();
    },
  };
}
