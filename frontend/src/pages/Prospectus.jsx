import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProspectusDocument from '../components/prospectus/ProspectusDocument.jsx';
import { getQuote, isApiConfigured } from '../lib/api.js';
import { decodeQuoteParams } from '../lib/encoder.js';
import { buildFields, getDefaultQuote } from '../lib/fields.js';
import { calculatePricing } from '../lib/pricing.js';
import '../styles/prospectus.css';

export default function Prospectus() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quote, setQuote] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const highlightFields = searchParams.get('highlightFields') !== 'false';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
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
          setQuote(getDefaultQuote());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, searchParams.toString()]);

  useEffect(() => {
    if (searchParams.get('print') === 'true' && quote && !loading) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, quote, loading]);

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

  function toggleHighlight() {
    const next = new URLSearchParams(searchParams);
    if (highlightFields) {
      next.set('highlightFields', 'false');
    } else {
      next.delete('highlightFields');
    }
    setSearchParams(next);
  }

  if (loading || !quote || !fields) {
    return <div style={{ padding: '40px' }}>Loading prospectus…</div>;
  }

  return (
    <>
      <div className="prospectus-toolbar no-print">
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
        <label>
          <input type="checkbox" checked={highlightFields} onChange={toggleHighlight} />
          Highlight merge fields
        </label>
        {loadError && (
          <span style={{ color: 'var(--discount)', fontSize: '0.875rem' }}>{loadError}</span>
        )}
      </div>
      <ProspectusDocument fields={fields} quote={quote} highlightFields={highlightFields} />
    </>
  );
}
