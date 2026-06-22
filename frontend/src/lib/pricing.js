export const PRICING_CONFIG = {
  traditional: { perStudent: 5, minimum: 3000 },
  online: { perStudent: 6.5, minimum: 3900 },
  districtMinimum: 6000,
};

export const CLEVER_FEE_FLAT = 500;

const PRICING_TIERS = [
  { min: 120000, max: Infinity, startRatio: 0.484375, endRatio: 0.484375 },
  { min: 60000, max: 119999, startRatio: 0.515625, endRatio: 0.484375 },
  { min: 30000, max: 59999, startRatio: 0.539063, endRatio: 0.515625 },
  { min: 15000, max: 29999, startRatio: 0.554688, endRatio: 0.539063 },
  { min: 7500, max: 14999, startRatio: 0.570313, endRatio: 0.554688 },
  { min: 5000, max: 7499, startRatio: 0.601563, endRatio: 0.570313 },
  { min: 2500, max: 4999, startRatio: 0.65625, endRatio: 0.601563 },
  { min: 1500, max: 2499, startRatio: 0.71875, endRatio: 0.65625 },
  { min: 1200, max: 1499, startRatio: 0.804688, endRatio: 0.71875 },
  { min: 750, max: 1199, startRatio: 0.914063, endRatio: 0.804688 },
  { min: 600, max: 749, startRatio: 1.0, endRatio: 0.914063 },
];

const PRODUCT_KEYS = ['engagementBuilder', 'communityBuilder', 'controlTowerUltra'];

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '$0';
  const rounded = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function safeMultiply(a, b) {
  return round2(a * b);
}

function getBasePrice(schoolType) {
  return PRICING_CONFIG[schoolType]?.perStudent ?? PRICING_CONFIG.online.perStudent;
}

function getMinimumCost(schoolType, isDistrict) {
  if (isDistrict) return PRICING_CONFIG.districtMinimum;
  return PRICING_CONFIG[schoolType]?.minimum ?? PRICING_CONFIG.online.minimum;
}

function calculateLicenseForProduct(students, schoolType, isDistrict) {
  const raw = safeMultiply(students, getBasePrice(schoolType));
  return Math.max(raw, getMinimumCost(schoolType, isDistrict));
}

function calculateVolumeDiscount(students, subtotal) {
  if (students < 500) return 0;
  const tier = PRICING_TIERS.find(t => students >= t.min && students <= t.max);
  if (!tier) return 0;
  let ratio;
  if (tier.max === Infinity) {
    ratio = tier.startRatio;
  } else {
    const progress = (students - tier.min) / (tier.max - tier.min);
    ratio = tier.startRatio + progress * (tier.endRatio - tier.startRatio);
  }
  const discounted = safeMultiply(subtotal, ratio);
  return round2(subtotal - discounted);
}

function calculateImplementationFee(normalizedSubtotal) {
  if (normalizedSubtotal < 6000) return 1450;
  if (normalizedSubtotal <= 20000) return 1950;
  return 2950;
}

export function getMultiYearDiscountPercent(years) {
  if (years === 2) return 2.5;
  if (years === 3) return 5;
  if (years === 5) return 10;
  return 0;
}

function calculateMultiYearDiscount(subtotal, years) {
  const rate = getMultiYearDiscountPercent(years) / 100;
  if (!rate) return 0;
  return safeMultiply(subtotal, rate);
}

function getActiveProducts(quote) {
  return PRODUCT_KEYS.filter(key => Boolean(quote[key]));
}

function computeCustomItemValue(item, percentBase) {
  const amount = Number(item.amount) || 0;
  let value;
  if (item.isPercent) {
    value = safeMultiply(percentBase, amount / 100);
  } else {
    value = amount;
  }
  return item.isDiscount ? -Math.abs(value) : Math.abs(value);
}

function processCustomItems(customItems, annualPercentBase, oneTimePercentBase) {
  return (customItems || []).map(item => {
    const isOneTime = Boolean(item.isOneTime);
    const percentBase = isOneTime ? oneTimePercentBase : annualPercentBase;
    return {
      ...item,
      isOneTime,
      computedValue: computeCustomItemValue(item, percentBase),
    };
  });
}

/** @param {object} quote Full quote state from QuoteContext */
export function calculatePricing(quote) {
  const students = Number(quote.students) || 0;
  const years = Number(quote.years) || 1;
  const schoolType = quote.schoolType || 'online';
  const isDistrict = Boolean(quote.isDistrict);
  const isFirstYear = quote.isFirstYear !== false;
  const customItems = quote.customItems || [];

  if (students < 0) throw new Error('Students cannot be negative');
  if (years < 1 || years > 5) throw new Error('Years must be between 1 and 5');

  const activeProducts = getActiveProducts(quote);
  const productCount = activeProducts.length;

  const licensePerProduct = productCount > 0
    ? calculateLicenseForProduct(students, schoolType, isDistrict)
    : 0;

  const productLicenses = {};
  activeProducts.forEach(name => {
    productLicenses[name] = licensePerProduct;
  });

  const productSubtotal = round2(licensePerProduct * productCount);
  const volumeDiscount = calculateVolumeDiscount(students, productSubtotal);
  const volumeDiscountPercent =
    productSubtotal > 0 ? Math.round((volumeDiscount / productSubtotal) * 100) : 0;
  const subtotalAfterVolume = round2(productSubtotal - volumeDiscount);

  const multiProductDiscount =
    productCount >= 2 ? safeMultiply(productSubtotal, 0.1) : 0;
  const subtotalAfterMultiProduct = round2(subtotalAfterVolume - multiProductDiscount);

  const normalizedSubtotal = productCount > 0 ? subtotalAfterVolume / productCount : 0;
  const implementationFee = isFirstYear ? calculateImplementationFee(normalizedSubtotal) : 0;

  const cleverSchools = quote.clever ? Math.max(1, Number(quote.cleverSchools) || 1) : 0;
  const cleverFee = quote.clever ? CLEVER_FEE_FLAT * cleverSchools : 0;
  const smsFee = quote.sms ? (Number(quote.smsFee) || 0) : 0;
  const addOnTotal = round2(cleverFee + smsFee);

  const multiYearDiscount = calculateMultiYearDiscount(productSubtotal, years);
  const subtotalAfterMultiYear = round2(subtotalAfterMultiProduct - multiYearDiscount);

  const oneTimePercentBase = round2(
    (subtotalAfterMultiYear + addOnTotal) * years + implementationFee,
  );
  const processedCustomItems = processCustomItems(
    customItems,
    subtotalAfterMultiProduct,
    oneTimePercentBase,
  );
  const annualCustomTotal = round2(
    processedCustomItems.filter(i => !i.isOneTime).reduce((sum, i) => sum + i.computedValue, 0),
  );
  const dealCustomTotal = round2(
    processedCustomItems.filter(i => i.isOneTime).reduce((sum, i) => sum + i.computedValue, 0),
  );

  const annualBase = round2(subtotalAfterMultiYear + annualCustomTotal + addOnTotal);
  const annualTotal = annualBase;

  const listTotal = round2(productSubtotal + addOnTotal);
  const annualSavings = round2(listTotal - annualTotal);
  const grandTotal = round2(annualTotal * years + implementationFee + dealCustomTotal);
  const listGrandTotal = round2(listTotal * years + implementationFee);
  const totalSavings = round2(listGrandTotal - grandTotal);

  const modulesNet = round2(annualTotal - addOnTotal);
  const perModuleNet = productCount > 0 ? round2(modulesNet / productCount) : 0;
  const volumePerModule = productCount > 0 ? round2(volumeDiscount / productCount) : 0;
  const listPerModule = licensePerProduct;

  const yearBreakdowns = [];
  for (let y = 1; y <= years; y += 1) {
    yearBreakdowns.push({
      year: y,
      license: annualTotal,
      implementation: y === 1 ? implementationFee : 0,
      total: round2(annualTotal + (y === 1 ? implementationFee + dealCustomTotal : 0)),
    });
  }

  return {
    productLicenses,
    productSubtotal,
    volumeDiscount,
    volumeDiscountPercent,
    subtotalAfterVolume,
    multiProductDiscount,
    subtotalAfterMultiProduct,
    subtotalAfterMultiYear,
    implementationFee,
    customItems: processedCustomItems,
    annualCustomTotal,
    dealCustomTotal,
    annualBase,
    multiYearDiscount,
    annualTotal,
    grandTotal,
    years,
    listTotal,
    totalSavings,
    annualSavings,
    cleverFee,
    cleverSchools,
    smsFee,
    addOnTotal,
    yearBreakdowns,
    ebPrice: quote.engagementBuilder ? perModuleNet : 0,
    cbPrice: quote.communityBuilder ? perModuleNet : 0,
    ctuPrice: quote.controlTowerUltra ? perModuleNet : 0,
    listEbPrice: quote.engagementBuilder ? listPerModule : 0,
    listCbPrice: quote.communityBuilder ? listPerModule : 0,
    listCtuPrice: quote.controlTowerUltra ? listPerModule : 0,
    volumePerModule,
    termTotal: round2(annualTotal * years),
    listTermTotal: round2(listTotal * years),
  };
}

/** Default yearly schedule: license split evenly; implementation fee in year 1 only. */
export function buildDefaultYearlyPayments(results) {
  const years = results.years;
  if (years <= 1) return [];

  const licensePerYear = round2(results.termTotal / years);
  const editable = [];
  for (let i = 0; i < years - 1; i += 1) {
    editable.push(
      i === 0
        ? round2(licensePerYear + results.implementationFee + (results.dealCustomTotal || 0))
        : licensePerYear,
    );
  }
  return editable;
}

/**
 * Resolve display schedule for multi-year quotes when pay-upfront is off.
 * Years 1..N-1 come from quote.yearlyPayments (or defaults); year N is the remainder.
 */
export function resolveYearlyPaymentSchedule(quote, results) {
  const years = results.years;
  if (years <= 1 || quote.payUpfront !== false) return [];

  let editable = quote.yearlyPayments;
  if (!Array.isArray(editable) || editable.length !== years - 1) {
    editable = buildDefaultYearlyPayments(results);
  }

  const sumPrevious = editable.reduce((sum, amt) => round2(sum + (Number(amt) || 0)), 0);
  const finalYear = round2(results.grandTotal - sumPrevious);

  const schedule = editable.map((amount, index) => ({
    year: index + 1,
    amount: round2(Number(amount) || 0),
    editable: true,
    isRemainder: false,
  }));
  schedule.push({
    year: years,
    amount: finalYear,
    editable: false,
    isRemainder: true,
  });
  return schedule;
}

/** @deprecated Use calculatePricing(quote) instead */
export class ProductPricingCalculator {
  constructor({ schoolType, students, isDistrict, isFirstYear, years, products, customItems, clever, sms, smsFee }) {
    this.schoolType = schoolType || 'online';
    this.students = Number(students) || 0;
    this.isDistrict = Boolean(isDistrict);
    this.isFirstYear = Boolean(isFirstYear);
    this.years = Number(years) || 1;
    this.products = products || {};
    this.customItems = customItems || [];
    this.clever = Boolean(clever);
    this.sms = Boolean(sms);
    this.smsFee = smsFee;
  }

  validateInputs() {
    if (this.students < 0) throw new Error('Students cannot be negative');
    if (this.years < 1 || this.years > 5) throw new Error('Years must be between 1 and 5');
  }

  calculateTotal() {
    this.validateInputs();
    return calculatePricing({
      schoolType: this.schoolType,
      students: this.students,
      isDistrict: this.isDistrict,
      isFirstYear: this.isFirstYear,
      years: this.years,
      customItems: this.customItems,
      clever: this.clever,
      sms: this.sms,
      smsFee: this.smsFee,
      engagementBuilder: this.products.engagementBuilder,
      communityBuilder: this.products.communityBuilder,
      controlTowerUltra: this.products.controlTowerUltra,
    });
  }
}
