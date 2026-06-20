import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuote } from '../context/QuoteContext.jsx';
import { createQuote, isApiConfigured } from '../lib/api.js';
import { encodeQuoteParams } from '../lib/encoder.js';
import { PAIN_OPTIONS } from '../lib/fields.js';
import { calculatePricing, formatCurrency } from '../lib/pricing.js';

const PRODUCT_LABELS = {
  engagementBuilder: 'Engagement Builder',
  communityBuilder: 'Community Builder',
  controlTowerUltra: 'Control Tower Ultra',
};

export default function PricingCalculator() {
  const { quote, updateQuote } = useQuote();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  let results = null;
  let calcError = null;

  try {
    results = calculatePricing(quote);
  } catch (err) {
    calcError = err.message;
  }

  const activeProducts = Object.entries(PRODUCT_LABELS).filter(([key]) => quote[key]);
  const hasProducts = activeProducts.length > 0;

  function handleViewProspectus() {
    const qs = encodeQuoteParams(quote);
    window.open(`/quotes/new?${qs}`, '_blank');
  }

  function handleCopyLink() {
    const qs = encodeQuoteParams(quote);
    const url = `${window.location.origin}/quotes/new?${qs}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSaveQuote() {
    setSaveError(null);
    if (!isApiConfigured()) {
      setSaveError('Set VITE_API_URL to enable saving quotes');
      return;
    }
    setSaving(true);
    try {
      const saved = await createQuote(quote);
      if (saved?.id) {
        updateQuote({ quoteId: saved.id });
        navigate(`/quotes/${saved.id}`);
      } else {
        setSaveError('Save succeeded but no quote ID was returned');
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addCustomItem() {
    const newItem = { id: Date.now(), name: '', isDiscount: false, isPercent: false, amount: 0 };
    updateQuote({ customItems: [...quote.customItems, newItem] });
  }

  function deleteCustomItem(id) {
    updateQuote({ customItems: quote.customItems.filter(i => i.id !== id) });
  }

  function updateCustomItem(id, field, value) {
    updateQuote({
      customItems: quote.customItems.map(i => (i.id === id ? { ...i, [field]: value } : i)),
    });
  }

  function painSelect(label, field, allowEmpty = false) {
    return (
      <div className="form-group" key={field}>
        <label>{label}</label>
        <select
          value={quote[field] || ''}
          onChange={e => updateQuote({ [field]: e.target.value })}
        >
          {allowEmpty && <option value="">— Select —</option>}
          {PAIN_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.pain}>{opt.pain}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', color: 'var(--text)' }}>Delphinium Pricing Calculator</h1>

      <div className="pricing-layout">
        <div className="form-col">
          <div className="card">
            <div className="card-title">School Information</div>
            <div className="form-group">
              <label>School / District Name</label>
              <input
                type="text"
                value={quote.schoolName}
                onChange={e => updateQuote({ schoolName: e.target.value })}
                placeholder="Enter school name"
              />
            </div>
            <div className="form-group">
              <label>School Type</label>
              <div className="radio-group">
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="schoolType"
                    value="online"
                    checked={quote.schoolType === 'online'}
                    onChange={() => updateQuote({ schoolType: 'online' })}
                  />
                  Online ($6.50/student)
                </label>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="schoolType"
                    value="traditional"
                    checked={quote.schoolType === 'traditional'}
                    onChange={() => updateQuote({ schoolType: 'traditional' })}
                  />
                  Traditional ($5.00/student)
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Number of Students</label>
              <input
                type="number"
                min="0"
                value={quote.students}
                onChange={e => updateQuote({ students: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.isDistrict}
                  onChange={e => updateQuote({ isDistrict: e.target.checked })}
                />
                District Account (higher minimum: $6,000)
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.isFirstYear}
                  onChange={e => updateQuote({ isFirstYear: e.target.checked })}
                />
                First Year (includes implementation fee)
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Products &amp; Add-ons</div>
            {Object.entries(PRODUCT_LABELS).map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(quote[key])}
                    onChange={e => updateQuote({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
              </div>
            ))}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.clever}
                  onChange={e => updateQuote({ clever: e.target.checked })}
                />
                Clever integration ($500 flat)
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.sms}
                  onChange={e => updateQuote({ sms: e.target.checked })}
                />
                SMS texting (custom / quote)
              </label>
            </div>
            {quote.sms && (
              <div className="form-group">
                <label>SMS fee (optional override)</label>
                <input
                  type="number"
                  min="0"
                  value={quote.smsFee}
                  onChange={e => updateQuote({ smsFee: Number(e.target.value) })}
                  placeholder="0 = show as custom/quote"
                />
              </div>
            )}
            {activeProducts.length >= 2 && (
              <p style={{ color: 'var(--accent)', fontSize: '0.875rem', margin: '8px 0 0' }}>
                Multi-product discount (10%) will be applied
              </p>
            )}
          </div>

          <div className="card">
            <div className="card-title">Contract Term</div>
            <div className="form-group">
              <label>Number of Years</label>
              <div className="radio-group">
                {[1, 2, 3, 4, 5].map(y => (
                  <label className="checkbox-label" key={y}>
                    <input
                      type="radio"
                      name="years"
                      value={y}
                      checked={quote.years === y}
                      onChange={() => updateQuote({ years: y })}
                    />
                    {y} {y === 1 ? 'Year' : 'Years'}
                    {y === 3 && ' (5% off)'}
                    {y === 5 && ' (10% off)'}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Prospectus Personalization</div>
            <div className="form-group">
              <label>Prepared by — Name</label>
              <input
                type="text"
                value={quote.preparedByName}
                onChange={e => updateQuote({ preparedByName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Prepared by — Title</label>
              <input
                type="text"
                value={quote.preparedByTitle}
                onChange={e => updateQuote({ preparedByTitle: e.target.value })}
              />
            </div>
            {painSelect('Primary pain (executive summary)', 'primaryPain')}
            {painSelect('Pain point 1', 'painPoint1')}
            {painSelect('Pain point 2', 'painPoint2')}
            {painSelect('Pain point 3', 'painPoint3')}
            <div className="form-group">
              <label>Peer reference</label>
              <input
                type="text"
                value={quote.peerReference}
                onChange={e => updateQuote({ peerReference: e.target.value })}
                placeholder="e.g. a 5,000-student virtual academy"
              />
            </div>
            <div className="form-group">
              <label>Target go-live</label>
              <input
                type="text"
                value={quote.targetGoLive}
                onChange={e => updateQuote({ targetGoLive: e.target.value })}
                placeholder="August 2026"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">Custom Line Items</div>
            {quote.customItems.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '12px' }}>
                No custom items added.
              </p>
            )}
            {quote.customItems.map(item => (
              <div className="custom-item-row" key={item.id}>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.name}
                  onChange={e => updateCustomItem(item.id, 'name', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={e => updateCustomItem(item.id, 'amount', Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <label className="checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={item.isPercent}
                    onChange={e => updateCustomItem(item.id, 'isPercent', e.target.checked)}
                  />
                  %
                </label>
                <label className="checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={item.isDiscount}
                    onChange={e => updateCustomItem(item.id, 'isDiscount', e.target.checked)}
                  />
                  Discount
                </label>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteCustomItem(item.id)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomItem} style={{ marginTop: '8px' }}>
              + Add Item
            </button>
          </div>

          <div className="card">
            <div className="card-title">Notes</div>
            <div className="form-group">
              <textarea
                value={quote.notes}
                onChange={e => updateQuote({ notes: e.target.value })}
                placeholder="Internal notes or special terms..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        <div className="results-col">
          <div className="results-panel card">
            <div className="card-title">Pricing Summary</div>

            {calcError && <p style={{ color: 'var(--discount)' }}>{calcError}</p>}

            {!hasProducts && !calcError && (
              <p className="no-products-msg">Select at least one product to see pricing.</p>
            )}

            {hasProducts && results && (
              <>
                {Object.entries(results.productLicenses).map(([key, val]) => (
                  <div className="result-row" key={key}>
                    <span>{PRODUCT_LABELS[key] || key} License</span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}

                {Object.keys(results.productLicenses).length > 1 && (
                  <div className="result-row subtotal">
                    <span>Product Subtotal</span>
                    <span>{formatCurrency(results.productSubtotal)}</span>
                  </div>
                )}

                {results.volumeDiscount > 0 && (
                  <div className="result-row discount">
                    <span>Volume Discount</span>
                    <span>-{formatCurrency(results.volumeDiscount)}</span>
                  </div>
                )}

                {results.multiProductDiscount > 0 && (
                  <div className="result-row discount">
                    <span>Multi-Product Discount (10%)</span>
                    <span>-{formatCurrency(results.multiProductDiscount)}</span>
                  </div>
                )}

                {results.cleverFee > 0 && (
                  <div className="result-row">
                    <span>Clever Integration</span>
                    <span>{formatCurrency(results.cleverFee)}</span>
                  </div>
                )}

                {quote.sms && (
                  <div className="result-row">
                    <span>SMS Texting</span>
                    <span>{results.smsFee > 0 ? formatCurrency(results.smsFee) : 'Custom / quote'}</span>
                  </div>
                )}

                {results.customItems.map(item => (
                  <div
                    className={`result-row${item.computedValue < 0 ? ' discount' : ''}`}
                    key={item.id}
                  >
                    <span>
                      {item.name || 'Custom Item'}
                      {item.isPercent ? ` (${item.amount}%)` : ''}
                    </span>
                    <span>
                      {item.computedValue < 0
                        ? `-${formatCurrency(Math.abs(item.computedValue))}`
                        : formatCurrency(item.computedValue)}
                    </span>
                  </div>
                ))}

                <hr className="result-divider" />

                <div className="result-row subtotal">
                  <span>Annual Base</span>
                  <span>{formatCurrency(results.annualBase)}</span>
                </div>

                {results.multiYearDiscount > 0 && (
                  <div className="result-row discount">
                    <span>
                      Multi-Year Discount
                      {results.years === 3 ? ' (5%)' : ' (10%)'}
                    </span>
                    <span>-{formatCurrency(results.multiYearDiscount)}</span>
                  </div>
                )}

                <div className="result-row subtotal">
                  <span>Annual Total</span>
                  <span>{formatCurrency(results.annualTotal)}</span>
                </div>

                {results.yearBreakdowns.map(row => (
                  <div className="result-row" key={row.year}>
                    <span>
                      Year {row.year}
                      {row.implementation > 0 ? ' (+ implementation)' : ''}
                    </span>
                    <span>{formatCurrency(row.total)}</span>
                  </div>
                ))}

                <hr className="result-divider" />

                <div className="result-row">
                  <span>List Total (annual, before discounts)</span>
                  <span>{formatCurrency(results.listTotal)}</span>
                </div>
                <div className="result-row discount">
                  <span>Annual Savings</span>
                  <span>{formatCurrency(results.annualSavings)}</span>
                </div>
                <div className="result-row discount">
                  <span>Total Savings ({results.years} yr)</span>
                  <span>{formatCurrency(results.totalSavings)}</span>
                </div>

                <hr className="result-divider" />

                <div className="result-row total">
                  <span>
                    Grand Total (
                    {results.years}
                    {' '}
                    {results.years === 1 ? 'Year' : 'Years'}
                    )
                  </span>
                  <span>{formatCurrency(results.grandTotal)}</span>
                </div>
              </>
            )}

            {saveError && (
              <p style={{ color: 'var(--discount)', fontSize: '0.875rem', marginTop: '12px' }}>{saveError}</p>
            )}

            <div className="actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleViewProspectus}
                disabled={!hasProducts}
              >
                View Prospectus
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSaveQuote}
                disabled={!hasProducts || saving}
              >
                {saving ? 'Saving…' : 'Save Quote'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopyLink}
                disabled={!hasProducts}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
