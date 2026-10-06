// Renders the real WebGL globe (page `?poster`, transparent background) in headless Edge/Chrome
// and saves it as public/globe-poster.webp. That image is the instant first paint and the no-WebGL fallback.
//   npm run dev        (in another terminal)
//   npm run poster     (optionally: node scripts/make-poster.mjs http://127.0.0.1:4173)
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);
const executablePath = candidates.find((p) => fs.existsSync(p));
if (!executablePath) throw new Error('No Chrome/Edge found; set CHROME_PATH');

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1300, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${base}/?poster`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.dataset.globeReady === '1', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 400));
  const el = await page.$('figure');
  const png = await el.screenshot({ omitBackground: true, type: 'png' });
  const webp = await sharp(png).resize(1280, 1280).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'globe-poster.webp'), webp);
  console.log('globe-poster.webp', (webp.length / 1024).toFixed(1), 'KB');
  // half-size variant for phones (used via srcset)
  const small = await sharp(png).resize(640, 640).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(root, 'public', 'globe-poster-640.webp'), small);
  console.log('globe-poster-640.webp', (small.length / 1024).toFixed(1), 'KB');
} finally {
  await browser.close();
}
