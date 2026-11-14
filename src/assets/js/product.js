import { bagSvg } from './bag.js';
import { MAX_QUANTITY, summarize } from './cart-core.js';
import {
  FREE_SHIPPING_FROM, GRINDS, METHODS, PLANS, PRODUCTS, ROASTS, badgesOf, findProduct, priceOf,
} from './data.js';
import { escapeHtml } from './html.js';
import { formatPrice } from './money.js';
import { RECIPES } from './recipes.js';
import { loadCart, onCartChange } from './store.js';
import { ICONS, addToCart, badgesHtml, initPage, priceLine, productCard } from './ui.js';

initPage();

const params = new URLSearchParams(location.search);
const product = findProduct(params.get('kawa'));
const root = document.getElementById('produkt');

if (!product) {
  showMissing();
} else {
  showProduct(product);
}

function showMissing() {
  document.title = 'Nie ma takiej kawy | Ziarnisto';
  document.getElementById('okruszek').textContent = 'Nie znaleziono';
  root.innerHTML = `<div class="empty">
    <h1>Nie mamy takiej kawy</h1>
    <p>Może skończyła się w tym tygodniu albo link jest niepełny.</p>
    <a class="btn btn-dark" href="sklep.html">Zobacz wszystkie kawy</a>
  </div>`;
  showRelated(PRODUCTS.filter((item) => item.badges.includes('bestseller')));
}

function showProduct(item) {
  const sizeParam = params.get('opakowanie');
  const planParam = params.get('plan');
  const state = {
    size: item.sizes.some((size) => size.id === sizeParam) ? sizeParam : item.sizes[0].id,
    grind: 'ziarno',
    plan: PLANS.some((plan) => plan.id === planParam) ? planParam : 'jednorazowo',
    qty: 1,
  };

  document.title = `${item.name} – palenie ${ROASTS[item.roast]} | Ziarnisto`;
  document.querySelector('meta[name="description"]').setAttribute('content', `${item.name}: ${item.notes.join(', ')}. ${item.description}`);
  document.getElementById('okruszek').textContent = item.name;

  root.innerHTML = `
  <div class="product">
    <div class="product-media" style="--tint:${item.background}">
      <div class="badges" id="odznaki"></div>
      <div class="product-bag" id="opakowanie"></div>
    </div>
    <div class="product-info">
      <p class="card-meta">${escapeHtml(item.country)} · palenie ${ROASTS[item.roast]}</p>
      <h1>${escapeHtml(item.name)}</h1>
      <p class="product-sub">${escapeHtml(item.region)} · obróbka ${escapeHtml(item.process)}</p>
      <ul class="notes" aria-label="Nuty smakowe">${item.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
      <p class="product-desc">${escapeHtml(item.description)}</p>
      <div id="cena" aria-live="polite"></div>
      <form class="buy" id="kup" novalidate>
        <fieldset>
          <legend>Opakowanie</legend>
          <div class="choices">${item.sizes.map((size) => `
            <label class="choice"><input type="radio" name="size" value="${size.id}"${size.id === state.size ? ' checked' : ''}><span>${size.label}</span></label>`).join('')}
          </div>
        </fieldset>
        <div class="field">
          <label for="mielenie">Mielenie</label>
          <select id="mielenie" name="grind">${GRINDS.map((grind) => `<option value="${grind.id}">${grind.label}</option>`).join('')}</select>
          <span class="hint">Mielimy tuż przed wysyłką. Najdłużej świeża zostaje kawa w ziarnach.</span>
        </div>
        <fieldset>
          <legend>Jak kupujesz?</legend>
          <div class="option-cards" id="plany"></div>
        </fieldset>
        <div class="buy-row">
          <div class="qty">
            <button type="button" data-step="-1" aria-label="Mniej sztuk">−</button>
            <input id="ilosc" name="qty" type="number" inputmode="numeric" min="1" max="${MAX_QUANTITY}" value="1" aria-label="Liczba sztuk">
            <button type="button" data-step="1" aria-label="Więcej sztuk">+</button>
          </div>
          <button class="btn btn-primary" type="submit" id="dodaj"><span id="dodaj-tekst">Dodaj do koszyka</span><span aria-hidden="true">·</span><span id="suma"></span></button>
        </div>
        <div class="ship-progress" id="dostawa" aria-live="polite"></div>
        <ul class="perks">
          <li>${ICONS.check}Palimy we wtorek, wysyłamy w środę</li>
          <li>${ICONS.check}Data palenia na każdej paczce</li>
          <li>${ICONS.check}14 dni na zwrot nieotwartej kawy</li>
        </ul>
      </form>
    </div>
  </div>
  <div class="details-grid">
    <section class="panel" aria-labelledby="profil-title">
      <h2 id="profil-title">Profil smaku</h2>
      ${meter('Kwasowość', item.profile.kwasowosc)}
      ${meter('Słodycz', item.profile.slodycz)}
      ${meter('Ciało', item.profile.body)}
    </section>
    <section class="panel" aria-labelledby="pochodzenie-title">
      <h2 id="pochodzenie-title">Skąd pochodzi</h2>
      <dl class="spec">
        <dt>Kraj</dt><dd>${escapeHtml(item.country)}</dd>
        <dt>Region</dt><dd>${escapeHtml(item.region)}</dd>
        <dt>Wysokość</dt><dd>${escapeHtml(item.altitude)}</dd>
        <dt>Odmiana</dt><dd>${escapeHtml(item.variety)}</dd>
        <dt>Obróbka</dt><dd>${escapeHtml(item.process)}</dd>
      </dl>
    </section>
    <section class="panel" aria-labelledby="parzenie-title">
      <h2 id="parzenie-title">Jak parzyć</h2>
      <p>Najlepiej smakuje z: ${item.methods.map((method) => METHODS[method]).join(', ')}.</p>
      ${recipeSummary(item.methods[0])}
      <a class="link-arrow" href="index.html#parzenie">Wszystkie przepisy <span aria-hidden="true">→</span></a>
    </section>
  </div>`;

  const form = document.getElementById('kup');
  const quantity = document.getElementById('ilosc');
  const addLabel = document.getElementById('dodaj-tekst');
  let labelTimer;

  const update = () => {
    const planHadFocus = document.activeElement?.name === 'plan';
    const size = item.sizes.find((option) => option.id === state.size);
    const price = priceOf(item, state.size, state.plan);
    const base = priceOf(item, state.size);
    document.getElementById('opakowanie').innerHTML = bagSvg(item, { label: size.label });
    document.getElementById('odznaki').innerHTML = badgesHtml(badgesOf(item, state.size));
    document.getElementById('cena').innerHTML = `
      <p class="price-big">${priceLine(base)} <span class="price-unit">/ ${size.label}</span></p>
      ${base.promo ? `<p class="omnibus">Najniższa cena z 30 dni przed obniżką: ${formatPrice(base.lowest30)}</p>` : ''}`;
    document.getElementById('plany').innerHTML = PLANS.map((plan) => {
      const planPrice = priceOf(item, state.size, plan.id);
      const extra = plan.discount ? '<small>10% taniej, dostawa gratis, przerwa w każdej chwili</small>' : '<small>Jedna paczka, bez zobowiązań</small>';
      return `<label class="option">
        <input type="radio" name="plan" value="${plan.id}"${plan.id === state.plan ? ' checked' : ''}>
        <span><span><strong>${plan.label}</strong>${extra}</span>
        ${plan.discount ? '<span class="save-tag">−10%</span>' : ''}
        <span class="option-price">${formatPrice(planPrice.unit)}</span></span>
      </label>`;
    }).join('');
    if (planHadFocus) form.querySelector('input[name="plan"]:checked').focus();
    document.getElementById('suma').textContent = formatPrice(price.unit * state.qty);
    showShipping(price.unit * state.qty, state.plan !== 'jednorazowo');
  };

  form.addEventListener('change', (event) => {
    if (event.target.name === 'size') state.size = event.target.value;
    if (event.target.name === 'plan') state.plan = event.target.value;
    if (event.target.name === 'grind') state.grind = event.target.value;
    if (event.target.name === 'qty') setQuantity(event.target.value);
    update();
  });
  quantity.addEventListener('input', () => {
    if (quantity.value !== '') setQuantity(quantity.value, false);
    update();
  });
  form.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    if (!step) return;
    setQuantity(state.qty + Number(step.dataset.step));
    update();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    addToCart({ slug: item.slug, size: state.size, grind: state.grind, plan: state.plan, qty: state.qty });
    addLabel.textContent = 'Dodano do koszyka';
    clearTimeout(labelTimer);
    labelTimer = setTimeout(() => { addLabel.textContent = 'Dodaj do koszyka'; }, 1800);
  });
  onCartChange(update);

  function setQuantity(value, write = true) {
    state.qty = Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(Number(value)) || 1));
    if (write) quantity.value = String(state.qty);
  }

  update();
  const related = PRODUCTS.filter((other) => other.slug !== item.slug && other.methods.some((method) => item.methods.includes(method)));
  showRelated(related);
}

function showShipping(selection, subscription) {
  const box = document.getElementById('dostawa');
  if (subscription) {
    box.innerHTML = 'W subskrypcji dostawa jest zawsze <strong>gratis</strong>.<div class="bar" aria-hidden="true"><span style="--progress:100%"></span></div>';
    return;
  }
  const inCart = summarize(loadCart()).subtotal;
  const total = inCart + selection;
  const left = Math.max(0, FREE_SHIPPING_FROM - total);
  const progress = Math.min(100, Math.round((total / FREE_SHIPPING_FROM) * 100));
  box.innerHTML = `${left ? `Z tą kawą do darmowej dostawy brakuje <strong>${formatPrice(left)}</strong>.` : 'Z tą kawą masz <strong>darmową dostawę</strong>.'}
    <div class="bar" aria-hidden="true"><span style="--progress:${progress}%"></span></div>`;
}

function meter(label, value) {
  const cells = Array.from({ length: 5 }, (_, index) => `<span${index < value ? ' class="on"' : ''}></span>`).join('');
  return `<div class="meter"><span>${label}</span><span class="meter-track" role="img" aria-label="${label}: ${value} na 5">${cells}</span></div>`;
}

function recipeSummary(method) {
  const recipe = RECIPES[method];
  return `<p class="hint">${escapeHtml(recipe.title)}: ${recipe.facts.map(([value, label]) => `${value} ${label}`).join(', ')}.</p>`;
}

function showRelated(list) {
  document.getElementById('podobne').innerHTML = list.slice(0, 4).map((item) => productCard(item)).join('');
}
