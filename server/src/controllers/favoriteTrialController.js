const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// FAVORIS
// ============================================

/**
 * POST /api/favorites/:playerId
 * Ajouter un joueur aux favoris
 */
const addFavorite = async (req, res) => {
  try {
    const { playerId } = req.params;

    // Vérifier que le joueur existe
    const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé.' });
    }

    // Vérifier si déjà en favoris
    const existing = await prisma.favorite.findUnique({
      where: { scoutId_playerId: { scoutId: req.user.id, playerId } }
    });
    if (existing) {
      return res.status(409).json({ error: 'Ce joueur est déjà dans vos favoris.' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        scoutId: req.user.id,
        playerId
      },
      include: {
        player: {
          select: { firstName: true, lastName: true, position: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      message: 'Joueur ajouté aux favoris.',
      favorite
    });
  } catch (error) {
    console.error('Erreur addFavorite:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * GET /api/favorites
 * Récupérer la liste des favoris
 */
const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { scoutId: req.user.id },
      include: {
        player: {
          include: {
            stats: true,
            videos: { select: { id: true }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Erreur getFavorites:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * DELETE /api/favorites/:playerId
 * Retirer un joueur des favoris
 */
const removeFavorite = async (req, res) => {
  try {
    const { playerId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { scoutId_playerId: { scoutId: req.user.id, playerId } }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Ce joueur n\'est pas dans vos favoris.' });
    }

    await prisma.favorite.delete({ where: { id: favorite.id } });

    res.json({ message: 'Joueur retiré des favoris.' });
  } catch (error) {
    console.error('Erreur removeFavorite:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// ============================================
// DEMANDES D'ESSAI
// ============================================

/**
 * POST /api/trials
 * Envoyer une demande d'essai à un joueur
 */
const sendTrialRequest = async (req, res) => {
  try {
    const { playerId, message } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'L\'ID du joueur est requis.' });
    }

    // Vérifier que le joueur existe
    const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé.' });
    }

    // --- SÉCURITÉ MINEURS ---
    // Calculer l'âge du joueur
    const calculateAge = (dobString) => {
      if (!dobString) return 0;
      const today = new Date();
      const birthDate = new Date(dobString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const isPlayerMinor = player.dateOfBirth && calculateAge(player.dateOfBirth) < 18;

    if (isPlayerMinor) {
      // Récupérer le statut vérifié du recruteur
      const scout = await prisma.scoutProfile.findUnique({ where: { userId: req.user.id } });
      if (!scout || !scout.verified) {
        return res.status(403).json({ 
          error: 'Sécurité : Seuls les clubs ou scouts vérifiés par Scoutini peuvent envoyer des demandes d\'essai aux joueurs mineurs.' 
        });
      }
    }
    // -------------------------

    // Vérifier s'il y a déjà une demande en cours
    const existingTrial = await prisma.trialRequest.findFirst({
      where: {
        fromId: req.user.id,
        playerId,
        status: 'PENDING'
      }
    });
    if (existingTrial) {
      return res.status(409).json({ error: 'Vous avez déjà une demande en cours pour ce joueur.' });
    }

    const trial = await prisma.trialRequest.create({
      data: {
        fromId: req.user.id,
        playerId,
        message: message || null
      },
      include: {
        player: { select: { firstName: true, lastName: true } },
        from: { select: { email: true, role: true } }
      }
    });

    res.status(201).json({
      message: 'Demande d\'essai envoyée.',
      trial
    });
  } catch (error) {
    console.error('Erreur sendTrialRequest:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * GET /api/trials/sent
 * Récupérer les demandes d'essai envoyées (scout)
 */
const getSentTrials = async (req, res) => {
  try {
    const trials = await prisma.trialRequest.findMany({
      where: { fromId: req.user.id },
      include: {
        player: { select: { firstName: true, lastName: true, position: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ trials });
  } catch (error) {
    console.error('Erreur getSentTrials:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * GET /api/trials/received
 * Récupérer les demandes d'essai reçues (joueur)
 */
const getReceivedTrials = async (req, res) => {
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profil joueur non trouvé.' });
    }

    const trials = await prisma.trialRequest.findMany({
      where: { playerId: profile.id },
      include: {
        from: {
          select: {
            email: true,
            role: true,
            scoutProfile: { select: { name: true, organization: true, verified: true, avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ trials });
  } catch (error) {
    console.error('Erreur getReceivedTrials:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * PUT /api/trials/:id/respond
 * Répondre à une demande d'essai (ACCEPTED ou REJECTED)
 */
const respondToTrial = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide. Utilisez ACCEPTED ou REJECTED.' });
    }

    const trial = await prisma.trialRequest.findUnique({
      where: { id: req.params.id },
      include: { player: { select: { userId: true } } }
    });

    if (!trial) {
      return res.status(404).json({ error: 'Demande non trouvée.' });
    }

    // Vérifier que c'est le joueur concerné
    if (trial.player.userId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez répondre qu\'à vos propres demandes.' });
    }

    const updatedTrial = await prisma.trialRequest.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({
      message: `Demande ${status === 'ACCEPTED' ? 'acceptée' : 'refusée'}.`,
      trial: updatedTrial
    });
  } catch (error) {
    console.error('Erreur respondToTrial:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = {
  addFavorite, getFavorites, removeFavorite,
  sendTrialRequest, getSentTrials, getReceivedTrials, respondToTrial
};
