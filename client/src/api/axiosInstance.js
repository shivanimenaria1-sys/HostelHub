import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

// Request Interceptor: Auto-attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local authentication cache
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Notify user
      toast.error('Session expired. Please log in again.');

      // Perform full redirect to Login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
