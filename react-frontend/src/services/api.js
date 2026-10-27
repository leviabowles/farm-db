import axios from 'axios';

// Base URL for the Django API.
// In production, this is baked in via REACT_APP_API_URL during build.
// For local development, we rely on the proxy (baseURL: '').
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '', 
});

// If we are in development (no REACT_APP_API_URL), Axios will use relative paths
// which setupProxy.js will then route to http://localhost:8000.

// Attach token from localStorage to every request if present.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
