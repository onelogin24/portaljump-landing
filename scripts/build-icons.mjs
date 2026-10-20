// Builds favicon-48.png, favicon-192.png and apple-touch-icon.png in public/ from scripts/icon-src/icon.png.
// Run with `npm run icons`; the output is committed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "scripts", "icon-src", "icon.png");
const out = (name) => path.join(root, "public", name);

const meta = await sharp(src).metadata();
if (meta.width !== meta.height || meta.width < 512) {
  throw new Error(`icon.png must be square and at least 512px, got ${meta.width}x${meta.height}`);
}

for (const [name, size] of [["favicon-48.png", 48], ["favicon-192.png", 192]]) {
  await sharp(src).resize(size, size).png().toFile(out(name));
}
await sharp(src)
  .resize(180, 180)
  .flatten({ background: "#FBFAF7" })
  .removeAlpha()
  .png()
  .toFile(out("apple-touch-icon.png"));

console.log("icons written");
