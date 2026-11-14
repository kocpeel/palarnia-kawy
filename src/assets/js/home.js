import { CODES, PRODUCTS, findProduct, hasPromo } from './data.js';
import { escapeHtml } from './html.js';
import { RECIPES } from './recipes.js';
import { initTabs } from './tabs.js';
import { initPage, productCard } from './ui.js';

initPage();

const FEATURED = {
  bestseller: (product) => product.badges.includes('bestseller'),
  nowosc: (product) => product.badges.includes('nowosc'),
  promocja: (product) => hasPromo(product),
};

const featuredList = document.getElementById('polecane-lista');
initTabs(document.querySelector('#polecane [role="tablist"]'), (tab) => {
  const kind = tab.dataset.filter;
  const products = PRODUCTS.filter(FEATURED[kind]).slice(0, 4);
  featuredList.innerHTML = products
    .map((product) => productCard(product, kind === 'promocja' ? product.sizes.find((size) => size.promo !== undefined).id : undefined))
    .join('');
  featuredList.setAttribute('aria-labelledby', tab.id);
});

const recipePanel = document.getElementById('przepis');
initTabs(document.querySelector('#parzenie [role="tablist"]'), (tab) => {
  const recipe = RECIPES[tab.dataset.recipe];
  const coffee = findProduct(recipe.coffee);
  recipePanel.setAttribute('aria-labelledby', tab.id);
  recipePanel.innerHTML = `
    <h3>${escapeHtml(recipe.title)}</h3>
    <div class="recipe-facts">${recipe.facts.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
    <ol class="recipe-steps">${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
    <p>Do tej metody polecamy: <a href="produkt.html?kawa=${coffee.slug}">${escapeHtml(coffee.name)}</a>.</p>`;
});

const newsletter = document.getElementById('newsletter');
newsletter.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = newsletter.elements.email;
  const note = document.getElementById('newsletter-note');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  input.setAttribute('aria-invalid', String(!valid));
  if (!valid) {
    note.textContent = 'Wpisz poprawny adres e-mail, np. ania@example.com.';
    input.focus();
    return;
  }
  const [code] = Object.keys(CODES);
  note.innerHTML = `Gotowe! Twój kod to <strong>${code}</strong>. W wersji demonstracyjnej nie wysyłamy żadnych maili.`;
  newsletter.reset();
});
