import api from './api';

const userService = {
  getProfile: (userId) => {
    if (!userId) {
      return api.get('/auth/me');
    }
    return api.get(`/users/${userId}`);
  },

  updateProfile: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  search: (query, page = 1, limit = 10) => {
    return api.get(`/users/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
  },

  savePost: (postId) => api.post('/users/saved', { postId }),
  unsavePost: (postId) => api.delete(`/users/saved/${postId}`),
  getSaved: () => api.get('/users/saved'),
};

export default userService;
