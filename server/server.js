require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/music-player';

app.use(cors());
app.use(express.json());

// Serve static files from dist folder (React build output) - must come first!
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Block access to /src folder to prevent serving JSX files directly
app.use('/src', (req, res) => {
  res.status(404).send('Not Found');
});

// Serve other static files from root (like favicon, etc.)
app.use(express.static(path.join(__dirname, '..')));

const Song = require('./models/Song');
const User = require('./models/User');

const songsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'songs.json'), 'utf8'));
let inMemoryUsers = [];
let inMemorySongs = [...songsData];

const isDbReady = () => mongoose.connection.readyState === 1;

async function getSongs() {
  if (isDbReady()) {
    return Song.find({});
  }
  return inMemorySongs;
}

async function findUser(username) {
  if (isDbReady()) {
    return User.findOne({ username });
  }
  return inMemoryUsers.find((user) => user.username === username) || null;
}

async function createUser(username, password) {
  if (isDbReady()) {
    return User.create({ username, password });
  }

  const user = { _id: `${Date.now()}`, username, password };
  inMemoryUsers.push(user);
  return user;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/songs', async (req, res) => {
  try {
    const songs = await getSongs();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

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

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to root index.html for dev purposes, but in production dist/ should exist
    const rootIndexPath = path.join(__dirname, '..', 'index.html');
    if (fs.existsSync(rootIndexPath)) {
      res.sendFile(rootIndexPath);
    } else {
      res.status(404).send('Not Found');
    }
  }
});

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      connectTimeoutMS: 3000,
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected');

    const count = await Song.countDocuments();
    if (count === 0) {
      await Song.insertMany(songsData);
      console.log('Seeded songs');
    }
  } catch (error) {
    console.warn('MongoDB unavailable, continuing with in-memory storage:', error.message);
  }

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

start();
