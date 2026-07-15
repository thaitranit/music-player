require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/music-player';

app.use(cors());
app.use(express.json());

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use('/src', (req, res) => {
  res.status(404).send('Not Found');
});

app.use(express.static(path.join(__dirname, '..')));

// Load initial data
const songsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'songs.json'), 'utf8'));
let inMemoryUsers = [];
let inMemorySongs = [...songsData];

// Check MongoDB connection status
const isDbReady = () => mongoose.connection.readyState === 1;

// Helper functions for dual storage
async function getSongs() {
  if (isDbReady()) {
    return await require('./models/Song').find({ isActive: true });
  }
  return inMemorySongs;
}

async function findUser(username) {
  if (isDbReady()) {
    return await require('./models/User').findOne({ username });
  }
  return inMemoryUsers.find(u => u.username === username);
}

async function createUser(username, password) {
  if (isDbReady()) {
    return await require('./models/User').create({ username, password });
  }
  const user = { _id: Date.now().toString(), username, password };
  inMemoryUsers.push(user);
  return user;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: isDbReady(), 
    storage: isDbReady() ? 'mongodb' : 'in-memory',
    mongo_uri_defined: !!MONGO_URI,
    mongo_uri_preview: MONGO_URI ? MONGO_URI.substring(0, 30) + '...' : 'not set'
  });
});

// Auth routes with fallback
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    const existing = await findUser(username);
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, hashedPassword);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ user: { username: user.username }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await findUser(username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ user: { username: user.username }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Songs routes with fallback
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await getSongs();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/songs/popular', async (req, res) => {
  try {
    let songs = await getSongs();
    songs = songs.sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 10);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/songs/search', async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';
    let songs = await getSongs();
    songs = songs.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.singer.toLowerCase().includes(q) ||
      (s.album && s.album.toLowerCase().includes(q))
    );
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/songs/:id', async (req, res) => {
  try {
    let songs = await getSongs();
    const song = songs.find(s => s.id === req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/songs/:id/play', async (req, res) => {
  try {
    if (isDbReady()) {
      const Song = require('./models/Song');
      const song = await Song.findOneAndUpdate({ id: req.params.id }, { $inc: { plays: 1 } }, { new: true });
      if (!song) return res.status(404).json({ message: 'Song not found' });
      res.json(song);
    } else {
      const songIndex = inMemorySongs.findIndex(s => s.id === req.params.id);
      if (songIndex === -1) return res.status(404).json({ message: 'Song not found' });
      inMemorySongs[songIndex].plays = (inMemorySongs[songIndex].plays || 0) + 1;
      res.json(inMemorySongs[songIndex]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fallback for React SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please ensure "npm run build" was executed.');
  }
});

const start = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');

    const Song = require('./models/Song');
    const count = await Song.countDocuments();
    
    if (count === 0) {
      await Song.insertMany(songsData);
      console.log('✅ Seeded initial songs data');
    }
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable, using in-memory storage:', error.message);
    console.log('💡 App will still work with in-memory data!');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`💾 Storage: ${isDbReady() ? 'MongoDB' : 'In-Memory'}`);
  });
};

start();
