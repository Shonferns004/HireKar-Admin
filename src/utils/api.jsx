import axios from 'axios';
import { VITE_URL } from './constants';

export const API_BASE_URL = VITE_URL;

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
