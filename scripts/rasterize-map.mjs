// Exports the base map SVG as webp (1x and 2x) so visitors never download the large SVG.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "map");
const svg = path.join(dir, "lisbon.svg");

export async function rasterizeMap() {
  const { width, height } = await sharp(svg).metadata();
  for (const w of [1600, 3200]) {
    const info = await sharp(svg, { density: (72 * w) / width })
      .resize({ width: w, height: Math.round((height * w) / width) })
      .webp({ quality: 82 })
      .toFile(path.join(dir, `lisbon-${w}.webp`));
    console.log(`lisbon-${w}.webp ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await rasterizeMap();
