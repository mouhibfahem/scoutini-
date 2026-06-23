const express = require('express');
const router = express.Router();
const {
  uploadVideo, getPlayerVideos, getMyVideos, deleteVideo
} = require('../controllers/videoController');
const { auth, requireRole } = require('../middleware/auth');
const { uploadVideo: uploadVideoMiddleware } = require('../middleware/upload');

// Routes publiques
router.get('/player/:playerId', getPlayerVideos);

// Routes protégées (joueurs uniquement)
router.post('/', auth, requireRole('PLAYER'), uploadVideoMiddleware.single('video'), uploadVideo);
router.get('/my', auth, requireRole('PLAYER'), getMyVideos);
router.delete('/:id', auth, requireRole('PLAYER'), deleteVideo);

module.exports = router;
