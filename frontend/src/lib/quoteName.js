import { formatCurrency } from './pricing.js';

const PRODUCT_ABBREV = {
  engagementBuilder: 'EB',
  communityBuilder: 'CB',
  controlTowerUltra: 'CTU',
};

/** Build a human-readable quote name from current form state. */
export function buildSuggestedQuoteName(quote, pricing = null) {
  const parts = [];

  const school = quote.schoolName?.trim();
  if (school) parts.push(school);

  const students = Number(quote.students) || 0;
  if (students > 0) {
    parts.push(`${students.toLocaleString('en-US')} students`);
  }

  const products = Object.entries(PRODUCT_ABBREV)
    .filter(([key]) => quote[key])
    .map(([, abbrev]) => abbrev);
  if (quote.clever) products.push('Clever');
  if (quote.sms) products.push('SMS');
  if (products.length) parts.push(products.join(', '));

  const years = Number(quote.years) || 1;
  parts.push(years === 1 ? '1 yr' : `${years} yr`);

  if (pricing?.annualTotal > 0) {
    parts.push(`${formatCurrency(pricing.annualTotal)}/yr`);
  }

  if (parts.length === 0) return 'New quote';
  return parts.join(' · ');
}

export function displayQuoteLabel(quote) {
  return quote.quoteName?.trim() || quote.schoolName?.trim() || 'Untitled quote';
}
