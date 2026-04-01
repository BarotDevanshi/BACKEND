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
  console.log("[API INTERCEPTOR] Token check:", token ? "Token found" : "No token found");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[API INTERCEPTOR] ✅ Authorization header SET:", config.headers.Authorization.substring(0, 20) + "...");
  } else {
    console.error("[API INTERCEPTOR] ❌ NO TOKEN FOUND - Request will fail!");
  }
  console.log("[API DEBUG] Request URL:", config.url);
  console.log("[API DEBUG] Full config headers:", config.headers);
  return config;
});

// Detect 401 Unauthorized and logout
API.interceptors.response.use(
  (response) => {
    console.log("[API SUCCESS]", response.config.url, "Status:", response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("[API ERROR]", error.config?.url, "Status:", error.response.status, "Message:", error.response.data);
      if (error.response.status === 401) {
        console.error("[AUTH FAILED] 401 - Logging out user");
        localStorage.removeItem('neuro_token');
        localStorage.removeItem('nn-displayName');
        window.location.href = '/login';
      }
    } else {
      console.error("[API CONNECTION ERROR]", error.message);
    }
    return Promise.reject(error);
  }
);

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
export const getRecommendation = (data) => API.post('/activity/recommend', data);

// Notifications
export const subscribeNotifications = (data) => API.post('/notifications/subscribe', data);
export const triggerUserNotification = (data) => API.post('/notifications/notify-user', data);

// Progress
export const getProgress = () => API.get('/progress');

export const logAppOpen = () => API.post('/progress/app-open');

export default API;
