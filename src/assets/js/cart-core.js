// Pure cart logic: no DOM and no storage, so it runs in the browser and in node:test alike.
import { CODES, FREE_SHIPPING_FROM, SHIPPING, findGrind, findPlan, findProduct, findSize, priceOf } from './data.js';

export const MAX_QUANTITY = 20;

export function itemKey({ slug, size, grind, plan }) {
  return [slug, size, grind, plan].join('|');
}

export function isValidItem(item) {
  if (!item || typeof item !== 'object') return false;
  const product = findProduct(item.slug);
  return Boolean(product && findSize(product, item.size) && findGrind(item.grind) && findPlan(item.plan))
    && Number.isInteger(item.qty) && item.qty >= 1 && item.qty <= MAX_QUANTITY;
}

// The same coffee, size, grind and plan share one line in the cart.
export function addItem(items, item) {
  const key = itemKey(item);
  const existing = items.find((line) => itemKey(line) === key);
  if (existing) {
    return items.map((line) => (line === existing ? { ...line, qty: Math.min(MAX_QUANTITY, line.qty + item.qty) } : line));
  }
  const { slug, size, grind, plan, qty } = item;
  return [...items, { slug, size, grind, plan, qty: Math.min(MAX_QUANTITY, qty) }];
}

export function setQuantity(items, key, qty) {
  const clean = Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(Number(qty)) || 1));
  return items.map((line) => (itemKey(line) === key ? { ...line, qty: clean } : line));
}

export function removeItem(items, key) {
  return items.filter((line) => itemKey(line) !== key);
}

export function countItems(items) {
  return items.reduce((sum, line) => sum + line.qty, 0);
}

export function summarize(items, { shippingId = 'paczkomat', code = '' } = {}) {
  const lines = items.filter(isValidItem).map((item) => {
    const product = findProduct(item.slug);
    const price = priceOf(product, item.size, item.plan);
    return {
      ...item,
      key: itemKey(item),
      product,
      sizeInfo: findSize(product, item.size),
      grindInfo: findGrind(item.grind),
      planInfo: findPlan(item.plan),
      price,
      total: price.unit * item.qty,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const normalized = code.trim().toUpperCase();
  const offer = normalized ? CODES[normalized] ?? null : null;
  let codeStatus = null;
  let discount = 0;
  if (normalized && !offer) codeStatus = 'unknown';
  else if (offer && subtotal < offer.minimum) codeStatus = 'minimum';
  else if (offer) {
    codeStatus = 'ok';
    discount = Math.min(offer.amount, subtotal);
  }

  // Subscriptions always ship for free; one-off orders from the threshold up.
  const subscription = lines.some((line) => line.planInfo.discount > 0);
  const method = SHIPPING.find((option) => option.id === shippingId) ?? SHIPPING[0];
  const afterDiscount = subtotal - discount;
  const freeShipping = subscription || afterDiscount >= FREE_SHIPPING_FROM;
  const shipping = lines.length === 0 || freeShipping ? 0 : method.price;

  return {
    lines,
    count: countItems(lines),
    subtotal,
    code: normalized,
    codeStatus,
    offer,
    discount,
    subscription,
    method,
    freeShipping,
    freeShippingLeft: freeShipping ? 0 : Math.max(0, FREE_SHIPPING_FROM - afterDiscount),
    shipping,
    total: afterDiscount + shipping,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^(\+48)?\d{9}$/;
const POSTAL = /^\d{2}-\d{3}$/;
const LOCKER = /^[A-Z]{3}\d{2,3}[A-Z]{0,3}$/;

export function validateCheckout(values, shippingId) {
  const text = (name) => String(values[name] ?? '').trim();
  const errors = {};
  if (text('name').length < 3) errors.name = 'Podaj imię i nazwisko.';
  if (!EMAIL.test(text('email'))) errors.email = 'Podaj adres e-mail, np. ania@example.com.';
  if (!PHONE.test(text('phone').replace(/[\s-]/g, ''))) errors.phone = 'Podaj 9 cyfr numeru telefonu.';
  if (shippingId === 'kurier') {
    if (text('street').length < 3) errors.street = 'Podaj ulicę i numer domu.';
    if (!POSTAL.test(text('postal'))) errors.postal = 'Wpisz kod pocztowy w formacie 00-000.';
    if (text('city').length < 2) errors.city = 'Podaj miejscowość.';
  }
  if (shippingId === 'paczkomat' && !LOCKER.test(text('locker').toUpperCase())) {
    errors.locker = 'Podaj kod paczkomatu, np. KRA01M.';
  }
  if (!values.terms) errors.terms = 'Zaakceptuj regulamin, żeby złożyć zamówienie.';
  return errors;
}
