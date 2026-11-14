import { bagSvg } from './bag.js';
import { MAX_QUANTITY, removeItem, setQuantity, summarize, validateCheckout } from './cart-core.js';
import { FREE_SHIPPING_FROM, SHIPPING } from './data.js';
import { escapeHtml } from './html.js';
import { formatPrice } from './money.js';
import { loadCart, onCartChange, saveCart } from './store.js';
import { ICONS, initPage } from './ui.js';

initPage();

const root = document.getElementById('koszyk');
const state = { shippingId: 'paczkomat', code: '' };
const FIELDS = ['name', 'email', 'phone', 'locker', 'street', 'postal', 'city', 'terms'];
let layoutReady = false;
let completed = false;

function render() {
  if (completed) return;
  const summary = summarize(loadCart(), state);
  if (summary.lines.length === 0) {
    layoutReady = false;
    root.innerHTML = `<div class="empty">
      <h2>Twój koszyk jest pusty</h2>
      <p>Zajrzyj do sklepu albo zacznij od naszych bestsellerów.</p>
      <a class="btn btn-dark" href="sklep.html">Przejdź do sklepu</a>
    </div>`;
    return;
  }
  if (!layoutReady) {
    renderLayout();
    layoutReady = true;
  }
  renderLines(summary);
  renderSummary(summary);
}

function field(name, label, attributes, { wide = false, hint = '' } = {}) {
  const described = [`f-${name}-error`, hint ? `f-${name}-hint` : ''].filter(Boolean).join(' ');
  return `<div class="field${wide ? ' span-2' : ''}">
    <label for="f-${name}">${label}</label>
    <input id="f-${name}" name="${name}" ${attributes} aria-describedby="${described}">
    ${hint ? `<span class="hint" id="f-${name}-hint">${hint}</span>` : ''}
    <span class="field-error" id="f-${name}-error"></span>
  </div>`;
}

function radioCard(name, value, title, note, price, checked) {
  return `<label class="option">
    <input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}>
    <span><span><strong>${title}</strong><small>${note}</small></span>${price ? `<span class="option-price">${price}</span>` : ''}</span>
  </label>`;
}

function renderLayout() {
  root.innerHTML = `
  <div class="cart-layout">
    <div>
      <section aria-labelledby="pozycje-title">
        <h2 class="visually-hidden" id="pozycje-title">Produkty w koszyku</h2>
        <ul class="cart-list" id="pozycje"></ul>
      </section>
      <form class="checkout" id="zamowienie" novalidate>
        <h2>Dostawa i dane</h2>
        <fieldset class="form-section">
          <legend>Sposób dostawy</legend>
          <div class="option-cards">${SHIPPING.map((option) => radioCard('shipping', option.id, option.label, option.note,
            option.price ? formatPrice(option.price) : 'gratis', option.id === state.shippingId)).join('')}</div>
        </fieldset>
        <div class="form-section">
          <h3>Dane kontaktowe</h3>
          <div class="form-grid two">
            ${field('name', 'Imię i nazwisko', 'autocomplete="name"', { wide: true })}
            ${field('email', 'E-mail', 'type="email" autocomplete="email"')}
            ${field('phone', 'Telefon', 'type="tel" autocomplete="tel" inputmode="tel"')}
          </div>
        </div>
        <div class="form-section" data-for="paczkomat">
          <h3>Paczkomat</h3>
          ${field('locker', 'Kod paczkomatu', 'autocomplete="off" autocapitalize="characters"', { hint: 'Znajdziesz go na mapie paczkomatów, np. KRA01M.' })}
        </div>
        <div class="form-section" data-for="kurier" hidden>
          <h3>Adres dostawy</h3>
          <div class="form-grid two">
            ${field('street', 'Ulica i numer', 'autocomplete="address-line1"', { wide: true })}
            ${field('postal', 'Kod pocztowy', 'autocomplete="postal-code" inputmode="numeric" placeholder="00-000"')}
            ${field('city', 'Miejscowość', 'autocomplete="address-level2"')}
          </div>
        </div>
        <div class="form-section" data-for="odbior" hidden>
          <h3>Odbiór w palarni</h3>
          <p>Kawę odbierzesz przy ul. Przykładowej 1 w Krakowie, od środy do soboty w godzinach 10:00–18:00. Napiszemy, gdy paczka będzie gotowa.</p>
        </div>
        <fieldset class="form-section">
          <legend>Płatność</legend>
          <div class="option-cards">
            ${radioCard('payment', 'blik', 'BLIK', 'Kod z aplikacji banku', '', true)}
            ${radioCard('payment', 'przelew', 'Szybki przelew', 'Wybierasz swój bank', '', false)}
            ${radioCard('payment', 'karta', 'Karta płatnicza', 'Visa lub Mastercard', '', false)}
          </div>
        </fieldset>
        <div class="form-section">
          <label class="checkbox"><input type="checkbox" id="f-terms" name="terms" aria-describedby="f-terms-error"> Akceptuję regulamin sklepu i politykę prywatności.</label>
          <span class="field-error" id="f-terms-error"></span>
        </div>
        <div class="form-section">
          <button class="btn btn-primary btn-block" type="submit">Zamawiam z obowiązkiem zapłaty</button>
          <p class="demo-note">To wersja demonstracyjna: zamówienie nie zostanie wysłane, a płatność nie zostanie pobrana.</p>
        </div>
      </form>
    </div>
    <aside class="summary" aria-labelledby="podsumowanie-title">
      <h2 id="podsumowanie-title">Podsumowanie</h2>
      <div id="podsumowanie" aria-live="polite"></div>
      <form class="code-form" id="kod" novalidate>
        <label class="visually-hidden" for="f-code">Kod rabatowy</label>
        <input id="f-code" name="code" placeholder="Kod rabatowy" autocomplete="off">
        <button class="btn btn-dark" type="submit">Użyj</button>
      </form>
      <p class="code-status" id="kod-status" role="status"></p>
    </aside>
  </div>`;

  const checkout = document.getElementById('zamowienie');
  checkout.addEventListener('change', (event) => {
    if (event.target.name !== 'shipping') return;
    state.shippingId = event.target.value;
    for (const section of checkout.querySelectorAll('[data-for]')) section.hidden = section.dataset.for !== state.shippingId;
    render();
  });
  checkout.addEventListener('submit', onCheckout);
  for (const name of FIELDS) {
    checkout.elements[name]?.addEventListener('input', () => showError(name, ''));
  }

  document.getElementById('kod').addEventListener('submit', (event) => {
    event.preventDefault();
    state.code = event.target.elements.code.value;
    render();
  });

  const list = document.getElementById('pozycje');
  list.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    const remove = event.target.closest('[data-remove]');
    if (step) {
      const line = step.closest('[data-key]');
      const current = Number(line.querySelector('input').value);
      update(setQuantity(loadCart(), line.dataset.key, current + Number(step.dataset.step)), line.dataset.key, step.dataset.step);
    }
    if (remove) update(removeItem(loadCart(), remove.dataset.remove), null, null);
  });
  list.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="number"]')) return;
    const line = event.target.closest('[data-key]');
    update(setQuantity(loadCart(), line.dataset.key, event.target.value), line.dataset.key, 'input');
  });
}

// Saves the cart and puts keyboard focus back on the control that was used, since the list is re-rendered.
function update(items, key, control) {
  saveCart(items);
  if (!key) {
    document.getElementById('podsumowanie-title')?.setAttribute('tabindex', '-1');
    document.getElementById('podsumowanie-title')?.focus();
    return;
  }
  const line = [...document.querySelectorAll('#pozycje [data-key]')].find((item) => item.dataset.key === key);
  const target = control === 'input' ? line?.querySelector('input') : line?.querySelector(`[data-step="${control}"]`);
  target?.focus();
}

function renderLines(summary) {
  document.getElementById('pozycje').innerHTML = summary.lines.map((line) => {
    const name = escapeHtml(line.product.name);
    const href = `produkt.html?kawa=${line.product.slug}`;
    const plan = line.planInfo.discount
      ? `<strong>${line.planInfo.label}</strong>, 10% taniej`
      : 'Zakup jednorazowy';
    return `<li class="cart-item" data-key="${escapeHtml(line.key)}">
      <a class="cart-thumb" href="${href}" style="--tint:${line.product.background}" tabindex="-1" aria-hidden="true">${bagSvg(line.product, { label: line.sizeInfo.label })}</a>
      <div>
        <h3><a href="${href}">${name}</a></h3>
        <p class="cart-item-meta">${line.sizeInfo.label} · ${line.grindInfo.label}<br>${plan} · ${formatPrice(line.price.unit)} za sztukę</p>
        <div class="cart-item-foot">
          <div class="qty">
            <button type="button" data-step="-1" aria-label="Mniej sztuk: ${name}">−</button>
            <input type="number" inputmode="numeric" min="1" max="${MAX_QUANTITY}" value="${line.qty}" aria-label="Liczba sztuk: ${name}">
            <button type="button" data-step="1" aria-label="Więcej sztuk: ${name}">+</button>
          </div>
          <span class="line-total">${formatPrice(line.total)}</span>
          <button class="remove" type="button" data-remove="${escapeHtml(line.key)}">Usuń<span class="visually-hidden"> ${name}</span></button>
        </div>
      </div>
    </li>`;
  }).join('');
}

function renderSummary(summary) {
  const progress = Math.min(100, Math.round(((summary.subtotal - summary.discount) / FREE_SHIPPING_FROM) * 100));
  let shippingNote = '';
  if (summary.subscription) shippingNote = '<p class="hint">W subskrypcji dostawa jest zawsze gratis.</p>';
  else if (summary.freeShippingLeft && summary.method.price) {
    shippingNote = `<div class="ship-progress">Do darmowej dostawy brakuje <strong>${formatPrice(summary.freeShippingLeft)}</strong>.
      <div class="bar" aria-hidden="true"><span style="--progress:${progress}%"></span></div></div>`;
  }
  document.getElementById('podsumowanie').innerHTML = `
    <div class="summary-row"><span>Produkty (${summary.count} szt.)</span><span>${formatPrice(summary.subtotal)}</span></div>
    ${summary.discount ? `<div class="summary-row discount"><span>Rabat ${escapeHtml(summary.code)}</span><span>−${formatPrice(summary.discount)}</span></div>` : ''}
    <div class="summary-row"><span>Dostawa: ${summary.method.label}</span><span>${summary.shipping ? formatPrice(summary.shipping) : 'gratis'}</span></div>
    ${shippingNote}
    <div class="summary-row summary-total"><span>Do zapłaty</span><span>${formatPrice(summary.total)}</span></div>
    <p class="hint">Ceny zawierają VAT.</p>`;

  const status = document.getElementById('kod-status');
  const messages = {
    ok: `Kod działa: ${summary.offer?.label ?? ''}.`,
    minimum: `Ten kod działa przy zamówieniu od ${formatPrice(summary.offer?.minimum ?? 0)}.`,
    unknown: 'Nie znamy takiego kodu. Sprawdź, czy nie ma literówki.',
  };
  status.textContent = summary.codeStatus ? messages[summary.codeStatus] : '';
  status.className = `code-status ${summary.codeStatus === 'ok' ? 'ok' : 'bad'}`;
}

function showError(name, message) {
  const input = document.getElementById(`f-${name}`);
  const error = document.getElementById(`f-${name}-error`);
  if (!input || !error) return;
  error.textContent = message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
}

function onCheckout(event) {
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form));
  values.terms = form.elements.terms.checked;
  const errors = validateCheckout(values, state.shippingId);
  for (const name of FIELDS) showError(name, errors[name] ?? '');
  const first = FIELDS.find((name) => errors[name]);
  if (first) {
    document.getElementById(`f-${first}`).focus();
    return;
  }

  const summary = summarize(loadCart(), state);
  const number = `ZI/2026/${String(Math.floor(1000 + Math.random() * 9000))}`;
  completed = true;
  saveCart([]);
  root.innerHTML = `<div class="success">
    <div class="success-icon">${ICONS.check}</div>
    <h2 id="sukces" tabindex="-1">Dziękujemy, ${escapeHtml(String(values.name).trim().split(/\s+/)[0])}!</h2>
    <p>Zamówienie <strong>${number}</strong> na kwotę <strong>${formatPrice(summary.total)}</strong> zostało przyjęte. Kawę palimy we wtorek i wysyłamy w środę.</p>
    <p class="demo-note">To wersja demonstracyjna: nie wysłaliśmy maila, nie pobraliśmy płatności, a koszyk został wyczyszczony.</p>
    <p><a class="btn btn-dark" href="sklep.html">Wróć do sklepu</a></p>
  </div>`;
  window.scrollTo({ top: 0 });
  document.getElementById('sukces').focus();
}

render();
onCartChange(render);
