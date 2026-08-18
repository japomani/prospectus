/** SMS prepaid credit pricing — matches Excel Cost Basis / B - Message Credits. */

export const SMS_CREDIT_FLOOR = 1000;

export const SMS_OVERAGE_AUTO = 'auto_bill';
export const SMS_OVERAGE_HARD_STOP = 'hard_stop_105';

export const DEFAULT_SMS_VOLUME_BREAKPOINTS = [
  { creditsMo: 0, pctOfList: 1 },
  { creditsMo: 5000, pctOfList: 0.86 },
  { creditsMo: 10000, pctOfList: 0.86 },
  { creditsMo: 25000, pctOfList: 0.74 },
  { creditsMo: 50000, pctOfList: 0.57 },
  { creditsMo: 100000, pctOfList: 0.49 },
  { creditsMo: 250000, pctOfList: 0.43 },
  { creditsMo: 500000, pctOfList: 0.43 },
  { creditsMo: 1000000, pctOfList: 0.43 },
];

/** Defaults from Excel; labels in admin show these in parentheses. */
export const DEFAULT_SMS_CONFIG = {
  carrierFeePerSegment: 0.00302,
  awsFeePerSegment: 0.00581,
  avgSegmentsPerMessage: 1.3,
  markupMultiple: 3.35,
  accountsServed: 5,
  roundToNearest: 100,
  defaultActiveMonths: 10,
  defaultTeachersPerStudent: 7,
  defaultMsgsPerTeacherStudentMo: 5,
  brandRegistration: 4.5,
  publicProfitAuth: 12.5,
  campaignVetting: 15,
  brandVettingOptional: 40,
  monthlyCampaignFee: 10,
  tenDlcLeasePerNumber: 1,
  tenDlcNumbers: 50,
  amortizeMonths: 12,
  volumeBreakpoints: DEFAULT_SMS_VOLUME_BREAKPOINTS.map(b => ({ ...b })),
};

export const DEFAULT_LICENSE_CONFIG = {
  traditional: { perStudent: 5, minimum: 3000 },
  online: { perStudent: 6.5, minimum: 3900 },
  districtMinimum: 6000,
};

export const DEFAULT_PROSPECTUS_CONFIG = {
  preparedByName: 'Jared Chapman',
  preparedByTitle: 'Chief Innovation Officer',
};

/** Excel MROUND for non-negative values. */
export function mround(value, multiple) {
  const n = Number(value) || 0;
  const m = Number(multiple) || 0;
  if (m === 0) return n;
  return Math.round(n / m) * m;
}

export function listPerCredit(config = DEFAULT_SMS_CONFIG) {
  const carrier = Number(config.carrierFeePerSegment) || 0;
  const aws = Number(config.awsFeePerSegment) || 0;
  const segments = Number(config.avgSegmentsPerMessage) || 0;
  const markup = Number(config.markupMultiple) || 0;
  return (carrier + aws) * segments * markup;
}

/**
 * Excel MATCH(..., ..., 1): largest breakpoint <= monthlyCredits.
 * Breakpoints must be sorted ascending by creditsMo.
 */
export function matchPctOfList(monthlyCredits, breakpoints = DEFAULT_SMS_VOLUME_BREAKPOINTS) {
  const sorted = [...(breakpoints || [])]
    .map(b => ({
      creditsMo: Number(b.creditsMo) || 0,
      pctOfList: Number(b.pctOfList) || 0,
    }))
    .sort((a, b) => a.creditsMo - b.creditsMo);

  if (sorted.length === 0) return 1;

  let pct = sorted[0].pctOfList;
  const mo = Number(monthlyCredits) || 0;
  for (const row of sorted) {
    if (row.creditsMo <= mo) pct = row.pctOfList;
    else break;
  }
  return pct;
}

function applyFloor(credits) {
  const n = Math.max(0, Math.round(Number(credits) || 0));
  if (n < SMS_CREDIT_FLOOR) {
    return { credits: SMS_CREDIT_FLOOR, floored: n !== SMS_CREDIT_FLOOR || credits < SMS_CREDIT_FLOOR };
  }
  return { credits: n, floored: false };
}

/**
 * Clamp credits-to-purchase input.
 * Empty/0 stays 0 (UI + resolve fall back to recommended).
 * Any positive value below the floor is raised to SMS_CREDIT_FLOOR.
 */
export function clampSmsCreditsPurchased(credits) {
  const n = Math.round(Number(credits) || 0);
  if (n <= 0) return 0;
  return Math.max(n, SMS_CREDIT_FLOOR);
}

/**
 * Estimate recommended credits from usage inputs.
 * @returns guidance figures (not what appears as purchased on the doc)
 */
export function estimateSmsCredits(inputs, config = DEFAULT_SMS_CONFIG) {
  const fte = Number(inputs.fte) || 0;
  const teachers = Number(inputs.teachersPerStudent) || 0;
  const msgs = Number(inputs.msgsPerTeacherStudentMo) || 0;
  const activeMonths = Math.max(1, Number(inputs.activeMonths) || config.defaultActiveMonths || 10);
  const roundTo = Number(config.roundToNearest) || 100;

  const msgsMo = fte * teachers * msgs;
  let recMo = mround(msgsMo, roundTo);
  let recMoFloored = false;
  if (recMo < SMS_CREDIT_FLOOR) {
    recMoFloored = recMo !== SMS_CREDIT_FLOOR;
    recMo = SMS_CREDIT_FLOOR;
  }

  let recYr = recMo * activeMonths;
  let recYrFloored = false;
  const yrFloor = applyFloor(recYr);
  if (yrFloor.floored) {
    recYr = yrFloor.credits;
    recYrFloored = true;
    // Keep monthly guidance consistent with floored annual when needed.
    recMo = Math.max(recMo, mround(recYr / activeMonths, roundTo) || SMS_CREDIT_FLOOR);
  }

  const list = listPerCredit(config);
  const pctOfList = matchPctOfList(recMo, config.volumeBreakpoints);
  const pricePerCredit = list * pctOfList;
  const annualAtRecommend = recYr * pricePerCredit;

  return {
    msgsMo,
    recommendedMo: recMo,
    recommendedYr: recYr,
    floored: recMoFloored || recYrFloored,
    listPerCredit: list,
    pctOfList,
    pricePerCredit,
    annualAtRecommend,
    activeMonths,
  };
}

/**
 * Price a purchased annual credit block.
 * Tier MATCH uses monthly = purchased_yr / active_months.
 */
export function priceSmsPurchase(purchasedYrCredits, activeMonths, config = DEFAULT_SMS_CONFIG) {
  const months = Math.max(1, Number(activeMonths) || config.defaultActiveMonths || 10);
  const floor = applyFloor(purchasedYrCredits);
  const purchasedYr = floor.credits;
  const purchasedMo = purchasedYr / months;

  const list = listPerCredit(config);
  const pctOfList = matchPctOfList(purchasedMo, config.volumeBreakpoints);
  const pricePerCredit = list * pctOfList;
  const annualCost = purchasedYr * pricePerCredit;
  const fullCost = purchasedYr * list;
  const discountOverFull = fullCost - annualCost;

  return {
    creditsPurchased: purchasedYr,
    creditsPurchasedFloored: floor.floored,
    purchasedMo,
    listPerCredit: list,
    pctOfList,
    effectiveRate: pricePerCredit,
    annualCreditCost: annualCost,
    discountOverFull,
    activeMonths: months,
  };
}

/** Build snapshot stored on save so quotes stay stable if config changes. */
export function buildSmsSnapshot(inputs, config, purchaseResult, estimateResult) {
  return {
    carrierFeePerSegment: Number(config.carrierFeePerSegment),
    awsFeePerSegment: Number(config.awsFeePerSegment),
    avgSegmentsPerMessage: Number(config.avgSegmentsPerMessage),
    markupMultiple: Number(config.markupMultiple),
    roundToNearest: Number(config.roundToNearest),
    volumeBreakpoints: (config.volumeBreakpoints || []).map(b => ({
      creditsMo: Number(b.creditsMo) || 0,
      pctOfList: Number(b.pctOfList) || 0,
    })),
    fte: Number(inputs.fte) || 0,
    teachersPerStudent: Number(inputs.teachersPerStudent) || 0,
    msgsPerTeacherStudentMo: Number(inputs.msgsPerTeacherStudentMo) || 0,
    activeMonths: Number(inputs.activeMonths) || 0,
    creditsPurchased: purchaseResult.creditsPurchased,
    overageMode: inputs.overageMode || SMS_OVERAGE_AUTO,
    listPerCredit: purchaseResult.listPerCredit,
    pctOfList: purchaseResult.pctOfList,
    effectiveRate: purchaseResult.effectiveRate,
    annualCreditCost: purchaseResult.annualCreditCost,
    discountOverFull: purchaseResult.discountOverFull,
    recommendedYr: estimateResult?.recommendedYr ?? null,
  };
}

export function resolveSmsQuoteFields(quote, liveConfig = DEFAULT_SMS_CONFIG) {
  if (!quote?.sms) {
    return {
      smsFee: 0,
      estimate: null,
      purchase: null,
      configUsed: liveConfig,
    };
  }

  const fte = quote.smsFte != null && quote.smsFte !== ''
    ? Number(quote.smsFte)
    : (Number(quote.students) || 0);
  const teachers = quote.smsTeachersPerStudent != null && quote.smsTeachersPerStudent !== ''
    ? Number(quote.smsTeachersPerStudent)
    : (liveConfig.defaultTeachersPerStudent ?? 7);
  const msgs = quote.smsMsgsPerTeacherStudentMo != null && quote.smsMsgsPerTeacherStudentMo !== ''
    ? Number(quote.smsMsgsPerTeacherStudentMo)
    : (liveConfig.defaultMsgsPerTeacherStudentMo ?? 5);
  const activeMonths = quote.smsActiveMonths != null && quote.smsActiveMonths !== ''
    ? Number(quote.smsActiveMonths)
    : (liveConfig.defaultActiveMonths ?? 10);
  const overageMode = quote.smsOverageMode || SMS_OVERAGE_AUTO;

  const estimate = estimateSmsCredits(
    { fte, teachersPerStudent: teachers, msgsPerTeacherStudentMo: msgs, activeMonths },
    liveConfig,
  );

  let purchased = Number(quote.smsCreditsPurchased);
  if (!Number.isFinite(purchased) || purchased <= 0) {
    purchased = estimate.recommendedYr;
  } else {
    purchased = clampSmsCreditsPurchased(purchased);
  }

  const purchase = priceSmsPurchase(purchased, activeMonths, liveConfig);

  return {
    smsFee: purchase.annualCreditCost,
    estimate,
    purchase,
    configUsed: liveConfig,
    inputs: {
      fte,
      teachersPerStudent: teachers,
      msgsPerTeacherStudentMo: msgs,
      activeMonths,
      overageMode,
      creditsPurchased: purchase.creditsPurchased,
    },
  };
}

export function overageModeLabel(mode) {
  if (mode === SMS_OVERAGE_HARD_STOP) return 'Hard stop at 105%';
  return 'Auto-bill';
}

export function mergeSmsConfig(partial) {
  const base = { ...DEFAULT_SMS_CONFIG, ...(partial || {}) };
  if (!Array.isArray(base.volumeBreakpoints) || base.volumeBreakpoints.length === 0) {
    base.volumeBreakpoints = DEFAULT_SMS_VOLUME_BREAKPOINTS.map(b => ({ ...b }));
  }
  return base;
}

export function mergeLicenseConfig(partial) {
  return {
    ...DEFAULT_LICENSE_CONFIG,
    ...(partial || {}),
    traditional: {
      ...DEFAULT_LICENSE_CONFIG.traditional,
      ...(partial?.traditional || {}),
    },
    online: {
      ...DEFAULT_LICENSE_CONFIG.online,
      ...(partial?.online || {}),
    },
  };
}

export function mergeProspectusConfig(partial) {
  return {
    ...DEFAULT_PROSPECTUS_CONFIG,
    ...(partial || {}),
  };
}
