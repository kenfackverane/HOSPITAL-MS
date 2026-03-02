import axios from "axios";

// Use Vercel backend URL in production, localhost in dev
const root = (import.meta.env.VITE_API_URL || "https://hospital-ms-huhk.vercel.app").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${root}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;