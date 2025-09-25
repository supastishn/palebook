const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars') + path.sep);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('friends', 'firstName lastName avatar')
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    const isOwner = req.user._id.toString() === userId;
    const isFriend = user.friends.some(friend => friend._id.toString() === req.user._id.toString());

    if (user.privacy.profile === 'private' && !isOwner) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    if (user.privacy.profile === 'friends' && !isFriend && !isOwner) {
      return res.status(403).json({ error: 'Profile is only visible to friends' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('avatar'), [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
  const allowedUpdates = ['firstName', 'lastName', 'bio', 'location', 'website', 'dateOfBirth'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.file) {
      updates.avatar = req.file.path.replace(/^.*uploads\//, '/uploads/');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Upload/update cover photo
router.put('/cover', auth, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const coverPhoto = req.file.path.replace(/^.*uploads\//, '/uploads/');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { coverPhoto },
      { new: true }
    ).select('-password');
    res.json({ coverPhoto: user.coverPhoto });
  } catch (error) {
    console.error('Update cover error:', error);
    res.status(500).json({ error: 'Server error while updating cover photo' });
  }
});

// Search users
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ],
      _id: { $ne: req.user._id }
    })
    .select('firstName lastName avatar email')
    .skip(skip)
    .limit(limit);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error while searching users' });
  }
});

// Update privacy settings
router.put('/privacy', auth, [
  body('profile').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid profile privacy setting'),
  body('posts').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid posts privacy setting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    if (req.body.profile) updates['privacy.profile'] = req.body.profile;
    if (req.body.posts) updates['privacy.posts'] = req.body.posts;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user.privacy);
  } catch (error) {
    console.error('Update privacy error:', error);
    res.status(500).json({ error: 'Server error while updating privacy settings' });
  }
});

// Block a user
router.post('/block', auth, [
  body('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { userId } = req.body;
    if (String(userId) === String(req.user._id)) return res.status(400).json({ error: 'Cannot block yourself' });
    const current = await User.findById(req.user._id);
    if (!current.blockedUsers.includes(userId)) current.blockedUsers.push(userId);
    // Remove from friends both sides
    current.friends.pull(userId);
    const other = await User.findById(userId);
    if (other) {
      other.friends.pull(req.user._id);
      await other.save();
    }
    await current.save();
    res.json({ blockedUsers: current.blockedUsers });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Server error while blocking user' });
  }
});

// Unblock a user
router.post('/unblock', auth, [
  body('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { userId } = req.body;
    const current = await User.findById(req.user._id);
    current.blockedUsers.pull(userId);
    await current.save();
    res.json({ blockedUsers: current.blockedUsers });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Server error while unblocking user' });
  }
});

// Save/bookmark a post
router.post('/saved', auth, [
  body('postId').isMongoId().withMessage('Invalid post ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { postId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.savedPosts.includes(postId)) user.savedPosts.push(postId);
    await user.save();
    res.json({ savedPosts: user.savedPosts });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ error: 'Server error while saving post' });
  }
});

// Unsave a post
router.delete('/saved/:postId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedPosts.pull(req.params.postId);
    await user.save();
    res.json({ savedPosts: user.savedPosts });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({ error: 'Server error while unsaving post' });
  }
});

// Get saved posts
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'firstName lastName avatar' }
    });
    res.json(user.savedPosts || []);
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ error: 'Server error while fetching saved posts' });
  }
});

module.exports = router;
