/** Prospectus date format: Jun 20, '26 */
export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  return `${month} ${day}, '${yy}`;
}
