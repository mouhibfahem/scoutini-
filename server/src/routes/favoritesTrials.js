const express = require('express');
const router = express.Router();
const {
  addFavorite, getFavorites, removeFavorite,
  sendTrialRequest, getSentTrials, getReceivedTrials, respondToTrial
} = require('../controllers/favoriteTrialController');
const { auth, requireRole } = require('../middleware/auth');

// ====== FAVORIS (Scouts, Clubs, Académies) ======
router.get('/favorites', auth, requireRole('SCOUT', 'CLUB', 'ACADEMY'), getFavorites);
router.post('/favorites/:playerId', auth, requireRole('SCOUT', 'CLUB', 'ACADEMY'), addFavorite);
router.delete('/favorites/:playerId', auth, requireRole('SCOUT', 'CLUB', 'ACADEMY'), removeFavorite);

// ====== DEMANDES D'ESSAI ======
// Envoi (scouts, clubs, académies)
router.post('/trials', auth, requireRole('SCOUT', 'CLUB', 'ACADEMY'), sendTrialRequest);
router.get('/trials/sent', auth, requireRole('SCOUT', 'CLUB', 'ACADEMY'), getSentTrials);

// Réception (joueurs)
router.get('/trials/received', auth, requireRole('PLAYER'), getReceivedTrials);
router.put('/trials/:id/respond', auth, requireRole('PLAYER'), respondToTrial);

module.exports = router;
