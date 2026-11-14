// Draws a coffee pouch as inline SVG, so every product gets a consistent packshot without product photos.
import { escapeHtml } from './html.js';

const POUCH = { jasne: '#f3ebdf', srednie: '#c9a271', ciemne: '#2b231d' };
const ROAST_LEVEL = { jasne: 1, srednie: 2, ciemne: 3 };
let counter = 0;

function isDark(hex) {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b) < 0.36;
}

export function bagSvg(product, { label = product.sizes[0].label } = {}) {
  counter += 1;
  const shade = `bag-shade-${counter}`;
  const pouch = POUCH[product.roast];
  const crimp = isDark(pouch) ? 'rgba(255,255,255,.16)' : 'rgba(40,25,15,.14)';
  const ink = isDark(product.color) ? '#fffaf2' : '#21170f';
  const titleSize = Math.min(19, 150 / product.bagTitle.length).toFixed(1);
  const crimps = Array.from({ length: 19 }, (_, index) => `M${46 + index * 6} 18v18`).join('');
  const dots = [0, 1, 2]
    .map((index) => {
      const filled = index < ROAST_LEVEL[product.roast];
      return `<circle cx="${88 + index * 12}" cy="184" r="3.6" fill="${filled ? ink : 'none'}" stroke="${ink}" stroke-width="1.3"/>`;
    })
    .join('');

  return `<svg class="bag" viewBox="0 0 200 260" role="img" aria-label="Opakowanie: ${escapeHtml(product.name)}">
  <defs>
    <linearGradient id="${shade}" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".22"/>
      <stop offset=".16" stop-color="#000" stop-opacity="0"/>
      <stop offset=".55" stop-color="#fff" stop-opacity=".07"/>
      <stop offset=".84" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".26"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="249" rx="68" ry="7" fill="#000" opacity=".13"/>
  <path d="M38 36h124l6 196q0 12-12 12H44q-12 0-12-12z" fill="${pouch}"/>
  <path d="M38 36h124l6 196q0 12-12 12H44q-12 0-12-12z" fill="url(#${shade})"/>
  <rect x="38" y="14" width="124" height="26" rx="3" fill="${pouch}"/>
  <rect x="38" y="14" width="124" height="26" rx="3" fill="url(#${shade})"/>
  <path d="${crimps}" stroke="${crimp}" stroke-width="1.2"/>
  <path d="M38 41h124" stroke="${crimp}" stroke-width="1.5"/>
  <circle cx="100" cy="66" r="8" fill="#000" opacity=".16"/>
  <circle cx="100" cy="66" r="3.5" fill="#fff" opacity=".35"/>
  <rect x="54" y="90" width="92" height="126" rx="8" fill="${product.color}"/>
  <g fill="${ink}" text-anchor="middle">
    <text x="100" y="111" font-family="Inter, system-ui, sans-serif" font-size="8.5" font-weight="700" letter-spacing="2.4">ZIARNISTO</text>
    <path d="M80 120h40" stroke="${ink}" stroke-opacity=".5" stroke-width="1"/>
    <text x="100" y="148" font-family="Fraunces, Georgia, serif" font-size="${titleSize}" font-weight="600">${escapeHtml(product.bagTitle)}</text>
    <text x="100" y="164" font-family="Inter, system-ui, sans-serif" font-size="8.6">${escapeHtml(product.bagSubtitle)}</text>
    ${dots}
    <text x="100" y="206" font-family="Inter, system-ui, sans-serif" font-size="8.5" font-weight="600">${escapeHtml(label)}</text>
  </g>
</svg>`;
}
