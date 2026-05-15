const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Journal = require('../models/Journal');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all public journals
router.get('/', async (req, res) => {
  try {
    const journals = await Journal.find({ isPublic: true })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(journals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single journal
router.get('/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id)
      .populate('user', 'username avatar');
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create journal
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, location, mood, isPublic } = req.body;
    const journal = new Journal({
      user: req.user.id,
      title,
      content,
      location,
      mood,
      isPublic
    });
    await journal.save();
    res.json(journal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update journal
router.put('/:id', auth, async (req, res) => {
  try {
    let journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    if (journal.user.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });
    journal = await Journal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(journal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete journal
router.delete('/:id', auth, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    if (journal.user.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });
    await journal.deleteOne();
    res.json({ message: 'Journal deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my journals
router.get('/user/me', auth, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(journals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;