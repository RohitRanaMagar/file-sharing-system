import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {},
  withCredentials: true,
});

let csrfToken = null;
let csrfTokenPromise = null;

function fetchCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = client
      .get('/csrf-token', { skipAuth: true })
      .then((res) => {
        csrfToken = res.data.csrfToken;
        return csrfToken;
      })
      .catch(() => {
        csrfTokenPromise = null;
        return null;
      });
  }
  return csrfTokenPromise;
}

fetchCsrfToken();

client.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('easyshare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (
    !csrfToken &&
    !['get', 'head', 'options'].includes(config.method?.toLowerCase()) &&
    !config.skipAuth
  ) {
    await fetchCsrfToken();
  }
  if (
    csrfToken &&
    !['get', 'head', 'options'].includes(config.method?.toLowerCase()) &&
    !config.skipAuth
  ) {
    config.headers['CSRF-Token'] = csrfToken;
  }
  return config;
});

let isRetrying = false;

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 403 && err.response?.data?.message === 'CSRF token missing' && !isRetrying && !originalRequest.skipAuth) {
      isRetrying = true;
      try {
        await fetchCsrfToken();
        if (csrfToken) {
          originalRequest.headers['CSRF-Token'] = csrfToken;
          return client(originalRequest);
        }
      } finally {
        isRetrying = false;
      }
    }
    if (err.response?.status === 401) {
      localStorage.removeItem('easyshare_token');
      localStorage.removeItem('easyshare_user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  },
);

export { fetchCsrfToken };
export default client;