const PlayerStatsSyncService = require('../services/espn/playerStatsSyncService');

async function syncRecentPlayerStats() {
  const statsService = new PlayerStatsSyncService();
  
  try {
    console.log('Starting sync of recent player stats from scoreboard...\n');
    
    // Sync recent games from scoreboard
    const result = await statsService.syncRecentGamesFromScoreboard();
    
    console.log('\n=== SYNC SUMMARY ===');
    console.log(`Games processed: ${result.gamesProcessed}`);
    console.log(`Total player stats synced: ${result.totalSynced}`);
    console.log(`Total errors: ${result.totalErrors}`);
    
    if (result.totalSynced > 0) {
      // Get some stats about what we synced
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const totalStats = await prisma.playerGameStat.count();
      const uniquePlayers = await prisma.playerGameStat.groupBy({
        by: ['playerId'],
        _count: {
          playerId: true
        }
      });
      
      const uniqueGames = await prisma.playerGameStat.groupBy({
        by: ['gameId'],
        _count: {
          gameId: true
        }
      });
      
      console.log(`\n=== DATABASE STATS ===`);
      console.log(`Total player game stats in database: ${totalStats}`);
      console.log(`Unique players with stats: ${uniquePlayers.length}`);
      console.log(`Unique games with player stats: ${uniqueGames.length}`);
      
      // Show some sample stats
      const sampleStats = await prisma.playerGameStat.findMany({
        take: 5,
        include: {
          player: {
            select: {
              name: true
            }
          },
          game: {
            select: {
              date: true,
              homeTeam: true,
              awayTeam: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`\n=== SAMPLE STATS ===`);
      sampleStats.forEach(stat => {
        const gameDate = stat.game.date.toISOString().split('T')[0];
        console.log(`${stat.player.name}: ${stat.points} pts, ${stat.rebounds} reb, ${stat.assists} ast (${stat.game.awayTeam} @ ${stat.game.homeTeam} on ${gameDate})`);
      });
      
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('Sync failed:', error.message);
  }
}

syncRecentPlayerStats(); 