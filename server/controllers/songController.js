const Song = require('../models/Song');

const songController = {
  getAllSongs: async (req, res) => {
    try {
      const songs = await Song.find({ isActive: true }).sort({ createdAt: -1 });
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getSongById: async (req, res) => {
    try {
      const song = await Song.findOne({ id: req.params.id, isActive: true });
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createSong: async (req, res) => {
    try {
      const { id, name, singer, album, genre, duration, path, image } = req.body;
      
      const existingSong = await Song.findOne({ id });
      if (existingSong) {
        return res.status(409).json({ message: 'Song with this ID already exists' });
      }

      const song = new Song({
        id,
        name,
        singer,
        album: album || 'Single',
        genre: genre || 'Pop',
        duration: duration || 0,
        path,
        image
      });

      const savedSong = await song.save();
      res.status(201).json(savedSong);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateSong: async (req, res) => {
    try {
      const song = await Song.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      
      res.json(song);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteSong: async (req, res) => {
    try {
      const song = await Song.findOneAndUpdate(
        { id: req.params.id },
        { isActive: false },
        { new: true }
      );
      
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      
      res.json({ message: 'Song deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  incrementPlayCount: async (req, res) => {
    try {
      const song = await Song.findOneAndUpdate(
        { id: req.params.id },
        { $inc: { plays: 1 } },
        { new: true }
      );
      
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPopularSongs: async (req, res) => {
    try {
      const songs = await Song.find({ isActive: true })
        .sort({ plays: -1 })
        .limit(10);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  searchSongs: async (req, res) => {
    try {
      const { q } = req.query;
      const songs = await Song.find({
        isActive: true,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { singer: { $regex: q, $options: 'i' } },
          { album: { $regex: q, $options: 'i' } }
        ]
      });
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = songController;
