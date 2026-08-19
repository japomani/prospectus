import { defaultValidUntil } from './dates.js';

/** Map between flat frontend quote state and API request/response shapes. */

export function quoteToApiBody(quote) {
  return {
    schoolName: quote.schoolName || '',
    schoolType: quote.schoolType || 'online',
    students: Number(quote.students) || 0,
    isDistrict: Boolean(quote.isDistrict),
    isUniversity: Boolean(quote.isUniversity),
    isFirstYear: quote.isFirstYear !== false,
    years: Number(quote.years) || 1,
    payUpfront: quote.payUpfront !== false,
    yearlyPayments: Array.isArray(quote.yearlyPayments) ? quote.yearlyPayments : [],
    products: {
      engagementBuilder: Boolean(quote.engagementBuilder),
      communityBuilder: Boolean(quote.communityBuilder),
      controlTowerUltra: Boolean(quote.controlTowerUltra),
      clever: Boolean(quote.clever),
      sms: Boolean(quote.sms),
    },
    customItems: quote.customItems || [],
    cleverFee: Number(quote.cleverFee) || 0,
    smsFee: Number(quote.smsFee) || 0,
    smsFte: Number(quote.smsFte) || 0,
    smsTeachersPerStudent: Number(quote.smsTeachersPerStudent) || 0,
    smsMsgsPerTeacherStudentMo: Number(quote.smsMsgsPerTeacherStudentMo) || 0,
    smsActiveMonths: Number(quote.smsActiveMonths) || 0,
    smsCreditsPurchased: Number(quote.smsCreditsPurchased) || 0,
    smsOverageMode: quote.smsOverageMode || 'auto_bill',
    smsSnapshot: quote.smsSnapshot || null,
    notes: quote.notes || '',
    preparedByName: quote.preparedByName || '',
    preparedByTitle: quote.preparedByTitle || '',
    targetGoLive: quote.targetGoLive || '',
    validUntil: quote.validUntil || '',
    includeFreeTrialPage: Boolean(quote.includeFreeTrialPage),
    includePilotPage: Boolean(quote.includePilotPage),
    slackUserId: quote.slackUserId || '',
    ref: quote.ref || '',
    quoteName: quote.quoteName || '',
    hubspotCompanyId: quote.hubspotCompanyId || '',
  };
}

export function apiQuoteToForm(source) {
  if (!source) return null;
  const q = source.quote || source;
  const products = q.products || {};

  return {
    schoolName: q.schoolName || '',
    schoolType: q.schoolType || 'online',
    students: Number(q.students) || 0,
    isDistrict: Boolean(q.isDistrict),
    isUniversity: Boolean(q.isUniversity),
    isFirstYear: q.isFirstYear !== false,
    years: Number(q.years) || 1,
    payUpfront: Object.prototype.hasOwnProperty.call(q, 'payUpfront') ? q.payUpfront !== false : true,
    yearlyPayments: Array.isArray(q.yearlyPayments) ? q.yearlyPayments : [],
    engagementBuilder: Boolean(products.engagementBuilder ?? q.engagementBuilder),
    communityBuilder: Boolean(products.communityBuilder ?? q.communityBuilder),
    controlTowerUltra: Boolean(products.controlTowerUltra ?? q.controlTowerUltra),
    clever: Boolean(products.clever ?? q.clever),
    cleverFee: Number(q.cleverFee) || 0,
    sms: Boolean(products.sms ?? q.sms),
    smsFee: Number(q.smsFee) || 0,
    smsFte: Number(q.smsFte) || 0,
    smsTeachersPerStudent: Number(q.smsTeachersPerStudent) || 0,
    smsMsgsPerTeacherStudentMo: Number(q.smsMsgsPerTeacherStudentMo) || 0,
    smsActiveMonths: Number(q.smsActiveMonths) || 0,
    smsCreditsPurchased: Number(q.smsCreditsPurchased) || 0,
    smsOverageMode: q.smsOverageMode || 'auto_bill',
    smsSnapshot: q.smsSnapshot || null,
    notes: q.notes || '',
    customItems: Array.isArray(q.customItems) ? q.customItems : [],
    preparedByName: q.preparedByName || '',
    preparedByTitle: q.preparedByTitle || '',
    targetGoLive: q.targetGoLive || '',
    validUntil: q.validUntil || defaultValidUntil(),
    includeFreeTrialPage: Boolean(q.includeFreeTrialPage),
    includePilotPage: Boolean(q.includePilotPage),
    quoteName: q.quoteName || '',
    quoteId: q.quoteId || '',
    hubspotCompanyId: q.hubspotCompanyId || '',
    slackUserId: q.slackUserId || '',
    ref: q.ref || '',
    updatedAt: q.updatedAt || null,
    createdAt: q.createdAt || null,
    pricingSnapshot: q.pricingSnapshot || source.pricing || null,
  };
}
