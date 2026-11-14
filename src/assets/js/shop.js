import { METHODS, PRODUCTS, ROASTS, hasPromo, priceOf } from './data.js';
import { initPage, productCard } from './ui.js';

initPage();

const form = document.getElementById('filtry');
const panel = document.querySelector('.filters');
const grid = document.getElementById('lista');
const count = document.getElementById('liczba');
const empty = document.getElementById('pusto');
const active = document.getElementById('aktywne-filtry');
const countrySelect = document.getElementById('kraj');

const countriesOf = (product) => product.country.split(/,\s*|\s+i\s+/);
const normalize = (text) => text.toLocaleLowerCase('pl').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
const searchText = new Map(
  PRODUCTS.map((product) => [product.slug, normalize([product.name, product.country, product.region, product.process, ...product.notes].join(' '))]),
);
const startPrice = (product) => priceOf(product, product.sizes[0].id).unit;

const SORTS = {
  polecane: () => 0,
  'cena-rosnaco': (a, b) => startPrice(a) - startPrice(b),
  'cena-malejaco': (a, b) => startPrice(b) - startPrice(a),
  nazwa: (a, b) => a.name.localeCompare(b.name, 'pl'),
};

for (const country of [...new Set(PRODUCTS.flatMap(countriesOf))].sort((a, b) => a.localeCompare(b, 'pl'))) {
  countrySelect.add(new Option(country, country));
}

function plural(n, [one, few, many]) {
  if (n === 1) return one;
  const tens = n % 100;
  return n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? few : many;
}

function readState() {
  const data = new FormData(form);
  return {
    q: String(data.get('q') ?? '').trim(),
    metoda: data.getAll('metoda').filter((value) => value in METHODS),
    palenie: data.getAll('palenie').filter((value) => value in ROASTS),
    kraj: String(data.get('kraj') ?? ''),
    promocje: data.has('promocje'),
    bezkofeinowa: data.has('bezkofeinowa'),
    sort: SORTS[data.get('sort')] ? String(data.get('sort')) : 'polecane',
  };
}

function applyParams(params) {
  form.elements.q.value = params.get('q') ?? '';
  for (const box of form.querySelectorAll('input[name="metoda"], input[name="palenie"]')) {
    box.checked = params.getAll(box.name).includes(box.value);
  }
  countrySelect.value = [...countrySelect.options].some((option) => option.value === params.get('kraj')) ? params.get('kraj') : '';
  form.elements.promocje.checked = params.get('promocje') === '1';
  form.elements.bezkofeinowa.checked = params.get('bezkofeinowa') === '1';
  form.elements.sort.value = SORTS[params.get('sort')] ? params.get('sort') : 'polecane';
}

function matches(product, state) {
  if (state.metoda.length && !state.metoda.some((method) => product.methods.includes(method))) return false;
  if (state.palenie.length && !state.palenie.includes(product.roast)) return false;
  if (state.kraj && !countriesOf(product).includes(state.kraj)) return false;
  if (state.promocje && !hasPromo(product)) return false;
  if (state.bezkofeinowa && !product.decaf) return false;
  if (state.q) {
    const words = normalize(state.q).split(/\s+/);
    if (!words.every((word) => searchText.get(product.slug).includes(word))) return false;
  }
  return true;
}

function writeUrl(state) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  for (const method of state.metoda) params.append('metoda', method);
  for (const roast of state.palenie) params.append('palenie', roast);
  if (state.kraj) params.set('kraj', state.kraj);
  if (state.promocje) params.set('promocje', '1');
  if (state.bezkofeinowa) params.set('bezkofeinowa', '1');
  if (state.sort !== 'polecane') params.set('sort', state.sort);
  const query = params.toString();
  history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
}

function render() {
  const state = readState();
  const results = PRODUCTS.filter((product) => matches(product, state)).sort(SORTS[state.sort]);
  grid.innerHTML = results
    .map((product) => productCard(product, state.promocje ? product.sizes.find((size) => size.promo !== undefined)?.id : undefined))
    .join('');
  grid.hidden = results.length === 0;
  empty.hidden = results.length > 0;
  count.textContent = `${results.length} ${plural(results.length, ['kawa', 'kawy', 'kaw'])}${state.q ? ` dla „${state.q}”` : ''}`;
  const filters = state.metoda.length + state.palenie.length + (state.kraj ? 1 : 0) + Number(state.promocje) + Number(state.bezkofeinowa);
  active.textContent = filters ? String(filters) : '';
  writeUrl(state);
}

function clearFilters() {
  form.reset();
  render();
}

applyParams(new URLSearchParams(location.search));
render();

form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('reset', () => requestAnimationFrame(render));
// The sort select sits outside the form element (it joins it with form="filtry"), so its events do not bubble to the form.
document.getElementById('sortowanie').addEventListener('change', render);
document.getElementById('wyczysc').addEventListener('click', clearFilters);

// The filter panel folds away on phones and stays open on wide screens.
const wide = matchMedia('(min-width: 960px)');
const syncPanel = () => {
  if (wide.matches) panel.open = true;
};
panel.open = wide.matches || location.search.length > 1;
wide.addEventListener('change', syncPanel);

if (location.hash === '#szukaj') {
  panel.open = true;
  form.elements.q.focus();
}
