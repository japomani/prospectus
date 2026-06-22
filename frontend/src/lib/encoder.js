const DEFAULT_PRODUCTS = {
  engagementBuilder: true,
  communityBuilder: false,
  controlTowerUltra: false,
};

export function encodeQuoteParams(formData) {
  const params = new URLSearchParams();
  params.set('schoolName', formData.schoolName || '');
  params.set('schoolType', formData.schoolType || 'online');
  params.set('students', String(formData.students || 0));
  params.set('isDistrict', formData.isDistrict ? '1' : '0');
  params.set('isUniversity', formData.isUniversity ? '1' : '0');
  params.set('isFirstYear', formData.isFirstYear !== false ? '1' : '0');
  params.set('years', String(formData.years || 1));
  params.set('payUpfront', formData.payUpfront !== false ? '1' : '0');
  params.set('notes', formData.notes || '');

  params.set('engagementBuilder', formData.engagementBuilder ? '1' : '0');
  params.set('communityBuilder', formData.communityBuilder ? '1' : '0');
  params.set('controlTowerUltra', formData.controlTowerUltra ? '1' : '0');
  params.set('clever', formData.clever ? '1' : '0');
  params.set('cleverSchools', String(Math.max(1, Number(formData.cleverSchools) || 1)));
  params.set('sms', formData.sms ? '1' : '0');
  params.set('smsFee', String(formData.smsFee || 0));

  params.set('preparedByName', formData.preparedByName || '');
  params.set('preparedByTitle', formData.preparedByTitle || '');
  params.set('primaryPain', formData.primaryPain || '');
  params.set('painPoint1', formData.painPoint1 || '');
  params.set('painPoint2', formData.painPoint2 || '');
  params.set('painPoint3', formData.painPoint3 || '');
  params.set('peerReference', formData.peerReference || '');
  params.set('targetGoLive', formData.targetGoLive || '');
  params.set('includeFreeTrialPage', formData.includeFreeTrialPage !== false ? '1' : '0');
  params.set('includePilotPage', formData.includePilotPage ? '1' : '0');

  if (formData.quoteId) params.set('quoteId', formData.quoteId);

  const products = {
    engagementBuilder: Boolean(formData.engagementBuilder),
    communityBuilder: Boolean(formData.communityBuilder),
    controlTowerUltra: Boolean(formData.controlTowerUltra),
  };
  params.set('products', btoa(JSON.stringify(products)));

  const customItems = formData.customItems || [];
  params.set('customItems', btoa(JSON.stringify(customItems)));

  const yearlyPayments = formData.yearlyPayments || [];
  if (yearlyPayments.length > 0) {
    params.set('yearlyPayments', btoa(JSON.stringify(yearlyPayments)));
  }

  return params.toString();
}

export function decodeQuoteParams(searchString) {
  const params = new URLSearchParams(searchString);

  let products = { ...DEFAULT_PRODUCTS };
  try {
    const raw = params.get('products');
    if (raw) products = { ...DEFAULT_PRODUCTS, ...JSON.parse(atob(raw)) };
  } catch {
    /* keep defaults */
  }

  let customItems = [];
  try {
    const raw = params.get('customItems');
    if (raw) customItems = JSON.parse(atob(raw));
  } catch {
    /* keep empty */
  }

  let yearlyPayments = [];
  try {
    const raw = params.get('yearlyPayments');
    if (raw) yearlyPayments = JSON.parse(atob(raw));
  } catch {
    /* keep empty */
  }

  const bool = key => params.get(key) === '1';
  const has = key => params.has(key);

  return {
    schoolName: params.get('schoolName') || '',
    schoolType: params.get('schoolType') || 'online',
    students: Number(params.get('students')) || 0,
    isDistrict: params.get('isDistrict') === '1',
    isUniversity: params.get('isUniversity') === '1',
    isFirstYear: params.get('isFirstYear') !== '0',
    years: Number(params.get('years')) || 1,
    payUpfront: !has('payUpfront') || bool('payUpfront'),
    yearlyPayments,
    notes: params.get('notes') || '',
    engagementBuilder: has('engagementBuilder') ? bool('engagementBuilder') : products.engagementBuilder,
    communityBuilder: has('communityBuilder') ? bool('communityBuilder') : products.communityBuilder,
    controlTowerUltra: has('controlTowerUltra') ? bool('controlTowerUltra') : products.controlTowerUltra,
    clever: bool('clever'),
    cleverSchools: Math.max(1, Number(params.get('cleverSchools')) || 1),
    sms: bool('sms'),
    smsFee: Number(params.get('smsFee')) || 0,
    preparedByName: params.get('preparedByName') || '',
    preparedByTitle: params.get('preparedByTitle') || '',
    primaryPain: params.get('primaryPain') || '',
    painPoint1: params.get('painPoint1') || '',
    painPoint2: params.get('painPoint2') || '',
    painPoint3: params.get('painPoint3') || '',
    peerReference: params.get('peerReference') || '',
    targetGoLive: params.get('targetGoLive') || '',
    includeFreeTrialPage: !has('includeFreeTrialPage') || bool('includeFreeTrialPage'),
    includePilotPage: bool('includePilotPage'),
    quoteId: params.get('quoteId') || '',
    customItems,
  };
}
