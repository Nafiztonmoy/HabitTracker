import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5212/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
 google: (data) =>
  api.post('/auth/google', data, {
    headers: {
      "X-Requested-With": "XmlHttpRequest",
    },
  }),
  facebook: (data) => api.post('/auth/facebook', data)
};

export const habitsAPI = {
  getAll: () => api.get('/habits'),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  getWeeklyProgress: () => api.get('/habits/weekly-progress'),
  getImpactSummary: () => api.get('/habits/impact-summary')
};

export const logsAPI = {
  toggle: (data) => api.post('/logs', data),
  getByHabit: (habitId) => api.get(`/logs/${habitId}`)
};

export const aiAPI = {
  status: () => api.get('/ai/status'),
  suggestHabit: (data) => api.post('/ai/smart-habit', data),
  weeklyReview: () => api.post('/ai/weekly-review')
};

