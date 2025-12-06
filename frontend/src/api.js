import axios from "axios";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

export default API;
