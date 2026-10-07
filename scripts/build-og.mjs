// Builds public/og.png (1200x630): the "Your day" map view with a headline panel.
// Run with `npm run og`; the output is committed.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontDir = path.join(root, "scripts", "fonts");
const W = 1200;
const H = 630;
const PANEL = 520;
const PAD = 0.18;
const FONT = "TeX Gyre Adventor";
const BASE = "https://mirrors.ctan.org/fonts/tex-gyre/opentype/";

await mkdir(fontDir, { recursive: true });
const fontFiles = [];
for (const name of ["texgyreadventor-bold.otf", "texgyreadventor-regular.otf"]) {
  const file = path.join(fontDir, name);
  if (!existsSync(file)) {
    const res = await fetch(BASE + name);
    if (!res.ok) throw new Error(`Font download failed: ${name}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  fontFiles.push(file);
}

const mapData = JSON.parse(await readFile(path.join(root, "src/generated/map-points.json"), "utf8"));
const mapSvg = await readFile(path.join(root, "public/map/lisbon.svg"), "utf8");
const inner = mapSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

// Same fit as the site: the 3 stops with 18% padding, filling the map area
const stops = [
  { p: mapData.points.chiado, photo: "pick-nata", n: 1 },
  { p: mapData.points.lanes, photo: "pick-golden", n: 2 },
  { p: mapData.points.graca, photo: "pick-miradouro", n: 3 },
];
const mw = W - PANEL;
const xs = stops.map((s) => s.p.x);
const ys = stops.map((s) => s.p.y);
const bw = Math.max(...xs) - Math.min(...xs);
const bh = Math.max(...ys) - Math.min(...ys);
const k = Math.min(mw / (bw * (1 + 2 * PAD)), H / (bh * (1 + 2 * PAD)));
const vw = mw / k;
const vh = H / k;
const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
const vx = Math.min(Math.max(cx - vw / 2, 0), mapData.width - vw);
const vy = Math.min(Math.max(cy - vh / 2, 0), mapData.height - vh);
const sx = (x) => PANEL + (x - vx) * k;
const sy = (y) => (y - vy) * k;
const pts = stops.map((s) => ({ ...s, x: sx(s.p.x), y: sy(s.p.y) }));

const R = 38;
const photoUri = async (name) => {
  const buf = await sharp(path.join(root, "public/images", `${name}.jpg`)).resize(160, 160, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};

function curve(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const c = { x: mx - (b.y - a.y) * 0.14, y: my + (b.x - a.x) * 0.14 };
  return { d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, mid: { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y } };
}

const legs = [
  { ...curve(pts[0], pts[1]), text: "About 10 min by tram 28", w: 262 },
  { ...curve(pts[1], pts[2]), text: "About 12 min walk, uphill", w: 282 },
];

const chip = (l) => {
  const x = Math.min(Math.max(l.mid.x - l.w / 2, PANEL + 20), W - 20 - l.w);
  return `<g><rect x="${x}" y="${l.mid.y - 19}" width="${l.w}" height="38" rx="19" fill="#fff" stroke="rgba(11,11,12,0.12)" stroke-width="1"/>
  <text x="${x + l.w / 2}" y="${l.mid.y + 6}" font-family="${FONT}" font-size="17" text-anchor="middle" fill="#0B0B0C">${l.text}</text></g>`;
};

let pins = "";
for (const [i, s] of pts.entries()) {
  const uri = await photoUri(s.photo);
  pins += `<g>
  <circle cx="${s.x}" cy="${s.y + 3}" r="${R + 4}" fill="rgba(0,0,0,0.18)"/>
  <clipPath id="c${i}"><circle cx="${s.x}" cy="${s.y}" r="${R}"/></clipPath>
  <image href="${uri}" x="${s.x - R}" y="${s.y - R}" width="${R * 2}" height="${R * 2}" clip-path="url(#c${i})" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="${s.x}" cy="${s.y}" r="${R}" fill="none" stroke="#fff" stroke-width="5"/>
  <circle cx="${s.x + R * 0.72}" cy="${s.y - R * 0.72}" r="14" fill="#0B0B0C" stroke="#fff" stroke-width="2"/>
  <text x="${s.x + R * 0.72}" y="${s.y - R * 0.72 + 5.5}" font-family="${FONT}" font-weight="700" font-size="16" text-anchor="middle" fill="#fff">${s.n}</text></g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><clipPath id="mapclip"><rect x="${PANEL}" y="0" width="${mw}" height="${H}"/></clipPath></defs>
<rect width="${W}" height="${H}" fill="#F3EEE5"/>
<g clip-path="url(#mapclip)"><g transform="translate(${PANEL - vx * k} ${-vy * k}) scale(${k})">${inner}</g>
${legs.map((l) => `<path d="${l.d}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="${l.d}" fill="none" stroke="#0B0B0C" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 9"/>`).join("\n")}
${pins}
${legs.map(chip).join("\n")}
<text x="${W - 16}" y="${H - 14}" font-family="${FONT}" font-size="14" text-anchor="end" fill="#6B6B70">Map data \u00A9 OpenStreetMap contributors</text></g>
<rect width="${PANEL}" height="${H}" fill="#fff"/>
<text x="64" y="92" font-family="${FONT}" font-weight="700" font-size="28" fill="#0B0B0C">Portal Jump</text>
${["Every day of", "your trip,", "mapped for", "you."].map((t, i) => `<text x="64" y="${196 + i * 59}" font-family="${FONT}" font-weight="400" font-size="56" fill="#0B0B0C">${t}</text>`).join("\n")}
${["Places picked for your", "taste, in the right order,", "with travel time between", "each stop."].map((t, i) => `<text x="64" y="${450 + i * 30}" font-family="${FONT}" font-size="24" fill="#6B6B70">${t}</text>`).join("\n")}
<text x="64" y="${H - 64}" font-family="${FONT}" font-size="20" fill="#A1A1A6">portaljump.co</text>
</svg>`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: { fontFiles, loadSystemFonts: false, defaultFontFamily: FONT },
}).render().asPng();

let out = await sharp(png).png({ palette: true, quality: 90, effort: 10 }).toBuffer();
if (out.length > 600 * 1024) out = await sharp(png).png({ palette: true, quality: 75, colours: 96, effort: 10 }).toBuffer();
const meta = await sharp(out).metadata();
if (meta.width !== W || meta.height !== H) throw new Error(`Wrong size ${meta.width}x${meta.height}`);
await writeFile(path.join(root, "public/og.png"), out);
console.log(`og.png ${meta.width}x${meta.height}, ${(out.length / 1024).toFixed(0)} KB`);
