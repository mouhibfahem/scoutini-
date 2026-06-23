const express = require('express');
const router = express.Router();
const {
  getPlayers, getPlayerById, updateProfile, updateAvatar, updateStats
} = require('../controllers/playerController');
const { auth, requireRole } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Routes publiques
router.get('/', getPlayers);
router.get('/:id', getPlayerById);

// Routes protégées (joueurs uniquement)
router.put('/profile', auth, requireRole('PLAYER'), updateProfile);
router.put('/avatar', auth, requireRole('PLAYER'), uploadAvatar.single('avatar'), updateAvatar);
router.put('/stats', auth, requireRole('PLAYER'), updateStats);

module.exports = router;
