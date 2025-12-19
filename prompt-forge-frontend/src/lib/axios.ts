import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Ensure this matches your backend URL
});

// Automatically add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
