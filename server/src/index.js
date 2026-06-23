require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importer les routes
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const videoRoutes = require('./routes/videos');
const favoritesTrialsRoutes = require('./routes/favoritesTrials');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE GLOBAUX
// ============================================

// Protection des en-têtes HTTP
app.use(helmet());

// Limiteur de débit global (limite chaque IP à 100 requêtes par 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: { error: 'Trop de requêtes depuis cette IP, veuillez réessayer après 15 minutes.' }
});

// Appliquer le limiter à toutes les routes d'API
app.use('/api', limiter);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://scoutini.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// ROUTES API
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api', favoritesTrialsRoutes);

// ============================================
// ROUTE DE BIENVENUE
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: '⚽ Bienvenue sur Scoutini API !',
    description: 'Plateforme de détection des talents footballistiques en Tunisie',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      players: {
        list: 'GET /api/players',
        details: 'GET /api/players/:id',
        updateProfile: 'PUT /api/players/profile',
        updateAvatar: 'PUT /api/players/avatar',
        updateStats: 'PUT /api/players/stats'
      },
      videos: {
        upload: 'POST /api/videos',
        playerVideos: 'GET /api/videos/player/:playerId',
        myVideos: 'GET /api/videos/my',
        delete: 'DELETE /api/videos/:id'
      },
      favorites: {
        list: 'GET /api/favorites',
        add: 'POST /api/favorites/:playerId',
        remove: 'DELETE /api/favorites/:playerId'
      },
      trials: {
        send: 'POST /api/trials',
        sent: 'GET /api/trials/sent',
        received: 'GET /api/trials/received',
        respond: 'PUT /api/trials/:id/respond'
      }
    }
  });
});

// ============================================
// GESTION DES ERREURS
// ============================================
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);

  // Erreur Multer (taille fichier, type, etc.)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Fichier trop volumineux.' });
  }

  if (err.message && err.message.includes('Seules les images')) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message && err.message.includes('formats vidéo')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('  ⚽ ═══════════════════════════════════════');
  console.log('  ⚽  SCOUTINI API - Serveur démarré !');
  console.log(`  ⚽  http://localhost:${PORT}`);
  console.log('  ⚽  Environnement:', process.env.NODE_ENV || 'development');
  console.log('  ⚽ ═══════════════════════════════════════');
  console.log('');
});
