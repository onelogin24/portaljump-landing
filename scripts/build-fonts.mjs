import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import wawoff2 from "wawoff2";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const weight of ["400", "700"]) {
  const otf = await readFile(path.join(root, "scripts", "fonts-src", `adventor-${weight}.otf`));
  const woff2 = await wawoff2.compress(otf);
  await writeFile(path.join(root, "public", "fonts", `adventor-${weight}.woff2`), woff2);
  console.log(`adventor-${weight}.woff2`, woff2.length);
}
