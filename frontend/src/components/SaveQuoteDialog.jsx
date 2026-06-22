export default function SaveQuoteDialog({
  open,
  draftName,
  suggestedName,
  saving,
  isUpdate,
  onDraftChange,
  onUseSuggested,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="save-quote-overlay" role="presentation" onClick={onCancel}>
      <div
        className="save-quote-dialog card"
        role="dialog"
        aria-labelledby="save-quote-title"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <div className="card-title" id="save-quote-title" style={{ marginBottom: '12px' }}>
          {isUpdate ? 'Update quote' : 'Save quote'}
        </div>
        <p className="pricing-muted" style={{ marginBottom: '12px' }}>
          Give this quote a name so you can find it later.
        </p>
        <div className="form-group">
          <label htmlFor="save-quote-name">Quote name</label>
          <input
            id="save-quote-name"
            type="text"
            value={draftName}
            onChange={e => onDraftChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && draftName.trim() && !saving) onConfirm();
            }}
            autoFocus
            placeholder="School · students · products · term"
          />
        </div>
        <div className="save-quote-suggest-row">
          <span className="pricing-muted">Suggested:</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onUseSuggested}>
            Use suggested
          </button>
          <span className="save-quote-suggested-text">{suggestedName}</span>
        </div>
        <div className="save-quote-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={saving || !draftName.trim()}
          >
            {saving ? 'Saving…' : isUpdate ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
