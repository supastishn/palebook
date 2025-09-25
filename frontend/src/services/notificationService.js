import api from './api';

const notificationService = {
  list: (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export default notificationService;

