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
  // En producción, forzamos la ruta absoluta para saltarnos interferencias de WordPress
  if (window.location.hostname !== 'localhost') {
    return 'https://altamarmkt.cl/siscon-ai/api';
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
