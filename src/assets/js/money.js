const formatter = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });

// 4500 → "45,00 zł"
export function formatPrice(grosze) {
  return formatter.format(grosze / 100);
}
