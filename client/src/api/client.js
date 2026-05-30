const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('3bite_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('3bite_token', token);
  else localStorage.removeItem('3bite_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) =>
    request('/user/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  getProduct: (barcode) => request(`/products/barcode/${encodeURIComponent(barcode)}`),
};
