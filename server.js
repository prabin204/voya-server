const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/journals', require('./routes/journals'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'VOYA API is running 🚀' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
.then(() => {
  console.log('MongoDB connected ✅');
  app.listen(process.env.PORT || 5000, () => {
    console.log('Server running on port 5000 🚀');
  });
})
.catch(err => console.log(err));