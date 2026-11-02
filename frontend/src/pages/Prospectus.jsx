import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import ProspectusDocument from '../components/prospectus/ProspectusDocument.jsx';
import { getQuote, getConfig, isApiConfigured } from '../lib/api.js';
import { decodeQuoteParams } from '../lib/encoder.js';
import { buildFields, getDefaultQuote, setProspectusDefaults } from '../lib/fields.js';
import { calculatePricing } from '../lib/pricing.js';
import { clearSheetPrintPads, padSheetsToPageMultiple } from '../lib/printSheetPad.js';
import '../styles/prospectus.css';

function quoteSearchKey(searchString) {
  const params = new URLSearchParams(searchString);
  params.delete('print');
  return params.toString();
}

/** Strip characters illegal in filenames so Save as PDF gets a clean suggested name. */
function sanitizeForFilename(name) {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Set document.title for the PDF suggested filename, then restore after print. */
function printProspectus(schoolName) {
  const prevTitle = document.title;
  const cleaned = schoolName ? sanitizeForFilename(schoolName) : '';
  document.title = cleaned
    ? `Delphinium Prospectus for ${cleaned}`
    : 'Delphinium Prospectus';
  const restore = () => {
    document.title = prevTitle;
    clearSheetPrintPads();
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  window.print();
  setTimeout(restore, 1500);
}

export default function Prospectus() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quote, setQuote] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasAutoPrinted = useRef(false);

  const quoteParamKey = useMemo(
    () => quoteSearchKey(searchParams.toString()),
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        if (isApiConfigured()) {
          try {
            const cfg = await getConfig();
            if (!cancelled) setProspectusDefaults(cfg?.prospectus);
          } catch {
            /* keep built-in defaults */
          }
        }

        const defaults = getDefaultQuote();
        const hasUrlParams =
          searchParams.has('schoolName') ||
          searchParams.has('students') ||
          searchParams.has('products');

        if (id && id !== 'new') {
          if (!isApiConfigured()) {
            throw new Error('VITE_API_URL is not configured — cannot load saved quote');
          }
          const saved = await getQuote(id);
          if (!cancelled) setQuote({ ...defaults, ...saved });
        } else if (hasUrlParams) {
          const decoded = decodeQuoteParams(searchParams.toString());
          if (!cancelled) setQuote({ ...defaults, ...decoded });
        } else {
          if (!cancelled) setQuote(defaults);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message);
          // Saved-quote routes: don't fall back to a blank demo prospectus on API failure
          if (id && id !== 'new') {
            setQuote(null);
          } else {
            setQuote(getDefaultQuote());
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, quoteParamKey]);

  useEffect(() => {
    if (searchParams.get('print') !== 'true' || !quote || loading || hasAutoPrinted.current) {
      return;
    }

    hasAutoPrinted.current = true;

    const next = new URLSearchParams(searchParams);
    next.delete('print');
    setSearchParams(next, { replace: true });

    const timer = setTimeout(() => printProspectus(quote.schoolName), 300);
    return () => clearTimeout(timer);
  }, [quote, loading, searchParams, setSearchParams]);

  useEffect(() => {
    const onBeforePrint = () => padSheetsToPageMultiple();
    const onAfterPrint = () => clearSheetPrintPads();
    const onPrintMql = (event) => {
      if (event.matches) padSheetsToPageMultiple();
      else clearSheetPrintPads();
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    const mql = window.matchMedia('print');
    if (mql.addEventListener) mql.addEventListener('change', onPrintMql);
    else mql.addListener(onPrintMql);

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      if (mql.removeEventListener) mql.removeEventListener('change', onPrintMql);
      else mql.removeListener(onPrintMql);
      clearSheetPrintPads();
    };
  }, []);

  const pricing = useMemo(() => {
    if (!quote) return null;
    try {
      return calculatePricing(quote);
    } catch {
      return null;
    }
  }, [quote]);

  const fields = useMemo(() => {
    if (!quote || !pricing) return null;
    return buildFields(quote, pricing);
  }, [quote, pricing]);

  if (loading) {
    return <div className="prospectus-loading">Loading prospectus…</div>;
  }

  if (loadError && id && id !== 'new' && !quote) {
    return (
      <div className="prospectus-loading">
        <p className="prospectus-error">
          {loadError === 'unauthorized'
            ? 'This prospectus could not be loaded. If you are a Delphinium rep, log in on the pricing page and try again.'
            : loadError}
        </p>
        <p>
          <a href="/pricing">Go to pricing calculator</a>
        </p>
      </div>
    );
  }

  if (!quote || !fields) {
    return <div className="prospectus-loading">Loading prospectus…</div>;
  }

  return (
    <>
      {loadError && (
        <p className="prospectus-error prospectus-error-banner no-print">{loadError}</p>
      )}
      <ProspectusDocument fields={fields} quote={quote} pricing={pricing} highlightFields={false} />
      <button
        type="button"
        className="prospectus-print-fab no-print"
        onClick={() => printProspectus(quote.schoolName)}
        aria-label="Print / Save PDF"
        title="Print / Save PDF — uncheck Headers and footers in the print dialog"
      >
        <Printer size={22} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </>
  );
}
