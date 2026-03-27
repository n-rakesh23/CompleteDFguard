/**
 * lib/api.js
 * ──────────
 * Axios instance pre-configured for the DFGuard backend.
 *
 * - Automatically attaches JWT ID token to every request
 * - Retries once with a refreshed token on 401
 * - Normalizes error messages for clean UI display
 */

import axios              from 'axios';
import { getIdToken, refreshSession } from './cognito';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Request interceptor: attach JWT ─────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Not authenticated — request goes without token
      // Backend will return 401 if route requires auth
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle errors globally ─────────────
let isRefreshing  = false;
let refreshQueue  = [];

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;
    const status   = error.response?.status;
    const message  = error.response?.data?.error || error.message;

    // ── 401: Try refresh once, then redirect to login ────────
    if (status === 401 && !original._retried) {
      original._retried = true;

      if (isRefreshing) {
        // Queue other requests while refreshing
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshSession();
        isRefreshing   = false;

        // Retry all queued requests with new token
        refreshQueue.forEach(cb => cb.resolve(newToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch {
        isRefreshing = false;
        refreshQueue.forEach(cb => cb.reject(new Error('Session expired')));
        refreshQueue = [];

        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    // ── 402: Payment required / insufficient credits ─────────
    if (status === 402) {
      window.location.href = '/pricing';
    }

    // ── 429: Rate limited ────────────────────────────────────
    if (status === 429) {
      const err     = new Error('Too many requests. Please slow down.');
      err.status    = 429;
      return Promise.reject(err);
    }

    // ── 500+: Server error ───────────────────────────────────
    if (status >= 500) {
      const err  = new Error('Server error. Please try again shortly.');
      err.status = status;
      return Promise.reject(err);
    }

    // ── Default: pass clean error up ─────────────────────────
    const cleanErr  = new Error(message || 'Request failed.');
    cleanErr.status = status;
    return Promise.reject(cleanErr);
  }
);

// ── Convenience methods ──────────────────────────────────────

/** GET /api/auth/me */
export const getMe = () => api.get('/api/auth/me');

/** GET /api/credits */
export const getCredits = () => api.get('/api/credits');

/** GET /api/jobs */
export const getJobs = (page = 1) => api.get(`/api/jobs?page=${page}`);

/** GET /api/jobs/:id */
export const getJob = (id) => api.get(`/api/jobs/${id}`);

/** POST /api/jobs/upload */
export const requestUploadUrl = () => api.post('/api/jobs/upload');

/** POST /api/jobs/:id/confirm */
export const confirmUpload = (id) => api.post(`/api/jobs/${id}/confirm`);

/** DELETE /api/jobs/:id */
export const deleteJob = (id) => api.delete(`/api/jobs/${id}`);

/** POST /api/payments/create-order */
export const createPaymentOrder = () => api.post('/api/payments/create-order');

/** POST /api/payments/verify */
export const verifyPayment = (data) => api.post('/api/payments/verify', data);

/** GET /api/payments/history */
export const getPaymentHistory = () => api.get('/api/payments/history');

/** PUT /api/auth/profile */
export const updateProfile = (data) => api.put('/api/auth/profile', data);

/** POST /api/jobs/:id/retry */
export const retryJob = (id) => api.post(`/api/jobs/${id}/retry`);

export default api;
