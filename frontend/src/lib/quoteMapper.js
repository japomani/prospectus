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
    notes: quote.notes || '',
    preparedByName: quote.preparedByName || '',
    preparedByTitle: quote.preparedByTitle || '',
    targetGoLive: quote.targetGoLive || '',
    includeFreeTrialPage: Boolean(quote.includeFreeTrialPage),
    includePilotPage: Boolean(quote.includePilotPage),
    slackUserId: quote.slackUserId || '',
    ref: quote.ref || '',
    quoteName: quote.quoteName || '',
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
    notes: q.notes || '',
    customItems: Array.isArray(q.customItems) ? q.customItems : [],
    preparedByName: q.preparedByName || '',
    preparedByTitle: q.preparedByTitle || '',
    targetGoLive: q.targetGoLive || '',
    includeFreeTrialPage: Boolean(q.includeFreeTrialPage),
    includePilotPage: Boolean(q.includePilotPage),
    quoteName: q.quoteName || '',
    quoteId: q.quoteId || '',
    slackUserId: q.slackUserId || '',
    ref: q.ref || '',
    updatedAt: q.updatedAt || null,
    createdAt: q.createdAt || null,
    pricingSnapshot: q.pricingSnapshot || source.pricing || null,
  };
}
