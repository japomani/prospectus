import { useEffect, useRef, useState } from 'react';
import { isApiConfigured, searchZohoAccounts } from '../lib/api.js';

function accountSubtitle(account) {
  return account.website || '';
}

/**
 * Zoho Account typeahead for School Information.
 * Selecting an account sets zohoAccountId and schoolName from account.name.
 * Save writes the prospectus URL to Accounts.Delphinium_Prospectus_URL.
 */
export default function ZohoAccountSearch({ accountId, schoolName, onSelect, onUnlink }) {
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
        const items = await searchZohoAccounts(q);
        setResults(items);
        setOpen(true);
      } catch (err) {
        setResults([]);
        setError(err.message || 'Zoho search unavailable');
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, apiConfigured]);

  if (!apiConfigured) return null;

  if (accountId) {
    return (
      <div className="form-group zoho-account-link">
        <label>Zoho account</label>
        <div className="zoho-linked">
          <div className="zoho-linked-meta">
            <span className="zoho-linked-name">{schoolName || 'Linked account'}</span>
            <span className="zoho-linked-id">ID {accountId}</span>
          </div>
          <button
            type="button"
            className="btn-secondary zoho-unlink"
            onClick={() => {
              onUnlink?.();
              setQuery('');
              setResults([]);
            }}
          >
            Unlink
          </button>
        </div>
        <p className="pricing-muted">Prospectus URL will sync to this account on save.</p>
      </div>
    );
  }

  return (
    <div className="form-group zoho-account-search" ref={wrapRef}>
      <label htmlFor="zoho-account-q">Find Zoho account</label>
      <input
        id="zoho-account-q"
        type="search"
        autoComplete="off"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length || error) setOpen(true);
        }}
        placeholder="Search accounts by name…"
      />
      {loading && <p className="pricing-muted">Searching Zoho…</p>}
      {open && (results.length > 0 || error) && (
        <ul className="zoho-results" role="listbox">
          {error && (
            <li className="zoho-results-empty">{error}</li>
          )}
          {!error && results.map(account => (
            <li key={account.id}>
              <button
                type="button"
                className="zoho-result"
                onClick={() => {
                  onSelect?.(account);
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
              >
                <span className="zoho-result-name">{account.name || 'Untitled'}</span>
                {accountSubtitle(account) && (
                  <span className="zoho-result-sub">{accountSubtitle(account)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && query.trim().length >= 2 && open && results.length === 0 && (
        <p className="pricing-muted">No accounts matched.</p>
      )}
    </div>
  );
}
