const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'posts') + path.sep);
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
  body('privacy').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid privacy setting'),
  body('pageId').optional().isMongoId(),
  body('groupId').optional().isMongoId(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, privacy = 'friends', location, tags, pageId, groupId } = req.body;
    const images = req.files ? req.files.map(file => file.path.replace(/^.*uploads\//, '/uploads/')) : [];

    const post = new Post({
      author: req.user._id,
      content,
      images,
      privacy,
      location,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    // Optional scoping to page/group if permitted
    if (pageId) {
      const Page = require('../models/Page');
      const page = await Page.findById(pageId);
      if (!page) return res.status(404).json({ error: 'Page not found' });
      const isAdmin = (page.admins || []).some(a => String(a) === String(req.user._id));
      if (!isAdmin) return res.status(403).json({ error: 'Not allowed to post as this page' });
      post.page = pageId;
    }
    if (groupId) {
      const Group = require('../models/Group');
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      const isMember = (group.members || []).some(m => String(m) === String(req.user._id));
      if (!isMember) return res.status(403).json({ error: 'Not a member of this group' });
      post.group = groupId;
    }

    await post.save();
    await post.populate('author', 'firstName lastName avatar');

    // persist + emit notification to friends (basic fanout)
    try {
      const io = req.app.get('io');
      const author = await User.findById(req.user._id).select('friends');
      const friendIds = (author?.friends || []).map(id => String(id));
      if (friendIds.length) {
        const docs = friendIds.map(fid => ({
          recipient: fid,
          actor: req.user._id,
          type: 'post:create',
          post: post._id,
        }));
        await Notification.insertMany(docs, { ordered: false }).catch(() => {});
      }
      if (io) friendIds.forEach(fid => io.to(fid).emit('notification', {
        type: 'post:create',
        actorId: String(req.user._id),
        postId: String(post._id),
        createdAt: new Date().toISOString()
      }));
    } catch (_) {}

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
    const friendIds = [...user.friends];
    friendIds.push(req.user._id); // Include user's own posts

    // Exclude content from or involving blocked users
    const current = await User.findById(req.user._id);
    const blocked = (current?.blockedUsers || []).map(String);

    const posts = await Post.find({
      $or: [
        { author: { $in: friendIds }, privacy: { $in: ['public', 'friends'] } },
        { privacy: 'public' }
      ],
      author: { $nin: blocked }
    })
    .populate('author', 'firstName lastName avatar')
    .populate('comments.user', 'firstName lastName avatar')
    .populate('likes.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Filter out comments by blocked users
    const sanitized = posts.map(p => {
      const copy = p.toJSON();
      copy.comments = (copy.comments || []).filter(c => !blocked.includes(String(c.user?._id || c.user)));
      return copy;
    });

    res.json(sanitized);
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

// Like/unlike post (legacy like)
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

    // notify author if not self-like
    try {
      const io = req.app.get('io');
      if (io && String(post.author) !== String(req.user._id)) {
        io.to(String(post.author)).emit('notification', {
          type: 'post:like',
          actorId: String(req.user._id),
          postId: String(post._id),
          createdAt: new Date().toISOString()
        });
      }
      if (String(post.author) !== String(req.user._id) && likeIndex === -1) {
        await Notification.create({
          recipient: post.author,
          actor: req.user._id,
          type: 'post:like',
          post: post._id,
        }).catch(() => {});
      }
    } catch (_) {}

    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error while liking post' });
  }
});

// React to a post with a specific reaction type
router.post('/:postId/react', auth, [
  body('type').optional().isIn(['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry']).withMessage('Invalid reaction type')
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

    const reactionType = req.body.type || 'like';
    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user._id.toString());

    if (likeIndex > -1) {
      // Switch or remove if same
      if (post.likes[likeIndex].type === reactionType) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes[likeIndex].type = reactionType;
        post.likes[likeIndex].createdAt = new Date();
      }
    } else {
      post.likes.push({ user: req.user._id, type: reactionType });
    }

    await post.save();
    await post.populate('likes.user', 'firstName lastName');

    // notify author if not self
    try {
      const io = req.app.get('io');
      if (io && String(post.author) !== String(req.user._id)) {
        io.to(String(post.author)).emit('notification', {
          type: 'post:react',
          actorId: String(req.user._id),
          postId: String(post._id),
          reaction: reactionType,
          createdAt: new Date().toISOString()
        });
      }
      if (String(post.author) !== String(req.user._id)) {
        await Notification.create({
          recipient: post.author,
          actor: req.user._id,
          type: 'post:react',
          post: post._id,
        }).catch(() => {});
      }
    } catch (_) {}

    res.json({ likes: post.likes });
  } catch (error) {
    console.error('React post error:', error);
    res.status(500).json({ error: 'Server error while reacting to post' });
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

    // notify author if not self-comment
    try {
      const io = req.app.get('io');
      if (io && String(post.author) !== String(req.user._id)) {
        io.to(String(post.author)).emit('notification', {
          type: 'post:comment',
          actorId: String(req.user._id),
          postId: String(post._id),
          comment: req.body.content,
          createdAt: new Date().toISOString()
        });
      }
      if (String(post.author) !== String(req.user._id)) {
        await Notification.create({
          recipient: post.author,
          actor: req.user._id,
          type: 'post:comment',
          post: post._id,
        }).catch(() => {});
      }
    } catch (_) {}

    res.json({ comments: post.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error while adding comment' });
  }
});

// Like or unlike a comment
router.post('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const likeIndex = (comment.likes || []).findIndex(l => String(l.user) === String(req.user._id));
    if (likeIndex > -1) comment.likes.splice(likeIndex, 1);
    else comment.likes.push({ user: req.user._id });

    await post.save();
    res.json({ commentId: req.params.commentId, likes: comment.likes });
    // notify comment owner
    try {
      if (String(comment.user) !== String(req.user._id)) {
        await Notification.create({
          recipient: comment.user,
          actor: req.user._id,
          type: 'comment:like',
          post: post._id,
          commentId: String(comment._id),
        }).catch(() => {});
      }
    } catch (_) {}
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Server error while liking comment' });
  }
});

// Reply to a comment
router.post('/:postId/comments/:commentId/reply', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Reply must be 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reply = { user: req.user._id, content: req.body.content };
    comment.replies.push(reply);
    await post.save();
    res.status(201).json({ commentId: comment._id, replies: comment.replies });
    try {
      if (String(comment.user) !== String(req.user._id)) {
        await Notification.create({
          recipient: comment.user,
          actor: req.user._id,
          type: 'reply:create',
          post: post._id,
          commentId: String(comment._id),
        }).catch(() => {});
      }
    } catch (_) {}
  } catch (error) {
    console.error('Reply comment error:', error);
    res.status(500).json({ error: 'Server error while replying to comment' });
  }
});

// Like or unlike a reply
router.post('/:postId/comments/:commentId/replies/:replyId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    const likeIndex = (reply.likes || []).findIndex(l => String(l.user) === String(req.user._id));
    if (likeIndex > -1) reply.likes.splice(likeIndex, 1);
    else reply.likes.push({ user: req.user._id });

    await post.save();
    res.json({ replyId: req.params.replyId, likes: reply.likes });
    try {
      if (String(reply.user) !== String(req.user._id)) {
        await Notification.create({
          recipient: reply.user,
          actor: req.user._id,
          type: 'reply:like',
          post: post._id,
          commentId: String(comment._id),
          replyId: String(reply._id),
        }).catch(() => {});
      }
    } catch (_) {}
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ error: 'Server error while liking reply' });
  }
});

// Share a post (create a new post referencing original)
router.post('/:postId/share', auth, async (req, res) => {
  try {
    const original = await Post.findById(req.params.postId);
    if (!original) return res.status(404).json({ error: 'Original post not found' });

    const sharePost = new Post({
      author: req.user._id,
      content: req.body.content || '',
      images: [],
      originalPost: original._id,
      privacy: req.body.privacy || 'friends'
    });

    await sharePost.save();
    original.shares.push({ user: req.user._id });
    await original.save();
    await sharePost.populate('author', 'firstName lastName avatar');

    try {
      const io = req.app.get('io');
      if (io && String(original.author) !== String(req.user._id)) {
        io.to(String(original.author)).emit('notification', {
          type: 'post:share',
          actorId: String(req.user._id),
          postId: String(original._id),
          createdAt: new Date().toISOString()
        });
      }
      if (String(original.author) !== String(req.user._id)) {
        await Notification.create({
          recipient: original.author,
          actor: req.user._id,
          type: 'post:share',
          post: original._id,
        }).catch(() => {});
      }
    } catch (_) {}

    res.status(201).json(sharePost);
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ error: 'Server error while sharing post' });
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
