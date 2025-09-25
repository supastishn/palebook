const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// List groups (basic)
router.get('/', auth, async (req, res) => {
  const groups = await Group.find().sort({ createdAt: -1 }).limit(50);
  res.json(groups);
});

router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('description').optional().isLength({ max: 1000 }),
  body('privacy').optional().isIn(['public', 'private'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const group = await Group.create({
    name: req.body.name,
    description: req.body.description || '',
    createdBy: req.user._id,
    admins: [req.user._id],
    members: [req.user._id],
    privacy: req.body.privacy || 'public',
  });
  const user = await User.findById(req.user._id);
  if (!user.groups.includes(group._id)) user.groups.push(group._id);
  await user.save();
  res.status(201).json(group);
});

router.post('/:id/join', auth, async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const user = await User.findById(req.user._id);
  if (group.privacy === 'private') return res.status(403).json({ error: 'Group is private' });
  if (!group.members.includes(req.user._id)) group.members.push(req.user._id);
  if (!user.groups.includes(group._id)) user.groups.push(group._id);
  await Promise.all([group.save(), user.save()]);
  res.json({ ok: true });
});

router.delete('/:id/leave', auth, async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  const user = await User.findById(req.user._id);
  group.members.pull(req.user._id);
  user.groups.pull(group._id);
  await Promise.all([group.save(), user.save()]);
  res.json({ ok: true });
});

module.exports = router;
