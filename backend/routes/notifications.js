const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// List notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const items = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'firstName lastName avatar')
      .populate('post', '_id');

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ items, unreadCount, page, limit });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ error: 'Server error while listing notifications' });
  }
});

// Mark one notification as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ error: 'Notification not found' });
    res.json(n);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error while marking notification read' });
  }
});

// Mark all notifications as read
router.post('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error while marking notifications read' });
  }
});

module.exports = router;

