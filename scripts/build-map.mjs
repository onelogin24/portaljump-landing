// Bakes a static SVG map of central Lisbon from OpenStreetMap data (Overpass API).
// Run once with `npm run map`; the output is committed so the site never calls Overpass.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BBOX = { south: 38.702, west: -9.16, north: 38.723, east: -9.125 };
const W = 1600;
const ENDPOINT = "https://overpass-api.de/api/interpreter";

const POINTS = {
  chiado: [-9.1424, 38.7107],
  lanes: [-9.13, 38.7114],
  graca: [-9.1315, 38.7163],
  stay: [-9.1292, 38.7121],
  market: [-9.1459, 38.7069],
};

// Web Mercator projection into the SVG box
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const lonSpan = ((BBOX.east - BBOX.west) * Math.PI) / 180;
const H = Math.round((W * (mercY(BBOX.north) - mercY(BBOX.south))) / lonSpan);
const project = ([lon, lat]) => [
  ((lon - BBOX.west) / (BBOX.east - BBOX.west)) * W,
  ((mercY(BBOX.north) - mercY(lat)) / (mercY(BBOX.north) - mercY(BBOX.south))) * H,
];
// metres per SVG unit, for the building size filter
const MPU = ((BBOX.east - BBOX.west) * 111320 * Math.cos((38.7125 * Math.PI) / 180)) / W;

const query = `[out:json][timeout:90][bbox:${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}];
(
  way["highway"~"^(primary|secondary|tertiary|unclassified|residential|living_street|pedestrian)$"];
  way["natural"="coastline"];
  way["leisure"="park"];
  way["landuse"="grass"];
  rel["leisure"="park"];
  rel["landuse"="grass"];
  way["building"];
);
out geom;`;

async function fetchOverpass() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "portaljump-landing-map/1.0" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return res.json();
}

let data;
try {
  data = await fetchOverpass();
} catch (err) {
  console.log(`Overpass failed (${err.message}), retrying in 30 seconds`);
  await new Promise((r) => setTimeout(r, 30000));
  try {
    data = await fetchOverpass();
  } catch (err2) {
    console.error(`Overpass failed again (${err2.message}). Stopping.`);
    process.exit(1);
  }
}
console.log("elements", data.elements.length);

// geometry helpers
const toXY = (geom) => geom.map((g) => project([g.lon, g.lat]));

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0;
    let idx = -1;
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

// Closed rings need two halves, otherwise Douglas-Peucker collapses them to a point.
function simplifyRing(pts, tol) {
  if (pts.length < 6) return pts;
  const mid = Math.floor(pts.length / 2);
  const a = simplify(pts.slice(0, mid + 1), tol);
  const b = simplify(pts.slice(mid), tol);
  return a.concat(b.slice(1, -1));
}

const r1 = (n) => Math.round(n * 10) / 10;
const fmt = (n) => String(r1(n));
const area = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
};
const lineD = (pts) => "M" + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join("L");
const polyD = (pts) => lineD(pts) + "Z";

function build(minBuildingM2, tol) {
  const main = [];
  const minor = [];
  const parks = [];
  const buildings = [];
  const coast = [];

  for (const el of data.elements) {
    const t = el.tags ?? {};
    if (el.type === "way" && el.geometry) {
      const closedWay = el.geometry.length > 3 && el.geometry[0].lat === el.geometry[el.geometry.length - 1].lat && el.geometry[0].lon === el.geometry[el.geometry.length - 1].lon;
      const pts = closedWay ? simplifyRing(toXY(el.geometry), tol) : simplify(toXY(el.geometry), tol);
      if (pts.length < 2) continue;
      if (t.natural === "coastline") coast.push(el);
      else if (t.highway) (/^(primary|secondary|tertiary)$/.test(t.highway) ? main : minor).push(pts);
      else if (t.building) {
        const full = toXY(el.geometry);
        if (area(full) * MPU * MPU >= minBuildingM2 && pts.length >= 3) buildings.push(pts);
      } else if (t.leisure === "park" || t.landuse === "grass") {
        if (pts.length >= 3) parks.push(pts);
      }
    } else if (el.type === "relation" && Array.isArray(el.members)) {
      for (const m of el.members) {
        if (m.role !== "outer" || !m.geometry || m.geometry.length < 4) continue;
        const first = m.geometry[0];
        const last = m.geometry[m.geometry.length - 1];
        if (first.lat === last.lat && first.lon === last.lon) {
          const pts = simplifyRing(toXY(m.geometry), tol);
          if (pts.length >= 3) parks.push(pts);
        }
      }
    }
  }
  return { main, minor, parks, buildings, coast };
}

// Water: chain the coastline ways, then close the shape along the bbox bottom.
function waterPath(coastWays, tol) {
  const key = (g) => `${g.lat},${g.lon}`;
  const segs = coastWays.map((w) => w.geometry.slice());
  let merged = true;
  while (merged && segs.length > 1) {
    merged = false;
    outer: for (let i = 0; i < segs.length; i++) {
      for (let j = 0; j < segs.length; j++) {
        if (i === j) continue;
        const a = segs[i];
        const b = segs[j];
        if (key(a[a.length - 1]) === key(b[0])) {
          segs[i] = a.concat(b.slice(1));
          segs.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  if (!segs.length) return null;
  let chain = segs.sort((a, b) => b.length - a.length)[0];
  let pts = toXY(chain);
  // water lies on the right of the coastline direction: for Lisbon the line runs west to east
  if (pts[0][0] > pts[pts.length - 1][0]) pts = pts.reverse();
  const clamp = ([x, y]) => [Math.min(W, Math.max(0, x)), Math.min(H, Math.max(0, y))];
  pts = simplify(pts.map(clamp), tol);
  if (pts.length < 2) return null;
  if (pts[pts.length - 1][0] - pts[0][0] < W * 0.6) return null; // does not span the bbox: do not guess
  pts[0] = [0, pts[0][1]];
  pts[pts.length - 1] = [W, pts[pts.length - 1][1]];
  return polyD([...pts, [W, H], [0, H]]);
}

function svgFor(minBuildingM2, tol) {
  const { main, minor, parks, buildings, coast } = build(minBuildingM2, tol);
  const water = waterPath(coast, tol);
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
  parts.push(`<rect width="${W}" height="${H}" fill="#F3EEE5"/>`);
  if (water) parts.push(`<path d="${water}" fill="#D6DEE0"/>`);
  parts.push(`<path d="${parks.map(polyD).join("")}" fill="#E4E8DC"/>`);
  parts.push(`<path d="${buildings.map(polyD).join("")}" fill="#E9E2D6"/>`);
  const cap = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  parts.push(`<path d="${main.map(lineD).join("")}" ${cap} stroke="#E3DCCF" stroke-width="3"/>`);
  parts.push(`<path d="${minor.map(lineD).join("")}" ${cap} stroke="#FFFFFF" stroke-width="1.1"/>`);
  parts.push(`<path d="${main.map(lineD).join("")}" ${cap} stroke="#FFFFFF" stroke-width="2.4"/>`);
  parts.push("</svg>");
  const stats = { main: main.length, minor: minor.length, parks: parks.length, buildings: buildings.length, water: !!water };
  return { svg: parts.join(""), stats };
}

let attempt = { min: 0, tol: 0.6 };
let out = svgFor(attempt.min, attempt.tol);
const MAX = 1.5 * 1024 * 1024;
if (out.svg.length > MAX) {
  attempt = { min: 40, tol: 0.6 };
  out = svgFor(attempt.min, attempt.tol);
}
for (let tol = 0.9; out.svg.length > MAX && tol <= 2.4; tol += 0.3) {
  attempt = { min: 40, tol };
  out = svgFor(attempt.min, attempt.tol);
}
if (out.svg.length > MAX) {
  console.error(`SVG still ${out.svg.length} bytes after simplifying. Stopping.`);
  process.exit(1);
}
if (!out.stats.water) console.log("WARNING: no usable coastline found, map rendered without water.");

await mkdir(path.join(root, "public", "map"), { recursive: true });
await mkdir(path.join(root, "src", "generated"), { recursive: true });
await writeFile(path.join(root, "public", "map", "lisbon.svg"), out.svg);

// Recommended places: resolved with OpenStreetMap Nominatim, never guessed.
const RECS = [
  ["rec-comercio", "Praca do Comercio, Lisboa"],
  ["rec-se", "Se de Lisboa"],
  ["rec-santajusta", "Elevador de Santa Justa"],
  ["rec-castelo", "Castelo de Sao Jorge"],
  ["rec-santaluzia", "Miradouro de Santa Luzia"],
  ["rec-carmo", "Convento do Carmo"],
];
const recommendations = [];
const missing = [];
for (const [id, q] of RECS) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1" +
    `&viewbox=${BBOX.west},${BBOX.north},${BBOX.east},${BBOX.south}&q=${encodeURIComponent(q)}`;
  let hit = null;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PortalJumpSite/1.0 (hello@portaljump.co)" } });
    if (res.ok) hit = (await res.json())[0] ?? null;
  } catch {
    hit = null;
  }
  if (hit) {
    const lon = Number(hit.lon);
    const lat = Number(hit.lat);
    const inside = lon >= BBOX.west && lon <= BBOX.east && lat >= BBOX.south && lat <= BBOX.north;
    if (inside) {
      const [x, y] = project([lon, lat]);
      recommendations.push({ id, x: r1(x), y: r1(y), lon, lat });
    } else missing.push(id);
  } else missing.push(id);
  await new Promise((r) => setTimeout(r, 1100));
}
if (missing.length) console.log("LEFT OUT (no result inside the bbox):", missing.join(", "));

const geo = Object.fromEntries(Object.entries(POINTS).map(([k, ll]) => [k, ll]));
const points = Object.fromEntries(
  Object.entries(POINTS).map(([k, ll]) => {
    const [x, y] = project(ll);
    return [k, { x: r1(x), y: r1(y) }];
  }),
);
await writeFile(
  path.join(root, "src", "generated", "map-points.json"),
  JSON.stringify({ width: W, height: H, points, geo, recommendations }, null, 2) + "\n",
);
console.log(`lisbon.svg ${(out.svg.length / 1024).toFixed(0)} KB, ${W}x${H}`, out.stats, attempt);
