// Cart persistence. localStorage can be blocked (private mode, disabled cookies), so every access is guarded
// and the cart falls back to memory for the current page.
import { isValidItem } from './cart-core.js';

const KEY = 'ziarnisto:koszyk';
const EVENT = 'ziarnisto:koszyk';
let memory = [];

export function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    return memory.filter(isValidItem);
  }
}

export function saveCart(items) {
  memory = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable: the cart lives only until the page is closed.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onCartChange(callback) {
  window.addEventListener(EVENT, () => callback(loadCart()));
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) callback(loadCart());
  });
}
