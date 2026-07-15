const Song = require('../models/Song');
const { v4: uuidv4 } = require('uuid');

const songController = {
  // Lấy tất cả bài hát (public + của user hiện tại)
  getAllSongs: async (req, res) => {
    try {
      const userId = req.user?.id;
      let query = { isActive: true };
      
      // Nếu có user, lấy cả bài hát public và bài hát của user đó
      if (userId) {
        query = {
          isActive: true,
          $or: [
            { isPublic: true },
            { userId: userId }
          ]
        };
      } else {
        // Nếu không có user, chỉ lấy bài public
        query.isPublic = true;
      }

      const songs = await Song.find(query).sort({ createdAt: -1 });
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy bài hát của một user cụ thể
  getUserSongs: async (req, res) => {
    try {
      const userId = req.user.id;
      const songs = await Song.find({ userId, isActive: true }).sort({ createdAt: -1 });
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

  // Upload và tạo bài hát mới
  uploadAndCreateSong: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng chọn file nhạc' });
      }

      const { name, singer, album, genre, isPublic } = req.body;
      const userId = req.user.id;

      // Tạo bài hát mới
      const song = new Song({
        id: uuidv4(),
        name: name || req.file.originalname.replace(/\.[^/.]+$/, ''),
        singer: singer || 'Unknown Artist',
        album: album || 'Single',
        genre: genre || 'Pop',
        path: `/assests/music/${req.file.filename}`,
        userId,
        isPublic: isPublic === 'true' || isPublic === true
      });

      const savedSong = await song.save();
      res.status(201).json(savedSong);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Tạo bài hát (không upload file - dùng path có sẵn)
  createSong: async (req, res) => {
    try {
      const { id, name, singer, album, genre, duration, path, image, isPublic } = req.body;
      const userId = req.user?.id;
      
      const existingSong = await Song.findOne({ id });
      if (existingSong) {
        return res.status(409).json({ message: 'Song with this ID already exists' });
      }

      const song = new Song({
        id: id || uuidv4(),
        name,
        singer,
        album: album || 'Single',
        genre: genre || 'Pop',
        duration: duration || 0,
        path,
        image,
        userId,
        isPublic: isPublic !== undefined ? isPublic : true
      });

      const savedSong = await song.save();
      res.status(201).json(savedSong);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Cập nhật bài hát (chỉ người tạo mới được cập nhật)
  updateSong: async (req, res) => {
    try {
      const userId = req.user.id;
      const song = await Song.findOne({ id: req.params.id, userId });
      
      if (!song) {
        return res.status(404).json({ message: 'Song not found or you do not have permission' });
      }

      // Cập nhật các trường
      const { name, singer, album, genre, image, isPublic } = req.body;
      if (name !== undefined) song.name = name;
      if (singer !== undefined) song.singer = singer;
      if (album !== undefined) song.album = album;
      if (genre !== undefined) song.genre = genre;
      if (image !== undefined) song.image = image;
      if (isPublic !== undefined) song.isPublic = isPublic;

      const updatedSong = await song.save();
      res.json(updatedSong);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Xóa bài hát (chỉ người tạo mới được xóa)
  deleteSong: async (req, res) => {
    try {
      const userId = req.user.id;
      const song = await Song.findOne({ id: req.params.id, userId });
      
      if (!song) {
        return res.status(404).json({ message: 'Song not found or you do not have permission' });
      }
      
      // Soft delete
      song.isActive = false;
      await song.save();
      
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
      let query = { isActive: true, isPublic: true };
      
      const songs = await Song.find(query)
        .sort({ plays: -1 })
        .limit(20);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  searchSongs: async (req, res) => {
    try {
      const { q } = req.query;
      const userId = req.user?.id;
      
      let query = {
        isActive: true,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { singer: { $regex: q, $options: 'i' } },
          { album: { $regex: q, $options: 'i' } }
        ]
      };

      // Nếu có user, tìm trong public và của user
      if (userId) {
        query.$and = [
          { $or: [
              { isPublic: true },
              { userId: userId }
            ]
          }
        ];
      } else {
        query.isPublic = true;
      }

      const songs = await Song.find(query);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = songController;
