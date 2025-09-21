import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  friends: [],
  friendRequests: [],
  loading: false,
  error: null,
};

const friendSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setFriends: (state, action) => {
      state.friends = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFriendRequests: (state, action) => {
      state.friendRequests = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFriend: (state, action) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action) => {
      state.friends = state.friends.filter(friend => friend._id !== action.payload);
    },
    addFriendRequest: (state, action) => {
      state.friendRequests.push(action.payload);
    },
    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        request => request.from._id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearFriends: (state) => {
      state.friends = [];
      state.friendRequests = [];
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setFriends,
  setFriendRequests,
  addFriend,
  removeFriend,
  addFriendRequest,
  removeFriendRequest,
  setLoading,
  setError,
  clearFriends,
} = friendSlice.actions;

export default friendSlice.reducer;