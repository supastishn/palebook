const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: if this is a page post
  page: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
  // Optional: if this is a group post
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  images: [{
    type: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true, maxlength: 1000 },
      createdAt: { type: Date, default: Date.now },
      likes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }]
    }]
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'friends'
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  location: {
    type: String,
    maxlength: 100
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ 'comments.user': 1 });

module.exports = mongoose.model('Post', postSchema);
