import axios from 'axios';
    
const baseURL = 'http://172.20.10.5:8080';

const api = axios.create({
  baseURL: baseURL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nextgen_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;