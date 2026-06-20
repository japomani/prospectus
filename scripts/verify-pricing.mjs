import { calculatePricing } from '../frontend/src/lib/pricing.js';

const quote = {
  schoolType: 'online',
  students: 2000,
  isDistrict: false,
  isFirstYear: true,
  years: 3,
  engagementBuilder: true,
  communityBuilder: true,
  controlTowerUltra: false,
  clever: false,
  sms: false,
};

const r = calculatePricing(quote);
console.log('Annual total:', r.annualTotal);
console.log('Implementation:', r.implementationFee);
console.log('Grand total:', r.grandTotal);
console.log('Multi-year discount:', r.multiYearDiscount);

if (r.implementationFee !== 1950) {
  console.error('FAIL: implementation fee expected 1950');
  process.exit(1);
}
if (r.years !== 3 || r.multiYearDiscount <= 0) {
  console.error('FAIL: expected 3yr multi-year discount');
  process.exit(1);
}
console.log('OK');
