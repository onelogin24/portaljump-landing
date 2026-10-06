// Generates every static asset the landing page needs. Run: npm run assets   (~1-2 min, output is committed)
//
//  public/textures/earth-albedo-4096.webp  desktop globe colour map (baked: ocean, coast shallows, land, deserts,
//  public/textures/earth-albedo-2048.webp  mobile variant           hillshaded terrain, ice) - no runtime noise
//     inputs (public domain): Natural Earth 10m land (scripts/data/ne_10m_land.geojson) and an elevation map
//     (scripts/data/earth-topology.png, from the three-globe npm package's example imagery)
//  public/clouds/*.webp   painterly cloud banks, rendered once here with domain-warped fBm noise
//  public/moon.webp       shaded crescent with faint maria / crater texture
//  public/avatars/*.svg   DiceBear "notionists" (CC0), generated locally
//  public/fonts/*.woff2   self-hosted Inter (latin) 400 / 500 / 700 and Inter Tight 400 / 700 (hero headline + subhead)
//  src/generated/assets.json  manifest consumed by the app. Drop PNGs into public/assets/avatars/ or
//     public/assets/clouds-{left,right,base}.png and re-run to use them instead of the generated ones.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';

const root = path.resolve(import.meta.dirname, '..');
const pub = (...p) => path.join(root, 'public', ...p);
const data = (...p) => path.join(root, 'scripts', 'data', ...p);
for (const d of ['textures', 'clouds', 'avatars', 'fonts']) {
  fs.rmSync(pub(d), { recursive: true, force: true });
  fs.mkdirSync(pub(d), { recursive: true });
}
fs.mkdirSync(path.join(root, 'src', 'generated'), { recursive: true });

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const t0 = Date.now();
const lap = (label) => console.log(`  ${label} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);

// ---------- noise ----------
function hash2(x, y, seed) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
function vnoise2(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = fade(x - xi);
  const fy = fade(y - yi);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
function fbm2(x, y, oct, seed = 0) {
  let v = 0;
  let a = 0.5;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    v += a * vnoise2(x, y, seed + i * 17);
    norm += a;
    x = x * 2.03 + 11.3;
    y = y * 2.03 + 7.1;
    a *= 0.5;
  }
  return v / norm;
}
// seamless 3D value noise for the globe (sampled on the unit sphere: no seam, no pole pinching)
function hash3(x, y, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise3(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fx = fade(x - xi);
  const fy = fade(y - yi);
  const fz = fade(z - zi);
  const l = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  const x1 = l(0, 0, 0) + (l(1, 0, 0) - l(0, 0, 0)) * fx;
  const x2 = l(0, 1, 0) + (l(1, 1, 0) - l(0, 1, 0)) * fx;
  const x3 = l(0, 0, 1) + (l(1, 0, 1) - l(0, 0, 1)) * fx;
  const x4 = l(0, 1, 1) + (l(1, 1, 1) - l(0, 1, 1)) * fx;
  const y1 = x1 + (x2 - x1) * fy;
  const y2 = x3 + (x4 - x3) * fy;
  return y1 + (y2 - y1) * fz;
}
function fbm3(x, y, z, oct) {
  let v = 0;
  let a = 0.5;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    v += a * vnoise3(x, y, z);
    norm += a;
    x *= 2.03;
    y *= 2.03;
    z *= 2.03;
    a *= 0.5;
  }
  return v / norm;
}

// ---------- fonts ----------
for (const w of [400, 500, 700]) {
  fs.copyFileSync(
    path.join(root, 'node_modules/@fontsource/inter/files', `inter-latin-${w}-normal.woff2`),
    pub('fonts', `inter-${w}.woff2`),
  );
}
for (const w of [400, 700]) {
  fs.copyFileSync(
    path.join(root, 'node_modules/@fontsource/inter-tight/files', `inter-tight-latin-${w}-normal.woff2`),
    pub('fonts', `inter-tight-${w}.woff2`),
  );
}
console.log('fonts');

// ---------- land: Natural Earth 10m, rasterised at 2x then box-filtered to 4096x2048 ----------
const AW = 4096;
const AH = 2048;
const SW = AW * 2;
const SH = AH * 2;
const big = new Uint8Array(SW * SH);
const px = (lon) => ((lon + 180) / 360) * SW;
const py = (lat) => ((90 - lat) / 180) * SH;

// Rings that cross the antimeridian jump ~360 deg between neighbours: unwrap and draw shifted by -360/0/+360.
// (Antarctica is left alone: its ring runs along the pole and already rasterises correctly.)
function unwrap(ring) {
  const out = [[ring[0][0], ring[0][1]]];
  let off = 0;
  for (let i = 1; i < ring.length; i++) {
    const d = ring[i][0] - ring[i - 1][0];
    if (d > 180) off -= 360;
    else if (d < -180) off += 360;
    out.push([ring[i][0] + off, ring[i][1]]);
  }
  return out;
}
const crossesAntimeridian = (rings) =>
  rings.some((r) => r.some((p, i) => i > 0 && Math.abs(p[0] - r[i - 1][0]) > 180)) && rings.every((r) => r.every((p) => p[1] > -80));

function fillRings(rings, shift) {
  const edges = [];
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      let [x0, y0] = [px(ring[i][0]) + shift, py(ring[i][1])];
      let [x1, y1] = [px(ring[i + 1][0]) + shift, py(ring[i + 1][1])];
      if (y0 === y1) continue;
      if (y0 > y1) [x0, y0, x1, y1] = [x1, y1, x0, y0];
      edges.push([x0, y0, x1, y1]);
    }
  }
  let minY = Infinity;
  let maxY = -Infinity;
  for (const e of edges) {
    minY = Math.min(minY, e[1]);
    maxY = Math.max(maxY, e[3]);
  }
  for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(SH - 1, Math.ceil(maxY)); y++) {
    const sy = y + 0.5;
    const xs = [];
    for (const [x0, y0, x1, y1] of edges) {
      if (sy >= y0 && sy < y1) xs.push(x0 + ((sy - y0) / (y1 - y0)) * (x1 - x0));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const a = Math.max(0, Math.round(xs[i]));
      const b = Math.min(SW, Math.round(xs[i + 1]));
      for (let x = a; x < b; x++) big[y * SW + x] = 255;
    }
  }
}
function fillPolygon(rings) {
  if (crossesAntimeridian(rings)) {
    const un = rings.map(unwrap);
    for (const shift of [-SW, 0, SW]) fillRings(un, shift);
  } else {
    fillRings(rings, 0);
  }
}
const land = JSON.parse(fs.readFileSync(data('ne_10m_land.geojson'), 'utf8'));
for (const f of land.features) {
  const g = f.geometry;
  if (g.type === 'Polygon') fillPolygon(g.coordinates);
  else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) fillPolygon(poly);
}
lap('land rasterised (10m, 8192x4096)');

// sharp promotes 1-channel input to 3 channels after resize/blur; force greyscale so buffers stay w*h long
const raw1 = (w, h) => ({ raw: { width: w, height: h, channels: 1 } });
const grey = (s) => s.toColourspace('b-w').raw().toBuffer();
const L = await grey(sharp(Buffer.from(big.buffer), raw1(SW, SH)).resize(AW, AH, { kernel: 'lanczos2' })); // crisp, anti-aliased land
const SHORE = await grey(sharp(L, raw1(AW, AH)).blur(12)); // blurred land: >0 just offshore
if (L.length !== AW * AH || SHORE.length !== AW * AH) throw new Error('land buffer size mismatch');

// ---------- terrain: elevation map -> hillshade ----------
const topo = await grey(sharp(data('earth-topology.png')).resize(AW, AH, { kernel: 'cubic' }));
if (topo.length !== AW * AH) throw new Error('topology buffer size mismatch');
const E = new Float32Array(AW * AH);
for (let y = 0; y < AH; y++) {
  for (let x = 0; x < AW; x++) {
    const i = y * AW + x;
    const base = topo[i] / 250;
    // add fine detail that scales with height so ranges look crisp at 4096
    const detail = base > 0.015 ? (fbm2(x / 38, y / 38, 4, 3) - 0.5) * 0.09 * smoothstep(0.015, 0.2, base) : 0;
    E[i] = Math.max(0, base + detail);
  }
}
lap('terrain');

// deserts: soft ellipses (lat, lon, half-height deg, half-width deg, strength)
const deserts = [
  [23.5, 12, 8.5, 29, 1],
  [24, 45, 8, 11, 1],
  [31, 8, 3, 8, 0.7],
  [42, 103, 5, 14, 0.8],
  [-25, 134, 9, 15, 0.9],
  [34, -112, 5, 6.5, 0.8],
  [-23, 22, 5, 7, 0.8],
  [27, 71, 3.5, 5, 0.8],
  [32, 56, 4.5, 8, 0.8],
  [-26, -69, 4, 3, 0.6],
];
const DESERT = new Uint8Array(AW * AH);
for (let y = 0; y < AH; y++) {
  const lat = 90 - ((y + 0.5) / AH) * 180;
  for (let x = 0; x < AW; x++) {
    const lon = ((x + 0.5) / AW) * 360 - 180;
    let v = 0;
    for (const [la, lo, rh, rw, s] of deserts) {
      const d = ((lat - la) / rh) ** 2 + ((lon - lo) / rw) ** 2;
      if (d < 1) v = Math.max(v, (1 - d) ** 1.3 * s);
    }
    DESERT[y * AW + x] = Math.round(v * 255);
  }
}
const DESERTB = await grey(sharp(Buffer.from(DESERT.buffer), raw1(AW, AH)).blur(10));

// ---------- bake the albedo ----------
const OCEAN_A = [0.231, 0.498, 0.816]; // #3B7FD0
const OCEAN_B = [0.19, 0.42, 0.75];
const SHALLOW = [0.43, 0.73, 0.93];
const GREEN_A = [0.53, 0.75, 0.43];
const GREEN_B = [0.68, 0.83, 0.55];
const FOREST = [0.38, 0.63, 0.38];
const BOREAL = [0.42, 0.63, 0.46];
const TUNDRA = [0.74, 0.8, 0.72];
const HIGHLAND = [0.74, 0.75, 0.55];
const ROCK = [0.86, 0.85, 0.82];
const SAND_A = [0.93, 0.85, 0.63];
const SAND_B = [0.85, 0.73, 0.5];
const ICE = [0.95, 0.97, 1.0];

const albedo = Buffer.alloc(AW * AH * 3);
for (let y = 0; y < AH; y++) {
  const lat = (0.5 - (y + 0.5) / AH) * Math.PI;
  const latDeg = (lat * 180) / Math.PI;
  const alat = Math.abs(lat);
  const cl = Math.cos(lat);
  const sl = Math.sin(lat);
  for (let x = 0; x < AW; x++) {
    const i = y * AW + x;
    const lon = ((x + 0.5) / AW) * 2 * Math.PI - Math.PI;
    const lonDeg = (lon * 180) / Math.PI;
    const p0 = cl * Math.cos(lon);
    const p1 = sl;
    const p2 = -cl * Math.sin(lon);

    const isLand = L[i] / 255;
    const shore = SHORE[i] / 255;
    const rag = (fbm3(p0 * 12, p1 * 12, p2 * 12, 3) - 0.5) * 0.12;

    // ocean: cerulean, gentle swells, bright shallows hugging the coast
    const swell = fbm3(p0 * 5, p1 * 5, p2 * 5, 4);
    let col = mix3(OCEAN_A, OCEAN_B, smoothstep(0.35, 0.7, swell) * 0.7);
    col = mix3(col, SHALLOW, smoothstep(0.03, 0.5, shore) * 0.8);

    if (isLand > 0.002) {
      const e = E[i];
      const blotch = fbm3(p0 * 10, p1 * 10, p2 * 10, 5);
      const patch = fbm3(p0 * 24 + 5, p1 * 24, p2 * 24, 4);
      let c = mix3(GREEN_A, GREEN_B, blotch);
      c = mix3(c, FOREST, smoothstep(0.55, 0.85, patch) * 0.55);
      c = mix3(c, BOREAL, smoothstep(0.85, 1.1, alat) * 0.75);
      c = mix3(c, TUNDRA, smoothstep(1.15, 1.32, alat + rag));
      // arid zones
      const dz = smoothstep(0.1, 0.55, (DESERTB[i] / 255) * (0.45 + 1.2 * fbm3(p0 * 22, p1 * 22, p2 * 22, 4)));
      c = mix3(c, mix3(SAND_A, SAND_B, blotch), dz);
      // elevation: tan highlands, bare rock, snow caps
      c = mix3(c, HIGHLAND, smoothstep(0.2, 0.45, e) * 0.85);
      c = mix3(c, ROCK, smoothstep(0.5, 0.75, e));
      // hillshade, light from the upper left
      const xm = x > 0 ? i - 1 : i;
      const xp = x < AW - 1 ? i + 1 : i;
      const ym = y > 0 ? i - AW : i;
      const yp = y < AH - 1 ? i + AW : i;
      const shade = Math.max(-0.32, Math.min(0.32, ((E[xp] - E[xm]) * 0.7 + (E[yp] - E[ym]) * 0.7) * 11));
      const k = 1 + shade * (0.55 + 0.9 * smoothstep(0.02, 0.3, e));
      c = [c[0] * k, c[1] * k, c[2] * k];
      // ice: Antarctica, Greenland and the highest peaks
      const gl = ((latDeg - 72) / 12.5) ** 2 + ((lonDeg + 42) / 25) ** 2;
      const greenland = smoothstep(1.0, 0.6, gl + rag * 3);
      const antarctic = smoothstep(1.08, 1.17, -lat + rag);
      const arctic = smoothstep(1.34, 1.46, alat + rag);
      const peaks = smoothstep(0.78, 0.92, e);
      c = mix3(c, ICE, Math.max(greenland, antarctic, arctic, peaks));
      col = mix3(col, c, isLand);
    }
    // pack ice around the poles
    col = mix3(col, ICE, smoothstep(1.36, 1.5, alat + rag) * (1 - isLand));

    const o = i * 3;
    albedo[o] = Math.round(clamp01(col[0]) * 255);
    albedo[o + 1] = Math.round(clamp01(col[1]) * 255);
    albedo[o + 2] = Math.round(clamp01(col[2]) * 255);
  }
  if (y % 512 === 0) lap(`albedo row ${y}/${AH}`);
}
const albedo4096 = await sharp(albedo, { raw: { width: AW, height: AH, channels: 3 } })
  .webp({ quality: 84, smartSubsample: true, effort: 5 })
  .toBuffer();
fs.writeFileSync(pub('textures', 'earth-albedo-4096.webp'), albedo4096);
const albedo2048 = await sharp(albedo, { raw: { width: AW, height: AH, channels: 3 } })
  .resize(2048, 1024, { kernel: 'lanczos3' })
  .webp({ quality: 84, smartSubsample: true, effort: 5 })
  .toBuffer();
fs.writeFileSync(pub('textures', 'earth-albedo-2048.webp'), albedo2048);
console.log('earth-albedo-4096.webp', (albedo4096.length / 1024).toFixed(0), 'KB;  earth-albedo-2048.webp', (albedo2048.length / 1024).toFixed(0), 'KB');

// ---------- clouds (rendered once with domain-warped fBm; shipped as static WebP) ----------
// profile(u) -> height (0..1 of the image) of the cloud top at distance u (0..1) from the screen corner
function renderCloud({ w, h, seed, corner, profile, aspect = 1.2, feather = 0 }) {
  const buf = Buffer.alloc(w * h * 4);
  const uOf = (x) => (corner === 'right' ? 1 - x / w : x / w);
  const dens = (x, y) => {
    const u = uOf(x);
    const v = y / h;
    const nx = u * aspect * 3.4;
    const ny = v * 3.4;
    const wx = fbm2(nx * 0.9 + 1.7, ny * 0.9 + 9.2, 4, seed);
    const wy = fbm2(nx * 0.9 + 5.3, ny * 0.9 + 2.8, 4, seed + 31);
    const n = fbm2(nx * 1.15 + wx * 1.7, ny * 1.15 + wy * 1.7, 6, seed + 67);
    return n + (v - profile(u)) * 2.5 - 0.5;
  };
  const SHADOW = [0.58, 0.67, 0.85];
  const MIDC = [0.83, 0.89, 0.98];
  const LIGHT = [1, 1, 1];
  const PEACH = [1.0, 0.79, 0.64];
  const step = 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = dens(x, y);
      let alpha = smoothstep(0.0, 0.13, d);
      if (alpha <= 0) continue;
      const u = uOf(x);
      const v = y / h;
      // light comes from above: lit = how much the 2D surface normal (pointing out of the cloud) faces up
      const gx = (dens(x + step, y) - dens(x - step, y)) / (2 * step);
      const gy = (dens(x, y + step) - dens(x, y - step)) / (2 * step);
      const glen = Math.hypot(gx, gy) || 1e-6;
      const nxo = -gx / glen; // outward normal x
      const nyo = -gy / glen; // outward normal y (image y points down)
      const lit = clamp01((nxo * -0.25 + nyo * -0.95) * 0.5 + 0.5) * smoothstep(0.0, 0.004, glen);
      const top = profile(u);
      const hb = 1 - smoothstep(top, top + 0.55, v); // brighter near the top, bluer lower down
      const b = clamp01(0.5 * lit + 0.62 * hb + 0.08);
      let c = b < 0.5 ? mix3(SHADOW, MIDC, b * 2) : mix3(MIDC, LIGHT, (b - 0.5) * 2);
      // warm peach light on thin edges, strongest in the lower half (horizon glow)
      const rim = 1 - smoothstep(0.0, 0.32, d);
      const warm = clamp01(rim * (0.3 + 0.7 * smoothstep(0.3, 1.0, v)) * 0.95 + (1 - b) * 0.12 * smoothstep(0.4, 1, v));
      c = mix3(c, PEACH, warm);
      if (feather) alpha *= 1 - smoothstep(1 - feather, 1, v);
      const o = (y * w + x) * 4;
      buf[o] = Math.round(clamp01(c[0]) * 255);
      buf[o + 1] = Math.round(clamp01(c[1]) * 255);
      buf[o + 2] = Math.round(clamp01(c[2]) * 255);
      buf[o + 3] = Math.round(clamp01(alpha) * 255);
    }
  }
  return buf;
}
async function writeCloud(name, spec, smallW) {
  const buf = renderCloud(spec);
  const img = sharp(buf, { raw: { width: spec.w, height: spec.h, channels: 4 } });
  const full = await img.clone().webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer();
  fs.writeFileSync(pub('clouds', `${name}.webp`), full);
  const small = await img.clone().resize(smallW, Math.round((spec.h / spec.w) * smallW)).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toBuffer();
  fs.writeFileSync(pub('clouds', `${name}-${smallW}.webp`), small);
  console.log(`${name}.webp ${(full.length / 1024).toFixed(0)} KB, ${name}-${smallW}.webp ${(small.length / 1024).toFixed(0)} KB`);
}
// tallest at the screen edge, falling away toward the centre
const cornerProfile = (peak, base, curve) => (u) => peak + (base - peak) * Math.pow(Math.min(1, u * 1.05), curve);
await writeCloud('cloud-left', { w: 1100, h: 740, seed: 11, corner: 'left', aspect: 1.49, profile: cornerProfile(0.04, 0.92, 0.85) }, 560);
lap('cloud-left');
await writeCloud('cloud-right', { w: 1280, h: 600, seed: 29, corner: 'right', aspect: 2.13, profile: cornerProfile(0.02, 0.9, 0.9) }, 640);
lap('cloud-right');
// low bank that tucks under the globe: highest in the middle, tapering to both ends, feathered at the bottom
await writeCloud('cloud-base', { w: 900, h: 300, seed: 5, corner: 'left', aspect: 3, feather: 0.22, profile: (u) => 0.18 + 0.7 * Math.pow(Math.abs(2 * u - 1), 1.4) }, 450);
lap('cloud-base');

// ---------- moon: lit crescent with faint maria and craters ----------
{
  const N = 280;
  const buf = Buffer.alloc(N * N * 4);
  const lx = -0.95;
  const ly = -0.12;
  const lz = -0.22;
  const ll = Math.hypot(lx, ly, lz);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const nx = ((x + 0.5) / N) * 2 - 1;
      const ny = ((y + 0.5) / N) * 2 - 1;
      const r = Math.hypot(nx, ny);
      const cover = clamp01((1 - r) * (N / 2) * 0.9);
      if (cover <= 0) continue;
      const nz = Math.sqrt(Math.max(0, 1 - r * r));
      const lam = Math.max(0, (nx * lx + ny * ly + nz * lz) / ll);
      const lit = Math.pow(smoothstep(0, 0.5, lam), 0.9);
      const mare = smoothstep(0.55, 0.72, fbm2(nx * 1.8 + 4, ny * 1.8 + 2, 4, 3)) * 0.2;
      const cr = fbm2(nx * 9, ny * 9, 4, 8);
      const craters = (cr - 0.5) * 0.14 + (smoothstep(0.62, 0.7, fbm2(nx * 14, ny * 14, 3, 21)) - 0.4) * 0.05;
      const tex = 1 - mare + craters;
      const earthshine = 0.05 * (1 - lit);
      const o = (y * N + x) * 4;
      buf[o] = Math.round(clamp01(0.95 * tex * lit + earthshine * 0.8) * 255);
      buf[o + 1] = Math.round(clamp01(0.96 * tex * lit + earthshine * 0.9) * 255);
      buf[o + 2] = Math.round(clamp01(1.0 * tex * lit + earthshine * 1.2) * 255);
      buf[o + 3] = Math.round(clamp01(cover * (0.06 + 0.94 * lit)) * 255);
    }
  }
  const moon = await sharp(buf, { raw: { width: N, height: N, channels: 4 } }).webp({ quality: 88, alphaQuality: 95, effort: 5 }).toBuffer();
  fs.writeFileSync(pub('moon.webp'), moon);
  console.log('moon.webp', (moon.length / 1024).toFixed(1), 'KB');
}

// ---------- avatars + manifest ----------
const people = [
  { name: 'maya', bg: 'd4e6ff' },
  { name: 'noah', bg: 'e6d9ff' },
  { name: 'zoe', bg: 'ffd9d0' },
  { name: 'kai', bg: 'd3f0e4' },
  { name: 'amira', bg: 'ffe3f1' },
  { name: 'leo', bg: 'fff0c2' },
  { name: 'sven', bg: 'dff1ff' },
  { name: 'priya', bg: 'ffe0cc' },
  { name: 'wei', bg: 'dcf5df' },
  { name: 'jack', bg: 'e9e0ff' },
  { name: 'sofia', bg: 'ffe0ec' },
  { name: 'kofi', bg: 'fff3c9' },
];
const manifest = { avatars: [], clouds: {} };
const suppliedAvatars = fs.existsSync(pub('assets', 'avatars'))
  ? fs.readdirSync(pub('assets', 'avatars')).filter((f) => f.toLowerCase().endsWith('.png')).sort()
  : [];
if (suppliedAvatars.length >= people.length) {
  manifest.avatars = suppliedAvatars.slice(0, people.length).map((f) => `/assets/avatars/${f}`);
  console.log('avatars: using supplied PNGs from public/assets/avatars');
} else {
  for (const p of people) {
    const svg = createAvatar(notionists, { seed: p.name, backgroundColor: [p.bg], backgroundType: ['solid'], radius: 50 }).toString();
    fs.writeFileSync(pub('avatars', `${p.name}.svg`), svg);
    manifest.avatars.push(`/avatars/${p.name}.svg`);
  }
  console.log('avatars: generated', people.length, '(DiceBear notionists)');
}
for (const [key, w, small] of [['left', 1100, 560], ['right', 1280, 640], ['base', 900, 450]]) {
  const supplied = pub('assets', `clouds-${key}.png`);
  manifest.clouds[key] = fs.existsSync(supplied)
    ? { src: `/assets/clouds-${key}.png`, small: `/assets/clouds-${key}.png`, w, smallW: small }
    : { src: `/clouds/cloud-${key}.webp`, small: `/clouds/cloud-${key}-${small}.webp`, w, smallW: small };
}
fs.writeFileSync(path.join(root, 'src', 'generated', 'assets.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest written; done in', ((Date.now() - t0) / 1000).toFixed(0), 's');
