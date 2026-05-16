import axios from 'axios';

// Add interceptor to global axios to cover direct imports like in Empresa.jsx
axios.interceptors.request.use(
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

export const getBaseURL = () => {
  // 1. Prioridad: Variable de entorno explícita
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Detección por ubicación del script o URL
  const isSisconFolder = window.location.pathname.includes('/siscon-ai') || 
                         window.location.href.includes('/siscon-ai/');

  if (isSisconFolder) {
    return '/siscon-ai/api';
  }

  // 3. Fallback final (Asumimos producción si no estamos en localhost)
  if (window.location.hostname !== 'localhost') {
    return '/siscon-ai/api';
  }

  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Also add to the custom instance just in case
api.interceptors.request.use(
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

export default api;
