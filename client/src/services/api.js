import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// API_ORIGIN = the API URL without the trailing /api — used to build full
// URLs for uploaded files (resumes, avatars, logos) served from /uploads.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const fileUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_ORIGIN}${relativePath}`;
};

const getFriendlyErrorMessage = (error, fallback = 'Something went wrong') => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message;
  const message = typeof serverMessage === 'string' ? serverMessage : null;

  if (status === 401) return 'Please sign in again to continue.';
  if (status === 403 && /csrf/i.test(message || '')) return 'Your session expired. Please refresh the page and try again.';
  if (status === 400) return message || 'Please check the form details and try again.';
  if (status === 404) return 'The requested information could not be found.';
  if (status >= 500) return 'We hit a temporary server issue. Please try again in a moment.';

  return message || fallback;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hireai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hireai_token');
      localStorage.removeItem('hireai_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const friendlyMessage = getFriendlyErrorMessage(error);

    if (error.response?.data) {
      error.response.data.message = friendlyMessage;
    }

    error.userMessage = friendlyMessage;
    error.message = friendlyMessage;

    return Promise.reject(error);
  }
);

export default api;
