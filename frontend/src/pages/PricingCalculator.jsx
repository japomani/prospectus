import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuoteList from '../components/QuoteList.jsx';
import SaveQuoteDialog from '../components/SaveQuoteDialog.jsx';
import HubSpotCompanySearch from '../components/HubSpotCompanySearch.jsx';
import AdminSettings from '../components/AdminSettings.jsx';
import { useQuote } from '../context/QuoteContext.jsx';
import {
  createQuote,
  deleteQuote,
  getConfig,
  getQuote,
  isApiConfigured,
  listQuotes,
  updateQuote as updateQuoteApi,
} from '../lib/api.js';
import { isAdminSession } from '../lib/auth.js';
import { encodeQuoteParams } from '../lib/encoder.js';
import { getDefaultQuote } from '../lib/fields.js';
import { formatCustomItemLabel, PRODUCT_LABELS } from '../lib/pricingSummary.js';
import { calculatePricing, formatCurrency, getMultiYearDiscountPercent, buildDefaultYearlyPayments, resolveYearlyPaymentSchedule } from '../lib/pricing.js';
import { formatDate, fromDateInputValue, toDateInputValue } from '../lib/dates.js';
import { buildSuggestedQuoteName, displayQuoteLabel } from '../lib/quoteName.js';
import {
  DEFAULT_LICENSE_CONFIG,
  DEFAULT_SMS_CONFIG,
  SMS_CREDIT_FLOOR,
  SMS_OVERAGE_AUTO,
  SMS_OVERAGE_HARD_STOP,
  buildSmsSnapshot,
  clampSmsCreditsPurchased,
  mergeLicenseConfig,
  mergeSmsConfig,
  overageModeLabel,
  resolveSmsQuoteFields,
} from '../lib/smsCredits.js';

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

function decimalInputProps(value, onChange) {
  return {
    type: 'number',
    step: 'any',
    value: value === '' || value == null ? '' : value,
    onChange: e => {
      const raw = e.target.value;
      if (raw === '') onChange('');
      else onChange(Number(raw));
    },
  };
}

function formatRate(rate) {
  if (!rate || rate <= 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 5,
  }).format(rate);
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
  const [deletingId, setDeletingId] = useState(null);
  const [copyingId, setCopyingId] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveNameDraft, setSaveNameDraft] = useState('');
  const [scheduleStale, setScheduleStale] = useState(false);
  const scheduleBaseTotalRef = useRef(null);
  const apiConfigured = isApiConfigured();
  const [isAdmin, setIsAdmin] = useState(() => isAdminSession());
  const [licenseConfig, setLicenseConfig] = useState(() => mergeLicenseConfig(DEFAULT_LICENSE_CONFIG));
  const [smsConfig, setSmsConfig] = useState(() => mergeSmsConfig(DEFAULT_SMS_CONFIG));

  useEffect(() => {
    setIsAdmin(isAdminSession());
  }, []);

  useEffect(() => {
    if (!apiConfigured) return;
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getConfig();
        if (cancelled) return;
        setLicenseConfig(mergeLicenseConfig(cfg?.license));
        setSmsConfig(mergeSmsConfig(cfg?.sms));
      } catch {
        /* keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, [apiConfigured]);

  function handleConfigSaved(next) {
    if (next?.license) setLicenseConfig(mergeLicenseConfig(next.license));
    if (next?.sms) setSmsConfig(mergeSmsConfig(next.sms));
  }
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

  const handleDeleteQuote = useCallback(async (item) => {
    if (!item?.quoteId || !apiConfigured) return;
    const label = displayQuoteLabel(item);
    const ok = window.confirm(`Delete saved quote "${label}"? This cannot be undone.`);
    if (!ok) return;

    setDeletingId(item.quoteId);
    setListError(null);
    try {
      await deleteQuote(item.quoteId);
      setSavedQuotes(prev => prev.filter(q => q.quoteId !== item.quoteId));
      if (quote.quoteId === item.quoteId) {
        scheduleBaseTotalRef.current = null;
        setScheduleStale(false);
        setQuote(getDefaultQuote());
        const next = new URLSearchParams(searchParams);
        next.delete('quoteId');
        setSearchParams(next, { replace: true });
      }
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeletingId(null);
    }
  }, [apiConfigured, quote.quoteId, searchParams, setQuote, setSearchParams]);

  const handleCopyQuote = useCallback(async (item) => {
    if (!item?.quoteId || !apiConfigured || copyingId) return;

    setCopyingId(item.quoteId);
    setListError(null);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const source = await getQuote(item.quoteId);
      const baseLabel = displayQuoteLabel(source);
      const copyName = baseLabel.toLowerCase().startsWith('copy of ')
        ? baseLabel
        : `Copy of ${baseLabel}`;
      const { quoteId: _omitId, updatedAt: _u, createdAt: _c, pricingSnapshot: _p, ...fields } = source;
      const saved = await createQuote({
        ...getDefaultQuote(),
        ...fields,
        quoteName: copyName,
        quoteId: '',
      });
      scheduleBaseTotalRef.current = null;
      setScheduleStale(false);
      setQuote({ ...getDefaultQuote(), ...saved, quoteId: saved.quoteId });
      const next = new URLSearchParams(searchParams);
      next.set('quoteId', saved.quoteId);
      setSearchParams(next, { replace: true });
      setActiveTab('form');
      setSaveSuccess(`Copied as "${saved.quoteName || copyName}"`);
      await refreshQuoteList();
    } catch (err) {
      setListError(err.message);
    } finally {
      setCopyingId(null);
    }
  }, [apiConfigured, copyingId, refreshQuoteList, searchParams, setQuote, setSearchParams]);

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
  const smsResolved = resolveSmsQuoteFields(quote, smsConfig);
  const smsGateError = quote.sms && !quote.clever
    ? 'SIS integration is required when SMS texting is selected (K-12 and Higher Ed).'
    : null;

  try {
    const quoteForCalc = quote.sms
      ? { ...quote, smsFee: smsResolved.smsFee }
      : quote;
    results = calculatePricing(quoteForCalc, { licenseConfig });
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
    if (smsGateError) {
      setSaveError(smsGateError);
      return;
    }
    setSaveNameDraft(quote.quoteName?.trim() || suggestedQuoteName);
    setSaveDialogOpen(true);
  }

  function closeSaveDialog() {
    if (!saving) setSaveDialogOpen(false);
  }

  /** Stable customer share path — saved quotes only (`/quotes/{id}`). */
  function shareableProspectusPath() {
    if (quote.quoteId && apiConfigured) {
      return `/quotes/${quote.quoteId}`;
    }
    return null;
  }

  /** Path (+ query) for preview — View Prospectus can use unsaved form-link style URLs. */
  function prospectusViewPath(quoteId = quote.quoteId) {
    if (quoteId && apiConfigured) {
      return `/quotes/${quoteId}`;
    }
    const encoded = { ...quote, ...buildSmsSaveFields() };
    return `/quotes/new?${encodeQuoteParams(encoded)}`;
  }

  function handleViewProspectus(quoteId = quote.quoteId) {
    if (smsGateError) {
      setSaveError(smsGateError);
      return;
    }
    window.open(prospectusViewPath(quoteId), '_blank');
  }

  function shareLinkLabel() {
    const school = quote.schoolName?.trim() || 'Delphinium';
    const annual = results?.annualTotal != null ? formatCurrency(results.annualTotal) : '';
    if (annual) {
      return `View ${school}'s Delphinium Prospectus — ${annual}/yr`;
    }
    return `View ${school}'s Delphinium Prospectus`;
  }

  async function copyTextWithOptionalHtml(plain, html) {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        const item = new ClipboardItem({
          'text/plain': new Blob([plain], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        });
        await navigator.clipboard.write([item]);
        return;
      } catch {
        /* fall through */
      }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(plain);
      return;
    }
    // Legacy rich-text copy (email clients), matching old delphi-me calculator.
    const tempDiv = document.createElement('div');
    tempDiv.contentEditable = 'true';
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(tempDiv);
    selection.removeAllRanges();
  }

  async function handleCopyLink() {
    if (smsGateError) {
      setSaveError(smsGateError);
      return;
    }
    const path = shareableProspectusPath();
    if (!path) {
      setSaveError('Save the quote first to get a shareable customer link.');
      return;
    }
    const url = `${window.location.origin}${path}`;
    const label = shareLinkLabel();
    const plain = `${label}\n${url}`;
    const html = `<div style="font-family: Arial, sans-serif;"><a href="${url}" style="color: #00adef; text-decoration: none;">${label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a></div>`;
    try {
      await copyTextWithOptionalHtml(plain, html);
      setCopied(true);
      setSaveError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSaveError('Could not copy link — try again or copy from the address bar after Open.');
    }
  }

  function handleOpenShareLink() {
    if (smsGateError) {
      setSaveError(smsGateError);
      return;
    }
    const path = shareableProspectusPath();
    if (!path) {
      setSaveError('Save the quote first to open the customer share link.');
      return;
    }
    window.open(path, '_blank', 'noopener,noreferrer');
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

  function buildSmsSaveFields() {
    if (!quote.sms || !smsResolved.purchase || !smsResolved.inputs) {
      return {
        smsFee: 0,
        smsSnapshot: null,
      };
    }
    const snapshot = buildSmsSnapshot(
      smsResolved.inputs,
      smsConfig,
      smsResolved.purchase,
      smsResolved.estimate,
    );
    return {
      smsFee: smsResolved.purchase.annualCreditCost,
      smsFte: smsResolved.inputs.fte,
      smsTeachersPerStudent: smsResolved.inputs.teachersPerStudent,
      smsMsgsPerTeacherStudentMo: smsResolved.inputs.msgsPerTeacherStudentMo,
      smsActiveMonths: smsResolved.inputs.activeMonths,
      smsCreditsPurchased: smsResolved.purchase.creditsPurchased,
      smsOverageMode: smsResolved.inputs.overageMode,
      smsSnapshot: snapshot,
    };
  }

  async function handleSaveQuote(quoteName) {
    const name = quoteName.trim();
    if (!name) {
      setSaveError('Quote name is required');
      return;
    }
    if (smsGateError) {
      setSaveError(smsGateError);
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
      const payload = { ...quote, quoteName: name, ...buildSmsSaveFields() };
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

  function handleSmsToggle(checked) {
    if (!checked) {
      updateQuote({ sms: false });
      return;
    }
    const fte = quote.smsFte > 0 ? quote.smsFte : (Number(quote.students) || 0);
    const teachers = quote.smsTeachersPerStudent > 0
      ? quote.smsTeachersPerStudent
      : (smsConfig.defaultTeachersPerStudent ?? 7);
    const msgs = quote.smsMsgsPerTeacherStudentMo > 0
      ? quote.smsMsgsPerTeacherStudentMo
      : (smsConfig.defaultMsgsPerTeacherStudentMo ?? 5);
    const months = quote.smsActiveMonths > 0
      ? quote.smsActiveMonths
      : (smsConfig.defaultActiveMonths ?? 10);
    const estimate = resolveSmsQuoteFields({
      ...quote,
      sms: true,
      smsFte: fte,
      smsTeachersPerStudent: teachers,
      smsMsgsPerTeacherStudentMo: msgs,
      smsActiveMonths: months,
      smsCreditsPurchased: 0,
    }, smsConfig);
    updateQuote({
      sms: true,
      smsFte: fte,
      smsTeachersPerStudent: teachers,
      smsMsgsPerTeacherStudentMo: msgs,
      smsActiveMonths: months,
      smsOverageMode: quote.smsOverageMode || SMS_OVERAGE_AUTO,
      smsCreditsPurchased: estimate.purchase?.creditsPurchased || 0,
    });
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
        {isAdmin && (
          <button
            type="button"
            className={`pricing-tab${activeTab === 'admin' ? ' active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        )}
      </div>

      {activeTab === 'saved' ? (
        <QuoteList
          quotes={savedQuotes}
          loading={listLoading}
          error={listError}
          apiConfigured={apiConfigured}
          deletingId={deletingId}
          copyingId={copyingId}
          onRefresh={refreshQuoteList}
          onEdit={quoteId => loadQuoteIntoForm(quoteId)}
          onCopy={handleCopyQuote}
          onView={quoteId => handleViewProspectus(quoteId)}
          onDelete={handleDeleteQuote}
        />
      ) : activeTab === 'admin' && isAdmin ? (
        <AdminSettings onConfigSaved={handleConfigSaved} />
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
            <HubSpotCompanySearch
              companyId={quote.hubspotCompanyId}
              schoolName={quote.schoolName}
              onSelect={company => updateQuote({
                hubspotCompanyId: company.id,
                schoolName: company.name || quote.schoolName,
              })}
              onUnlink={() => updateQuote({ hubspotCompanyId: '' })}
            />
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
                  onChange={e => updateQuote({
                    isUniversity: e.target.checked,
                    // Higher Ed still keeps SIS when SMS requires it.
                    ...(e.target.checked && !quote.sms ? { clever: false } : {}),
                  })}
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
            {(!quote.isUniversity || quote.sms) && (
              <>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={quote.clever}
                      onChange={e => updateQuote({ clever: e.target.checked })}
                    />
                    SIS integration
                    {quote.sms ? ' (required for SMS)' : ' (custom / quote)'}
                  </label>
                </div>
                {quote.clever && (
                  <div className="form-group form-group-nested">
                    <label>SIS fee (optional override)</label>
                    <input
                      placeholder="0 = show as custom/quote"
                      {...integerInputProps(quote.cleverFee, cleverFee => updateQuote({ cleverFee }))}
                    />
                  </div>
                )}
              </>
            )}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quote.sms}
                  onChange={e => handleSmsToggle(e.target.checked)}
                />
                SMS texting (prepaid credits)
              </label>
            </div>
            {quote.sms && (
              <div className="form-group-nested sms-fields">
                {smsGateError && <p className="pricing-error">{smsGateError}</p>}
                <div className="form-group">
                  <label>FTE students</label>
                  <input
                    {...integerInputProps(
                      quote.smsFte > 0 ? quote.smsFte : quote.students,
                      smsFte => updateQuote({ smsFte }),
                    )}
                  />
                </div>
                <div className="form-group">
                  <label>Teachers per student</label>
                  <input
                    {...decimalInputProps(
                      quote.smsTeachersPerStudent,
                      smsTeachersPerStudent => updateQuote({ smsTeachersPerStudent }),
                    )}
                  />
                </div>
                <div className="form-group">
                  <label>Msgs per teacher per student / month (incl. replies)</label>
                  <input
                    {...decimalInputProps(
                      quote.smsMsgsPerTeacherStudentMo,
                      smsMsgsPerTeacherStudentMo => updateQuote({ smsMsgsPerTeacherStudentMo }),
                    )}
                  />
                </div>
                <div className="form-group">
                  <label>Active months / year</label>
                  <input
                    {...integerInputProps(
                      quote.smsActiveMonths,
                      smsActiveMonths => updateQuote({ smsActiveMonths }),
                    )}
                  />
                </div>
                <div className="form-group">
                  <label>Credits to purchase (annual)</label>
                  <input
                    type="number"
                    min={SMS_CREDIT_FLOOR}
                    step={1}
                    inputMode="numeric"
                    value={quote.smsCreditsPurchased > 0 ? quote.smsCreditsPurchased : ''}
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') {
                        updateQuote({ smsCreditsPurchased: 0 });
                        return;
                      }
                      const n = parseInt(raw, 10);
                      if (!Number.isFinite(n) || n < 0) return;
                      updateQuote({ smsCreditsPurchased: clampSmsCreditsPurchased(n) });
                    }}
                    onBlur={e => {
                      const raw = e.target.value;
                      if (raw === '') return;
                      const n = parseInt(raw, 10);
                      if (!Number.isFinite(n) || n <= 0) return;
                      const clamped = clampSmsCreditsPurchased(n);
                      if (clamped !== quote.smsCreditsPurchased) {
                        updateQuote({ smsCreditsPurchased: clamped });
                      }
                    }}
                  />
                  {smsResolved.estimate && (
                    <p className="pricing-hint">
                      Estimator recommends
                      {' '}
                      {smsResolved.estimate.recommendedYr.toLocaleString('en-US')}
                      {' '}
                      credits/year
                      {' '}
                      (
                      {smsResolved.estimate.recommendedMo.toLocaleString('en-US')}
                      /mo) — guidance only.
                      {smsResolved.estimate.floored || smsResolved.purchase?.creditsPurchasedFloored
                        ? ' Floor: 1,000 credits minimum.'
                        : ''}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Overage method</label>
                  <div className="radio-group">
                    <label className="checkbox-label">
                      <input
                        type="radio"
                        name="smsOverage"
                        checked={(quote.smsOverageMode || SMS_OVERAGE_AUTO) === SMS_OVERAGE_AUTO}
                        onChange={() => updateQuote({ smsOverageMode: SMS_OVERAGE_AUTO })}
                      />
                      Auto-bill (default)
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="radio"
                        name="smsOverage"
                        checked={quote.smsOverageMode === SMS_OVERAGE_HARD_STOP}
                        onChange={() => updateQuote({ smsOverageMode: SMS_OVERAGE_HARD_STOP })}
                      />
                      Hard stop at 105%
                    </label>
                  </div>
                </div>
                {smsResolved.purchase && (
                  <div className="sms-preview-box">
                    <div className="result-section-title">SMS quote preview</div>
                    <div className="result-row">
                      <span>Credits purchased</span>
                      <span>{smsResolved.purchase.creditsPurchased.toLocaleString('en-US')}</span>
                    </div>
                    <div className="result-row">
                      <span>Effective rate</span>
                      <span>{formatRate(smsResolved.purchase.effectiveRate)}</span>
                    </div>
                    <div className="result-row">
                      <span>Annual credit cost</span>
                      <span>{formatCurrency(smsResolved.purchase.annualCreditCost)}</span>
                    </div>
                    <div className="result-row">
                      <span>Discount over full cost</span>
                      <span>{formatCurrency(smsResolved.purchase.discountOverFull)}</span>
                    </div>
                    <div className="result-row">
                      <span>Overage</span>
                      <span>{overageModeLabel(quote.smsOverageMode)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Number of Years</div>
            <div className="form-group">
              <div className="radio-group">
                {[1, 2, 3, 4, 5].map(y => (
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
            <div className="form-group">
              <label>Target go-live</label>
              <input
                type="date"
                value={toDateInputValue(quote.targetGoLive)}
                onChange={e => updateQuote({
                  targetGoLive: fromDateInputValue(e.target.value),
                })}
              />
            </div>
            <div className="form-group">
              <label>Pricing held until</label>
              <input
                type="date"
                value={toDateInputValue(quote.validUntil)}
                onChange={e => updateQuote({
                  validUntil: fromDateInputValue(e.target.value),
                })}
              />
            </div>
            <div className="form-group">
              <label>Prospectus pages</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(quote.includeFreeTrialPage)}
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
                    || quote.clever
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
                          {quote.clever && (
                            <div className="result-row">
                              <span>SIS Integration</span>
                              <span>
                                {results.cleverFee > 0 ? formatCurrency(results.cleverFee) : 'Custom / quote'}
                              </span>
                            </div>
                          )}
                          {quote.sms && (
                            <>
                              <div className="result-row">
                                <span>SMS Texting (annual credits)</span>
                                <span>
                                  {results.smsFee > 0 ? formatCurrency(results.smsFee) : 'Custom / quote'}
                                </span>
                              </div>
                              {smsResolved.purchase && (
                                <>
                                  <div className="result-row">
                                    <span>Credits purchased</span>
                                    <span>{smsResolved.purchase.creditsPurchased.toLocaleString('en-US')}</span>
                                  </div>
                                  <div className="result-row">
                                    <span>Effective rate</span>
                                    <span>{formatRate(smsResolved.purchase.effectiveRate)}</span>
                                  </div>
                                  <div className="result-row">
                                    <span>Discount over full cost</span>
                                    <span>{formatCurrency(smsResolved.purchase.discountOverFull)}</span>
                                  </div>
                                  <div className="result-row">
                                    <span>Overage</span>
                                    <span>{overageModeLabel(quote.smsOverageMode)}</span>
                                  </div>
                                </>
                              )}
                            </>
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
                className="btn btn-secondary"
                onClick={handleCopyLink}
                disabled={!hasProducts || !quote.quoteId}
                title={quote.quoteId ? 'Copy shareable prospectus link for email' : 'Save the quote first to copy a customer link'}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleOpenShareLink}
                disabled={!hasProducts || !quote.quoteId}
                title={quote.quoteId ? 'Open customer prospectus in a new tab' : 'Save the quote first to open the share link'}
              >
                Open
              </button>
            </div>
            {!quote.quoteId && hasProducts && (
              <p className="pricing-muted" style={{ marginTop: '8px' }}>
                Save the quote to enable Copy Link and Open (stable <code>/quotes/…</code> URL for customers).
              </p>
            )}
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
