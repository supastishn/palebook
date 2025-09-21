import api from './api';

const authService = {
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  verifyToken: () => {
    return api.get('/auth/verify');
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  },
};

export default authService;