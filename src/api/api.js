import axios from "axios";

const BASEURL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL:BASEURL
})
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 401) &&
      error.config &&
      error.config.url &&
      !error.config.url.includes("auth/")
    ) {
      // Clear token and userData
      localStorage.removeItem("userData");
      localStorage.setItem("token", "null");
      
      // Store session expiration flag to display toast on login page
      localStorage.setItem("session_expired_toast", "true");
      
      // Redirect immediately to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Checked all changes
