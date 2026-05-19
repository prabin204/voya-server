const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  location: {
    name: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  themes: [{ type: String }],
  mood: {
    type: String,
    default: 'wonder'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    percentage: Number
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Journal', JournalSchema);