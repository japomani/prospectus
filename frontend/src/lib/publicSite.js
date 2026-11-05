/**
 * Published customer-facing site origin.
 * The SPA may still be loaded from the legacy *.cloudfront.net hostname;
 * share / View Prospectus / copy-link URLs must use this host so customers
 * never get cloudfront.net bookmarks from the pricing UI.
 */
export const PUBLIC_SITE_ORIGIN = String(
  import.meta.env.VITE_PUBLIC_WEB_URL || 'https://prospectus.delphi-me.com',
).replace(/\/+$/, '');

/** Build an absolute URL on the published Prospectus hostname. */
export function publicSiteUrl(pathOrUrl = '/') {
  const raw = String(pathOrUrl || '/').trim();
  if (!raw) return `${PUBLIC_SITE_ORIGIN}/`;
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${PUBLIC_SITE_ORIGIN}${path}`;
}
