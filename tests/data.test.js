import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BADGES, METHODS, PRODUCTS, ROASTS, badgesOf, priceOf } from '../src/assets/js/data.js';

describe('katalog', () => {
  it('każda kawa ma unikalny adres i komplet danych', () => {
    const slugs = new Set(PRODUCTS.map((product) => product.slug));
    assert.equal(slugs.size, PRODUCTS.length);
    for (const product of PRODUCTS) {
      assert.match(product.slug, /^[a-z0-9-]+$/, product.slug);
      assert.ok(product.name && product.description && product.notes.length === 3, product.slug);
      assert.ok(product.roast in ROASTS, product.slug);
      assert.ok(product.methods.length > 0 && product.methods.every((method) => method in METHODS), product.slug);
      assert.match(product.color, /^#[0-9a-f]{6}$/, product.slug);
      assert.ok(badgesOf(product).every((badge) => badge in BADGES), product.slug);
    }
  });

  it('ceny są całkowite, a promocja jest niższa od ceny regularnej', () => {
    for (const product of PRODUCTS) {
      for (const size of product.sizes) {
        assert.ok(Number.isInteger(size.price) && size.price > 0, `${product.slug} ${size.id}`);
        if (size.promo !== undefined) assert.ok(size.promo < size.price, `${product.slug} ${size.id}`);
      }
    }
  });

  it('przy promocji podaje najniższą cenę z 30 dni', () => {
    const huila = PRODUCTS.find((product) => product.slug === 'kolumbia-huila');
    assert.deepEqual(priceOf(huila, '250'), { regular: 5200, base: 4500, unit: 4500, promo: true, lowest30: 5200 });
    assert.equal(priceOf(huila, '1000').lowest30, null);
    assert.equal(priceOf(huila, '500'), null);
  });
});
