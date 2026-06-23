const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

/**
 * POST /api/videos
 * Upload d'une vidéo highlight
 */
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune vidéo envoyée.' });
    }

    const { title, description, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Le titre est requis.' });
    }

    // Trouver le profil joueur
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profil joueur non trouvé.' });
    }

    const validCategories = ['HIGHLIGHT', 'MATCH', 'TRAINING', 'SKILLS'];
    const videoCategory = validCategories.includes(category) ? category : 'HIGHLIGHT';

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    const video = await prisma.video.create({
      data: {
        playerId: profile.id,
        title,
        description: description || null,
        videoUrl,
        category: videoCategory
      }
    });

    res.status(201).json({
      message: 'Vidéo uploadée avec succès.',
      video
    });
  } catch (error) {
    console.error('Erreur uploadVideo:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'upload.' });
  }
};

/**
 * GET /api/videos/player/:playerId
 * Récupérer toutes les vidéos d'un joueur
 */
const getPlayerVideos = async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = { playerId: req.params.playerId };
    if (category) where.category = category;

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        player: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    res.json({ videos });
  } catch (error) {
    console.error('Erreur getPlayerVideos:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * GET /api/videos/my
 * Récupérer mes propres vidéos (joueur connecté)
 */
const getMyVideos = async (req, res) => {
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profil joueur non trouvé.' });
    }

    const videos = await prisma.video.findMany({
      where: { playerId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ videos });
  } catch (error) {
    console.error('Erreur getMyVideos:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * DELETE /api/videos/:id
 * Supprimer une vidéo (joueur propriétaire uniquement)
 */
const deleteVideo = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: { player: { select: { userId: true } } }
    });

    if (!video) {
      return res.status(404).json({ error: 'Vidéo non trouvée.' });
    }

    // Vérifier que c'est bien le propriétaire
    if (video.player.userId !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres vidéos.' });
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../..', video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer de la base
    await prisma.video.delete({ where: { id: req.params.id } });

    res.json({ message: 'Vidéo supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur deleteVideo:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = { uploadVideo, getPlayerVideos, getMyVideos, deleteVideo };
