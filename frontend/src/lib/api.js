import { apiQuoteToForm, quoteToApiBody } from './quoteMapper.js';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function assertApiUrl() {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured');
  }
}

async function request(path, options = {}) {
  assertApiUrl();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

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
  const data = await request(`/quotes/${encodeURIComponent(id)}`);
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

export async function listQuotes({ rep } = {}) {
  const qs = rep ? `?rep=${encodeURIComponent(rep)}` : '';
  const data = await request(`/quotes${qs}`);
  if (!Array.isArray(data)) return [];
  return data.map(item => apiQuoteToForm(item));
}
