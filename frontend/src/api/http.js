import axios from "axios";

const root = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${root}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;