import api from "./apiClient";

export const register = (payload) => api.post("/auth/register", payload).then(r => r.data);
export const login = (payload) => api.post("/auth/login", payload).then(r => r.data);
export const verifyEmail = (code) => api.get(`/auth/verify?code=${encodeURIComponent(code)}`).then(r => r.data);

export const requestPasswordReset = (email) =>
  api.post("/auth/password-reset/request", { email }).then(r => r.data);

export const confirmPasswordReset = ({ email, otp, newPassword }) =>
  api.post("/auth/password-reset/confirm", { email, otp, newPassword }).then(r => r.data);
