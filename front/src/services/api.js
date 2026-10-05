const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    credentials: 'include',
    ...options,
    headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  // If unauthorized on protected routes, trigger session expiry event
  if (response.status === 401) {
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
      window.dispatchEvent(new Event('clinicflow:session-expired'));
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      (data?.error?.details ? data.error.details.map((d) => d.message).join(', ') : null) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
