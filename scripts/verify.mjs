import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const expected = [
  'assets2/real-momo.webp',
  'assets2/real-naan-curry.webp',
  'assets2/real-thali-close.webp',
  'assets2/real-thali.webp',
];
const output = fileURLToPath(new URL('../verification/', import.meta.url));
await mkdir(output, { recursive: true });

const server = await createServer({
  server: { host: '127.0.0.1', port: 7100, strictPort: true },
  logLevel: 'silent',
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const pageErrors = [];
  const localFailures = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:7100/') && response.status() >= 400) {
      localFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto('http://127.0.0.1:7100/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.gallery .masonry img');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${output}desktop-home.png` });

  const contentSources = await page.locator('img:not(.mark)').evaluateAll(images =>
    images.map(image => new URL(image.src).pathname.replace(/^\//, '')),
  );
  assert.ok(contentSources.every(src => src.startsWith('assets2/real-')), 'Tutte le immagini dei contenuti devono essere foto originali');
  const backgrounds = await page.locator('.hero .bg, .cta-final .bg, .reservation').evaluateAll(elements =>
    elements.map(element => getComputedStyle(element).backgroundImage),
  );
  assert.ok(backgrounds.every(value => value.includes('/assets2/real-')), 'Anche gli sfondi devono usare foto originali');

  const dayButtons = page.locator('.day-tabs button');
  for (let i = 0; i < await dayButtons.count(); i += 1) {
    await dayButtons.nth(i).click();
    const src = await page.locator('#dayImg').getAttribute('src');
    assert.ok(src.startsWith('assets2/real-'), `Foto non originale nel giorno ${i + 1}`);
  }
  await page.locator('.best').scrollIntoViewIfNeeded();
  await page.locator('.best').screenshot({ path: `${output}desktop-best.png` });

  const gallerySources = await page.locator('.gallery .masonry img').evaluateAll(images =>
    images.map(image => new URL(image.src).pathname.replace(/^\//, '')),
  );
  assert.deepEqual(gallerySources, expected, 'La galleria deve contenere solo le quattro foto originali');

  await page.locator('#galleria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const loaded = await page.locator('.gallery .masonry img').evaluateAll(images =>
    images.every(image => image.complete && image.naturalWidth > 0),
  );
  assert.equal(loaded, true, 'Tutte le foto della galleria devono essere caricate');
  await page.locator('#galleria').screenshot({ path: `${output}desktop-gallery-fi.png` });

  await page.locator('#btnEN').click();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  const englishSources = await page.locator('.gallery .masonry img').evaluateAll(images =>
    images.map(image => new URL(image.src).pathname.replace(/^\//, '')),
  );
  assert.deepEqual(englishSources, gallerySources, 'FI ed EN devono mostrare le stesse foto');
  assert.equal(await page.locator('.gallery figcaption').first().textContent(), 'Mo:Mo — from our kitchen');
  await page.locator('#galleria').screenshot({ path: `${output}desktop-gallery-en.png` });

  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.locator('footer .mark').evaluate(image => image.decode());
  const footerLogoLoaded = await page.locator('footer .mark').evaluate(image => image.complete && image.naturalWidth > 0);
  assert.equal(footerLogoLoaded, true, 'Il logo nel piè di pagina deve essere caricato');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:7100/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${output}mobile-home.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, `La pagina mobile non deve avere overflow orizzontale (${overflow}px)`);
  await page.locator('#galleria').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator('#galleria').screenshot({ path: `${output}mobile-gallery.png` });

  assert.deepEqual(pageErrors, [], `Errori JavaScript: ${pageErrors.join('; ')}`);
  assert.deepEqual(localFailures, [], `Risorse locali non caricate: ${localFailures.join('; ')}`);
  console.log('OK: logo, 4 foto originali, sincronizzazione, FI/EN, desktop e mobile verificati.');
} finally {
  if (browser) await browser.close();
  await server.close();
}
