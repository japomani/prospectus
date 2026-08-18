import { formatCurrency } from './pricing.js';
import { defaultValidUntil, formatDate, formatGoLiveDisplay } from './dates.js';
import { overageModeLabel, DEFAULT_PROSPECTUS_CONFIG, mergeProspectusConfig } from './smsCredits.js';

export const PILOT_FEE = 5000;

/** Live defaults from admin config; updated via setProspectusDefaults(). */
let prospectusDefaults = { ...DEFAULT_PROSPECTUS_CONFIG };

export function setProspectusDefaults(partial) {
  prospectusDefaults = mergeProspectusConfig(partial);
}

export function getProspectusDefaults() {
  return { ...prospectusDefaults };
}

function formatSchoolType(schoolType) {
  return schoolType === 'online' ? 'fully online K-12' : 'traditional K-12';
}

function formatTermYears(years) {
  return years === 1 ? '1 year' : `${years} years`;
}

function formatStudentCount(students) {
  return students.toLocaleString('en-US');
}

function formatSmsFee(pricing, quote) {
  if (!quote.sms) return 'Custom / quote';
  if (pricing.smsFee > 0) return formatCurrency(pricing.smsFee);
  return 'Custom / quote';
}

function formatCleverFee(pricing, quote) {
  if (!quote.clever) return '—';
  if (pricing.cleverFee > 0) return formatCurrency(pricing.cleverFee);
  return 'Custom / quote';
}

function possessive(name) {
  if (!name) return "Your School's";
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

function formatRate(rate) {
  if (!rate || rate <= 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 5,
  }).format(rate);
}

export function buildFields(quote, pricing) {
  const preparedDate = quote.preparedDate ? new Date(quote.preparedDate) : new Date();
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil)
    : new Date(preparedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const years = pricing.years || quote.years || 1;
  const snap = quote.smsSnapshot || {};
  const credits = Number(snap.creditsPurchased ?? quote.smsCreditsPurchased) || 0;
  const rate = Number(snap.effectiveRate) || 0;
  const discount = Number(snap.discountOverFull) || 0;

  return {
    SCHOOL_NAME: quote.schoolName || 'Your School',
    SCHOOL_NAME_POSSESSIVE: possessive(quote.schoolName),
    SCHOOL_TYPE: formatSchoolType(quote.schoolType),
    STUDENT_COUNT: formatStudentCount(quote.students || 0),
    PREPARED_DATE: formatDate(preparedDate),
    VALID_UNTIL: formatDate(validUntil),
    PREPARED_BY_NAME: quote.preparedByName || prospectusDefaults.preparedByName,
    PREPARED_BY_TITLE: quote.preparedByTitle || prospectusDefaults.preparedByTitle,
    ANNUAL_PRICE: formatCurrency(pricing.annualTotal),
    TERM_YEARS: formatTermYears(years),
    TERM_TOTAL: formatCurrency(pricing.grandTotal),
    TOTAL_SAVINGS: formatCurrency(pricing.totalSavings),
    ANNUAL_SAVINGS: formatCurrency(pricing.annualSavings),
    VOLUME_DISCOUNT: formatCurrency(pricing.volumeDiscount),
    MULTI_DISCOUNT: formatCurrency(pricing.multiProductDiscount),
    LIST_TOTAL: formatCurrency(pricing.listTotal),
    EB_PRICE: quote.engagementBuilder ? formatCurrency(pricing.ebPrice) : '—',
    CB_PRICE: quote.communityBuilder ? formatCurrency(pricing.cbPrice) : '—',
    CTU_PRICE: quote.controlTowerUltra ? formatCurrency(pricing.ctuPrice) : '—',
    CLEVER_FEE: formatCleverFee(pricing, quote),
    SMS_FEE: formatSmsFee(pricing, quote),
    SMS_CREDITS_PURCHASED: credits > 0 ? credits.toLocaleString('en-US') : '—',
    SMS_EFFECTIVE_RATE: formatRate(rate),
    SMS_ANNUAL_CREDIT_COST: formatSmsFee(pricing, quote),
    SMS_DISCOUNT_OVER_FULL: discount > 0 ? formatCurrency(discount) : '—',
    SMS_OVERAGE_MODE: quote.sms ? overageModeLabel(quote.smsOverageMode || snap.overageMode) : '—',
    IMPLEMENTATION_FEE: formatCurrency(pricing.implementationFee),
    PILOT_FEE: formatCurrency(PILOT_FEE),
    TARGET_GO_LIVE: formatGoLiveDisplay(quote.targetGoLive) || 'Next term',
  };
}

export function getDefaultQuote() {
  return {
    schoolName: '',
    schoolType: 'online',
    students: 0,
    isDistrict: false,
    isUniversity: false,
    isFirstYear: true,
    years: 1,
    payUpfront: true,
    yearlyPayments: [],
    engagementBuilder: true,
    communityBuilder: true,
    controlTowerUltra: false,
    clever: false,
    cleverFee: 0,
    sms: false,
    smsFee: 0,
    smsFte: 0,
    smsTeachersPerStudent: 7,
    smsMsgsPerTeacherStudentMo: 5,
    smsActiveMonths: 10,
    smsCreditsPurchased: 0,
    smsOverageMode: 'auto_bill',
    smsSnapshot: null,
    notes: '',
    customItems: [],
    preparedByName: prospectusDefaults.preparedByName,
    preparedByTitle: prospectusDefaults.preparedByTitle,
    targetGoLive: 'August 1, 2026',
    validUntil: defaultValidUntil(),
    includeFreeTrialPage: false,
    includePilotPage: false,
    quoteName: '',
    quoteId: '',
    hubspotCompanyId: '',
  };
}
