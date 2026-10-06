// Shared camera/rotation model. The Three.js scene (GlobeScene.ts) and the DOM/SVG overlay (pins, arcs, nodes,
// rings) all use these constants, so everything stays glued to the surface without reading back from WebGL.

/** Camera distance from the globe centre (globe radius = 1). Large => near-orthographic, like the reference. */
export const CAM_DIST = 7;
/** Globe diameter as a fraction of the (square) stage; the rest is room for the thin atmosphere. */
export const GLOBE_FILL = 0.9;

export const TAN_HALF_FOV = 1 / (GLOBE_FILL * Math.sqrt(CAM_DIST * CAM_DIST - 1));
export const FOV_DEG = (2 * Math.atan(TAN_HALF_FOV) * 180) / Math.PI;

export const INIT_LON = -30;
export const INIT_TILT = 15;
export const TILT_MAX = 30;

const RAD = Math.PI / 180;
/** z (toward camera) above which a surface point is on the visible side of the horizon. */
export const HORIZON_Z = 1 / CAM_DIST;
/** pins/arcs fade from 0 at FADE_START to full at FADE_END, so nothing is ever drawn ghosted at the limb */
const FADE_START = HORIZON_Z + 0.012;
const FADE_END = 0.3;

export type Vec3 = [number, number, number];
export type Projected = {
  /** normalised device coords, -1..1, y up */
  nx: number;
  ny: number;
  /** depth toward the camera after rotation (1 = centre of the disc, ~0 = limb) */
  z: number;
  /** 0 on the horizon / back side, 1 comfortably facing the camera (smoothed) */
  facing: number;
};

export type Rot = { ca: number; sa: number; cb: number; sb: number };

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

export const newProjected = (): Projected => ({ nx: 0, ny: 0, z: 0, facing: 0 });

/** Unit vector for (lat, lon) on a THREE.SphereGeometry (u = 0 at lon -180). */
export function latLonToVec(lat: number, lon: number): Vec3 {
  const la = lat * RAD;
  const lo = lon * RAD;
  return [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)];
}

/** Rotation that puts longitude `lonCenter` facing the camera and tilts the north pole `tilt` deg toward the viewer.
 *  Mirrors mesh.rotation.set(tilt, -(90 + lonCenter), 0). */
export function makeRot(lonCenter: number, tilt: number): Rot {
  const a = -(90 + lonCenter) * RAD;
  const b = tilt * RAD;
  return { ca: Math.cos(a), sa: Math.sin(a), cb: Math.cos(b), sb: Math.sin(b) };
}

export function projectVec(v: Vec3, r: Rot, out: Projected): Projected {
  const [x, y, z] = v;
  const x1 = x * r.ca + z * r.sa;
  const z1 = -x * r.sa + z * r.ca;
  const y2 = y * r.cb - z1 * r.sb;
  const z2 = y * r.sb + z1 * r.cb;
  const d = (CAM_DIST - z2) * TAN_HALF_FOV;
  out.nx = x1 / d;
  out.ny = y2 / d;
  out.z = z2;
  out.facing = smooth((z2 - FADE_START) / (FADE_END - FADE_START));
  return out;
}

/** Project a point that is NOT attached to the globe (e.g. the orbit rings): camera space, no rotation. */
export function projectCamera(x: number, y: number, z: number, out: { nx: number; ny: number }) {
  const d = (CAM_DIST - z) * TAN_HALF_FOV;
  out.nx = x / d;
  out.ny = y / d;
}
