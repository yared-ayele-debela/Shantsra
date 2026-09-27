/**
 * Backend API & Environment Configuration
 *
 * Configures the base API URL using Vite environment variables (VITE_API_URL).
 * For production, requests route to the specified backend domain.
 */
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
// ByetHost free hosting blocks direct browser requests with an anti-bot challenge (aes.js).
// In production, route through the same-origin Vercel proxy ('') when targeting ByetHost or left empty.
const isByethost = configuredApiUrl.includes('byethost');

export const API_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_DEV_API_URL || '')
  : (isByethost ? '' : configuredApiUrl);

/**
 * Resolves an API or endpoint path against the configured VITE_API_URL.
 * Supports absolute URLs, relative paths, and query strings.
 *
 * @param {string} path - Endpoint path (e.g. '/api/user', '/sanctum/csrf-cookie')
 * @returns {string} Fully-qualified API URL
 */
export function getApiUrl(path = '') {
  if (!path) return API_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_URL ? `${API_URL}${cleanPath}` : cleanPath;
}

/**
 * Resolves a storage asset or image path against the backend storage URL.
 *
 * @param {string} path - Storage path or URL
 * @returns {string} Fully-qualified storage URL
 */
export function getStorageUrl(path = '') {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  // Local assets, inline data URLs, or external image hosts
  if (
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('assets/') ||
    trimmed.startsWith('/favicon') ||
    trimmed.startsWith('/icons.svg') ||
    trimmed.startsWith('/No-Image-Found') ||
    trimmed.toLowerCase().includes('unsplash.com') ||
    trimmed.startsWith('photo-') ||
    /^(https?:|data:|\/\/)/i.test(trimmed)
  ) {
    return trimmed;
  }

  let cleanPath = trimmed;
  if (cleanPath.startsWith('storage/')) {
    cleanPath = `/${cleanPath}`;
  } else if (cleanPath.startsWith('shipments/') || cleanPath.startsWith('avatars/') || cleanPath.startsWith('users/')) {
    cleanPath = `/storage/${cleanPath}`;
  } else if (!cleanPath.startsWith('/')) {
    cleanPath = `/storage/${cleanPath}`;
  }

  return API_URL ? `${API_URL}${cleanPath}` : cleanPath;
}

/**
 * Reads the XSRF-TOKEN cookie set by Laravel Sanctum.
 */
export function getXsrfToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Ensures Sanctum CSRF cookie is initialized before stateful requests.
 */
export async function initializeCsrf() {
  try {
    await fetch(getApiUrl('/sanctum/csrf-cookie'), {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
  } catch (e) {
    console.warn('CSRF initialization fallback:', e.message);
  }
}

/**
 * Standard fetch wrapper pre-configured with CORS credentials and Laravel headers.
 */
export async function apiFetch(endpoint, options = {}) {
  const fullUrl = getApiUrl(endpoint);
  const xsrfToken = getXsrfToken();
  return fetch(fullUrl, {
    credentials: 'include',
    ...options,
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {})
    }
  });
}

export const api = {
  async get(url, options = {}) {
    const fullUrl = getApiUrl(url);
    const response = await fetch(fullUrl, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(`API error: ${response.status}`);
      err.response = { status: response.status, data: errData };
      throw err;
    }

    const data = await response.json();
    return { data };
  },

  async post(url, body = {}, options = {}) {
    const fullUrl = getApiUrl(url);
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const xsrfToken = getXsrfToken();
    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(fullUrl, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: isFormData ? body : JSON.stringify(body),
      ...options
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(`API error: ${response.status}`);
      err.response = { status: response.status, data: errData };
      throw err;
    }

    const data = await response.json();
    return { data };
  },

  async put(url, body = {}, options = {}) {
    const fullUrl = getApiUrl(url);
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const xsrfToken = getXsrfToken();
    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(fullUrl, {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: isFormData ? body : JSON.stringify(body),
      ...options
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(`API error: ${response.status}`);
      err.response = { status: response.status, data: errData };
      throw err;
    }

    const data = await response.json();
    return { data };
  },

  async patch(url, body = {}, options = {}) {
    const fullUrl = getApiUrl(url);
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const xsrfToken = getXsrfToken();
    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      credentials: 'include',
      headers,
      body: isFormData ? body : JSON.stringify(body),
      ...options
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(`API error: ${response.status}`);
      err.response = { status: response.status, data: errData };
      throw err;
    }

    const data = await response.json();
    return { data };
  },

  async delete(url, options = {}) {
    const fullUrl = getApiUrl(url);
    const xsrfToken = getXsrfToken();
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(`API error: ${response.status}`);
      err.response = { status: response.status, data: errData };
      throw err;
    }

    const data = await response.json();
    return { data };
  }
};

export default api;
