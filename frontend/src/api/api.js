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
  updateProfile: (data) => api.post('/profile/update', data),
  updatePassword: (data) => api.post('/password/update', data),
};

export const analysisAPI = {
  analyze: (text) => api.post('/analyze', { text }),
};

export const historyAPI = {
  add: (data) => api.post('/history/add', data),
  getByUserId: (userId) => api.get(`/history/${userId}`),
  delete: (historyId) => api.delete(`/history/delete/${historyId}`),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getHistory: () => api.get('/admin/history'),
  deleteUser: (userId) => api.delete(`/admin/user/${userId}`),
};

export const activityAPI = {
  getActivities: (userId) => api.get(`/activity/${userId}`),
  logActivity: (data) => api.post('/activity/log', data),
};

export const settingsAPI = {
  save: (data) => api.post('/settings/save', data),
  get: () => api.get('/settings/get'),
};

export const contactAPI = {
  sendMessage: (data) => api.post('/contact/send', data),
  createSupportTicket: (data) => api.post('/contact/support/ticket', data),
};

export const alertsAPI = {
  getByUserId: (userId) => api.get(`/alerts/${userId}`),
};

export const apiKeysAPI = {
  getAll: () => api.get('/apikeys'),
  create: (data) => api.post('/apikeys', data),
  delete: (id) => api.delete(`/apikeys/${id}`),
  regenerate: (id) => api.post(`/apikeys/${id}/regenerate`),
};

export default api;
