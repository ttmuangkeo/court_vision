const PlayerStatsSyncService = require('../services/espn/playerStatsSyncService');
const runAthleteSync = require('./sync-all-athletes');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class AutomatedPlayerStatsSync {
  constructor() {
    this.statsService = new PlayerStatsSyncService();
    this.prisma = new PrismaClient();
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  async run() {
    const startTime = new Date();
    const logEntry = {
      timestamp: startTime.toISOString(),
      type: 'automated_sync',
      status: 'started'
    };

    try {
      console.log(`[${startTime.toISOString()}] 🏀 Starting automated player stats sync...`);
      
      // --- NEW: Sync athletes first ---
      console.log(`[${startTime.toISOString()}] 👥 Syncing NBA athletes from Core API...`);
      await runAthleteSync();
      console.log(`[${startTime.toISOString()}] ✅ Athlete sync complete.`);
      // --- END NEW ---
      
      // Check if it's offseason
      const isOffseason = await this.checkIfOffseason();
      
      if (isOffseason) {
        console.log(`[${startTime.toISOString()}] 📅 NBA offseason detected - no games expected`);
        logEntry.offseason = true;
        logEntry.message = 'Offseason detected - no games to sync';
        
        // Still run sync to check for any available data
        const result = await this.statsService.syncRecentGamesFromScoreboard();
        
        if (result.gamesProcessed === 0) {
          console.log(`[${startTime.toISOString()}] ✅ Confirmed: No games available during offseason`);
          logEntry.result = {
            gamesProcessed: 0,
            totalSynced: 0,
            totalErrors: 0,
            offseason: true
          };
        } else {
          console.log(`[${startTime.toISOString()}] ⚠️  Unexpected: Found ${result.gamesProcessed} games during offseason`);
          logEntry.result = result;
          logEntry.offseason = false;
        }
      } else {
        console.log(`[${startTime.toISOString()}] 🏆 NBA season active - syncing recent games`);
        logEntry.offseason = false;
        
        // Sync recent games from scoreboard
        const result = await this.statsService.syncRecentGamesFromScoreboard();
        
        console.log(`[${startTime.toISOString()}] 📊 Sync completed:`);
        console.log(`  - Games processed: ${result.gamesProcessed}`);
        console.log(`  - Stats synced: ${result.totalSynced}`);
        console.log(`  - Errors: ${result.totalErrors}`);
        
        logEntry.result = result;
      }

      // Get database summary
      const summary = await this.getStatsSummary();
      logEntry.databaseSummary = summary;
      
      // Log the result
      await this.logSyncResult(logEntry);
      
      const endTime = new Date();
      const duration = endTime - startTime;
      
      console.log(`[${endTime.toISOString()}] ✅ Automated sync completed in ${duration}ms`);
      console.log(`[${endTime.toISOString()}] 📈 Database stats: ${summary.totalStats} total stats, ${summary.uniquePlayers} players, ${summary.uniqueGames} games`);
      
      return logEntry;
      
    } catch (error) {
      const errorTime = new Date();
      console.error(`[${errorTime.toISOString()}] ❌ Automated sync failed:`, error.message);
      
      logEntry.status = 'error';
      logEntry.error = error.message;
      logEntry.errorStack = error.stack;
      
      await this.logSyncResult(logEntry);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async checkIfOffseason() {
    try {
      // Get current date
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentDay = now.getDate();
      
      // NBA season typically runs from October to June
      // Offseason: July, August, September
      // Regular season: October to April
      // Playoffs: April to June
      
      if (currentMonth >= 7 && currentMonth <= 9) {
        return true; // July, August, September
      }
      
      // Check if we're in the early part of October (season might not have started)
      if (currentMonth === 10 && currentDay < 15) {
        return true; // Early October
      }
      
      // Check if we're in late June (season might be over)
      if (currentMonth === 6 && currentDay > 20) {
        return true; // Late June
      }
      
      return false;
    } catch (error) {
      console.error('Error checking offseason status:', error.message);
      return false; // Default to season active if we can't determine
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
      
      // Get most recent stats
      const recentStats = await this.prisma.playerGameStat.findMany({
        take: 3,
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

  async logSyncResult(logEntry) {
    try {
      const logFile = path.join(this.logDir, `player-stats-sync-${new Date().toISOString().split('T')[0]}.log`);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
      
      // Also log to console for immediate visibility
      if (logEntry.status === 'error') {
        console.error(`[${logEntry.timestamp}] ❌ Sync failed: ${logEntry.error}`);
      } else if (logEntry.offseason) {
        console.log(`[${logEntry.timestamp}] 📅 Offseason sync: ${logEntry.message}`);
      } else {
        console.log(`[${logEntry.timestamp}] ✅ Sync successful: ${logEntry.result.totalSynced} stats synced`);
      }
    } catch (error) {
      console.error('Error logging sync result:', error.message);
    }
  }

  async getRecentLogs(limit = 10) {
    try {
      const logFile = path.join(this.logDir, `player-stats-sync-${new Date().toISOString().split('T')[0]}.log`);
      
      if (!fs.existsSync(logFile)) {
        return [];
      }
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.trim().split('\n').filter(line => line.length > 0);
      
      return logLines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(log => log !== null)
        .slice(-limit);
    } catch (error) {
      console.error('Error reading recent logs:', error.message);
      return [];
    }
  }
}

// If run directly, execute the sync
if (require.main === module) {
  const sync = new AutomatedPlayerStatsSync();
  sync.run()
    .then(async (result) => {
      console.log('\n=== AUTOMATED SYNC COMPLETE ===');
      
      if (result.offseason) {
        console.log('📅 NBA Offseason Mode');
        console.log('   - No games expected during offseason');
        console.log('   - Sync will continue to run to check for any available data');
        console.log('   - Regular sync will resume when season starts');
      } else {
        console.log('🏆 NBA Season Mode');
        console.log(`   - Games processed: ${result.result.gamesProcessed}`);
        console.log(`   - Stats synced: ${result.result.totalSynced}`);
        console.log(`   - Errors: ${result.result.totalErrors}`);
      }
      
      if (result.databaseSummary) {
        console.log(`\n📊 Database Summary:`);
        console.log(`   - Total stats: ${result.databaseSummary.totalStats}`);
        console.log(`   - Unique players: ${result.databaseSummary.uniquePlayers}`);
        console.log(`   - Unique games: ${result.databaseSummary.uniqueGames}`);
        
        if (result.databaseSummary.recentStats.length > 0) {
          console.log(`\n📈 Recent Activity:`);
          result.databaseSummary.recentStats.forEach(stat => {
            console.log(`   - ${stat.player}: ${stat.points} pts (${stat.game})`);
          });
        }
      }
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Automated sync failed:', error);
      process.exit(1);
    });
}

module.exports = AutomatedPlayerStatsSync; 