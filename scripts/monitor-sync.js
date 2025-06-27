#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

class SyncMonitor {
  constructor() {
    this.prisma = new PrismaClient();
    this.logDir = path.join(__dirname, '../logs');
  }

  async run() {
    console.log('🏀 Court Vision - Sync Monitor');
    console.log('=' .repeat(50));
    
    try {
      // Check database status
      await this.checkDatabaseStatus();
      
      // Check recent sync activity
      await this.checkRecentSyncs();
      
      // Check cron jobs
      await this.checkCronJobs();
      
      // Check log files
      await this.checkLogFiles();
      
      // Check offseason status
      await this.checkOffseasonStatus();
      
    } catch (error) {
      console.error('❌ Monitor error:', error.message);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async checkDatabaseStatus() {
    console.log('\n📊 Database Status:');
    
    try {
      const totalStats = await this.prisma.playerGameStat.count();
      const totalGames = await this.prisma.game.count();
      const totalPlayers = await this.prisma.player.count();
      
      console.log(`  - Player stats: ${totalStats.toLocaleString()}`);
      console.log(`  - Games: ${totalGames.toLocaleString()}`);
      console.log(`  - Players: ${totalPlayers.toLocaleString()}`);
      
      // Get recent activity
      const recentStats = await this.prisma.playerGameStat.findMany({
        take: 5,
        include: {
          player: { select: { name: true } },
          game: { select: { date: true, homeTeam: true, awayTeam: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (recentStats.length > 0) {
        console.log(`  - Latest sync: ${recentStats[0].createdAt.toLocaleString()}`);
        console.log(`  - Recent game: ${recentStats[0].game.awayTeam} @ ${recentStats[0].game.homeTeam}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Database error: ${error.message}`);
    }
  }

  async checkRecentSyncs() {
    console.log('\n🔄 Recent Sync Activity:');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `player-stats-sync-${today}.log`);
      
      if (!fs.existsSync(logFile)) {
        console.log('  - No sync logs found today');
        return;
      }
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.trim().split('\n').filter(line => line.length > 0);
      
      if (logLines.length === 0) {
        console.log('  - No sync activity today');
        return;
      }
      
      // Parse last 3 sync entries
      const recentLogs = logLines.slice(-3).map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      }).filter(log => log !== null);
      
      recentLogs.forEach((log, index) => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        const status = log.status === 'error' ? '❌' : '✅';
        const games = log.result?.gamesProcessed || 0;
        const stats = log.result?.totalSynced || 0;
        const offseason = log.offseason ? ' (offseason)' : '';
        
        console.log(`  ${status} ${time} - ${games} games, ${stats} stats${offseason}`);
      });
      
    } catch (error) {
      console.log(`  ❌ Log parsing error: ${error.message}`);
    }
  }

  async checkCronJobs() {
    console.log('\n⏰ Cron Job Status:');
    
    try {
      const { execSync } = require('child_process');
      const cronOutput = execSync('crontab -l 2>/dev/null || echo "No cron jobs"', { encoding: 'utf8' });
      const courtVisionJobs = cronOutput.split('\n').filter(line => 
        line.includes('court_vision') || line.includes('sync-automated')
      );
      
      if (courtVisionJobs.length === 0) {
        console.log('  ⚠️  No Court Vision cron jobs found');
        console.log('  💡 Run: ./scripts/setup-cron-jobs.sh');
      } else {
        courtVisionJobs.forEach((job, index) => {
          console.log(`  ✅ Job ${index + 1}: ${job.trim()}`);
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Cron check error: ${error.message}`);
    }
  }

  async checkLogFiles() {
    console.log('\n📁 Log Files:');
    
    try {
      if (!fs.existsSync(this.logDir)) {
        console.log('  - Log directory not found');
        return;
      }
      
      const files = fs.readdirSync(this.logDir);
      const logFiles = files.filter(file => file.startsWith('player-stats-sync-'));
      
      if (logFiles.length === 0) {
        console.log('  - No sync log files found');
        return;
      }
      
      // Show last 3 log files
      const recentLogs = logFiles
        .sort()
        .slice(-3)
        .map(file => {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          const size = (stats.size / 1024).toFixed(1);
          return { file, size, date: stats.mtime };
        });
      
      recentLogs.forEach(({ file, size, date }) => {
        console.log(`  📄 ${file} (${size}KB, ${date.toLocaleDateString()})`);
      });
      
    } catch (error) {
      console.log(`  ❌ Log file error: ${error.message}`);
    }
  }

  async checkOffseasonStatus() {
    console.log('\n📅 Season Status:');
    
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      
      let isOffseason = false;
      let seasonInfo = '';
      
      if (currentMonth >= 7 && currentMonth <= 9) {
        isOffseason = true;
        seasonInfo = 'Full offseason (July-September)';
      } else if (currentMonth === 10 && currentDay < 15) {
        isOffseason = true;
        seasonInfo = 'Pre-season (Early October)';
      } else if (currentMonth === 6 && currentDay > 20) {
        isOffseason = true;
        seasonInfo = 'Post-season (Late June)';
      } else {
        seasonInfo = 'NBA Season Active';
      }
      
      const icon = isOffseason ? '📅' : '🏆';
      console.log(`  ${icon} ${seasonInfo}`);
      
      if (isOffseason) {
        console.log('  💡 Sync will continue but expect no games');
      } else {
        console.log('  💡 Sync should find games regularly');
      }
      
    } catch (error) {
      console.log(`  ❌ Season check error: ${error.message}`);
    }
  }
}

// Run the monitor
if (require.main === module) {
  const monitor = new SyncMonitor();
  monitor.run()
    .then(() => {
      console.log('\n' + '=' .repeat(50));
      console.log('✅ Monitor complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Monitor failed:', error);
      process.exit(1);
    });
}

module.exports = SyncMonitor; 