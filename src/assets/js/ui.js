// Shared page behaviour: mobile menu, cart counter, toasts and product cards.
import { bagSvg } from './bag.js';
import { addItem, countItems } from './cart-core.js';
import { BADGES, ROASTS, badgesOf, findProduct, priceOf } from './data.js';
import { escapeHtml } from './html.js';
import { formatPrice } from './money.js';
import { loadCart, onCartChange, saveCart } from './store.js';

export const ICONS = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
};

export function initPage() {
  initMenu();
  updateCartCount(loadCart());
  onCartChange(updateCartCount);
  document.addEventListener('click', onQuickAdd);
}

function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  if (!toggle || !menu) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

function updateCartCount(items) {
  const count = countItems(items);
  for (const badge of document.querySelectorAll('[data-cart-count]')) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }
  const link = document.querySelector('.cart-link');
  if (link) link.setAttribute('aria-label', count ? `Koszyk, sztuk: ${count}` : 'Koszyk, pusty');
}

// `html` must come from this code, never from user input.
export function toast(html) {
  const region = document.querySelector('.toast-region');
  if (!region) return;
  const note = document.createElement('div');
  note.className = 'toast';
  note.innerHTML = html;
  region.append(note);
  setTimeout(() => note.classList.add('is-leaving'), 3600);
  setTimeout(() => note.remove(), 4000);
}

export function addToCart(item) {
  saveCart(addItem(loadCart(), item));
  const product = findProduct(item.slug);
  toast(`${ICONS.check}<span><strong>${escapeHtml(product.name)}</strong> jest w koszyku. <a href="koszyk.html">Zobacz koszyk</a></span>`);
}

function onQuickAdd(event) {
  const button = event.target.closest('[data-quick-add]');
  if (!button) return;
  const product = findProduct(button.dataset.quickAdd);
  if (!product) return;
  const size = product.sizes.some((option) => option.id === button.dataset.size) ? button.dataset.size : product.sizes[0].id;
  addToCart({ slug: product.slug, size, grind: 'ziarno', plan: 'jednorazowo', qty: 1 });
}

export function priceLine(price, sizeLabel) {
  const unit = sizeLabel ? ` <span class="price-unit">/ ${escapeHtml(sizeLabel)}</span>` : '';
  if (!price.promo) return `<span class="price">${formatPrice(price.unit)}</span>${unit}`;
  return `<span class="price price-promo">${formatPrice(price.unit)}</span> <s class="price-old">${formatPrice(price.regular)}</s>${unit}`;
}

export function badgesHtml(badges) {
  return badges.map((badge) => `<span class="badge badge-${badge}">${BADGES[badge]}</span>`).join('');
}

// A card shows one size: the first by default, or e.g. the reduced one in the "Promocje" list.
export function productCard(product, sizeId) {
  const size = product.sizes.find((option) => option.id === sizeId) ?? product.sizes[0];
  const price = priceOf(product, size.id);
  const href = `produkt.html?kawa=${product.slug}${size === product.sizes[0] ? '' : `&opakowanie=${size.id}`}`;
  const badges = badgesHtml(badgesOf(product, size.id));
  return `<article class="card">
  <a class="card-media" href="${href}" style="--tint:${product.background}" tabindex="-1" aria-hidden="true">${bagSvg(product, { label: size.label })}</a>
  ${badges ? `<div class="badges">${badges}</div>` : ''}
  <div class="card-body">
    <p class="card-meta">${escapeHtml(product.country)} · palenie ${ROASTS[product.roast]}</p>
    <h3 class="card-title"><a href="${href}">${escapeHtml(product.name)}</a></h3>
    <p class="card-notes">${product.notes.map(escapeHtml).join(', ')}</p>
    <div class="card-foot">
      <p class="price-line">${priceLine(price, size.label)}</p>
      <button class="add-btn" type="button" data-quick-add="${product.slug}" data-size="${size.id}" aria-label="Dodaj do koszyka: ${escapeHtml(product.name)}, ${size.label}, ziarno">${ICONS.plus}</button>
    </div>
    ${price.promo ? `<p class="omnibus">Najniższa cena z 30 dni przed obniżką: ${formatPrice(price.lowest30)}</p>` : ''}
  </div>
</article>`;
}
