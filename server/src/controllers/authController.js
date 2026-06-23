const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Calculer l'âge à partir d'une date de naissance (format YYYY-MM-DD)
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

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      firstName, 
      lastName, 
      name, 
      organization,
      dateOfBirth,
      parentName,
      parentNationalId,
      parentPhone,
      parentEmail,
      parentalConsent
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const validRoles = ['PLAYER', 'SCOUT', 'ACADEMY', 'CLUB'];
    const userRole = validRoles.includes(role) ? role : 'PLAYER';

    // Validation spécifique pour les joueurs (mineurs vs majeurs)
    let isMinor = false;
    if (userRole === 'PLAYER') {
      if (!dateOfBirth) {
        return res.status(400).json({ error: 'La date de naissance est requise pour les joueurs.' });
      }
      const age = calculateAge(dateOfBirth);
      if (age < 18) {
        isMinor = true;
        if (!parentName || !parentNationalId || !parentPhone || !parentEmail || !parentalConsent) {
          return res.status(400).json({ 
            error: 'L\'autorisation et les coordonnées parentales complètes sont obligatoires pour les joueurs mineurs.' 
          });
        }
      }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec son profil selon le rôle
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        // Créer le profil joueur automatiquement
        ...(userRole === 'PLAYER' && {
          playerProfile: {
            create: {
              firstName: firstName || '',
              lastName: lastName || '',
              dateOfBirth: dateOfBirth,
              parentName: isMinor ? parentName : null,
              parentNationalId: isMinor ? parentNationalId : null,
              parentPhone: isMinor ? parentPhone : null,
              parentEmail: isMinor ? parentEmail : null,
              parentalConsent: isMinor ? (parentalConsent === true || parentalConsent === 'true') : false,
              stats: { create: {} } // Stats par défaut
            }
          }
        }),
        // Créer le profil scout/club/académie
        ...(['SCOUT', 'CLUB', 'ACADEMY'].includes(userRole) && {
          scoutProfile: {
            create: {
              name: name || organization || '',
              organization: organization || ''
            }
          }
        })
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Inscription réussie ! Bienvenue sur Scoutini.',
      token,
      user
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
};

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur existant
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Connexion réussie !',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};

/**
 * GET /api/auth/me
 * Récupérer le profil de l'utilisateur connecté
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        playerProfile: {
          include: { stats: true }
        },
        scoutProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = { register, login, getMe };
