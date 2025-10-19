import api from './api'

export async function login(email, password) {
  const resp = await api.post('/auth/login', { email, password });
  const data = resp.data;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({ email: data.email, roles: data.roles }));
  return data;
}

export async function register(payload) {
  const resp = await api.post('/auth/register', payload);
  const data = resp.data;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({ email: data.email, roles: data.roles }));
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}