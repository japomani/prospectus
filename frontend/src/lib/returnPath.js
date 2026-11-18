/**
 * Allow only same-origin relative paths for post-login redirects.
 * Rejects protocol-relative and open-redirect style values.
 */
export function safeReturnPath(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}
