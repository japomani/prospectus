import { CLEVER_FEE_FLAT, calculatePricing, formatCurrency } from './pricing.js';

/** Price if this module were added to the current quote. */
export function priceIfModuleAdded(quote, quoteKey) {
  const mod = { ...quote, [quoteKey]: true };
  try {
    const pricing = calculatePricing(mod);
    if (quoteKey === 'engagementBuilder') return pricing.ebPrice;
    if (quoteKey === 'communityBuilder') return pricing.cbPrice;
    if (quoteKey === 'controlTowerUltra') return pricing.ctuPrice;
  } catch {
    return null;
  }
  return null;
}

export function formatModulePrice(quote, quoteKey) {
  const amount = priceIfModuleAdded(quote, quoteKey);
  if (!amount || amount <= 0) return 'Contact us';
  return formatCurrency(amount);
}

export function formatAddonPrice(quote, quoteKey) {
  if (quoteKey === 'clever') {
    const schools = Math.max(1, Number(quote.cleverSchools) || 1);
    return formatCurrency(CLEVER_FEE_FLAT * schools);
  }
  if (quoteKey === 'sms') {
    const fee = Number(quote.smsFee) || 0;
    if (fee > 0) return formatCurrency(fee);
    return 'Custom / quote';
  }
  return '—';
}
