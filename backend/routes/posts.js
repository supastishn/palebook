const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create post
router.post('/', auth, upload.array('images', 5), [
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content must be 1-10000 characters'),
  body('privacy').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid privacy setting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, privacy = 'friends', location, tags } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    const post = new Post({
      author: req.user._id,
      content,
      images,
      privacy,
      location,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await post.save();
    await post.populate('author', 'firstName lastName avatar');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error while creating post' });
  }
});

// Get feed posts
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const friendIds = user.friends;
    friendIds.push(req.user._id); // Include user's own posts

    const posts = await Post.find({
      $or: [
        { author: { $in: friendIds }, privacy: { $in: ['public', 'friends'] } },
        { privacy: 'public' }
      ]
    })
    .populate('author', 'firstName lastName avatar')
    .populate('comments.user', 'firstName lastName avatar')
    .populate('likes.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error while fetching feed' });
  }
});

// Get user posts
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    const isOwner = req.user._id.toString() === userId;
    const isFriend = user.friends.includes(req.user._id);

    let privacyFilter = [];
    if (isOwner) {
      privacyFilter = ['public', 'friends', 'private'];
    } else if (isFriend) {
      privacyFilter = ['public', 'friends'];
    } else {
      privacyFilter = ['public'];
    }

    const posts = await Post.find({
      author: userId,
      privacy: { $in: privacyFilter }
    })
    .populate('author', 'firstName lastName avatar')
    .populate('comments.user', 'firstName lastName avatar')
    .populate('likes.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error while fetching user posts' });
  }
});

// Like/unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(like =>
      like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    await post.populate('likes.user', 'firstName lastName');

    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error while liking post' });
  }
});

// Add comment
router.post('/:postId/comment', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'firstName lastName avatar');

    res.json({ comments: post.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error while adding comment' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error while deleting post' });
  }
});

module.exports = router;