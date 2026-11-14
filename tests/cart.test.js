import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MAX_QUANTITY, addItem, countItems, isValidItem, itemKey, removeItem, setQuantity, summarize, validateCheckout,
} from '../src/assets/js/cart-core.js';
import { FREE_SHIPPING_FROM } from '../src/assets/js/data.js';
import { formatPrice } from '../src/assets/js/money.js';

const yirga = { slug: 'etiopia-yirgacheffe', size: '250', grind: 'ziarno', plan: 'jednorazowo', qty: 1 };

describe('koszyk', () => {
  it('łączy tę samą kawę w jedną pozycję i pilnuje limitu sztuk', () => {
    let items = addItem([], yirga);
    items = addItem(items, { ...yirga, qty: 2 });
    assert.equal(items.length, 1);
    assert.equal(items[0].qty, 3);

    items = addItem(items, { ...yirga, qty: 50 });
    assert.equal(items[0].qty, MAX_QUANTITY);
  });

  it('inne mielenie albo plan to osobna pozycja', () => {
    let items = addItem([], yirga);
    items = addItem(items, { ...yirga, grind: 'przelew' });
    items = addItem(items, { ...yirga, plan: 'co-2-tygodnie' });
    assert.equal(items.length, 3);
    assert.equal(countItems(items), 3);
  });

  it('zmienia ilość w granicach 1–20 i usuwa pozycję', () => {
    const key = itemKey(yirga);
    let items = setQuantity([yirga], key, 0);
    assert.equal(items[0].qty, 1);
    items = setQuantity(items, key, '7');
    assert.equal(items[0].qty, 7);
    assert.deepEqual(removeItem(items, key), []);
  });

  it('odrzuca nieznane kawy i błędne dane z pamięci przeglądarki', () => {
    assert.equal(isValidItem(yirga), true);
    assert.equal(isValidItem({ ...yirga, slug: 'nie-ma-takiej' }), false);
    assert.equal(isValidItem({ ...yirga, size: '500' }), false);
    assert.equal(isValidItem({ ...yirga, qty: 1.5 }), false);
    assert.equal(isValidItem(null), false);
    assert.equal(summarize([{ ...yirga, slug: 'stara-kawa' }, yirga]).lines.length, 1);
  });
});

describe('podsumowanie', () => {
  it('liczy cenę promocyjną i dolicza dostawę poniżej progu', () => {
    const summary = summarize([{ slug: 'kolumbia-huila', size: '250', grind: 'ziarno', plan: 'jednorazowo', qty: 2 }]);
    assert.equal(summary.subtotal, 9000);
    assert.equal(summary.shipping, 1399);
    assert.equal(summary.total, 10399);
    assert.equal(summary.freeShippingLeft, FREE_SHIPPING_FROM - 9000);
  });

  it('od 149 zł dostawa jest za darmo', () => {
    const summary = summarize([{ ...yirga, qty: 3 }], { shippingId: 'kurier' });
    assert.equal(summary.subtotal, 17700);
    assert.equal(summary.shipping, 0);
    assert.equal(summary.freeShippingLeft, 0);
  });

  it('subskrypcja daje 10% rabatu i darmową dostawę', () => {
    const summary = summarize([{ ...yirga, plan: 'co-4-tygodnie' }]);
    assert.equal(summary.lines[0].price.unit, 5310);
    assert.equal(summary.subscription, true);
    assert.equal(summary.shipping, 0);
    assert.equal(summary.total, 5310);
  });

  it('kod rabatowy działa od kwoty minimalnej', () => {
    assert.equal(summarize([yirga], { code: 'pierwsza15' }).codeStatus, 'minimum');
    assert.equal(summarize([yirga], { code: 'ZLY-KOD' }).codeStatus, 'unknown');

    const summary = summarize([{ ...yirga, qty: 2 }], { code: ' pierwsza15 ', shippingId: 'kurier' });
    assert.equal(summary.codeStatus, 'ok');
    assert.equal(summary.discount, 1500);
    assert.equal(summary.total, 11800 - 1500 + 1699);
  });

  it('próg darmowej dostawy liczy się po rabacie', () => {
    const summary = summarize([{ slug: 'etiopia-yirgacheffe', size: '1000', grind: 'ziarno', plan: 'jednorazowo', qty: 1 }], {
      code: 'PIERWSZA15',
    });
    assert.equal(summary.subtotal - summary.discount, 18400);
    assert.equal(summary.shipping, 0);
  });

  it('odbiór osobisty jest bezpłatny, a pusty koszyk nic nie kosztuje', () => {
    assert.equal(summarize([yirga], { shippingId: 'odbior' }).shipping, 0);
    const empty = summarize([]);
    assert.equal(empty.total, 0);
    assert.equal(empty.shipping, 0);
  });
});

describe('formularz zamówienia', () => {
  const good = { name: 'Anna Nowak', email: 'anna@example.com', phone: '+48 600 000 000', locker: 'kra01m', terms: true };

  it('przyjmuje poprawne dane do paczkomatu', () => {
    assert.deepEqual(validateCheckout(good, 'paczkomat'), {});
  });

  it('wymaga adresu dla kuriera i kodu w formacie 00-000', () => {
    const errors = validateCheckout({ ...good, street: 'Długa 5', postal: '30-0001', city: 'Kraków' }, 'kurier');
    assert.deepEqual(Object.keys(errors), ['postal']);
  });

  it('wskazuje każde błędne pole', () => {
    const errors = validateCheckout({ name: 'A', email: 'anna@', phone: '123', locker: '', terms: false }, 'paczkomat');
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'locker', 'name', 'phone', 'terms']);
  });
});

describe('ceny', () => {
  it('formatuje kwoty po polsku', () => {
    assert.equal(formatPrice(4500).replace(/\s/g, ' '), '45,00 zł');
  });
});
