import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Attach access token to every outgoing request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401, try to refresh once, then retry the original request
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't try to refresh these — they ARE the auth flow
    const skip =
      original?.url?.includes("/auth/refresh/") ||
      original?.url?.includes("/auth/login/") ||
      original?.url?.includes("/auth/register/") ||
      original?.url?.includes("/auth/logout/");

    if (error.response?.status !== 401 || skip || original._retried) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      // De-dupe concurrent refreshes
      if (!refreshPromise) {
        refreshPromise = api
          .post("/auth/refresh/")
          .then((res) => {
            setAccessToken(res.data.access);
            return res.data.access;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      setAccessToken(null);
      return Promise.reject(refreshErr);
    }
  }
);