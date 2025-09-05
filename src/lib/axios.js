import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/api',
  withCredentials: false
});

// attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → try refresh once
let refreshing = false;
let queue = [];

function flushQueue(err, token = null) {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (status === 401 && !original._retry && refreshToken) {
      if (refreshing) {
        // wait
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      refreshing = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost/api'}/auth/refresh.php`,
          { refresh_token: refreshToken }
        );
        const newToken = res.data?.access_token;
        if (!newToken) throw new Error('No new token');

        setTokens({ access: newToken, refresh: refreshToken });
        flushQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        flushQueue(e, null);
        logout();
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;