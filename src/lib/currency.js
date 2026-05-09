export const CURRENCIES = [
  // ── Southeast Asia ──────────────────────────────────────────
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit',    decimals: 2, region: 'SE Asia' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',     decimals: 2, region: 'SE Asia' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah',    decimals: 0, region: 'SE Asia' },
  { code: 'PHP', symbol: '₱',    name: 'Philippine Peso',      decimals: 2, region: 'SE Asia' },
  { code: 'THB', symbol: '฿',    name: 'Thai Baht',            decimals: 2, region: 'SE Asia' },
  { code: 'VND', symbol: '₫',    name: 'Vietnamese Dong',      decimals: 0, region: 'SE Asia' },
  { code: 'BND', symbol: 'B$',   name: 'Brunei Dollar',        decimals: 2, region: 'SE Asia' },
  { code: 'KHR', symbol: '៛',    name: 'Cambodian Riel',       decimals: 0, region: 'SE Asia' },
  { code: 'MMK', symbol: 'K',    name: 'Myanmar Kyat',         decimals: 0, region: 'SE Asia' },
  { code: 'LAK', symbol: '₭',    name: 'Laotian Kip',          decimals: 0, region: 'SE Asia' },
  // ── Global ──────────────────────────────────────────────────
  { code: 'USD', symbol: '$',    name: 'US Dollar',            decimals: 2, region: 'Global' },
  { code: 'EUR', symbol: '€',    name: 'Euro',                 decimals: 2, region: 'Global' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',        decimals: 2, region: 'Global' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',    decimals: 2, region: 'Global' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar',      decimals: 2, region: 'Global' },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen',         decimals: 0, region: 'Global' },
  { code: 'CNY', symbol: 'CN¥',  name: 'Chinese Yuan',         decimals: 2, region: 'Global' },
  { code: 'KRW', symbol: '₩',    name: 'South Korean Won',     decimals: 0, region: 'Global' },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',         decimals: 2, region: 'Global' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',           decimals: 2, region: 'Global' },
  { code: 'SAR', symbol: 'SAR',  name: 'Saudi Riyal',          decimals: 2, region: 'Global' },
  { code: 'HKD', symbol: 'HK$',  name: 'Hong Kong Dollar',     decimals: 2, region: 'Global' },
  { code: 'TWD', symbol: 'NT$',  name: 'New Taiwan Dollar',    decimals: 0, region: 'Global' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar',   decimals: 2, region: 'Global' },
];

export function getCurrency(code = 'USD') {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES.find(c => c.code === 'USD');
}

export function formatPrice(amount, currencyCode = 'USD') {
  const currency = getCurrency(currencyCode);
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency.symbol}0`;
  const fixed = num.toFixed(currency.decimals);
  const withCommas = fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency.symbol}${withCommas}`;
}

// Group currencies by region for the selector
export const CURRENCY_GROUPS = CURRENCIES.reduce((acc, c) => {
  if (!acc[c.region]) acc[c.region] = [];
  acc[c.region].push(c);
  return acc;
}, {});
