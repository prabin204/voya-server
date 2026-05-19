const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Journal = require('../models/Journal');
const User = require('../models/User');
const { upload } = require('../cloudinary');

// Auth middleware
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

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    res.json({ url: req.file.path, public_id: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get all public journals
router.get('/', async (req, res) => {
  try {
    const journals = await Journal.find({ isPublic: true })
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
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
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar');
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    res.json(journal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create journal
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, location, mood, isPublic, image } = req.body;
    const journal = new Journal({
      user: req.user.id,
      title,
      content,
      location,
      mood,
      isPublic,
      image: image || ''
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

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    if (!req.body.text || req.body.text.trim() === '')
      return res.status(400).json({ message: 'Comment cannot be empty' });
    journal.comments.push({ user: req.user.id, text: req.body.text.trim() });
    await journal.save();
    const updated = await Journal.findById(req.params.id)
      .populate('comments.user', 'username avatar');
    res.json(updated.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id)
      .populate('comments.user', 'username avatar');
    if (!journal) return res.status(404).json({ message: 'Not found' });
    res.json(journal.comments || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    const comment = journal.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });
    comment.deleteOne();
    await journal.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like journal
router.put('/:id/like', auth, async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Not found' });
    const liked = journal.likes.includes(req.user.id);
    if (liked) {
      journal.likes = journal.likes.filter(id => id.toString() !== req.user.id);
    } else {
      journal.likes.push(req.user.id);
    }
    await journal.save();
    res.json({ likes: journal.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;