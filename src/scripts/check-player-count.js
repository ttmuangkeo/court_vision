const { PrismaClient } = require('@prisma/client');

async function checkPlayerCount() {
  const prisma = new PrismaClient();
  
  try {
    const totalPlayers = await prisma.player.count();
    console.log('📊 Database Status:');
    console.log(`Total players in database: ${totalPlayers}`);
    
    const activePlayers = await prisma.player.count({
      where: { active: true }
    });
    const inactivePlayers = await prisma.player.count({
      where: { active: false }
    });
    
    console.log(`Active players: ${activePlayers}`);
    console.log(`Inactive players: ${inactivePlayers}`);
    
    // Check for duplicates by espnId
    const duplicateCheck = await prisma.$queryRaw`
      SELECT "espnId", COUNT(*) as count 
      FROM players 
      GROUP BY "espnId" 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateCheck.length > 0) {
      console.log('\n⚠️  Found duplicate espnIds:');
      duplicateCheck.forEach(dup => {
        console.log(`  - ${dup.espnId}: ${dup.count} records`);
      });
    } else {
      console.log('\n✅ No duplicate espnIds found');
    }
    
    // Show some recent players
    const recentPlayers = await prisma.player.findMany({
      take: 10,
      orderBy: { lastSynced: 'desc' },
      select: {
        name: true,
        espnId: true,
        active: true,
        lastSynced: true
      }
    });
    
    console.log('\n📈 Most recently synced players:');
    recentPlayers.forEach(player => {
      console.log(`  - ${player.name} (ID: ${player.espnId}) - ${player.active ? 'Active' : 'Inactive'} - ${player.lastSynced}`);
    });
    
    // Check if we have players from the old sync
    const oldPlayers = await prisma.player.findMany({
      where: {
        lastSynced: {
          lt: new Date('2025-06-27T03:30:00.000Z') // Before the new sync
        }
      },
      take: 5,
      select: {
        name: true,
        espnId: true,
        lastSynced: true
      }
    });
    
    if (oldPlayers.length > 0) {
      console.log('\n📅 Players from previous syncs:');
      oldPlayers.forEach(player => {
        console.log(`  - ${player.name} (ID: ${player.espnId}) - ${player.lastSynced}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking player count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlayerCount(); 