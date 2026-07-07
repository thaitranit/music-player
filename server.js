const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const songsPath = path.join(__dirname, 'server', 'data', 'songs.json');
const playlistsPath = path.join(__dirname, 'server', 'data', 'playlists.json');

app.use(express.json());
app.use(express.static(__dirname));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Music player API is running' });
});

app.get('/api/songs', (req, res) => {
  const songs = readJson(songsPath);
  res.json(songs);
});

app.get('/api/songs/:id', (req, res) => {
  const songs = readJson(songsPath);
  const song = songs.find((item) => item.id === req.params.id);

  if (!song) {
    return res.status(404).json({ message: 'Song not found' });
  }

  res.json(song);
});

app.get('/api/playlists', (req, res) => {
  const playlists = readJson(playlistsPath);
  res.json(playlists);
});

app.post('/api/playlists/:id/songs', (req, res) => {
  const playlists = readJson(playlistsPath);
  const playlist = playlists.find((item) => item.id === req.params.id);

  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }

  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ message: 'songId is required' });
  }

  if (!playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
    writeJson(playlistsPath, playlists);
  }

  res.json(playlist);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
