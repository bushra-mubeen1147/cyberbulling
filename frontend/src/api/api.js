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
  getStats: () => api.get('/admin/stats'),
  getAnalytics: (days = 7) => api.get(`/admin/analytics?days=${days}`),
  getUserDetails: (userId) => api.get(`/admin/user/${userId}/details`),
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  getNotifications: () => api.get('/admin/notifications'),
  deleteNotification: (id) => api.delete(`/admin/notification/${id}`),
  changeUserRole: (userId, data) => api.patch(`/admin/user/${userId}/role`, data),
  getReports: () => api.get('/admin/reports'),
  updateTicketStatus: (ticketId, data) => api.patch(`/admin/ticket/${ticketId}/status`, data),
  deleteHistoryItem: (id) => api.delete(`/admin/history/${id}`),
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
  markAllRead: () => api.post('/alerts/mark-read'),
};

export const userAnalyticsAPI = {
  get: () => api.get('/user/analytics'),
};

export const apiKeysAPI = {
  getAll: () => api.get('/apikeys'),
  create: (data) => api.post('/apikeys', data),
  delete: (id) => api.delete(`/apikeys/${id}`),
  regenerate: (id) => api.post(`/apikeys/${id}/regenerate`),
};

export const twitterAPI = {
  analyzeUrl: (url) => api.post('/twitter/analyze', { url }),
};

export const trendsAPI = {
  getLive: (location = 'worldwide') => api.get(`/trends?location=${location}`),
  getLocations: () => api.get('/trends/locations'),
};

export const predictionAPI = {
  getForVictim: (victimId) => api.get(`/predictions/victim/${victimId}`),
};

export const victimAPI = {
  add: (data) => api.post('/victims', data),
  list: () => api.get('/victims'),
  remove: (id) => api.delete(`/victims/${id}`),
  getTweets: (id) => api.get(`/victims/${id}/tweets`),
  checkTweets: (id) => api.post(`/victims/${id}/check`),
};

export default api;
