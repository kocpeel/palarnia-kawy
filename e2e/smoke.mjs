// Browser test of the main shopping path in installed Microsoft Edge. Also saves screenshots to docs/.
// Run after `npm run build`. Another Chromium browser can be used with BROWSER_CHANNEL=chrome.
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

import { startServer } from '../scripts/serve.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(root, 'docs');
await mkdir(docs, { recursive: true });

const server = await startServer({ root: join(root, 'dist') });
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true });
const problems = [];
const text = async (locator) => (await locator.textContent()).replace(/\s+/g, ' ').trim();
const check = (condition, message) => {
  if (!condition) problems.push(message);
};

function watch(page) {
  page.on('pageerror', (error) => problems.push(`błąd JavaScript: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`konsola: ${message.text()}`);
  });
  page.on('requestfailed', (request) => problems.push(`nie wczytano: ${request.url()}`));
}

async function noSideScroll(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, `${label}: strona przewija się w bok o ${overflow}px`);
}

async function loadLazyImages(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((done) => setTimeout(done, 60));
    }
    await Promise.all([...document.images].map((image) => (image.complete ? null : new Promise((done) => { image.onload = image.onerror = done; }))));
  });
}

async function shot(page, name, fullPage = false) {
  if (fullPage) await loadLazyImages(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  // Full-page shots are photo-heavy, so they are saved as JPEG to stay small enough to upload anywhere.
  await page.screenshot(fullPage ? { path: join(docs, `${name}.jpg`), fullPage, type: 'jpeg', quality: 82 } : { path: join(docs, `${name}.png`) });
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1360, height: 900 }, locale: 'pl-PL' });
  const page = await desktop.newPage();
  watch(page);

  // Home page: featured tabs and recipes.
  await page.goto(base);
  await page.locator('#polecane-lista .card').first().waitFor();
  check(await page.locator('#polecane-lista .card').count() === 4, 'strona główna: brak 4 polecanych kaw');
  await page.getByRole('tab', { name: 'Promocje' }).click();
  check(await page.locator('#polecane-lista .price-promo').count() === 4, 'zakładka Promocje: brak cen promocyjnych');
  await page.getByRole('tab', { name: 'Bestsellery' }).click();
  await page.getByRole('tab', { name: 'Kawiarka' }).click();
  check((await text(page.locator('#przepis h3'))).startsWith('Kawiarka'), 'przepis na kawiarkę się nie pokazał');
  await noSideScroll(page, 'strona główna');
  await shot(page, 'strona-glowna');
  await shot(page, 'strona-glowna-cala', true);

  // Shop: method from the URL, search and empty state.
  await page.goto(`${base}sklep.html?metoda=espresso`);
  await page.locator('#lista .card').first().waitFor();
  check(await page.locator('#lista .card').count() === 5, 'sklep: filtr espresso nie daje 5 kaw');
  await page.getByLabel('Szukaj', { exact: true }).fill('czekolada');
  await page.waitForFunction(() => document.querySelectorAll('#lista .card').length === 2);
  check((await text(page.locator('#liczba'))) === '2 kawy dla „czekolada”', 'sklep: zły licznik wyników');
  check(page.url().includes('q=czekolada') && page.url().includes('metoda=espresso'), 'sklep: filtry nie trafiły do adresu');
  await page.getByLabel('Szukaj', { exact: true }).fill('nie ma takiej kawy');
  await page.locator('#pusto').waitFor();
  await page.locator('#wyczysc').click();
  await page.waitForFunction(() => document.querySelectorAll('#lista .card').length === 12);
  await page.getByLabel('Sortuj').selectOption('cena-rosnaco');
  check((await text(page.locator('#lista .card-title').first())) === 'Mieszanka Do mleka', 'sklep: sortowanie po cenie');
  await shot(page, 'sklep');

  // Product page: size, grind, subscription and quantity.
  await page.goto(`${base}produkt.html?kawa=kenia-nyeri-aa`);
  await page.getByRole('heading', { level: 1, name: 'Kenia Nyeri AA' }).waitFor();
  await page.locator('label.choice', { hasText: '1 kg' }).click();
  await page.getByLabel('Mielenie').selectOption('przelew');
  await page.locator('label.option', { hasText: 'Subskrypcja co 2 tygodnie' }).click();
  await page.getByRole('button', { name: 'Więcej sztuk' }).click();
  check((await text(page.locator('#suma'))) === '394,20 zł', 'karta kawy: zła cena 2 × 1 kg w subskrypcji');
  await shot(page, 'karta-kawy');
  await page.locator('#dodaj').click();
  await page.locator('.toast').waitFor();
  check((await text(page.locator('[data-cart-count]'))) === '2', 'licznik koszyka nie pokazuje 2');

  await page.goto(`${base}produkt.html?kawa=nie-ma-takiej`);
  await page.getByRole('heading', { name: 'Nie mamy takiej kawy' }).waitFor();

  // Quick add from the promotions list.
  await page.goto(`${base}sklep.html?promocje=1`);
  await page.locator('[data-quick-add="kolumbia-huila"]').click();
  await page.locator('.toast').first().waitFor();

  // Cart: discount code, validation, order.
  await page.goto(`${base}koszyk.html`);
  await page.locator('#pozycje .cart-item').nth(1).waitFor();
  check(await page.locator('#pozycje .cart-item').count() === 2, 'koszyk: powinny być 2 pozycje');
  check((await text(page.locator('.summary-total span').last())) === '439,20 zł', 'koszyk: zła suma przed rabatem');
  await page.getByLabel('Kod rabatowy').fill('pierwsza15');
  await page.getByRole('button', { name: 'Użyj' }).click();
  check((await text(page.locator('.summary-total span').last())) === '424,20 zł', 'koszyk: kod rabatowy nie zadziałał');
  await shot(page, 'koszyk');
  await page.getByRole('button', { name: 'Zamawiam z obowiązkiem zapłaty' }).click();
  check(await page.locator('[aria-invalid="true"]').count() === 5, 'koszyk: pusty formularz powinien pokazać 5 błędów');
  await page.getByLabel('Imię i nazwisko').fill('Anna Nowak');
  await page.getByLabel('E-mail').fill('anna@example.com');
  await page.getByLabel('Telefon').fill('600 000 000');
  await page.getByLabel('Kod paczkomatu').fill('kra01m');
  await page.getByLabel(/Akceptuję regulamin/).check();
  await page.getByRole('button', { name: 'Zamawiam z obowiązkiem zapłaty' }).click();
  await page.getByRole('heading', { name: 'Dziękujemy, Anna!' }).waitFor();
  check(await page.locator('[data-cart-count]').isHidden(), 'po zamówieniu koszyk nie jest pusty');
  await desktop.close();

  // Phone width: layout, menu and filters.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pl-PL', isMobile: true, hasTouch: true });
  const mobile = await phone.newPage();
  watch(mobile);
  await mobile.goto(base);
  await mobile.locator('#polecane-lista .card').first().waitFor();
  await noSideScroll(mobile, 'telefon: strona główna');
  await shot(mobile, 'telefon-strona-glowna');
  await mobile.getByRole('button', { name: 'Otwórz menu' }).click();
  check(await mobile.getByRole('navigation', { name: 'Główne menu' }).getByRole('link', { name: 'Sklep' }).isVisible(), 'telefon: menu się nie otwiera');
  await mobile.getByRole('button', { name: 'Zamknij menu' }).click();
  await mobile.goto(`${base}sklep.html`);
  await mobile.locator('#lista .card').first().waitFor();
  check(!(await mobile.getByLabel('Szukaj', { exact: true }).isVisible()), 'telefon: filtry powinny być zwinięte');
  await noSideScroll(mobile, 'telefon: sklep');
  await shot(mobile, 'telefon-sklep');
  await mobile.goto(`${base}produkt.html?kawa=mieszanka-poranna`);
  await mobile.getByRole('heading', { level: 1 }).waitFor();
  await noSideScroll(mobile, 'telefon: karta kawy');
  await shot(mobile, 'telefon-karta-kawy');
  await mobile.locator('#dodaj').click();
  await mobile.goto(`${base}koszyk.html`);
  await mobile.locator('#pozycje .cart-item').first().waitFor();
  await noSideScroll(mobile, 'telefon: koszyk');
  await phone.close();
} catch (error) {
  problems.push(`test przerwany: ${error.message.split('\n')[0]}`);
} finally {
  await browser.close();
  server.close();
}

if (problems.length) {
  console.error(`Problemy (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('Test w przeglądarce przeszedł. Zrzuty ekranu są w docs/.');
