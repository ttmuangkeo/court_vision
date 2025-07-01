const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlayerHeadshots() {
  try {
    console.log('Checking player headshots...\n');
    
    // Get all players with headshots
    const playersWithHeadshots = await prisma.player.findMany({
      where: {
        headshot: {
          not: null
        }
      },
      select: {
        espnId: true,
        fullName: true,
        headshot: true
      },
      take: 10
    });
    
    console.log(`Found ${playersWithHeadshots.length} players with headshots:`);
    playersWithHeadshots.forEach(player => {
      console.log(`- ${player.fullName} (${player.espnId}): ${player.headshot}`);
    });
    
    // Get total count of players
    const totalPlayers = await prisma.player.count();
    const playersWithoutHeadshots = await prisma.player.count({
      where: {
        headshot: null
      }
    });
    
    console.log(`\nTotal players: ${totalPlayers}`);
    console.log(`Players with headshots: ${totalPlayers - playersWithoutHeadshots}`);
    console.log(`Players without headshots: ${playersWithoutHeadshots}`);
    
    // Check a specific user's favorite players
    const users = await prisma.user.findMany({
      take: 1,
      include: {
        favoritePlayers: {
          select: {
            espnId: true,
            fullName: true,
            headshot: true
          }
        }
      }
    });
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`\nUser ${user.email} favorite players:`);
      user.favoritePlayers.forEach(player => {
        console.log(`- ${player.fullName} (${player.espnId}): ${player.headshot || 'NO HEADSHOT'}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking player headshots:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlayerHeadshots(); 