const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

/**
 * Seed de données de test pour Scoutini
 * Crée des joueurs, scouts et données d'exemple
 */
async function main() {
  console.log('🌱 Seeding de la base de données Scoutini...\n');

  // Nettoyer la base
  await prisma.trialRequest.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.video.deleteMany();
  await prisma.playerStats.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.scoutProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 12);

  // ====== JOUEURS ======
  const players = [
    {
      email: 'ahmed.bensaid@email.com', password, role: 'PLAYER',
      playerProfile: {
        create: {
          firstName: 'Ahmed', lastName: 'Ben Said',
          dateOfBirth: '2005-03-15', city: 'Tunis', region: 'Tunis',
          height: 178, weight: 72, position: 'ST',
          preferredFoot: 'Right', currentClub: 'Espérance Sportive de Tunis (Jeunes)',
          bio: 'Attaquant rapide et technique, passionné par le football depuis l\'âge de 5 ans.',
          stats: { create: { speed: 85, technique: 78, endurance: 72, passing: 65, shooting: 88, dribbling: 80, defending: 35, physical: 70, matchesPlayed: 42, goals: 28, assists: 12 } }
        }
      }
    },
    {
      email: 'yassine.mejri@email.com', password, role: 'PLAYER',
      playerProfile: {
        create: {
          firstName: 'Yassine', lastName: 'Mejri',
          dateOfBirth: '2006-07-22', city: 'Sfax', region: 'Sfax',
          height: 182, weight: 75, position: 'CM',
          preferredFoot: 'Left', currentClub: 'CSS Jeunes',
          bio: 'Milieu de terrain créatif avec une excellente vision du jeu.',
          stats: { create: { speed: 70, technique: 82, endurance: 78, passing: 88, shooting: 62, dribbling: 75, defending: 68, physical: 65, matchesPlayed: 38, goals: 8, assists: 22 } }
        }
      }
    },
    {
      email: 'omar.trabelsi@email.com', password, role: 'PLAYER',
      playerProfile: {
        create: {
          firstName: 'Omar', lastName: 'Trabelsi',
          dateOfBirth: '2004-11-08', city: 'Sousse', region: 'Sousse',
          height: 186, weight: 80, position: 'CB',
          preferredFoot: 'Right', currentClub: 'Étoile du Sahel (Jeunes)',
          bio: 'Défenseur central solide, leader naturel sur le terrain.',
          stats: { create: { speed: 65, technique: 60, endurance: 80, passing: 70, shooting: 40, dribbling: 50, defending: 90, physical: 88, matchesPlayed: 50, goals: 5, assists: 3 } }
        }
      }
    },
    {
      email: 'khaled.hamdi@email.com', password, role: 'PLAYER',
      playerProfile: {
        create: {
          firstName: 'Khaled', lastName: 'Hamdi',
          dateOfBirth: '2005-05-30', city: 'Bizerte', region: 'Bizerte',
          height: 175, weight: 68, position: 'LW',
          preferredFoot: 'Both', currentClub: 'CA Bizertin (Jeunes)',
          bio: 'Ailier gauche explosif, excellent dribbleur avec une grande vitesse.',
          stats: { create: { speed: 92, technique: 85, endurance: 68, passing: 72, shooting: 75, dribbling: 90, defending: 30, physical: 60, matchesPlayed: 35, goals: 18, assists: 15 } }
        }
      }
    },
    {
      email: 'nizar.bouaziz@email.com', password, role: 'PLAYER',
      playerProfile: {
        create: {
          firstName: 'Nizar', lastName: 'Bouaziz',
          dateOfBirth: '2006-01-12', city: 'Nabeul', region: 'Nabeul',
          height: 190, weight: 82, position: 'GK',
          preferredFoot: 'Right', currentClub: 'Aucun',
          bio: 'Gardien de but prometteur, excellents réflexes et bonne lecture du jeu.',
          stats: { create: { speed: 55, technique: 50, endurance: 75, passing: 60, shooting: 30, dribbling: 40, defending: 85, physical: 82, matchesPlayed: 30, goals: 0, assists: 1 } }
        }
      }
    },
    {
      email: 'sami.cherif@email.com', password, role: 'PLAYER',
      playerProfile: {
        create: {
          firstName: 'Sami', lastName: 'Cherif',
          dateOfBirth: '2010-09-12', city: 'Tunis', region: 'Tunis',
          height: 165, weight: 58, position: 'CAM',
          preferredFoot: 'Right', currentClub: 'Club Africain (Cadets)',
          bio: 'Jeune milieu offensif agile avec une excellente technique individuelle.',
          parentName: 'Hedi Cherif',
          parentNationalId: '09876543',
          parentPhone: '+216 98 765 432',
          parentEmail: 'hedi.cherif@email.com',
          parentalConsent: true,
          stats: { create: { speed: 78, technique: 84, endurance: 70, passing: 80, shooting: 72, dribbling: 82, defending: 45, physical: 55, matchesPlayed: 25, goals: 12, assists: 18 } }
        }
      }
    }
  ];

  for (const playerData of players) {
    await prisma.user.create({ data: playerData });
  }
  console.log(`✅ ${players.length} joueurs créés`);

  // ====== SCOUT ======
  const scout = await prisma.user.create({
    data: {
      email: 'scout@scoutini.tn', password, role: 'SCOUT',
      scoutProfile: {
        create: {
          name: 'Mohamed Gharbi',
          organization: 'Scoutini Pro',
          city: 'Tunis', region: 'Tunis',
          bio: 'Scout professionnel avec 10 ans d\'expérience dans le football tunisien.',
          verified: true
        }
      }
    }
  });
  console.log('✅ 1 scout créé');

  // ====== CLUB ======
  await prisma.user.create({
    data: {
      email: 'club@est.tn', password, role: 'CLUB',
      scoutProfile: {
        create: {
          name: 'Espérance Sportive de Tunis',
          organization: 'EST',
          city: 'Tunis', region: 'Tunis',
          bio: 'Club le plus titré de Tunisie, à la recherche de jeunes talents.',
          verified: true
        }
      }
    }
  });
  console.log('✅ 1 club créé');

  // ====== ACADÉMIE ======
  await prisma.user.create({
    data: {
      email: 'academie@starsport.tn', password, role: 'ACADEMY',
      scoutProfile: {
        create: {
          name: 'Star Sport Academy',
          organization: 'Star Sport',
          city: 'La Marsa', region: 'Tunis',
          bio: 'Académie de formation de jeunes footballeurs depuis 2015.',
          verified: false
        }
      }
    }
  });
  console.log('✅ 1 académie créée');

  // ====== FAVORIS ======
  const allPlayers = await prisma.playerProfile.findMany({ take: 3 });
  for (const player of allPlayers) {
    await prisma.favorite.create({
      data: { scoutId: scout.id, playerId: player.id }
    });
  }
  console.log('✅ 3 favoris créés');

  // ====== DEMANDE D'ESSAI ======
  const firstPlayer = await prisma.playerProfile.findFirst();
  if (firstPlayer) {
    await prisma.trialRequest.create({
      data: {
        fromId: scout.id,
        playerId: firstPlayer.id,
        message: 'Bonjour, nous aimerions vous voir en essai avec notre équipe la semaine prochaine. Êtes-vous disponible ?'
      }
    });
    console.log('✅ 1 demande d\'essai créée');
  }

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('');
  console.log('📋 Comptes de test (mot de passe: password123):');
  console.log('   Joueur:   ahmed.bensaid@email.com');
  console.log('   Scout:    scout@scoutini.tn');
  console.log('   Club:     club@est.tn');
  console.log('   Académie: academie@starsport.tn');
}

main()
  .catch((e) => {
    console.error('Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
