import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://vleiskraft-api.onrender.com/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired — handled by auth context
    }
    return Promise.reject(err.response?.data || err);
  }
);
