// Generates every static asset the landing page needs. Run: npm run assets   (~1-2 min, output is committed)
//
//  public/textures/earth-albedo-4096.webp  desktop globe colour map, painted like a gouache storybook map from REAL
//  public/textures/earth-albedo-2048.webp  coastlines: Natural Earth 10m land (scripts/data/ne_10m_land.geojson) for the
//     shapes and an elevation map (scripts/data/earth-topology.png) for the land colour and posterised hill shading.
//     scripts/data/globe-style.png is a style reference only and is never read here.
//  public/avatars/<name>-{192,384}.webp    illustrated faces cut out of scripts/data/faces-{a,b}.png, circular alpha
//  public/grain.png                        static film grain tile laid over the sky
//  public/fonts/*.woff2                    self-hosted Inter (latin) 400 / 500 / 700 and Inter Tight 400 / 600
//  src/generated/assets.json               manifest consumed by the app
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const pub = (...p) => path.join(root, 'public', ...p);
const data = (...p) => path.join(root, 'scripts', 'data', ...p);
for (const d of ['textures', 'fonts', 'avatars']) {
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
const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const t0 = Date.now();
const lap = (label) => console.log(`  ${label} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);

// ---------- noise ----------
const fade = (t) => t * t * (3 - 2 * t);
function hash2(x, y, seed) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// seamless 3D value noise for the globe (sampled on the unit sphere: no seam, no pole pinching)
function vnoise3(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fx = fade(x - xi);
  const fy = fade(y - yi);
  const fz = fade(z - zi);
  const l = (dx, dy, dz) => hash2(xi + dx + Math.imul(zi + dz, 7919), yi + dy, 5);
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
// 2D value noise for the soft hill-shading detail
function fbm2(x, y, oct, seed = 0) {
  let v = 0;
  let a = 0.5;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = fade(x - xi);
    const fy = fade(y - yi);
    const n = hash2(xi, yi, seed + i) * (1 - fx) * (1 - fy) + hash2(xi + 1, yi, seed + i) * fx * (1 - fy) + hash2(xi, yi + 1, seed + i) * (1 - fx) * fy + hash2(xi + 1, yi + 1, seed + i) * fx * fy;
    v += a * n;
    norm += a;
    x = x * 2.03 + 11.3;
    y = y * 2.03 + 7.1;
    a *= 0.5;
  }
  return v / norm;
}

// ---------- fonts ----------
for (const w of [400, 500, 700]) {
  fs.copyFileSync(path.join(root, 'node_modules/@fontsource/inter/files', `inter-latin-${w}-normal.woff2`), pub('fonts', `inter-${w}.woff2`));
}
for (const w of [400, 600]) {
  fs.copyFileSync(path.join(root, 'node_modules/@fontsource/inter-tight/files', `inter-tight-latin-${w}-normal.woff2`), pub('fonts', `inter-tight-${w}.woff2`));
}
console.log('fonts');

// ---------- film grain: static noise tile, shown at 3% opacity over the sky ----------
{
  const N = 256;
  const buf = Buffer.alloc(N * N * 4);
  for (let i = 0; i < N * N; i++) {
    const v = Math.round(hash2(i % N, (i / N) | 0, 77) * 255);
    buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = v;
    buf[i * 4 + 3] = 255;
  }
  await sharp(buf, { raw: { width: N, height: N, channels: 4 } }).png({ compressionLevel: 9 }).toFile(pub('grain.png'));
  console.log('grain.png');
}

// ---------- avatars: cut the 12 circles out of the two sheets ----------
// Each sheet is a 4x2 grid of circles on ivory. Find them by their distance from the ivory, take the bounding box,
// inset 3%, and export a square-cropped circular webp with transparent corners. No colour grading.
{
  const IVORY = [0xf6, 0xf1, 0xea];
  const people = ['maya', 'noah', 'zoe', 'kai', 'amira', 'leo', 'sven', 'priya', 'wei', 'jack', 'sofia', 'kofi'];
  // pin index -> sheet circle (numbered left to right, top row then bottom row)
  const source = ['b1', 'a8', 'a5', 'b6', 'b2', 'a2', 'a3', 'a1', 'a4', 'a7', 'b4', 'b5'];

  // runs of rows/columns where enough pixels are not ivory
  const runs = (counts, min, gap) => {
    const out = [];
    let start = -1;
    let last = -1;
    counts.forEach((c, i) => {
      if (c < min) return;
      if (start < 0) start = i;
      else if (i - last > gap) {
        out.push([start, last]);
        start = i;
      }
      last = i;
    });
    if (start >= 0) out.push([start, last]);
    return out;
  };

  const circles = {};
  for (const sheet of ['a', 'b']) {
    const img = sharp(data(`faces-${sheet}.png`)).removeAlpha();
    const { width: W, height: H } = await img.metadata();
    const buf = await img.raw().toBuffer();
    const art = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const d = Math.hypot(buf[i * 3] - IVORY[0], buf[i * 3 + 1] - IVORY[1], buf[i * 3 + 2] - IVORY[2]);
      art[i] = d > 38 ? 1 : 0;
    }
    const cols = new Array(W).fill(0);
    const rows = new Array(H).fill(0);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (art[y * W + x]) (cols[x]++, rows[y]++);
    const colRuns = runs(cols, 40, 6).filter(([a, b]) => b - a > 100);
    const rowRuns = runs(rows, 40, 6).filter(([a, b]) => b - a > 100);
    if (colRuns.length !== 4 || rowRuns.length !== 2) throw new Error(`faces-${sheet}.png: expected a 4x2 grid, found ${colRuns.length}x${rowRuns.length}`);
    let n = 1;
    for (const [y0, y1] of rowRuns) {
      for (const [x0, x1] of colRuns) {
        // tighten to this circle's own bounding box
        let bx0 = x1;
        let bx1 = x0;
        let by0 = y1;
        let by1 = y0;
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            if (!art[y * W + x]) continue;
            if (x < bx0) bx0 = x;
            if (x > bx1) bx1 = x;
            if (y < by0) by0 = y;
            if (y > by1) by1 = y;
          }
        }
        circles[`${sheet}${n++}`] = { sheet, x0: bx0, y0: by0, x1: bx1, y1: by1 };
      }
    }
  }

  const avatars = [];
  for (const [i, name] of people.entries()) {
    const c = circles[source[i]];
    const w = c.x1 - c.x0 + 1;
    const h = c.y1 - c.y0 + 1;
    // the circles are slightly taller than wide: the centred square that fits inside is w wide; 3% inset on top
    const side = Math.floor(Math.min(w, h) * 0.94);
    const left = Math.round(c.x0 + (w - side) / 2);
    const top = Math.round(c.y0 + (h - side) / 2);
    const crop = await sharp(data(`faces-${c.sheet}.png`)).extract({ left, top, width: side, height: side }).removeAlpha().toBuffer();
    for (const size of [192, 384]) {
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
      await sharp(crop)
        .resize(size, size, { kernel: 'lanczos3' })
        .composite([{ input: mask, blend: 'dest-in' }])
        .webp({ quality: 90, alphaQuality: 100, effort: 5 })
        .toFile(pub('avatars', `${name}-${size}.webp`));
    }
    avatars.push(`/avatars/${name}-384.webp`);
    console.log(`  ${name} <- ${source[i]} (${w}x${h} circle at ${c.x0},${c.y0}, crop ${side}px)`);
  }
  fs.writeFileSync(path.join(root, 'src', 'generated', 'assets.json'), JSON.stringify({ avatars }, null, 2) + '\n');
  console.log('avatars: 12 cut');
}

// ---------- land mask: Natural Earth 10m, rasterised at 2x then box-filtered to 4096x2048 ----------
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
const landJson = JSON.parse(fs.readFileSync(data('ne_10m_land.geojson'), 'utf8'));
for (const f of landJson.features) {
  const g = f.geometry;
  if (g.type === 'Polygon') fillPolygon(g.coordinates);
  else if (g.type === 'MultiPolygon') for (const poly of g.coordinates) fillPolygon(poly);
}
lap('land rasterised (10m, 8192x4096)');

// sharp promotes 1-channel input to 3 channels after resize/blur; force greyscale so buffers stay w*h long
const raw1 = (w, h) => ({ raw: { width: w, height: h, channels: 1 } });
const grey = (s) => s.toColourspace('b-w').raw().toBuffer();
const L = await grey(sharp(Buffer.from(big.buffer), raw1(SW, SH)).resize(AW, AH, { kernel: 'lanczos2' })); // anti-aliased land
if (L.length !== AW * AH) throw new Error('land buffer size mismatch');

// distance (px at 4096) from every pixel to the nearest land: two-pass chamfer
const DIST = new Float32Array(AW * AH);
for (let i = 0; i < AW * AH; i++) DIST[i] = L[i] > 127 ? 0 : 1e6;
for (let y = 0; y < AH; y++) {
  for (let x = 0; x < AW; x++) {
    const i = y * AW + x;
    let d = DIST[i];
    if (x > 0) d = Math.min(d, DIST[i - 1] + 1);
    if (y > 0) {
      d = Math.min(d, DIST[i - AW] + 1);
      if (x > 0) d = Math.min(d, DIST[i - AW - 1] + 1.414);
      if (x < AW - 1) d = Math.min(d, DIST[i - AW + 1] + 1.414);
    }
    DIST[i] = d;
  }
}
for (let y = AH - 1; y >= 0; y--) {
  for (let x = AW - 1; x >= 0; x--) {
    const i = y * AW + x;
    let d = DIST[i];
    if (x < AW - 1) d = Math.min(d, DIST[i + 1] + 1);
    if (y < AH - 1) {
      d = Math.min(d, DIST[i + AW] + 1);
      if (x < AW - 1) d = Math.min(d, DIST[i + AW + 1] + 1.414);
      if (x > 0) d = Math.min(d, DIST[i + AW - 1] + 1.414);
    }
    DIST[i] = d;
  }
}
lap('coast distance');

// ---------- terrain: elevation map -> height + hillshade ----------
const topo = await grey(sharp(data('earth-topology.png')).resize(AW, AH, { kernel: 'cubic' }).blur(2.5));
if (topo.length !== AW * AH) throw new Error('topology buffer size mismatch');
const E = new Float32Array(AW * AH);
for (let y = 0; y < AH; y++) {
  for (let x = 0; x < AW; x++) {
    const i = y * AW + x;
    const base = topo[i] / 250;
    const detail = base > 0.015 ? (fbm2(x / 60, y / 60, 3, 3) - 0.5) * 0.05 * smoothstep(0.015, 0.2, base) : 0;
    E[i] = Math.max(0, base + detail);
  }
}
lap('terrain');

// mountain triangles: sparse, on the highest peaks, at least 220 px apart (greedy, tallest first)
const PEAK_GAP = 220;
const peaks = [];
{
  const cand = [];
  for (let y = 40; y < AH - 40; y += 4) {
    for (let x = 0; x < AW; x += 4) {
      const i = y * AW + x;
      if (L[i] > 250 && E[i] > 0.3 && Math.abs(90 - (y / AH) * 180) < 62) cand.push([E[i], x, y]);
    }
  }
  cand.sort((a, b) => b[0] - a[0]);
  const cell = new Map();
  const key = (cx, cy) => cy * 100 + cx;
  for (const [, x, y] of cand) {
    const cx = Math.floor(x / PEAK_GAP);
    const cy = Math.floor(y / PEAK_GAP);
    let ok = true;
    for (let dy = -1; dy <= 1 && ok; dy++) {
      for (let dx = -1; dx <= 1 && ok; dx++) {
        for (const q of cell.get(key(cx + dx, cy + dy)) ?? []) {
          if (Math.hypot(q[0] - x, q[1] - y) < PEAK_GAP) ok = false;
        }
      }
    }
    if (!ok) continue;
    peaks.push([x, y, 10 + Math.round(hash2(x, y, 9) * 6)]);
    const k = key(cx, cy);
    if (!cell.has(k)) cell.set(k, []);
    cell.get(k).push([x, y]);
  }
}
lap(`${peaks.length} mountain peaks`);

// ---------- paint the albedo ----------
const OCEAN = hex('#13285c');
const BAND = hex('#1f4a8a');
const SAGE = hex('#8fae7e');
const OCHRE = hex('#c9a15b');
const TERRA = hex('#b8674a');
const CREAM = hex('#f1eadb');
const INK = hex('#2b3b2e');
const PEAK_INK = hex('#5a3b2c');
const WHITE = [1, 1, 1];
const BAND_PX = 14; // the lighter coastal band fades out over this many px at 4096
const CONTOURS = [8, 18, 32]; // three hand-drawn lines at growing distances from the coast

// soft posterise: n steps with a short smooth ramp between them (painted, not smooth terrain)
const poster = (v, n) => {
  const s = clamp01(v) * n;
  const f = Math.floor(s);
  return (f + smoothstep(0.38, 0.62, s - f)) / n;
};

const albedo = Buffer.alloc(AW * AH * 3);
for (let y = 0; y < AH; y++) {
  const lat = (0.5 - (y + 0.5) / AH) * Math.PI;
  const latDeg = (lat * 180) / Math.PI;
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
    const d = DIST[i];

    // ocean: deep indigo, a lighter band hugging the coast, three wobbly white contour lines
    let col = OCEAN;
    if (d < 70) {
      col = mix3(col, BAND, 1 - smoothstep(0, BAND_PX, d));
      const wob = (fbm3(p0 * 40, p1 * 40, p2 * 40, 3) - 0.5) * 9;
      let line = 0;
      for (const c of CONTOURS) line = Math.max(line, 1 - smoothstep(0, 0.8, Math.abs(d - c - wob)));
      col = mix3(col, WHITE, line * 0.13);
    }

    if (isLand > 0.002) {
      const e = E[i];
      // height ramp: sage lowland -> ochre -> terracotta highland
      let c = mix3(SAGE, OCHRE, smoothstep(0.1, 0.32, e));
      c = mix3(c, TERRA, smoothstep(0.35, 0.6, e));
      // hillshade, light from the upper left, posterised into 4 soft steps
      const xm = x > 0 ? i - 1 : i;
      const xp = x < AW - 1 ? i + 1 : i;
      const ym = y > 0 ? i - AW : i;
      const yp = y < AH - 1 ? i + AW : i;
      const shade = Math.max(-0.32, Math.min(0.32, ((E[xp] - E[xm]) * 0.7 + (E[yp] - E[ym]) * 0.7) * 11));
      const q = poster((shade + 0.32) / 0.64, 4) - 0.5;
      const k = 1 + q * 0.4 * (0.35 + smoothstep(0.02, 0.3, e));
      c = [c[0] * k, c[1] * k, c[2] * k];
      // polar ice: land beyond 66 degrees, all of Greenland, all of Antarctica
      const rag = (fbm3(p0 * 14, p1 * 14, p2 * 14, 3) - 0.5) * 3.2;
      const gl = ((latDeg - 72) / 12.5) ** 2 + ((lonDeg + 42) / 25) ** 2;
      const ice = Math.max(smoothstep(65.5, 67, Math.abs(latDeg) + rag), smoothstep(1.0, 0.6, gl + rag * 0.1), smoothstep(-69, -71, latDeg + rag));
      c = mix3(c, CREAM, ice);
      col = mix3(col, c, isLand);
      // coastline ink, 1.5px at 35%
      const edge = 1 - Math.abs(2 * isLand - 1);
      col = mix3(col, INK, 0.35 * smoothstep(0.25, 0.95, edge));
    } else {
      const edge = 1 - Math.abs(2 * isLand - 1);
      if (edge > 0.25) col = mix3(col, INK, 0.35 * smoothstep(0.25, 0.95, edge));
    }

    // gouache: slow +-4% colour drift, plus 3% paper grain
    const drift = 1 + (fbm3(p0 * 3.2 + 9, p1 * 3.2, p2 * 3.2, 3) - 0.5) * 0.16;
    const grain = (hash2(x, y, 41) - 0.5) * 0.06;
    const o = i * 3;
    albedo[o] = Math.round(clamp01(col[0] * drift + grain) * 255);
    albedo[o + 1] = Math.round(clamp01(col[1] * drift + grain) * 255);
    albedo[o + 2] = Math.round(clamp01(col[2] * drift + grain) * 255);
  }
  if (y % 512 === 0) lap(`albedo row ${y}/${AH}`);
}

// hand-drawn mountain triangles, ink #5A3B2C at 55%
for (const [cx, cy, size] of peaks) {
  const h = Math.round(size * 1.1);
  for (let r = 0; r < h; r++) {
    const half = ((r + 1) / h) * (size / 2);
    const yy = cy - Math.round(h * 0.6) + r;
    if (yy < 0 || yy >= AH) continue;
    for (let xx = Math.round(cx - half); xx <= Math.round(cx + half); xx++) {
      const xw = (xx + AW) % AW;
      const o = (yy * AW + xw) * 3;
      // the left face is a touch lighter than the right, so each peak reads as a drawn mountain
      const a = xx < cx ? 0.4 : 0.55;
      albedo[o] = Math.round(mix(albedo[o], PEAK_INK[0] * 255, a));
      albedo[o + 1] = Math.round(mix(albedo[o + 1], PEAK_INK[1] * 255, a));
      albedo[o + 2] = Math.round(mix(albedo[o + 2], PEAK_INK[2] * 255, a));
    }
  }
}
lap('albedo painted');

const albedo4096 = await sharp(albedo, { raw: { width: AW, height: AH, channels: 3 } }).webp({ quality: 84, smartSubsample: true, effort: 5 }).toBuffer();
fs.writeFileSync(pub('textures', 'earth-albedo-4096.webp'), albedo4096);
const albedo2048 = await sharp(albedo, { raw: { width: AW, height: AH, channels: 3 } })
  .resize(2048, 1024, { kernel: 'lanczos3' })
  .webp({ quality: 90, smartSubsample: true, effort: 5 })
  .toBuffer();
fs.writeFileSync(pub('textures', 'earth-albedo-2048.webp'), albedo2048);
console.log('earth-albedo-4096.webp', (albedo4096.length / 1024).toFixed(0), 'KB;  earth-albedo-2048.webp', (albedo2048.length / 1024).toFixed(0), 'KB');
console.log('done in', ((Date.now() - t0) / 1000).toFixed(0), 's');
