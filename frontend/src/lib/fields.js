import { formatCurrency } from './pricing.js';

/** Pain → solution options from migration brief §11 */
export const PAIN_OPTIONS = [
  {
    id: 'absenteeism',
    pain: 'High absenteeism / low log-ins',
    solution: 'Countdown urgency + nudges + early-alert messaging',
  },
  {
    id: 'failure-rates',
    pain: 'Course failure & withdrawal rates',
    solution: 'Self-regulated learning + Control Tower early intervention (31% proof)',
  },
  {
    id: 'parent-visibility',
    pain: "Parents can't tell how kids are doing",
    solution: 'Parent view, color-coded, auto-included on messages',
  },
  {
    id: 'gray-wall',
    pain: 'Canvas is a "gray wall of death"',
    solution: 'The 3-minute Makeover',
  },
  {
    id: 'email-burden',
    pain: 'Manual parent email burden',
    solution: 'Message Center templates/scheduling/filter-and-send',
  },
  {
    id: 'isolation',
    pain: 'Student isolation',
    solution: 'Social presence / Who\'s Near Me',
  },
  {
    id: 'multilingual',
    pain: 'Multilingual families excluded',
    solution: '160-language auto-translation',
  },
  {
    id: 'inconsistent-canvas',
    pain: 'Inconsistent Canvas across teachers',
    solution: 'School-wide layout templates',
  },
  {
    id: 'late-identification',
    pain: 'Late identification of struggling students',
    solution: 'Red/yellow/green triage, ~40-second turnaround',
  },
  {
    id: 'wasted-spend',
    pain: 'Wasted spend on non-completing students',
    solution: '"Multiplier" ROI framing',
  },
];

export const PILOT_FEE = 5000;

function formatSchoolType(schoolType) {
  return schoolType === 'online' ? 'fully online K-12' : 'traditional K-12';
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

export function buildFields(quote, pricing) {
  const preparedDate = quote.preparedDate ? new Date(quote.preparedDate) : new Date();
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil)
    : new Date(preparedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const years = pricing.years || quote.years || 1;

  return {
    SCHOOL_NAME: quote.schoolName || 'Your School',
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
    PRIMARY_PAIN: quote.primaryPain || 'rising course-failure rates',
    PAIN_POINT_1: quote.painPoint1 || PAIN_OPTIONS[0].pain,
    PAIN_POINT_2: quote.painPoint2 || PAIN_OPTIONS[1].pain,
    PAIN_POINT_3: quote.painPoint3 || PAIN_OPTIONS[2].pain,
    EB_PRICE: quote.engagementBuilder ? formatCurrency(pricing.ebPrice) : '—',
    CB_PRICE: quote.communityBuilder ? formatCurrency(pricing.cbPrice) : '—',
    CTU_PRICE: quote.controlTowerUltra ? formatCurrency(pricing.ctuPrice) : '—',
    CLEVER_FEE: quote.clever ? formatCurrency(pricing.cleverFee) : '—',
    SMS_FEE: formatSmsFee(pricing, quote),
    IMPLEMENTATION_FEE: formatCurrency(pricing.implementationFee),
    PILOT_FEE: formatCurrency(PILOT_FEE),
    TARGET_GO_LIVE: quote.targetGoLive || 'Next term',
    PEER_REFERENCE: quote.peerReference || 'a comparable virtual academy',
  };
}

export function getDefaultQuote() {
  return {
    schoolName: '',
    schoolType: 'online',
    students: 0,
    isDistrict: false,
    isFirstYear: true,
    years: 1,
    engagementBuilder: true,
    communityBuilder: false,
    controlTowerUltra: false,
    clever: false,
    sms: false,
    smsFee: 0,
    notes: '',
    customItems: [],
    preparedByName: 'Jared Chapman',
    preparedByTitle: 'Chief Innovation Officer',
    primaryPain: PAIN_OPTIONS[1].pain,
    painPoint1: PAIN_OPTIONS[0].pain,
    painPoint2: PAIN_OPTIONS[1].pain,
    painPoint3: PAIN_OPTIONS[3].pain,
    peerReference: 'a 5,000-student virtual academy',
    targetGoLive: 'August 2026',
    quoteId: '',
  };
}
