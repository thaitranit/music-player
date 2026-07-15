const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const auth = require('../middleware/auth');

router.get('/', songController.getAllSongs);
router.get('/popular', songController.getPopularSongs);
router.get('/search', songController.searchSongs);
router.get('/:id', songController.getSongById);

router.post('/', auth, songController.createSong);
router.put('/:id', auth, songController.updateSong);
router.delete('/:id', auth, songController.deleteSong);
router.post('/:id/play', songController.incrementPlayCount);

module.exports = router;
