const PlayerStatsSyncService = require('../services/espn/playerStatsSyncService');
const { PrismaClient } = require('@prisma/client');

class ScheduledPlayerStatsSync {
  constructor() {
    this.statsService = new PlayerStatsSyncService();
    this.prisma = new PrismaClient();
  }

  async run() {
    try {
      console.log(`[${new Date().toISOString()}] Starting scheduled player stats sync...`);
      
      // Sync recent games from scoreboard
      const result = await this.statsService.syncRecentGamesFromScoreboard();
      
      console.log(`[${new Date().toISOString()}] Sync completed:`);
      console.log(`  - Games processed: ${result.gamesProcessed}`);
      console.log(`  - Stats synced: ${result.totalSynced}`);
      console.log(`  - Errors: ${result.totalErrors}`);
      
      // Log summary to database or file if needed
      await this.logSyncResult(result);
      
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled sync failed:`, error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async logSyncResult(result) {
    try {
      // You could log this to a database table or file
      console.log(`[${new Date().toISOString()}] Sync log:`, {
        timestamp: new Date(),
        gamesProcessed: result.gamesProcessed,
        totalSynced: result.totalSynced,
        totalErrors: result.totalErrors,
        success: result.totalErrors === 0
      });
    } catch (error) {
      console.error('Error logging sync result:', error.message);
    }
  }

  async getStatsSummary() {
    try {
      const totalStats = await this.prisma.playerGameStat.count();
      const uniquePlayers = await this.prisma.playerGameStat.groupBy({
        by: ['playerId'],
        _count: {
          playerId: true
        }
      });
      
      const uniqueGames = await this.prisma.playerGameStat.groupBy({
        by: ['gameId'],
        _count: {
          gameId: true
        }
      });
      
      const recentStats = await this.prisma.playerGameStat.findMany({
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
      
      return {
        totalStats,
        uniquePlayers: uniquePlayers.length,
        uniqueGames: uniqueGames.length,
        recentStats: recentStats.map(stat => ({
          player: stat.player.name,
          game: `${stat.game.awayTeam} @ ${stat.game.homeTeam}`,
          date: stat.game.date,
          points: stat.points,
          rebounds: stat.rebounds,
          assists: stat.assists
        }))
      };
    } catch (error) {
      console.error('Error getting stats summary:', error.message);
      return null;
    }
  }
}

// If run directly, execute the sync
if (require.main === module) {
  const sync = new ScheduledPlayerStatsSync();
  sync.run()
    .then(async (result) => {
      console.log('\n=== SYNC COMPLETE ===');
      const summary = await sync.getStatsSummary();
      if (summary) {
        console.log(`Total player game stats in database: ${summary.totalStats}`);
        console.log(`Unique players with stats: ${summary.uniquePlayers}`);
        console.log(`Unique games with player stats: ${summary.uniqueGames}`);
        
        if (summary.recentStats.length > 0) {
          console.log('\nRecent stats:');
          summary.recentStats.forEach(stat => {
            console.log(`  ${stat.player}: ${stat.points} pts, ${stat.rebounds} reb, ${stat.assists} ast (${stat.game} on ${stat.date.toISOString().split('T')[0]})`);
          });
        }
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('Scheduled sync failed:', error);
      process.exit(1);
    });
}

module.exports = ScheduledPlayerStatsSync; 