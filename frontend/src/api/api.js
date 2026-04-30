import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/signup', data),
  login: (data) => api.post('/login', data),
  getUser: () => api.get('/user'),
};

export const analysisAPI = {
  analyze: (text) => api.post('/analyze', { text }),
};

export const historyAPI = {
  add: (data) => api.post('/history/add', data),
  getByUserId: (userId) => api.get(`/history/${userId}`),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getHistory: () => api.get('/admin/history'),
  deleteUser: (userId) => api.delete(`/admin/user/${userId}`),
};

export default api;
