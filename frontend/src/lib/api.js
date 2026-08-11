export const api = {
  async get(url) {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
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

  async post(url, body = {}) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(body)
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
