// Renderiza um mockup de design/mockups/*.html em PNG 2x (2160×1440).
// Uso: node scripts/render-mockup.js design/mockups/estimates.html saida.png
// Requer Playwright (npm i -g playwright) e um Chrome com H.264/fontes; CHROME=/caminho/do/chrome opcional.
const path = require('path');
const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const [src, out] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 720 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: out });
  await b.close();
})();
