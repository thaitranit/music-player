require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/music-player';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use(express.static(path.join(__dirname, '..')));

// Block access to src folder
app.use('/src', (req, res) => {
  res.status(404).send('Not Found');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1, 
    storage: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory'
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);

// Fallback for React SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please ensure "npm run build" was executed.');
  }
});

// Start server
const start = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');

    // Seed initial songs if empty
    const Song = require('./models/Song');
    const songsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'songs.json'), 'utf8'));
    const count = await Song.countDocuments();
    
    if (count === 0) {
      await Song.insertMany(songsData);
      console.log('✅ Seeded initial songs data');
    }
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`💾 Storage: ${mongoose.connection.readyState === 1 ? 'MongoDB' : 'In-Memory'}`);
  });
};

start();
