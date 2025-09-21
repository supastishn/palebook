import api from './api';

const postService = {
  createPost: (postData) => {
    const formData = new FormData();
    formData.append('content', postData.content);
    formData.append('privacy', postData.privacy);

    if (postData.location) {
      formData.append('location', postData.location);
    }

    if (postData.tags) {
      formData.append('tags', postData.tags.join(','));
    }

    if (postData.images) {
      postData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getFeed: (page = 1, limit = 10) => {
    return api.get(`/posts/feed?page=${page}&limit=${limit}`);
  },

  getUserPosts: (userId, page = 1, limit = 10) => {
    return api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  },

  likePost: (postId) => {
    return api.post(`/posts/${postId}/like`);
  },

  addComment: (postId, content) => {
    return api.post(`/posts/${postId}/comment`, { content });
  },

  deletePost: (postId) => {
    return api.delete(`/posts/${postId}`);
  },
};

export default postService;