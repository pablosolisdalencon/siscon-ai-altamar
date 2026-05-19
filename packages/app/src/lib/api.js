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
  // En producción, usamos la URL absoluta configurada para evitar interferencias
  if (window.location.hostname !== 'localhost') {
    return 'https://altamarmkt.cl/siscon-ai/api/';
  }
  return import.meta.env.VITE_API_URL || '/api';
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

// Global response interceptor for handling token expiration (401/403)
const handleAuthError = (error) => {
  const status = error.response ? error.response.status : null;
  const responseData = error.response ? error.response.data : null;
  
  console.warn(`[SISCON-AI] Auth Error Status: ${status}, Response:`, responseData);
  
  if ((status === 401 || status === 403) && !window.location.pathname.includes('/login')) {
    console.warn('[SISCON-AI] Session expired or unauthorized request. Redirecting to login...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('id_agente');
    
    const basePath = window.location.pathname.startsWith('/siscon-ai') ? '/siscon-ai' : '';
    window.location.href = `${window.location.origin}${basePath}/login`;
  }
  return Promise.reject(error);
};

axios.interceptors.response.use(
  (response) => response,
  (error) => handleAuthError(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => handleAuthError(error)
);

export default api;
