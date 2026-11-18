/** Prospectus date format: Jun 20, '26 */
export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  return `${month} ${day}, '${yy}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthIndexFromName(name) {
  return MONTH_NAMES.findIndex(m => m.toLowerCase() === name.toLowerCase());
}

/**
 * Display / ISO go-live text → "YYYY-MM-DD" for <input type="date">.
 * Accepts full dates ("August 15, 2026", "2026-08-15") and legacy month-only
 * values ("August 2026", "2026-08"), which map to the 1st of that month.
 */
export function toDateInputValue(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();

  const isoFull = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoFull) return `${isoFull[1]}-${isoFull[2]}-${isoFull[3]}`;

  const isoMonth = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) return `${isoMonth[1]}-${isoMonth[2]}-01`;

  const namedFull = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (namedFull) {
    const idx = monthIndexFromName(namedFull[1]);
    if (idx < 0) return '';
    const day = String(Number(namedFull[2])).padStart(2, '0');
    return `${namedFull[3]}-${String(idx + 1).padStart(2, '0')}-${day}`;
  }

  const namedMonth = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!namedMonth) return '';
  const idx = monthIndexFromName(namedMonth[1]);
  if (idx < 0) return '';
  return `${namedMonth[2]}-${String(idx + 1).padStart(2, '0')}-01`;
}

/** "2026-08-15" → "August 15, 2026" for quote storage / date picker round-trip */
export function fromDateInputValue(ymd) {
  if (!ymd || typeof ymd !== 'string') return '';
  const match = ymd.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (monthIndex < 0 || monthIndex > 11) return '';
  if (day < 1 || day > 31) return '';
  return `${MONTH_NAMES[monthIndex]} ${day}, ${match[1]}`;
}

/** Today + 30 days as "Month D, YYYY" for pricing hold-until default */
export function defaultValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return fromDateInputValue(ymd);
}

/**
 * Stored go-live text → cover/display format "MMM D, 'YY" (e.g. Aug 15, '26).
 * Accepts full dates and legacy month-only values (maps to the 1st).
 * Non-date fallbacks like "Next term" pass through unchanged.
 */
export function formatGoLiveDisplay(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const ymd = toDateInputValue(trimmed);
  if (!ymd) return trimmed;

  const [y, m, d] = ymd.split('-').map(Number);
  return formatDate(new Date(y, m - 1, d));
}
