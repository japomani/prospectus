import PricingBenefitNotes from '../PricingBenefitNotes.jsx';
import { Field } from './Field.jsx';
import { formatCustomItemLabel, PRODUCT_LABELS } from '../../lib/pricingSummary.js';
import {
  formatCurrency,
  getMultiYearDiscountPercent,
  resolveYearlyPaymentSchedule,
} from '../../lib/pricing.js';

export default function PricingValueSection({
  quote,
  pricing,
  fields,
  highlightFields,
  pageLabel,
}) {
  if (!pricing) return null;

  const customCharges = pricing.customItems.filter(i => i.computedValue > 0);
  const customDiscounts = pricing.customItems.filter(i => i.computedValue < 0);
  const hasAddons =
    pricing.implementationFee > 0
    || pricing.cleverFee > 0
    || quote.sms
    || customCharges.length > 0;
  const hasDiscounts =
    pricing.volumeDiscount > 0
    || pricing.multiProductDiscount > 0
    || pricing.multiYearDiscount > 0
    || customDiscounts.length > 0
    || pricing.annualSavings > 0;

  const payUpfront = quote.payUpfront !== false;
  const yearlySchedule =
    pricing.years > 1 && !payUpfront
      ? resolveYearlyPaymentSchedule(quote, pricing)
      : [];

  return (
    <section className="sheet">
      <div className="page-label screen-only">{pageLabel}</div>
      <div className="doc-kicker">Pricing &amp; value</div>
      <h2 className="doc-h2 doc-pricing-page-title">Your investment</h2>

      <div className="doc-pricing-page keep">
        <div className="doc-pricing-summary">
          <div className="doc-pricing-section-title">Students</div>
          <div className="doc-pricing-row">
            <span>
              <Field value={fields.STUDENT_COUNT} highlight={highlightFields} />
            </span>
          </div>

          <div className="doc-pricing-section-title">Products</div>
          {Object.entries(pricing.productLicenses).map(([key, val]) => (
            <div className="doc-pricing-row" key={key}>
              <span>
                {PRODUCT_LABELS[key] || key}
                {' '}
                License
              </span>
              <span>{formatCurrency(val)}</span>
            </div>
          ))}
          <div className="doc-pricing-row doc-pricing-subtotal">
            <span>Product Subtotal</span>
            <span>{formatCurrency(pricing.productSubtotal)}</span>
          </div>

          {hasDiscounts && (
            <>
              <div className="doc-pricing-section-title">Discounts</div>
              {pricing.volumeDiscount > 0 && (
                <div className="doc-pricing-row doc-pricing-discount">
                  <span>
                    Volume Discount
                    {' '}
                    ({pricing.volumeDiscountPercent}%)
                  </span>
                  <span>-{formatCurrency(pricing.volumeDiscount)}</span>
                </div>
              )}
              {pricing.multiProductDiscount > 0 && (
                <div className="doc-pricing-row doc-pricing-discount">
                  <span>Multi-Product Discount (10%)</span>
                  <span>-{formatCurrency(pricing.multiProductDiscount)}</span>
                </div>
              )}
              {pricing.multiYearDiscount > 0 && (
                <div className="doc-pricing-row doc-pricing-discount">
                  <span>
                    Multi-Year Discount
                    {' '}
                    ({getMultiYearDiscountPercent(pricing.years)}%)
                  </span>
                  <span>-{formatCurrency(pricing.multiYearDiscount)}</span>
                </div>
              )}
              {customDiscounts.map(item => (
                <div className="doc-pricing-row doc-pricing-discount" key={item.id}>
                  <span>{formatCustomItemLabel(item, 'Custom Discount')}</span>
                  <span>-{formatCurrency(Math.abs(item.computedValue))}</span>
                </div>
              ))}
              {pricing.annualSavings > 0 && (
                <div className="doc-pricing-row doc-pricing-total doc-pricing-discount">
                  <span>Annual Savings</span>
                  <span>{formatCurrency(pricing.annualSavings)}</span>
                </div>
              )}
            </>
          )}

          {hasAddons && (
            <>
              <div className="doc-pricing-section-title">Add-ons</div>
              {pricing.implementationFee > 0 && (
                <div className="doc-pricing-row">
                  <span>Implementation Fee (one time for setup and training)</span>
                  <span>{formatCurrency(pricing.implementationFee)}</span>
                </div>
              )}
              {pricing.cleverFee > 0 && (
                <div className="doc-pricing-row">
                  <span>
                    Clever Integration
                    {(quote.cleverSchools || 1) > 1 && ` (${quote.cleverSchools} schools)`}
                  </span>
                  <span>{formatCurrency(pricing.cleverFee)}</span>
                </div>
              )}
              {quote.sms && (
                <div className="doc-pricing-row">
                  <span>SMS Texting</span>
                  <span>
                    {pricing.smsFee > 0 ? formatCurrency(pricing.smsFee) : 'Custom / quote'}
                  </span>
                </div>
              )}
              {customCharges.map(item => (
                <div className="doc-pricing-row" key={item.id}>
                  <span>{formatCustomItemLabel(item, 'Custom Item')}</span>
                  <span>{formatCurrency(item.computedValue)}</span>
                </div>
              ))}
            </>
          )}

          <hr className="doc-pricing-divider" />

          {pricing.years > 1 ? (
            payUpfront ? (
              <>
                <div className="doc-pricing-row">
                  <span>Annual Total</span>
                  <span>{formatCurrency(pricing.annualTotal)}</span>
                </div>
                <div className="doc-pricing-row doc-pricing-total">
                  <span>
                    Total due
                    {' '}
                    (
                    {pricing.years}
                    -year agreement)
                  </span>
                  <span>{formatCurrency(pricing.grandTotal)}</span>
                </div>
                {pricing.totalSavings > 0 && (
                  <div className="doc-pricing-row doc-pricing-savings">
                    <span>
                      Total Savings (
                      {pricing.years}
                      {' '}
                      yr)
                    </span>
                    <span>{formatCurrency(pricing.totalSavings)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="doc-pricing-row">
                  <span>Annual Total</span>
                  <span>{formatCurrency(pricing.annualTotal)}</span>
                </div>
                <div className="doc-pricing-row doc-pricing-total">
                  <span>
                    Agreement total
                    {' '}
                    (
                    {pricing.years}
                    {' '}
                    years)
                  </span>
                  <span>{formatCurrency(pricing.grandTotal)}</span>
                </div>
                {pricing.totalSavings > 0 && (
                  <div className="doc-pricing-row doc-pricing-savings">
                    <span>
                      Total Savings (
                      {pricing.years}
                      {' '}
                      yr)
                    </span>
                    <span>{formatCurrency(pricing.totalSavings)}</span>
                  </div>
                )}
                {yearlySchedule.length > 0 && (
                  <>
                    <div className="doc-pricing-section-title">Payment schedule</div>
                    {yearlySchedule.map(row => (
                      <div className="doc-pricing-row" key={row.year}>
                        <span>
                          Year
                          {' '}
                          {row.year}
                          {row.isRemainder ? ' (balance)' : ''}
                          {!row.isRemainder && row.year === 1 && pricing.implementationFee > 0
                            ? ' (+ implementation)'
                            : ''}
                        </span>
                        <span>{formatCurrency(row.amount)}</span>
                      </div>
                    ))}
                  </>
                )}
              </>
            )
          ) : (
            <>
              <div className="doc-pricing-row doc-pricing-total">
                <span>Annual Total</span>
                <span>{formatCurrency(pricing.annualTotal)}</span>
              </div>
              <div className="doc-pricing-row doc-pricing-total">
                <span>Grand Total (1 Year)</span>
                <span>{formatCurrency(pricing.grandTotal)}</span>
              </div>
            </>
          )}

          {quote.notes?.trim() && (
            <>
              <div className="doc-pricing-section-title">Notes</div>
              <div className="doc-pricing-notes">{quote.notes.trim()}</div>
            </>
          )}

          <div className="doc-pricing-footer">
            Pricing held until
            {' '}
            <Field value={fields.VALID_UNTIL} highlight={highlightFields} />
            .
          </div>
        </div>

        <PricingBenefitNotes />
      </div>
    </section>
  );
}
