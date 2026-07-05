import axios from 'axios';
import { useAuthStore } from '../features/auth/authSlice';

const API_URL = 'http://localhost:5000/api';

export const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter automatiquement le token depuis le store
apiService.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour gérer les erreurs globalement
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
