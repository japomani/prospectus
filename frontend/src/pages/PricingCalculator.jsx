import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuoteList from '../components/QuoteList.jsx';
import SaveQuoteDialog from '../components/SaveQuoteDialog.jsx';
import { useQuote } from '../context/QuoteContext.jsx';
import {
  createQuote,
  getQuote,
  isApiConfigured,
  listQuotes,
  updateQuote as updateQuoteApi,
} from '../lib/api.js';
import { encodeQuoteParams } from '../lib/encoder.js';
import { getDefaultQuote, PAIN_OPTIONS } from '../lib/fields.js';
import { formatCustomItemLabel, PRODUCT_LABELS } from '../lib/pricingSummary.js';
import { calculatePricing, formatCurrency, getMultiYearDiscountPercent, buildDefaultYearlyPayments, resolveYearlyPaymentSchedule } from '../lib/pricing.js';
import { formatDate } from '../lib/dates.js';
import { buildSuggestedQuoteName, displayQuoteLabel } from '../lib/quoteName.js';

function integerInputProps(value, onChange) {
  const numeric = Number(value) || 0;
  return {
    type: 'text',
    inputMode: 'numeric',
    value: numeric === 0 ? '' : String(numeric),
    onChange: e => {
      const digits = e.target.value.replace(/\D/g, '');
      onChange(digits === '' ? 0 : parseInt(digits, 10));
    },
  };
}

export default function PricingCalculator() {
  const { quote, setQuote, updateQuote } = useQuote();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('form');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveNameDraft, setSaveNameDraft] = useState('');
  const [scheduleStale, setScheduleStale] = useState(false);
  const scheduleBaseTotalRef = useRef(null);
  const apiConfigured = isApiConfigured();

  const refreshQuoteList = useCallback(async () => {
    if (!apiConfigured) return;
    setListLoading(true);
    setListError(null);
    try {
      const items = await listQuotes();
      setSavedQuotes(items);
    } catch (err) {
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  }, [apiConfigured]);

  const loadQuoteIntoForm = useCallback(async (quoteId, { switchTab = true } = {}) => {
    if (!quoteId || !apiConfigured) return;
    setLoadingQuote(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const loaded = await getQuote(quoteId);
      scheduleBaseTotalRef.current = null;
      setScheduleStale(false);
      setQuote({ ...getDefaultQuote(), ...loaded, quoteId: loaded.quoteId || quoteId });
      const next = new URLSearchParams(searchParams);
      next.set('quoteId', quoteId);
      setSearchParams(next, { replace: true });
      if (switchTab) setActiveTab('form');
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setLoadingQuote(false);
    }
  }, [apiConfigured, searchParams, setQuote, setSearchParams]);

  useEffect(() => {
    const quoteId = searchParams.get('quoteId');
    if (quoteId && apiConfigured && quoteId !== quote.quoteId) {
      loadQuoteIntoForm(quoteId, { switchTab: false });
    }
  }, [searchParams, quote.quoteId, apiConfigured, loadQuoteIntoForm]);

  useEffect(() => {
    if (activeTab === 'saved') {
      refreshQuoteList();
    }
  }, [activeTab, refreshQuoteList]);

  useEffect(() => {
    if (apiConfigured) {
      refreshQuoteList();
    }
  }, [apiConfigured, refreshQuoteList]);

  let results = null;
  let calcError = null;

  try {
    results = calculatePricing(quote);
  } catch (err) {
    calcError = err.message;
  }

  const activeProducts = Object.entries(PRODUCT_LABELS).filter(([key]) => quote[key]);
  const hasProducts = activeProducts.length > 0;
  const studentCount = (quote.students || 0).toLocaleString('en-US');
  const suggestedQuoteName = useMemo(
    () => buildSuggestedQuoteName(quote, results),
    [quote, results],
  );

  function openSaveDialog() {
    setSaveError(null);
    setSaveSuccess(null);
    setSaveNameDraft(quote.quoteName?.trim() || suggestedQuoteName);
    setSaveDialogOpen(true);
  }

  function closeSaveDialog() {
    if (!saving) setSaveDialogOpen(false);
  }

  function handleViewProspectus(quoteId = quote.quoteId) {
    if (quoteId && apiConfigured) {
      window.open(`/quotes/${quoteId}`, '_blank');
      return;
    }
    const qs = encodeQuoteParams(quote);
    window.open(`/quotes/new?${qs}`, '_blank');
  }

  function handleCopyLink() {
    const url = quote.quoteId && apiConfigured
      ? `${window.location.origin}/quotes/${quote.quoteId}`
      : `${window.location.origin}/quotes/new?${encodeQuoteParams(quote)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function startNewQuote() {
    scheduleBaseTotalRef.current = null;
    setScheduleStale(false);
    setQuote(getDefaultQuote());
    setSaveError(null);
    setSaveSuccess(null);
    const next = new URLSearchParams(searchParams);
    next.delete('quoteId');
    setSearchParams(next, { replace: true });
  }

  function handleQuoteSelect(value) {
    if (value === 'new') {
      startNewQuote();
      return;
    }
    loadQuoteIntoForm(value);
  }

  async function handleSaveQuote(quoteName) {
    const name = quoteName.trim();
    if (!name) {
      setSaveError('Quote name is required');
      return;
    }
    setSaveError(null);
    setSaveSuccess(null);
    if (!apiConfigured) {
      setSaveError('Set VITE_API_URL to enable saving quotes');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...quote, quoteName: name };
      let saved;
      if (quote.quoteId) {
        saved = await updateQuoteApi(quote.quoteId, payload);
        setSaveSuccess(`Quote updated: ${name}`);
      } else {
        saved = await createQuote(payload);
        setSaveSuccess(`Quote saved: ${name}`);
      }
      setQuote({ ...payload, ...saved, quoteId: saved.quoteId, quoteName: saved.quoteName || name });
      const next = new URLSearchParams(searchParams);
      next.set('quoteId', saved.quoteId);
      setSearchParams(next, { replace: true });
      refreshQuoteList();
      setSaveDialogOpen(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addCustomItem() {
    const newItem = {
      id: Date.now(),
      name: '',
      isDiscount: false,
      isPercent: false,
      isOneTime: false,
      amount: 0,
    };
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

  function handlePayUpfrontChange(checked) {
    if (checked) {
      scheduleBaseTotalRef.current = null;
      setScheduleStale(false);
      updateQuote({ payUpfront: true });
      return;
    }
    const defaults = results ? buildDefaultYearlyPayments(results) : [];
    scheduleBaseTotalRef.current = results?.grandTotal ?? null;
    setScheduleStale(false);
    updateQuote({ payUpfront: false, yearlyPayments: defaults });
  }

  function handleYearsChange(years) {
    const updates = { years };
    if (years <= 1) {
      updates.payUpfront = true;
      updates.yearlyPayments = [];
      scheduleBaseTotalRef.current = null;
      setScheduleStale(false);
    } else if (quote.payUpfront === false && results) {
      updates.yearlyPayments = buildDefaultYearlyPayments({
        years,
        termTotal: Math.round(results.annualTotal * years * 100) / 100,
        implementationFee: results.implementationFee,
      });
      scheduleBaseTotalRef.current = null;
      setScheduleStale(false);
    }
    updateQuote(updates);
  }

  function recalculatePaymentSchedule() {
    if (!results) return;
    scheduleBaseTotalRef.current = results.grandTotal;
    setScheduleStale(false);
    updateQuote({ yearlyPayments: buildDefaultYearlyPayments(results) });
  }

  function handleYearlyPaymentChange(yearIndex, amount) {
    const years = quote.years || 1;
    const current = Array.isArray(quote.yearlyPayments)
      ? [...quote.yearlyPayments]
      : buildDefaultYearlyPayments(results);
    while (current.length < years - 1) {
      current.push(0);
    }
    current[yearIndex] = amount;
    updateQuote({ yearlyPayments: current.slice(0, years - 1) });
  }

  const payUpfront = quote.payUpfront !== false;
  const yearlySchedule = useMemo(
    () => (results && !payUpfront && results.years > 1
      ? resolveYearlyPaymentSchedule(quote, results)
      : []),
    [quote, results, payUpfront],
  );

  useEffect(() => {
    if (!results || payUpfront || results.years <= 1) {
      return;
    }
    const total = results.grandTotal;
    if (scheduleBaseTotalRef.current === null) {
      scheduleBaseTotalRef.current = total;
      return;
    }
    if (scheduleBaseTotalRef.current !== total) {
      setScheduleStale(true);
    }
  }, [results?.grandTotal, payUpfront, results?.years]);

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
    <div className="pricing-page">
      <h1 className="dComponentHeader dMarginBelowLrg">Delphinium Pricing Calculator</h1>

      <div className="pricing-tabs">
        <button
          type="button"
          className={`pricing-tab${activeTab === 'form' ? ' active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Quote form
        </button>
        <button
          type="button"
          className={`pricing-tab${activeTab === 'saved' ? ' active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved quotes
        </button>
      </div>

      {activeTab === 'saved' ? (
        <QuoteList
          quotes={savedQuotes}
          loading={listLoading}
          error={listError}
          apiConfigured={apiConfigured}
          onRefresh={refreshQuoteList}
          onEdit={quoteId => loadQuoteIntoForm(quoteId)}
          onView={quoteId => handleViewProspectus(quoteId)}
        />
      ) : (
        <>
          {apiConfigured && (
            <div className="quote-mode-bar">
              <label htmlFor="quote-mode-select">Working on</label>
              <select
                id="quote-mode-select"
                className="quote-mode-select"
                value={quote.quoteId || 'new'}
                onChange={e => handleQuoteSelect(e.target.value)}
                disabled={loadingQuote}
              >
                <option value="new">New quote</option>
                {savedQuotes.map(item => (
                  <option key={item.quoteId} value={item.quoteId}>
                    {displayQuoteLabel(item)}
                    {' '}
                    (
                    {formatDate(item.updatedAt)}
                    )
                  </option>
                ))}
              </select>
              {quote.quoteId && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={startNewQuote}>
                  Start new quote
                </button>
              )}
            </div>
          )}

          {quote.quoteId && (
            <div className="quote-editing-banner">
              Editing <strong>{displayQuoteLabel(quote)}</strong>
            </div>
          )}

          {loadingQuote && <p className="pricing-muted">Loading quote…</p>}

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
                  Online
                </label>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="schoolType"
                    value="traditional"
                    checked={quote.schoolType === 'traditional'}
                    onChange={() => updateQuote({ schoolType: 'traditional' })}
                  />
                  Traditional
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Number of Students</label>
              <input
                {...integerInputProps(quote.students, students => updateQuote({ students }))}
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.isUniversity}
                  onChange={e => updateQuote({ isUniversity: e.target.checked })}
                />
                Higher Ed (Remove references to parents)
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.isDistrict}
                  onChange={e => updateQuote({ isDistrict: e.target.checked })}
                />
                District or University
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
                  onChange={e => updateQuote({
                    clever: e.target.checked,
                    ...(e.target.checked && !quote.cleverSchools ? { cleverSchools: 1 } : {}),
                  })}
                />
                Clever integration ($500/school)
              </label>
            </div>
            {quote.clever && (
              <div className="form-group form-group-nested">
                <label>Number of schools</label>
                <input
                  {...integerInputProps(
                    quote.cleverSchools || 1,
                    cleverSchools => updateQuote({ cleverSchools: Math.max(1, cleverSchools) }),
                  )}
                />
              </div>
            )}
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
              <div className="form-group form-group-nested">
                <label>SMS fee (optional override)</label>
                <input
                  placeholder="0 = show as custom/quote"
                  {...integerInputProps(quote.smsFee, smsFee => updateQuote({ smsFee }))}
                />
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Contract Term</div>
            <div className="form-group">
              <label>Number of Years</label>
              <div className="radio-group">
                {[1, 2, 3, 5].map(y => (
                  <label className="checkbox-label" key={y}>
                    <input
                      type="radio"
                      name="years"
                      value={y}
                      checked={quote.years === y}
                      onChange={() => handleYearsChange(y)}
                    />
                    {y} {y === 1 ? 'Year' : 'Years'}
                    {getMultiYearDiscountPercent(y) > 0 && ` (${getMultiYearDiscountPercent(y)}% off)`}
                  </label>
                ))}
              </div>
            </div>
            {quote.years > 1 && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={payUpfront}
                    onChange={e => handlePayUpfrontChange(e.target.checked)}
                  />
                  Pay all upfront at signing
                </label>
              </div>
            )}
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
            <div className="form-group">
              <label>Prospectus pages</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.includeFreeTrialPage !== false}
                  onChange={e => updateQuote({ includeFreeTrialPage: e.target.checked })}
                />
                Include free trial page
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(quote.includePilotPage)}
                  onChange={e => updateQuote({ includePilotPage: e.target.checked })}
                />
                Include pilot page
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Custom Line Items</div>
            {quote.customItems.length === 0 && (
              <p className="pricing-muted" style={{ marginBottom: '12px' }}>
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
                  placeholder="Amount"
                  style={{ flex: 1 }}
                  {...integerInputProps(item.amount, amount => updateCustomItem(item.id, 'amount', amount))}
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
                <select
                  value={item.isOneTime ? 'oneTime' : 'yearly'}
                  onChange={e => updateCustomItem(item.id, 'isOneTime', e.target.value === 'oneTime')}
                  aria-label="Apply custom item yearly or one time"
                  style={{ flex: '0 0 auto', minWidth: '9em' }}
                >
                  <option value="yearly">Yearly</option>
                  <option value="oneTime">One-time</option>
                </select>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteCustomItem(item.id)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomItem} style={{ marginTop: '8px' }}>
              + Add Item
            </button>
          </div>

        </div>

        <div className="results-col">
          <div className="results-panel card">
            <div className="card-title">Pricing Summary</div>

            {calcError && <p className="pricing-error">{calcError}</p>}

            {!hasProducts && !calcError && (
              <p className="no-products-msg">Select at least one product to see pricing.</p>
            )}

            {hasProducts && results && (
              <>
                <div className="result-section-title">Students</div>
                <div className="result-row">
                  <span>{studentCount}</span>
                </div>
                <div className="result-section-title">Products</div>
                {Object.entries(results.productLicenses).map(([key, val]) => (
                  <div className="result-row" key={key}>
                    <span>
                      {PRODUCT_LABELS[key] || key}
                      {' '}
                      License
                    </span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}
                <div className="result-row subtotal">
                  <span>Product Subtotal</span>
                  <span>{formatCurrency(results.productSubtotal)}</span>
                </div>

                {(() => {
                  const customCharges = results.customItems.filter(i => i.computedValue > 0);
                  const customDiscounts = results.customItems.filter(i => i.computedValue < 0);
                  const hasAddons =
                    results.implementationFee > 0
                    || results.cleverFee > 0
                    || quote.sms
                    || customCharges.length > 0;
                  const hasDiscounts =
                    results.volumeDiscount > 0
                    || results.multiProductDiscount > 0
                    || results.multiYearDiscount > 0
                    || customDiscounts.length > 0
                    || results.annualSavings > 0;

                  return (
                    <>
                      {hasDiscounts && (
                        <>
                          <div className="result-section-title">Discounts</div>
                          {results.volumeDiscount > 0 && (
                            <div className="result-row discount">
                              <span>
                                Volume Discount
                                {' '}
                                ({results.volumeDiscountPercent}%)
                              </span>
                              <span>-{formatCurrency(results.volumeDiscount)}</span>
                            </div>
                          )}
                          {results.multiProductDiscount > 0 && (
                            <div className="result-row discount">
                              <span>Multi-Product Discount (10%)</span>
                              <span>-{formatCurrency(results.multiProductDiscount)}</span>
                            </div>
                          )}
                          {results.multiYearDiscount > 0 && (
                            <div className="result-row discount">
                              <span>
                                Multi-Year Discount
                                {' '}
                                ({getMultiYearDiscountPercent(results.years)}%)
                              </span>
                              <span>-{formatCurrency(results.multiYearDiscount)}</span>
                            </div>
                          )}
                          {customDiscounts.map(item => (
                            <div className="result-row discount" key={item.id}>
                              <span>{formatCustomItemLabel(item, 'Custom Discount')}</span>
                              <span>-{formatCurrency(Math.abs(item.computedValue))}</span>
                            </div>
                          ))}
                          {results.annualSavings > 0 && (
                            <div className="result-row total savings">
                              <span>Annual Savings</span>
                              <span>{formatCurrency(results.annualSavings)}</span>
                            </div>
                          )}
                        </>
                      )}

                      {hasAddons && (
                        <>
                          <div className="result-section-title">Add-ons</div>
                          {results.implementationFee > 0 && (
                            <div className="result-row">
                              <span>Implementation Fee (one time for setup and training)</span>
                              <span>{formatCurrency(results.implementationFee)}</span>
                            </div>
                          )}
                          {results.cleverFee > 0 && (
                            <div className="result-row">
                              <span>
                                Clever Integration
                                {(quote.cleverSchools || 1) > 1 && ` (${quote.cleverSchools} schools)`}
                              </span>
                              <span>{formatCurrency(results.cleverFee)}</span>
                            </div>
                          )}
                          {quote.sms && (
                            <div className="result-row">
                              <span>SMS Texting</span>
                              <span>
                                {results.smsFee > 0 ? formatCurrency(results.smsFee) : 'Custom / quote'}
                              </span>
                            </div>
                          )}
                          {customCharges.map(item => (
                            <div className="result-row" key={item.id}>
                              <span>{formatCustomItemLabel(item, 'Custom Item')}</span>
                              <span>{formatCurrency(item.computedValue)}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}

                <hr className="result-divider" />

                {results.years > 1 ? (
                  payUpfront ? (
                    <>
                      <div className="result-row">
                        <span>Annual Total</span>
                        <span>{formatCurrency(results.annualTotal)}</span>
                      </div>
                      <div className="result-row total">
                        <span>
                          Total due
                          {' '}
                          (
                          {results.years}
                          -year agreement)
                        </span>
                        <span>{formatCurrency(results.grandTotal)}</span>
                      </div>
                      {results.totalSavings > 0 && (
                        <div className="result-row savings">
                          <span>Total Savings ({results.years} yr)</span>
                          <span>{formatCurrency(results.totalSavings)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="result-row">
                        <span>Annual Total</span>
                        <span>{formatCurrency(results.annualTotal)}</span>
                      </div>
                      <div className="result-row total">
                        <span>
                          Agreement total
                          {' '}
                          (
                          {results.years}
                          {' '}
                          years)
                        </span>
                        <span>{formatCurrency(results.grandTotal)}</span>
                      </div>
                      {results.totalSavings > 0 && (
                        <div className="result-row savings">
                          <span>Total Savings ({results.years} yr)</span>
                          <span>{formatCurrency(results.totalSavings)}</span>
                        </div>
                      )}
                      <div className="payment-schedule-head">
                        <div className="result-section-title">Payment schedule</div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={recalculatePaymentSchedule}
                        >
                          Recalculate
                        </button>
                      </div>
                      {scheduleStale && (
                        <p className="pricing-muted payment-schedule-stale">
                          Agreement total changed — recalculate to reset the schedule.
                        </p>
                      )}
                      {yearlySchedule.map(row => (
                        <div className="result-row yearly-payment-row" key={row.year}>
                          <span>
                            Year {row.year}
                            {row.isRemainder ? ' (balance)' : ''}
                            {!row.isRemainder && row.year === 1 && results.implementationFee > 0
                              ? ' (+ implementation)'
                              : ''}
                          </span>
                          {row.editable ? (
                            <input
                              className="yearly-payment-input"
                              aria-label={`Year ${row.year} payment`}
                              {...integerInputProps(
                                row.amount,
                                amount => handleYearlyPaymentChange(row.year - 1, amount),
                              )}
                            />
                          ) : (
                            <span>{formatCurrency(row.amount)}</span>
                          )}
                        </div>
                      ))}
                    </>
                  )
                ) : (
                  <>
                    <div className="result-row total">
                      <span>Annual Total</span>
                      <span>{formatCurrency(results.annualTotal)}</span>
                    </div>
                  </>
                )}

                {results.years === 1 && (
                  <>
                    <hr className="result-divider" />

                    <div className="result-row total">
                      <span>Grand Total (1 Year)</span>
                      <span>{formatCurrency(results.grandTotal)}</span>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="pricing-notes-section">
              <div className="result-section-title">Notes</div>
              <div className="pricing-notes-box">
                <textarea
                  value={quote.notes}
                  onChange={e => updateQuote({ notes: e.target.value })}
                  placeholder="Add notes for this estimate…"
                  rows={3}
                />
              </div>
            </div>

            {saveError && (
              <p className="pricing-error" style={{ marginTop: '12px' }}>{saveError}</p>
            )}
            {saveSuccess && (
              <p className="quote-save-success">{saveSuccess}</p>
            )}

            <div className="actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleViewProspectus()}
                disabled={!hasProducts}
              >
                View Prospectus
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={openSaveDialog}
                disabled={!hasProducts || saving || loadingQuote}
              >
                {saving ? 'Saving…' : quote.quoteId ? 'Update Quote' : 'Save Quote'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCopyLink}
                disabled={!hasProducts}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      <SaveQuoteDialog
        open={saveDialogOpen}
        draftName={saveNameDraft}
        suggestedName={suggestedQuoteName}
        saving={saving}
        isUpdate={Boolean(quote.quoteId)}
        onDraftChange={setSaveNameDraft}
        onUseSuggested={() => setSaveNameDraft(suggestedQuoteName)}
        onCancel={closeSaveDialog}
        onConfirm={() => handleSaveQuote(saveNameDraft)}
      />
    </div>
  );
}
