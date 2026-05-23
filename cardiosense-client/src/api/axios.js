import axios from "axios";

// Base axios instance — all API calls go through this
const api = axios.create({
  baseURL: "http://localhost:5144/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token automatically if it exists
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("cardiosense_auth");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth and let the app redirect via protected routes
      localStorage.removeItem("cardiosense_auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
