const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/players
 * Recherche et liste des joueurs avec filtres
 */
const getPlayers = async (req, res) => {
  try {
    const {
      search,      // Recherche par nom
      position,    // Filtre par poste
      region,      // Filtre par gouvernorat
      city,        // Filtre par ville
      foot,        // Filtre par pied préféré
      minAge,      // Âge minimum
      maxAge,      // Âge maximum
      sortBy,      // Tri: name, date, position
      order,       // asc ou desc
      page = 1,
      limit = 12
    } = req.query;

    const where = {};

    // Recherche par nom
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } }
      ];
    }

    // Filtres
    if (position) where.position = position;
    if (region) where.region = { contains: region };
    if (city) where.city = { contains: city };
    if (foot) where.preferredFoot = foot;

    // Filtre par âge (basé sur dateOfBirth)
    if (minAge || maxAge) {
      const now = new Date();
      if (maxAge) {
        const minDate = new Date(now.getFullYear() - parseInt(maxAge) - 1, now.getMonth(), now.getDate());
        where.dateOfBirth = { ...where.dateOfBirth, gte: minDate.toISOString().split('T')[0] };
      }
      if (minAge) {
        const maxDate = new Date(now.getFullYear() - parseInt(minAge), now.getMonth(), now.getDate());
        where.dateOfBirth = { ...where.dateOfBirth, lte: maxDate.toISOString().split('T')[0] };
      }
    }

    // Tri
    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'name') orderBy = { firstName: order || 'asc' };
    if (sortBy === 'position') orderBy = { position: order || 'asc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [players, total] = await Promise.all([
      prisma.playerProfile.findMany({
        where,
        include: {
          stats: true,
          videos: { select: { id: true, thumbnailUrl: true }, take: 1 },
          user: { select: { email: true } }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.playerProfile.count({ where })
    ]);

    res.json({
      players,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur getPlayers:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * GET /api/players/:id
 * Profil complet d'un joueur (vue publique)
 */
const getPlayerById = async (req, res) => {
  try {
    const player = await prisma.playerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        stats: true,
        videos: { orderBy: { createdAt: 'desc' } },
        user: { select: { email: true, createdAt: true } }
      }
    });

    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé.' });
    }

    res.json({ player });
  } catch (error) {
    console.error('Erreur getPlayerById:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * PUT /api/players/profile
 * Mise à jour du profil joueur (utilisateur connecté)
 */
const updateProfile = async (req, res) => {
  try {
    const {
      firstName, lastName, dateOfBirth, phone,
      city, region, nationality, height, weight,
      position, preferredFoot, currentClub, bio
    } = req.body;

    // Trouver le profil du joueur connecté
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!existingProfile) {
      return res.status(404).json({ error: 'Profil joueur non trouvé.' });
    }

    const updatedProfile = await prisma.playerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(region !== undefined && { region }),
        ...(nationality !== undefined && { nationality }),
        ...(height !== undefined && { height: parseInt(height) }),
        ...(weight !== undefined && { weight: parseInt(weight) }),
        ...(position !== undefined && { position }),
        ...(preferredFoot !== undefined && { preferredFoot }),
        ...(currentClub !== undefined && { currentClub }),
        ...(bio !== undefined && { bio })
      },
      include: { stats: true }
    });

    res.json({
      message: 'Profil mis à jour avec succès.',
      player: updatedProfile
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * PUT /api/players/avatar
 * Upload de l'avatar du joueur
 */
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image envoyée.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedProfile = await prisma.playerProfile.update({
      where: { userId: req.user.id },
      data: { avatar: avatarUrl }
    });

    res.json({
      message: 'Avatar mis à jour.',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Erreur updateAvatar:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * PUT /api/players/stats
 * Mise à jour des statistiques du joueur
 */
const updateStats = async (req, res) => {
  try {
    const {
      speed, technique, endurance, passing,
      shooting, dribbling, defending, physical,
      matchesPlayed, goals, assists
    } = req.body;

    // Trouver le profil
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id },
      include: { stats: true }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profil joueur non trouvé.' });
    }

    // Valider les stats (0-100)
    const clamp = (val) => val !== undefined ? Math.min(100, Math.max(0, parseInt(val))) : undefined;

    const statsData = {
      ...(speed !== undefined && { speed: clamp(speed) }),
      ...(technique !== undefined && { technique: clamp(technique) }),
      ...(endurance !== undefined && { endurance: clamp(endurance) }),
      ...(passing !== undefined && { passing: clamp(passing) }),
      ...(shooting !== undefined && { shooting: clamp(shooting) }),
      ...(dribbling !== undefined && { dribbling: clamp(dribbling) }),
      ...(defending !== undefined && { defending: clamp(defending) }),
      ...(physical !== undefined && { physical: clamp(physical) }),
      ...(matchesPlayed !== undefined && { matchesPlayed: parseInt(matchesPlayed) }),
      ...(goals !== undefined && { goals: parseInt(goals) }),
      ...(assists !== undefined && { assists: parseInt(assists) })
    };

    let stats;
    if (profile.stats) {
      stats = await prisma.playerStats.update({
        where: { profileId: profile.id },
        data: statsData
      });
    } else {
      stats = await prisma.playerStats.create({
        data: { profileId: profile.id, ...statsData }
      });
    }

    res.json({
      message: 'Statistiques mises à jour.',
      stats
    });
  } catch (error) {
    console.error('Erreur updateStats:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = { getPlayers, getPlayerById, updateProfile, updateAvatar, updateStats };
