const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserFavorites() {
  try {
    console.log('Checking users with favorite players...\n');
    
    // Get users with favorite players
    const users = await prisma.user.findMany({
      where: {
        favoritePlayers: {
          some: {}
        }
      },
      include: {
        favoritePlayers: {
          select: {
            espnId: true,
            fullName: true,
            headshot: true,
            position: true
          }
        }
      }
    });
    
    console.log(`Found ${users.length} users with favorite players:`);
    
    users.forEach(user => {
      console.log(`\nUser: ${user.email} (${user.username})`);
      console.log('Favorite players:');
      user.favoritePlayers.forEach(player => {
        console.log(`  - ${player.fullName} (${player.position}) - Headshot: ${player.headshot ? 'YES' : 'NO'}`);
        if (player.headshot) {
          console.log(`    URL: ${player.headshot}`);
        }
      });
    });
    
    if (users.length === 0) {
      console.log('No users with favorite players found.');
      console.log('Creating a test user with favorite players...');
      
      // Create a test user with some favorite players
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: 'hashedpassword',
          firstName: 'Test',
          lastName: 'User'
        }
      });
      
      // Add some players as favorites
      const players = await prisma.player.findMany({
        where: {
          headshot: {
            not: null
          }
        },
        take: 3
      });
      
      if (players.length > 0) {
        await prisma.user.update({
          where: { id: testUser.id },
          data: {
            favoritePlayers: {
              connect: players.map(p => ({ espnId: p.espnId }))
            }
          }
        });
        
        console.log(`Created test user with ${players.length} favorite players`);
        players.forEach(player => {
          console.log(`  - ${player.fullName}: ${player.headshot}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking user favorites:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserFavorites(); 