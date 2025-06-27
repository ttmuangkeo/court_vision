const PlayerStatsSyncService = require('../services/espn/playerStatsSyncService');

async function testPlayerStatsSync() {
  const statsService = new PlayerStatsSyncService();
  
  try {
    console.log('Testing player stats sync service...\n');
    
    // Get a recent game ID from the database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const recentGame = await prisma.game.findFirst({
      where: {
        status: 'FINISHED'
      },
      select: {
        espnId: true,
        date: true,
        homeTeam: true,
        awayTeam: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    if (!recentGame) {
      console.log('No finished games found in database');
      return;
    }
    
    console.log(`Testing with game ${recentGame.espnId} (${recentGame.awayTeam} @ ${recentGame.homeTeam} on ${recentGame.date.toISOString().split('T')[0]})`);
    
    // Test fetching game leaders
    console.log('\n1. Testing fetchGameLeaders...');
    const leaders = await statsService.fetchGameLeaders(recentGame.espnId);
    console.log(`Found ${leaders.length} player stats from leaders`);
    
    if (leaders.length > 0) {
      console.log('Sample stats:');
      leaders.slice(0, 3).forEach((stat, index) => {
        console.log(`  ${index + 1}. Player ${stat.playerId}: ${stat.points} pts, ${stat.rebounds} reb, ${stat.assists} ast`);
      });
    }
    
    // Test syncing a single game
    console.log('\n2. Testing syncGamePlayerStats...');
    const result = await statsService.syncGamePlayerStats(recentGame.espnId);
    console.log(`Sync result: ${result.synced} synced, ${result.errors} errors`);
    
    // Check what was actually saved
    if (result.synced > 0) {
      const savedStats = await prisma.playerGameStat.findMany({
        where: {
          gameId: recentGame.espnId
        },
        include: {
          player: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log(`\nSaved stats in database:`);
      savedStats.forEach(stat => {
        console.log(`  ${stat.player.name}: ${stat.points} pts, ${stat.rebounds} reb, ${stat.assists} ast`);
      });
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPlayerStatsSync(); 