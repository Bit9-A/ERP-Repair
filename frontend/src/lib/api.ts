import axios from "axios";
import { useAuthStore } from "../features/auth/store/auth.store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// -- Request interceptor: attach JWT --
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// -- Response interceptor: handle 401 --
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state from Zustand store and localStorage
      useAuthStore.getState().logout();
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
