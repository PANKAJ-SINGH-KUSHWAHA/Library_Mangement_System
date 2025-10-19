import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

// attach token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// simple response interceptor to handle 401 and show messages if you want
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      // clear storage and reload to force login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // we don't redirect here because components may handle it
    }
    return Promise.reject(err);
  }
);

export default api;
