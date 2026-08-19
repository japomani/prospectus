import { useState } from 'react';
import { formatCurrency } from '../lib/pricing.js';
import { formatDate } from '../lib/dates.js';
import { displayQuoteLabel } from '../lib/quoteName.js';

function quoteSearchHaystack(item) {
  const label = displayQuoteLabel(item);
  const school = item.schoolName?.trim() || '';
  const students = Number(item.students || 0);
  const studentsFormatted = students.toLocaleString('en-US');
  const total = item.pricingSnapshot?.grandTotal;
  const totalText = total != null ? formatCurrency(total) : '';
  const updated = formatDate(item.updatedAt) || '';
  return [label, item.quoteName, school, String(students), studentsFormatted, totalText, updated]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export default function QuoteList({
  quotes,
  loading,
  error,
  apiConfigured,
  deletingId,
  copyingId,
  onRefresh,
  onEdit,
  onCopy,
  onRename,
  onView,
  onDelete,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameBusy, setRenameBusy] = useState(false);
  const query = searchQuery.trim().toLowerCase();
  const filteredQuotes = query
    ? quotes.filter(item => quoteSearchHaystack(item).includes(query))
    : quotes;

  function startRename(item) {
    setRenamingId(item.quoteId);
    setRenameDraft(item.quoteName?.trim() || displayQuoteLabel(item));
  }

  function cancelRename() {
    if (renameBusy) return;
    setRenamingId(null);
    setRenameDraft('');
  }

  async function commitRename(item) {
    const name = renameDraft.trim();
    if (!name || !onRename || renameBusy) return;
    setRenameBusy(true);
    try {
      await onRename(item, name);
      setRenamingId(null);
      setRenameDraft('');
    } finally {
      setRenameBusy(false);
    }
  }

  if (!apiConfigured) {
    return (
      <div className="card">
        <p className="pricing-muted">
          Set <code>VITE_API_URL</code> to load saved quotes from the API.
        </p>
      </div>
    );
  }

  return (
    <div className="card quote-list-card">
      <div className="quote-list-header">
        <div className="card-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
          Saved quotes
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="quote-list-search">
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, school, students…"
          aria-label="Search saved quotes"
        />
      </div>

      {error && <p className="pricing-error">{error}</p>}

      {!loading && !error && quotes.length === 0 && (
        <p className="pricing-muted">No saved quotes yet. Create one on the Quote form tab.</p>
      )}

      {!loading && !error && quotes.length > 0 && filteredQuotes.length === 0 && (
        <p className="pricing-muted">No quotes match your search.</p>
      )}

      {filteredQuotes.length > 0 && (
        <div className="quote-list-table-wrap">
          <table className="quote-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>School</th>
                <th>Students</th>
                <th>Updated</th>
                <th>Total</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map(item => {
                const total = item.pricingSnapshot?.grandTotal;
                const label = displayQuoteLabel(item);
                const school = item.schoolName?.trim() || '—';
                const deleting = deletingId === item.quoteId;
                const copying = copyingId === item.quoteId;
                const renaming = renamingId === item.quoteId;
                const busy = deleting || copying || renaming || renameBusy || (Boolean(renamingId) && !renaming);
                return (
                  <tr key={item.quoteId}>
                    <td>
                      {renaming ? (
                        <div className="quote-list-rename">
                          <input
                            type="text"
                            value={renameDraft}
                            onChange={e => setRenameDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitRename(item);
                              if (e.key === 'Escape') cancelRename();
                            }}
                            aria-label="Prospectus name"
                            disabled={renameBusy}
                            autoFocus
                          />
                          <div className="quote-list-rename-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={renameBusy || !renameDraft.trim()}
                              onClick={() => commitRename(item)}
                            >
                              {renameBusy ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={renameBusy}
                              onClick={cancelRename}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="quote-list-school">{label}</div>
                          <div className="quote-list-id">{item.quoteId.slice(0, 8)}…</div>
                        </>
                      )}
                    </td>
                    <td>{school}</td>
                    <td>{Number(item.students || 0).toLocaleString('en-US')}</td>
                    <td>{formatDate(item.updatedAt)}</td>
                    <td>{total != null ? formatCurrency(total) : '—'}</td>
                    <td>
                      <div className="quote-list-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={busy}
                          onClick={() => onEdit(item.quoteId)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={busy}
                          onClick={() => startRename(item)}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={busy}
                          onClick={() => onCopy(item)}
                        >
                          {copying ? 'Copying…' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busy}
                          onClick={() => onView(item.quoteId)}
                        >
                          Prospectus
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={busy}
                          onClick={() => onDelete(item)}
                        >
                          {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
