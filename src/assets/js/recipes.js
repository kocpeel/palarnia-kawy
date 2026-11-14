// Starting recipes for each brewing method, shown on the home page and on product pages.
export const RECIPES = {
  przelew: {
    title: 'Przelew: drip, V60 albo Chemex',
    facts: [['15 g', 'kawy'], ['250 ml', 'wody'], ['93°C', 'temperatura'], ['3:00', 'czas']],
    steps: [
      'Zmiel kawę średnio drobno, mniej więcej jak sól kuchenną.',
      'Przelej papierowy filtr gorącą wodą i wylej ją z dzbanka.',
      'Wlej 40 ml wody i odczekaj 30 sekund, aż kawa odgazuje.',
      'Dolewaj resztę wody spiralnie w trzech porcjach, do 250 ml.',
      'Po około 3 minutach woda przecieknie. Zamieszaj dzbanek i podawaj.',
    ],
    coffee: 'etiopia-yirgacheffe',
  },
  espresso: {
    title: 'Espresso z ekspresu kolbowego',
    facts: [['18 g', 'kawy'], ['36 g', 'napoju'], ['93°C', 'temperatura'], ['28 s', 'czas']],
    steps: [
      'Zmiel kawę drobno, tuż przed parzeniem.',
      'Rozprowadź kawę w koszyku i ubij ją równo, bez przechylania.',
      'Postaw filiżankę na wadze: z 18 g kawy chcesz około 36 g espresso.',
      'Leci szybciej niż 25 s? Zmiel drobniej. Wolniej niż 32 s? Grubiej.',
    ],
    coffee: 'mieszanka-poranna',
  },
  kawiarka: {
    title: 'Kawiarka na kuchence',
    facts: [['17 g', 'kawy'], ['170 ml', 'wody'], ['70°C', 'woda na start'], ['5 min', 'czas']],
    steps: [
      'Wlej do zbiorniczka gorącą wodę, do wysokości zaworu.',
      'Wsyp kawę do sitka i wyrównaj ją palcem, ale nie ubijaj.',
      'Postaw kawiarkę na średnim ogniu z otwartą pokrywką.',
      'Gdy kawa zacznie bulgotać, zdejmij kawiarkę i schłodź jej dno pod zimną wodą.',
    ],
    coffee: 'brazylia-cerrado',
  },
  'french-press': {
    title: 'French press',
    facts: [['30 g', 'kawy'], ['500 ml', 'wody'], ['94°C', 'temperatura'], ['4 min', 'czas']],
    steps: [
      'Zmiel kawę grubo, jak gruboziarnistą sól.',
      'Zalej kawę całą wodą naraz i zamieszaj.',
      'Po 4 minutach rozbij kożuch i zbierz pianę łyżką.',
      'Wciśnij tłok tylko do powierzchni kawy i od razu przelej ją do filiżanek.',
    ],
    coffee: 'gwatemala-huehuetenango',
  },
};
