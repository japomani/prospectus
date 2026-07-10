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

/** "August 2026" or "2026-08" → "2026-08" for <input type="month"> */
export function toMonthInputValue(text) {
  if (!text || typeof text !== 'string') return '';
  const iso = text.trim().match(/^(\d{4})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}`;

  const named = text.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!named) return '';
  const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === named[1].toLowerCase());
  if (idx < 0) return '';
  return `${named[2]}-${String(idx + 1).padStart(2, '0')}`;
}

/** "2026-08" → "August 2026" for prospectus display */
export function fromMonthInputValue(ym) {
  if (!ym || typeof ym !== 'string') return '';
  const match = ym.trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) return '';
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return '';
  return `${MONTH_NAMES[monthIndex]} ${match[1]}`;
}
