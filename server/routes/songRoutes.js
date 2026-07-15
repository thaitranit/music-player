const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const auth = require('../middleware/auth');
const { uploadMusic } = require('../config/upload');

// Public routes
router.get('/', songController.getAllSongs);
router.get('/popular', songController.getPopularSongs);
router.get('/search', songController.searchSongs);
router.get('/:id', songController.getSongById);
router.post('/:id/play', songController.incrementPlayCount);

// Protected routes (cần login)
router.get('/user/my-songs', auth, songController.getUserSongs);
router.post('/upload', auth, uploadMusic.single('musicFile'), songController.uploadAndCreateSong);
router.post('/', auth, songController.createSong);
router.put('/:id', auth, songController.updateSong);
router.delete('/:id', auth, songController.deleteSong);

module.exports = router;
