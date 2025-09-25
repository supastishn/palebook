const express = require('express');
const { body, validationResult } = require('express-validator');
const Page = require('../models/Page');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// List pages (basic)
router.get('/', auth, async (req, res) => {
  const pages = await Page.find().sort({ createdAt: -1 }).limit(50);
  res.json(pages);
});

router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('description').optional().isLength({ max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const page = await Page.create({
    name: req.body.name,
    description: req.body.description || '',
    createdBy: req.user._id,
    admins: [req.user._id],
  });
  res.status(201).json(page);
});

router.post('/:id/follow', auth, async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  const user = await User.findById(req.user._id);
  if (!page.followers.includes(req.user._id)) page.followers.push(req.user._id);
  if (!user.followedPages.includes(page._id)) user.followedPages.push(page._id);
  await Promise.all([page.save(), user.save()]);
  res.json({ ok: true });
});

router.delete('/:id/follow', auth, async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  const user = await User.findById(req.user._id);
  page.followers.pull(req.user._id);
  user.followedPages.pull(page._id);
  await Promise.all([page.save(), user.save()]);
  res.json({ ok: true });
});

module.exports = router;
