// Renders the raster brand assets from frontend/public/favicon.svg:
// favicon-16x16.png, favicon-32x32.png, favicon.ico (16/32/48), apple-touch-icon.png (180)
// and the social share image og-cover.jpg (1200x630).
//
// Uses the Chromium that the e2e tests already install, so it adds no package:
//   (cd tests && npm ci && npx playwright install chromium)
//   node scripts/render-brand-assets.mjs
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "tests", "package.json"));
const { chromium } = require("@playwright/test");

const pub = (name) => path.join(root, "frontend", "public", name);
const mark = readFileSync(pub("favicon.svg"), "utf8");
const markDark = mark
  // On navy the V bubble turns white with a navy V, as LogoMark's "dark" tone.
  .replace('fill="#0f172a" stroke="#ffffff"', 'fill="#ffffff" stroke="#0f172a"')
  .replace('d="M37 27 L43.5 41 L50 27" fill="none" stroke="#ffffff"', 'd="M37 27 L43.5 41 L50 27" fill="none" stroke="#0f172a"');
const font = (pkg, file) =>
  `url(data:font/woff2;base64,${readFileSync(path.join(root, "frontend", "node_modules", "@fontsource-variable", pkg, "files", file)).toString("base64")})`;

const page = (body, css = "") => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Outfit;font-weight:100 900;src:${font("outfit", "outfit-latin-wght-normal.woff2")}}
@font-face{font-family:Jakarta;font-weight:200 800;src:${font("plus-jakarta-sans", "plus-jakarta-sans-latin-wght-normal.woff2")}}
html,body{margin:0;padding:0;background:transparent}${css}</style></head><body>${body}</body></html>`;

// An .ico file whose entries are PNG images (supported by every current browser).
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

const browser = await chromium.launch();
try {
  const shot = async (html, width, height, opts = {}) => {
    const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await p.setContent(html);
    await p.evaluate(() => document.fonts.ready);
    const data = await p.screenshot({ omitBackground: !opts.jpeg, type: opts.jpeg ? "jpeg" : "png", quality: opts.jpeg ? 90 : undefined });
    await p.close();
    return data;
  };
  const icon = (size) => shot(page(mark.replace('width="64" height="64"', `width="${size}" height="${size}"`), "svg{display:block}"), size, size);

  const sizes = {};
  for (const size of [16, 32, 48]) sizes[size] = await icon(size);
  writeFileSync(pub("favicon-16x16.png"), sizes[16]);
  writeFileSync(pub("favicon-32x32.png"), sizes[32]);
  writeFileSync(pub("favicon.ico"), ico([16, 32, 48].map((size) => ({ size, data: sizes[size] }))));

  // iOS fills transparency with black, so the touch icon gets the light brand surface.
  writeFileSync(
    pub("apple-touch-icon.png"),
    await shot(
      page(`<div>${mark.replace('width="64" height="64"', 'width="132" height="132"')}</div>`,
        "div{width:180px;height:180px;display:grid;place-items:center;background:#fff7ed}"),
      180, 180,
    ),
  );

  writeFileSync(
    pub("og-cover.jpg"),
    await shot(
      page(
        `<main>
  <svg class="decor" viewBox="0 0 1200 630" width="1200" height="630" aria-hidden="true">
    <g fill="#ea580c"><circle cx="1010" cy="60" r="9"/><circle cx="1150" cy="120" r="7"/><circle cx="880" cy="92" r="5"/><circle cx="1165" cy="300" r="10"/><circle cx="1080" cy="360" r="6"/><circle cx="820" cy="520" r="7"/></g>
    <g fill="#fb923c"><circle cx="1110" cy="40" r="5"/><circle cx="940" cy="150" r="6"/><circle cx="1130" cy="220" r="5"/><circle cx="760" cy="600" r="6"/></g>
    <g fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round">
      <path d="M780 520 C 900 490, 1080 490, 1200 520"/><path d="M780 500 C 900 470, 1080 470, 1200 500"/>
      <path d="M820 506 V 485 M880 494 V 474 M940 487 V 467 M1000 485 V 465 M1060 487 V 467 M1120 494 V 474 M1180 506 V 485"/>
      <path d="M820 630 A 70 70 0 0 1 960 630"/><path d="M990 630 A 70 70 0 0 1 1130 630"/>
      <path d="M800 560 H 870 M 1010 575 H 1100"/>
    </g>
  </svg>
  <div class="mark">${markDark.replace('width="64" height="64"', 'width="220" height="220"')}</div>
  <h1>Dutch jobs that hire in English.</h1>
  <p>DutchVacancy — student jobs in the Netherlands</p>
</main>`,
        `main{position:relative;width:1200px;height:630px;overflow:hidden;background:#0f172a;color:#fff}
.decor{position:absolute;inset:0}
.mark{position:absolute;right:120px;top:150px}
h1{position:absolute;left:80px;top:90px;width:700px;margin:0;font:800 92px/1.02 Outfit;letter-spacing:-0.02em;color:#fb923c}
p{position:absolute;left:80px;bottom:70px;margin:0;font:500 30px/1.3 Jakarta;color:#e2e8f0}`,
      ),
      1200, 630, { jpeg: true },
    ),
  );
} finally {
  await browser.close();
}
console.log("Brand assets written to frontend/public.");
