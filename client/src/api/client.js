const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 15000;

function getToken() {
  return localStorage.getItem('3bite_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('3bite_token', token);
  else localStorage.removeItem('3bite_token');
}

/** Full URL for logging (dev proxy resolves /api → :3001). */
export function getApiUrl(path) {
  const relative = `${API_BASE}${path}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${relative}`;
  }
  return relative;
}

function normalizeFetchError(err) {
  if (err?.name === 'AbortError') {
    return new Error('Could not connect to server.');
  }
  if (err instanceof TypeError) {
    return new Error('Could not connect to server.');
  }
  return err;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    throw normalizeFetchError(err);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) =>
    request('/user/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAccount: () => request('/user/account', { method: 'DELETE' }),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  getProduct: (barcode) => request(`/products/barcode/${encodeURIComponent(barcode)}`),
};

export { API_BASE, REQUEST_TIMEOUT_MS };
