import axios from "axios";

const API_URL = "http://localhost:8081/api/auth"; // backend URL

export const register = async (user) => {
  const response = await axios.post(`${API_URL}/register`, user);
  return response.data;
};

export const login = async (user) => {
  const response = await axios.post(`${API_URL}/login`, user);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("email", response.data.email);
    localStorage.setItem("firstName", response.data.firstName);
  }
  return response.data;
};

export const logout = () => {
  localStorage.clear();
};
