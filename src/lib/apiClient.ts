import axios from "axios";
import { BACKEND_URL } from "./config";

const apiClient = axios.create({
  baseURL: BACKEND_URL,
});

// Add Authorization header to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses by redirecting to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
