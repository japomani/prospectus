import { useEffect, useRef, useState } from 'react';
import { isApiConfigured, searchHubspotCompanies } from '../lib/api.js';

function companySubtitle(company) {
  const parts = [company.domain, company.city, company.state].filter(Boolean);
  return parts.join(' · ');
}

/**
 * HubSpot company typeahead for School Information.
 * Selecting a company sets hubspotCompanyId and schoolName from company.name.
 */
export default function HubSpotCompanySearch({ companyId, schoolName, onSelect, onUnlink }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const apiConfigured = isApiConfigured();

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!apiConfigured) return undefined;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }
    setLoading(true);
    setError(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchHubspotCompanies(q);
        setResults(items);
        setOpen(true);
      } catch (err) {
        setResults([]);
        setError(err.message || 'HubSpot search unavailable');
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, apiConfigured]);

  if (!apiConfigured) return null;

  if (companyId) {
    return (
      <div className="form-group hubspot-company-link">
        <label>HubSpot company</label>
        <div className="hubspot-linked">
          <div className="hubspot-linked-meta">
            <span className="hubspot-linked-name">{schoolName || 'Linked company'}</span>
            <span className="hubspot-linked-id">ID {companyId}</span>
          </div>
          <button
            type="button"
            className="btn-secondary hubspot-unlink"
            onClick={() => {
              onUnlink?.();
              setQuery('');
              setResults([]);
            }}
          >
            Unlink
          </button>
        </div>
        <p className="pricing-muted">Prospectus URL will sync to this company on save.</p>
      </div>
    );
  }

  return (
    <div className="form-group hubspot-company-search" ref={wrapRef}>
      <label htmlFor="hubspot-company-q">Find HubSpot company</label>
      <input
        id="hubspot-company-q"
        type="search"
        autoComplete="off"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length || error) setOpen(true);
        }}
        placeholder="Search companies by name…"
      />
      {loading && <p className="pricing-muted">Searching HubSpot…</p>}
      {open && (results.length > 0 || error) && (
        <ul className="hubspot-results" role="listbox">
          {error && (
            <li className="hubspot-results-empty">{error}</li>
          )}
          {!error && results.map(company => (
            <li key={company.id}>
              <button
                type="button"
                className="hubspot-result"
                onClick={() => {
                  onSelect?.(company);
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
              >
                <span className="hubspot-result-name">{company.name || 'Untitled'}</span>
                {companySubtitle(company) && (
                  <span className="hubspot-result-sub">{companySubtitle(company)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && query.trim().length >= 2 && open && results.length === 0 && (
        <p className="pricing-muted">No companies matched.</p>
      )}
    </div>
  );
}
