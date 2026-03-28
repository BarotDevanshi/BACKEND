import axios from 'axios';

// Ensure VITE_API_URL is correctly formatted (no trailing slash)
const getBaseURL = () => {
  const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('neuro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// Moods
export const saveMood = (data) => API.post('/moods', data);
export const getMoods = () => API.get('/moods');
export const deleteMood = (id) => API.delete(`/moods/${id}`);

// Tasks
export const addTask = (data) => API.post('/tasks', data);
export const getTasks = () => API.get('/tasks');
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Sleep
export const saveSleep = (data) => API.post('/sleep', data);
export const getSleep = () => API.get('/sleep');
export const updateSleep = (id, data) => API.put(`/sleep/${id}`, data);
export const deleteSleep = (id) => API.delete(`/sleep/${id}`);

// Activity / Chat
export const sendChat = (data) => API.post('/activity/chat', data);
export const getChatHistory = () => API.get('/activity/chat');
export const getRecommendation = () => API.post('/activity/recommend');

// Progress
export const getProgress = () => API.get('/progress');

export const logAppOpen = () => API.post('/progress/app-open');

export default API;
