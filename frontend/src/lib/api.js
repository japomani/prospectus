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
  return request('/quotes', {
    method: 'POST',
    body: JSON.stringify(quote),
  });
}

export async function getQuote(id) {
  return request(`/quotes/${encodeURIComponent(id)}`);
}

export async function updateQuote(id, quote) {
  return request(`/quotes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(quote),
  });
}

export async function listQuotes() {
  return request('/quotes');
}
