// Catalogue of the fictional roastery. All prices are in grosze (1 zł = 100 gr).

export const METHODS = {
  przelew: 'Przelew',
  espresso: 'Espresso',
  kawiarka: 'Kawiarka',
  'french-press': 'French press',
};

export const ROASTS = {
  jasne: 'jasne',
  srednie: 'średnie',
  ciemne: 'ciemne',
};

export const GRINDS = [
  { id: 'ziarno', label: 'Ziarno' },
  { id: 'espresso', label: 'Mielona: ekspres ciśnieniowy' },
  { id: 'kawiarka', label: 'Mielona: kawiarka' },
  { id: 'przelew', label: 'Mielona: przelew' },
  { id: 'french-press', label: 'Mielona: French press' },
];

export const PLANS = [
  { id: 'jednorazowo', label: 'Jednorazowo', short: 'jednorazowo', discount: 0 },
  { id: 'co-2-tygodnie', label: 'Subskrypcja co 2 tygodnie', short: 'subskrypcja co 2 tygodnie', discount: 0.1 },
  { id: 'co-4-tygodnie', label: 'Subskrypcja co 4 tygodnie', short: 'subskrypcja co 4 tygodnie', discount: 0.1 },
];

export const SHIPPING = [
  { id: 'paczkomat', label: 'Paczkomat InPost', price: 1399, note: '1–2 dni robocze' },
  { id: 'kurier', label: 'Kurier pod drzwi', price: 1699, note: '1–2 dni robocze' },
  { id: 'odbior', label: 'Odbiór w palarni', price: 0, note: 'Kraków, środa–sobota' },
];

export const FREE_SHIPPING_FROM = 14900;

export const CODES = {
  PIERWSZA15: { label: '15 zł na pierwsze zamówienie', amount: 1500, minimum: 10000 },
};

export const PRODUCTS = [
  {
    slug: 'etiopia-yirgacheffe',
    name: 'Etiopia Yirgacheffe',
    bagTitle: 'Etiopia',
    bagSubtitle: 'Yirgacheffe',
    country: 'Etiopia',
    region: 'Yirgacheffe, Gedeo',
    process: 'myta',
    variety: 'odmiany lokalne',
    altitude: '1900–2200 m n.p.m.',
    roast: 'jasne',
    methods: ['przelew'],
    notes: ['jaśmin', 'bergamotka', 'brzoskwinia'],
    profile: { kwasowosc: 4, slodycz: 3, body: 2 },
    sizes: [
      { id: '250', label: '250 g', price: 5900 },
      { id: '1000', label: '1 kg', price: 19900 },
    ],
    badges: ['bestseller'],
    color: '#e3a33b',
    background: '#f3e5cc',
    description: 'Kwiatowa i lekka jak dobra herbata. Taką kawę parzymy sobie, kiedy chcemy przypomnieć, za co lubimy przelew.',
  },
  {
    slug: 'kenia-nyeri-aa',
    name: 'Kenia Nyeri AA',
    bagTitle: 'Kenia',
    bagSubtitle: 'Nyeri AA',
    country: 'Kenia',
    region: 'Nyeri',
    process: 'myta',
    variety: 'SL28, SL34',
    altitude: '1700–1900 m n.p.m.',
    roast: 'jasne',
    methods: ['przelew'],
    notes: ['czarna porzeczka', 'grejpfrut', 'rabarbar'],
    profile: { kwasowosc: 5, slodycz: 3, body: 3 },
    sizes: [
      { id: '250', label: '250 g', price: 6400 },
      { id: '1000', label: '1 kg', price: 21900 },
    ],
    badges: ['nowosc'],
    color: '#a8324a',
    background: '#f2dde0',
    description: 'Soczysta i wyrazista, z kwasowością, która budzi lepiej niż budzik. Najlepiej smakuje z dripa, gdy lekko przestygnie.',
  },
  {
    slug: 'etiopia-guji-natural',
    name: 'Etiopia Guji Natural',
    bagTitle: 'Etiopia',
    bagSubtitle: 'Guji natural',
    country: 'Etiopia',
    region: 'Guji, Oromia',
    process: 'naturalna',
    variety: 'odmiany lokalne',
    altitude: '2000–2200 m n.p.m.',
    roast: 'jasne',
    methods: ['przelew', 'french-press'],
    notes: ['jagoda', 'truskawka', 'mleczna czekolada'],
    profile: { kwasowosc: 3, slodycz: 5, body: 3 },
    sizes: [
      { id: '250', label: '250 g', price: 6300 },
      { id: '1000', label: '1 kg', price: 21500 },
    ],
    badges: ['nowosc'],
    color: '#6f4b96',
    background: '#e9e0f0',
    description: 'Słodka jak deser z owocami leśnymi. Ziarna suszą się w całych owocach, dlatego kawa ma tyle słodyczy i pełne ciało.',
  },
  {
    slug: 'rwanda-nyamasheke',
    name: 'Rwanda Nyamasheke',
    bagTitle: 'Rwanda',
    bagSubtitle: 'Nyamasheke',
    country: 'Rwanda',
    region: 'Nyamasheke, jezioro Kiwu',
    process: 'myta',
    variety: 'Red Bourbon',
    altitude: '1700–1900 m n.p.m.',
    roast: 'jasne',
    methods: ['przelew'],
    notes: ['czerwona porzeczka', 'czarna herbata', 'miód'],
    profile: { kwasowosc: 4, slodycz: 4, body: 2 },
    sizes: [
      { id: '250', label: '250 g', price: 6200 },
      { id: '1000', label: '1 kg', price: 20900 },
    ],
    badges: ['nowosc'],
    color: '#cf5f36',
    background: '#f5e0d5',
    description: 'Delikatna i słodka, z herbacianym finiszem. Dobra na pierwszą kawę z przelewu, bo wybacza drobne błędy w parzeniu.',
  },
  {
    slug: 'kolumbia-huila',
    name: 'Kolumbia Huila',
    bagTitle: 'Kolumbia',
    bagSubtitle: 'Huila',
    country: 'Kolumbia',
    region: 'Huila',
    process: 'myta',
    variety: 'Caturra, Castillo',
    altitude: '1600–1800 m n.p.m.',
    roast: 'srednie',
    methods: ['przelew', 'espresso', 'kawiarka', 'french-press'],
    notes: ['karmel', 'czerwone jabłko', 'kakao'],
    profile: { kwasowosc: 3, slodycz: 4, body: 3 },
    sizes: [
      { id: '250', label: '250 g', price: 5200, promo: 4500 },
      { id: '1000', label: '1 kg', price: 17900 },
    ],
    badges: ['bestseller'],
    color: '#c27b2a',
    background: '#f1e3cf',
    description: 'Kawa na każdą okazję i do każdej metody. Słodka, okrągła i przewidywalna w najlepszym sensie tego słowa.',
  },
  {
    slug: 'gwatemala-huehuetenango',
    name: 'Gwatemala Huehuetenango',
    bagTitle: 'Gwatemala',
    bagSubtitle: 'Huehuetenango',
    country: 'Gwatemala',
    region: 'Huehuetenango',
    process: 'myta',
    variety: 'Bourbon, Caturra',
    altitude: '1700–2000 m n.p.m.',
    roast: 'srednie',
    methods: ['przelew', 'kawiarka', 'french-press'],
    notes: ['mleczna czekolada', 'wiśnia', 'migdał'],
    profile: { kwasowosc: 3, slodycz: 3, body: 4 },
    sizes: [
      { id: '250', label: '250 g', price: 5500 },
      { id: '1000', label: '1 kg', price: 18900, promo: 16900 },
    ],
    badges: [],
    color: '#3d7a57',
    background: '#deebe2',
    description: 'Czekoladowa, z wiśnią w tle. Świetnie znosi kawiarkę i French press, kiedy chcesz czegoś pełniejszego niż przelew.',
  },
  {
    slug: 'peru-cajamarca',
    name: 'Peru Cajamarca',
    bagTitle: 'Peru',
    bagSubtitle: 'Cajamarca',
    country: 'Peru',
    region: 'Cajamarca',
    process: 'myta',
    variety: 'Typica, Caturra',
    altitude: '1600–1900 m n.p.m.',
    roast: 'srednie',
    methods: ['przelew', 'kawiarka', 'french-press'],
    notes: ['brązowy cukier', 'orzech włoski', 'pomarańcza'],
    profile: { kwasowosc: 2, slodycz: 4, body: 3 },
    sizes: [
      { id: '250', label: '250 g', price: 4900 },
      { id: '1000', label: '1 kg', price: 16900, promo: 14900 },
    ],
    badges: [],
    color: '#a0682a',
    background: '#eee1d1',
    description: 'Łagodna i słodka, bez ostrych krawędzi. Kawa do kubka na cały dzień, także dla tych, którzy dopiero zaczynają.',
  },
  {
    slug: 'brazylia-cerrado',
    name: 'Brazylia Cerrado',
    bagTitle: 'Brazylia',
    bagSubtitle: 'Cerrado',
    country: 'Brazylia',
    region: 'Cerrado Mineiro',
    process: 'naturalna',
    variety: 'Mundo Novo, Catuaí',
    altitude: '1000–1200 m n.p.m.',
    roast: 'ciemne',
    methods: ['espresso', 'kawiarka', 'french-press'],
    notes: ['orzech laskowy', 'mleczna czekolada', 'karmel'],
    profile: { kwasowosc: 1, slodycz: 4, body: 5 },
    sizes: [
      { id: '250', label: '250 g', price: 4200 },
      { id: '1000', label: '1 kg', price: 13900 },
    ],
    badges: ['bestseller'],
    color: '#6b4630',
    background: '#e9ded4',
    description: 'Orzechowa klasyka do espresso i kawiarki. Niska kwasowość i gęste ciało, więc świetnie łączy się z mlekiem.',
  },
  {
    slug: 'mieszanka-poranna',
    name: 'Mieszanka Poranna',
    bagTitle: 'Poranna',
    bagSubtitle: 'mieszanka espresso',
    country: 'Brazylia i Kolumbia',
    region: 'Cerrado Mineiro i Huila',
    process: 'naturalna i myta',
    variety: 'Mundo Novo, Caturra',
    altitude: '1100–1800 m n.p.m.',
    roast: 'ciemne',
    methods: ['espresso', 'kawiarka'],
    notes: ['kakao', 'toffi', 'prażone orzechy'],
    profile: { kwasowosc: 2, slodycz: 4, body: 5 },
    sizes: [
      { id: '250', label: '250 g', price: 4600 },
      { id: '1000', label: '1 kg', price: 15900 },
    ],
    badges: ['bestseller'],
    color: '#d9a441',
    background: '#e4dfd9',
    description: 'Nasza codzienna mieszanka do ekspresu. Gęsta crema, kakao i toffi, a z mlekiem smakuje jak dobre cappuccino z kawiarni.',
  },
  {
    slug: 'mieszanka-do-mleka',
    name: 'Mieszanka Do mleka',
    bagTitle: 'Do mleka',
    bagSubtitle: 'mieszanka espresso',
    country: 'Brazylia i Peru',
    region: 'Cerrado Mineiro i Cajamarca',
    process: 'naturalna i myta',
    variety: 'Catuaí, Typica',
    altitude: '1000–1900 m n.p.m.',
    roast: 'ciemne',
    methods: ['espresso', 'kawiarka'],
    notes: ['gorzka czekolada', 'melasa', 'cynamon'],
    profile: { kwasowosc: 1, slodycz: 3, body: 5 },
    sizes: [
      { id: '250', label: '250 g', price: 4400, promo: 3900 },
      { id: '1000', label: '1 kg', price: 14900 },
    ],
    badges: [],
    color: '#8a2e2e',
    background: '#efdcda',
    description: 'Mocna i czekoladowa, przebija się przez każdą ilość mleka. Dla tych, którzy piją latte i flat white.',
  },
  {
    slug: 'kolumbia-decaf',
    name: 'Kolumbia Decaf',
    bagTitle: 'Decaf',
    bagSubtitle: 'Kolumbia',
    country: 'Kolumbia',
    region: 'Huila',
    process: 'bezkofeinowa, z trzciną cukrową',
    variety: 'Castillo, Caturra',
    altitude: '1600–1800 m n.p.m.',
    roast: 'srednie',
    methods: ['przelew', 'espresso', 'kawiarka', 'french-press'],
    notes: ['panela', 'czerwone owoce', 'kakao'],
    profile: { kwasowosc: 2, slodycz: 4, body: 3 },
    sizes: [
      { id: '250', label: '250 g', price: 5400 },
      { id: '1000', label: '1 kg', price: 18500 },
    ],
    badges: ['nowosc'],
    decaf: true,
    color: '#3b6a8a',
    background: '#dce7ee',
    description: 'Cały smak kawy bez kofeiny. Kofeinę usuwa się naturalnie, octanem etylu z trzciny cukrowej, więc nic nie zakłóca słodyczy.',
  },
  {
    slug: 'zestaw-degustacyjny',
    name: 'Zestaw degustacyjny',
    bagTitle: 'Zestaw',
    bagSubtitle: '3 × 100 g',
    country: 'Etiopia, Kenia i Rwanda',
    region: 'trzy jasne kawy z tego tygodnia',
    process: 'myta i naturalna',
    variety: 'różne',
    altitude: '1700–2200 m n.p.m.',
    roast: 'jasne',
    methods: ['przelew'],
    notes: ['kwiaty', 'owoce leśne', 'herbata'],
    profile: { kwasowosc: 4, slodycz: 4, body: 2 },
    sizes: [{ id: '3x100', label: '3 × 100 g', price: 6900 }],
    badges: ['prezent'],
    set: true,
    color: '#1f1a17',
    background: '#ebe3d6',
    description: 'Trzy jasne kawy po 100 g, żeby porównać je obok siebie. Dobry prezent i najlepszy sposób, żeby znaleźć swój ulubiony kraj.',
  },
];

export const BADGES = {
  bestseller: 'Bestseller',
  nowosc: 'Nowość',
  prezent: 'Na prezent',
  promocja: 'Promocja',
};

export function findProduct(slug) {
  return PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export function findSize(product, sizeId) {
  return product.sizes.find((size) => size.id === sizeId) ?? null;
}

export function findPlan(planId) {
  return PLANS.find((plan) => plan.id === planId) ?? null;
}

export function findGrind(grindId) {
  return GRINDS.find((grind) => grind.id === grindId) ?? null;
}

export function hasPromo(product, sizeId) {
  return product.sizes.some((size) => size.promo !== undefined && (sizeId === undefined || size.id === sizeId));
}

// Badges shown on a card or product page. With a size, "Promocja" appears only when that size is reduced.
export function badgesOf(product, sizeId) {
  return hasPromo(product, sizeId) ? [...product.badges, 'promocja'] : product.badges;
}

// Price of one item for a size and plan. `lowest30` is the lowest price from the 30 days before a promotion,
// which Polish law requires next to every reduced price; here the regular price did not change in that time.
export function priceOf(product, sizeId, planId = 'jednorazowo') {
  const size = findSize(product, sizeId);
  const plan = findPlan(planId);
  if (!size || !plan) return null;
  const base = size.promo ?? size.price;
  return {
    regular: size.price,
    base,
    unit: Math.round(base * (1 - plan.discount)),
    promo: size.promo !== undefined,
    lowest30: size.promo !== undefined ? size.price : null,
  };
}
