import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "scripts", "photos-src");
const out = path.join(root, "public", "images");
await mkdir(out, { recursive: true });

const FULL = 2560;
const SMALL = 1280;
const XS = 1100; // phones
const THUMB = 320; // map pins and list thumbnails
const manifest = {};
// Illustrations shown full bleed: near-lossless webp, high quality jpg, never downscaled, one phone size.
const FIDELITY = new Set(["closing-roadtrip", "closing-final"]);
// Images are cached for a year by file name, so a replaced image ships under a new name (bump the suffix).
const OUTPUT_NAME = { "closing-final": "closing-final-v2" };

// Accepts "name.jpg" and "name.jpg.jpg"; files with "backup" in the name are ignored.
const files = (await readdir(src))
  .filter((f) => /\.(jpe?g|png)$/i.test(f) && !/backup/i.test(f))
  .sort();

for (const file of files) {
  const name = file.replace(/(\.(jpe?g|png))+$/i, "");
  const input = path.join(src, file);
  const meta = await sharp(input).rotate().metadata();
  const flipped = meta.orientation && meta.orientation >= 5;
  const srcWidth = flipped ? meta.height : meta.width;
  const srcHeight = flipped ? meta.width : meta.height;

  // Never upscale: cap at the original width.
  const width = Math.min(FULL, srcWidth);
  const smWidth = Math.min(SMALL, srcWidth);
  const xsWidth = Math.min(XS, srcWidth);
  const height = Math.round((srcHeight * width) / srcWidth);
  const smHeight = Math.round((srcHeight * smWidth) / srcWidth);

  const base = () => sharp(input).rotate();
  if (FIDELITY.has(name)) {
    const outName = OUTPUT_NAME[name] ?? name;
    const phone = Math.min(XS, srcWidth);
    await base().webp({ quality: 95, smartSubsample: true, effort: 6 }).toFile(path.join(out, `${outName}.webp`));
    await base().resize({ width: phone, withoutEnlargement: true }).webp({ quality: 95, smartSubsample: true, effort: 6 }).toFile(path.join(out, `${outName}-sm.webp`));
    await base().jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toFile(path.join(out, `${outName}.jpg`));
    manifest[outName] = { width: srcWidth, height: srcHeight, smWidth: phone, smHeight: Math.round((srcHeight * phone) / srcWidth), xsWidth: phone };
    console.log(outName, `${srcWidth}x${srcHeight} (full fidelity)`);
    continue;
  }
  await base().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(out, `${name}.webp`));
  await base().resize({ width: smWidth, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, `${name}-sm.webp`));
  await base().resize({ width: xsWidth, withoutEnlargement: true }).webp({ quality: 66 }).toFile(path.join(out, `${name}-xs.webp`));
  await base().resize({ width: Math.min(THUMB, srcWidth), withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(out, `${name}-th.webp`));
  await base().resize({ width, withoutEnlargement: true }).jpeg({ quality: 84 }).toFile(path.join(out, `${name}.jpg`));

  manifest[name] = { width, height, smWidth, smHeight, xsWidth };
  console.log(name, `${width}x${height}`);
}

await writeFile(path.join(root, "src", "content", "photos.json"), JSON.stringify(manifest, null, 2) + "\n");
