const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Send friend request
router.post('/request', auth, [
  body('recipientId').isMongoId().withMessage('Invalid recipient ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId } = req.body;

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    if (recipient.friends.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already sent
    const existingRequest = recipient.friendRequests.find(
      request => request.from.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Add friend request
    recipient.friendRequests.push({
      from: req.user._id
    });

    await recipient.save();
    // notify recipient
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(String(recipientId)).emit('notification', {
          type: 'friend:request',
          actorId: String(req.user._id),
          createdAt: new Date().toISOString()
        });
      }
      await Notification.create({
        recipient: recipientId,
        actor: req.user._id,
        type: 'friend:request',
      }).catch(() => {});
    } catch (_) {}

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Server error while sending friend request' });
  }
});

// Accept friend request
router.post('/accept', auth, [
  body('requesterId').isMongoId().withMessage('Invalid requester ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { requesterId } = req.body;

    const user = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    // Find the friend request
    const requestIndex = user.friendRequests.findIndex(
      request => request.from.toString() === requesterId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Add to friends lists
    user.friends.push(requesterId);
    requester.friends.push(req.user._id);

    // Remove friend request
    user.friendRequests.splice(requestIndex, 1);

    await Promise.all([user.save(), requester.save()]);

    // notify requester
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(String(requesterId)).emit('notification', {
          type: 'friend:accept',
          actorId: String(req.user._id),
          createdAt: new Date().toISOString()
        });
      }
      await Notification.create({
        recipient: requesterId,
        actor: req.user._id,
        type: 'friend:accept',
      }).catch(() => {});
    } catch (_) {}

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Server error while accepting friend request' });
  }
});

// Reject friend request
router.post('/reject', auth, [
  body('requesterId').isMongoId().withMessage('Invalid requester ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { requesterId } = req.body;

    const user = await User.findById(req.user._id);

    // Find and remove the friend request
    const requestIndex = user.friendRequests.findIndex(
      request => request.from.toString() === requesterId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    user.friendRequests.splice(requestIndex, 1);
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Server error while rejecting friend request' });
  }
});

// Get friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'firstName lastName avatar');

    res.json(user.friendRequests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Server error while fetching friend requests' });
  }
});

// Get friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'firstName lastName avatar isOnline lastSeen');

    res.json(user.friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error while fetching friends' });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    // Remove from both friends lists
    user.friends.pull(friendId);
    friend.friends.pull(req.user._id);

    await Promise.all([user.save(), friend.save()]);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error while removing friend' });
  }
});

module.exports = router;
