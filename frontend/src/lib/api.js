import { apiQuoteToForm, quoteToApiBody } from './quoteMapper.js';
import { clearApiPassword, getApiPassword, setIsAdmin } from './auth.js';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function assertApiUrl() {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured');
  }
}

async function request(path, options = {}) {
  assertApiUrl();
  const password = getApiPassword();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(password ? { Authorization: `Bearer ${password}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    const hadPassword = Boolean(password);
    if (!options.skipAuthRedirect) {
      clearApiPassword();
      // Avoid reload loops on public prospectus links that call the API without a session.
      if (hadPassword) {
        const here = `${window.location.pathname}${window.location.search}`;
        const next = here.startsWith('/') && !here.startsWith('//')
          ? `?next=${encodeURIComponent(here)}`
          : '';
        window.location.assign(`/pricing${next}`);
      }
    }
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      else if (body?.message) message = body.message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function isApiConfigured() {
  return Boolean(API_URL);
}

export async function createQuote(quote) {
  const data = await request('/quotes', {
    method: 'POST',
    body: JSON.stringify(quoteToApiBody(quote)),
  });
  if (!data?.quote?.quoteId) {
    throw new Error('Save succeeded but no quote ID was returned');
  }
  return apiQuoteToForm(data);
}

export async function getQuote(id) {
  // Public read — do not clear session / bounce to login on 401 (shareable customer links).
  const data = await request(`/quotes/${encodeURIComponent(id)}`, { skipAuthRedirect: true });
  return apiQuoteToForm(data);
}

export async function updateQuote(id, quote) {
  const data = await request(`/quotes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(quoteToApiBody(quote)),
  });
  if (!data?.quote?.quoteId) {
    throw new Error('Update succeeded but no quote ID was returned');
  }
  return apiQuoteToForm(data);
}

export async function deleteQuote(id) {
  await request(`/quotes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listQuotes({ rep } = {}) {
  const qs = rep ? `?rep=${encodeURIComponent(rep)}` : '';
  const data = await request(`/quotes${qs}`);
  if (!Array.isArray(data)) return [];
  return data.map(item => apiQuoteToForm(item));
}

export async function searchHubspotCompanies(query) {
  const q = (query || '').trim();
  if (!q) return [];
  const data = await request(`/hubspot/companies?q=${encodeURIComponent(q)}`);
  return Array.isArray(data?.results) ? data.results : [];
}

export async function getHubspotCompany(id) {
  if (!id) return null;
  return request(`/hubspot/companies/${encodeURIComponent(id)}`);
}

/** Verify password against API and detect admin session. */
export async function verifySession() {
  const data = await request('/auth/session', { skipAuthRedirect: true });
  const admin = Boolean(data?.admin);
  setIsAdmin(admin);
  return { ok: true, admin };
}

export async function getConfig() {
  return request('/config');
}

export async function putConfig(config) {
  return request('/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}
