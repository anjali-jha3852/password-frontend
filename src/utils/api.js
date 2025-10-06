// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://password-backend-j5ol.onrender.com",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
