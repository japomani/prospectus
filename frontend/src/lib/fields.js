import { formatCurrency } from './pricing.js';
import { formatDate } from './dates.js';

export const PILOT_FEE = 5000;

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

function possessive(name) {
  if (!name) return "Your School's";
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

export function buildFields(quote, pricing) {
  const preparedDate = quote.preparedDate ? new Date(quote.preparedDate) : new Date();
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil)
    : new Date(preparedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const years = pricing.years || quote.years || 1;

  return {
    SCHOOL_NAME: quote.schoolName || 'Your School',
    SCHOOL_NAME_POSSESSIVE: possessive(quote.schoolName),
    SCHOOL_TYPE: formatSchoolType(quote.schoolType),
    STUDENT_COUNT: formatStudentCount(quote.students || 0),
    PREPARED_DATE: formatDate(preparedDate),
    VALID_UNTIL: formatDate(validUntil),
    PREPARED_BY_NAME: quote.preparedByName || 'Jared Chapman',
    PREPARED_BY_TITLE: quote.preparedByTitle || 'Chief Innovation Officer',
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
    CLEVER_FEE: quote.clever ? formatCurrency(pricing.cleverFee) : '—',
    SMS_FEE: formatSmsFee(pricing, quote),
    IMPLEMENTATION_FEE: formatCurrency(pricing.implementationFee),
    PILOT_FEE: formatCurrency(PILOT_FEE),
    TARGET_GO_LIVE: quote.targetGoLive || 'Next term',
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
    cleverSchools: 1,
    sms: false,
    smsFee: 0,
    notes: '',
    customItems: [],
    preparedByName: 'Jared Chapman',
    preparedByTitle: 'Chief Innovation Officer',
    targetGoLive: 'August 2026',
    includeFreeTrialPage: true,
    includePilotPage: false,
    quoteName: '',
    quoteId: '',
  };
}
