import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  feed: [],
  userPosts: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFeedPosts: (state, action) => {
      state.feed = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFeedPosts: (state, action) => {
      state.feed.push(...action.payload);
      state.loading = false;
    },
    setUserPosts: (state, action) => {
      state.userPosts = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPost: (state, action) => {
      state.feed.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;

      // Update in feed
      const feedIndex = state.feed.findIndex(post => post._id === postId);
      if (feedIndex !== -1) {
        state.feed[feedIndex] = { ...state.feed[feedIndex], ...updates };
      }

      // Update in user posts
      const userIndex = state.userPosts.findIndex(post => post._id === postId);
      if (userIndex !== -1) {
        state.userPosts[userIndex] = { ...state.userPosts[userIndex], ...updates };
      }
    },
    removePost: (state, action) => {
      const postId = action.payload;
      state.feed = state.feed.filter(post => post._id !== postId);
      state.userPosts = state.userPosts.filter(post => post._id !== postId);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    incrementPage: (state) => {
      state.page += 1;
    },
    resetPage: (state) => {
      state.page = 1;
      state.hasMore = true;
    },
    clearPosts: (state) => {
      state.feed = [];
      state.userPosts = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
});

export const {
  setFeedPosts,
  addFeedPosts,
  setUserPosts,
  addPost,
  updatePost,
  removePost,
  setLoading,
  setError,
  setHasMore,
  incrementPage,
  resetPage,
  clearPosts,
} = postSlice.actions;

export default postSlice.reducer;