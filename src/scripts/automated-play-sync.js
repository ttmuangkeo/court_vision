const { PrismaClient } = require('@prisma/client');
const PlayByPlayIngestionService = require('./sync-sportsdata-play-by-play');
const PlayPartitioningService = require('./play-partitioning');

const prisma = new PrismaClient();

class AutomatedPlaySync {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.options = {
      syncInterval: options.syncInterval || 30 * 60 * 1000, // 30 minutes
      maxGamesPerRun: options.maxGamesPerRun || 10,
      archiveAfterDays: options.archiveAfterDays || 365, // Archive after 1 year
      enablePartitioning: options.enablePartitioning !== false,
      ...options
    };
    
    this.ingestionService = new PlayByPlayIngestionService(apiKey, {
      batchSize: 1, // Process one game at a time for rate limiting
      maxRetries: 3
    });
    
    this.partitioningService = new PlayPartitioningService({
      archiveThreshold: 1 // Archive seasons older than 1 year
    });
  }

  /**
   * Get current NBA season automatically
   */
  getCurrentSeason() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // NBA season typically starts in October
    // If we're in October or later, we're in the next year's season
    if (month >= 10) {
      return year + 1; // Next year's season
    } else {
      return year; // Current year's season
    }
  }

  /**
   * Get recent games that need play-by-play data (automatically detects season)
   */
  async getRecentGamesNeedingPlays() {
    const currentSeason = this.getCurrentSeason();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Look back 7 days
    
    const games = await prisma.game.findMany({
      where: {
        status: 'Final',
        season: currentSeason, // Automatically use current season
        dateTime: {
          gte: cutoffDate
        }
      },
      select: {
        id: true,
        season: true,
        dateTime: true,
        homeTeamId: true,
        awayTeamId: true
      },
      orderBy: {
        dateTime: 'desc'
      },
      take: this.options.maxGamesPerRun
    });

    // Filter out games that already have plays
    const gamesNeedingPlays = [];
    for (const game of games) {
      const hasPlays = await prisma.play.count({
        where: { gameId: game.id }
      }) > 0;
      
      if (!hasPlays) {
        gamesNeedingPlays.push(game);
      }
    }

    return gamesNeedingPlays;
  }

  /**
   * Get games with missing or incomplete play data (automatically detects season)
   */
  async getGamesWithIncompletePlays() {
    const currentSeason = this.getCurrentSeason();
    
    // Find games that have very few plays (might be incomplete)
    const gamesWithFewPlays = await prisma.$queryRaw`
      SELECT 
        g.id,
        g.season,
        g."dateTime",
        COUNT(p.id) as play_count
      FROM games g
      LEFT JOIN plays p ON g.id = p."gameId"
      WHERE g.status = 'Final' 
        AND g.season = ${currentSeason}
      GROUP BY g.id, g.season, g."dateTime"
      HAVING COUNT(p.id) < 50  -- Games with less than 50 plays might be incomplete
      ORDER BY g."dateTime" DESC
      LIMIT ${this.options.maxGamesPerRun}
    `;

    return gamesWithFewPlays;
  }

  /**
   * Run incremental sync (automatically detects season)
   */
  async runIncrementalSync() {
    const currentSeason = this.getCurrentSeason();
    console.log(`Starting incremental play-by-play sync for season ${currentSeason}...`);
    
    try {
      // Get recent games needing plays
      const recentGames = await this.getRecentGamesNeedingPlays();
      console.log(`Found ${recentGames.length} recent games needing plays for season ${currentSeason}`);
      
      // Get games with incomplete plays
      const incompleteGames = await this.getGamesWithIncompletePlays();
      console.log(`Found ${incompleteGames.length} games with potentially incomplete plays for season ${currentSeason}`);
      
      // Combine and deduplicate
      const allGameIds = [...new Set([
        ...recentGames.map(g => g.id),
        ...incompleteGames.map(g => g.id)
      ])];
      
      if (allGameIds.length === 0) {
        console.log(`No games need play-by-play sync for season ${currentSeason}`);
        return { synced: 0, errors: [], season: currentSeason };
      }
      
      // Run sync for these games
      const results = [];
      for (const gameId of allGameIds) {
        const game = recentGames.find(g => g.id === gameId) || incompleteGames.find(g => g.id === gameId);
        const result = await this.ingestionService.ingestGamePlays(gameId, {
          season: currentSeason
        });
        results.push(result);
      }
      
      return {
        synced: allGameIds.length,
        results,
        season: currentSeason
      };
      
    } catch (error) {
      console.error('Incremental sync failed:', error);
      throw error;
    }
  }

  /**
   * Run archival process
   */
  async runArchival() {
    if (!this.options.enablePartitioning) {
      console.log('Partitioning disabled, skipping archival');
      return;
    }
    
    console.log('Running archival process...');
    
    try {
      const results = await this.partitioningService.archiveOldSeasons();
      console.log(`Archived ${results.length} seasons`);
      return results;
      
    } catch (error) {
      console.error('Archival failed:', error);
      throw error;
    }
  }

  /**
   * Run optimization
   */
  async runOptimization() {
    console.log('Running database optimization...');
    
    try {
      await this.partitioningService.optimizePlaysTable();
      console.log('Optimization complete');
      
    } catch (error) {
      console.error('Optimization failed:', error);
      throw error;
    }
  }

  /**
   * Generate sync report
   */
  async generateReport() {
    console.log('\n=== AUTOMATED SYNC REPORT ===');
    
    // Play statistics
    const playStats = await prisma.play.groupBy({
      by: ['season'],
      _count: { id: true },
      orderBy: { season: 'desc' }
    });
    
    console.log('\nPlays by Season:');
    playStats.forEach(stat => {
      console.log(`  ${stat.season}: ${stat._count.id.toLocaleString()} plays`);
    });
    
    // Recent games without plays
    const recentGamesWithoutPlays = await this.getRecentGamesNeedingPlays();
    console.log(`\nRecent games without plays: ${recentGamesWithoutPlays.length}`);
    
    // Incomplete games
    const incompleteGames = await this.getGamesWithIncompletePlays();
    console.log(`Games with incomplete plays: ${incompleteGames.length}`);
    
    // Archive status
    const archiveStats = await this.partitioningService.getArchiveStats();
    console.log(`\nArchive tables: ${archiveStats.length}`);
  }

  /**
   * Main sync loop
   */
  async startSyncLoop() {
    console.log('Starting automated play-by-play sync loop...');
    console.log(`Sync interval: ${this.options.syncInterval / 1000 / 60} minutes`);
    
    let runCount = 0;
    let lastSeason = null;
    
    const runSync = async () => {
      runCount++;
      const currentSeason = this.getCurrentSeason();
      console.log(`\n--- Sync Run #${runCount} ---`);
      console.log(`Time: ${new Date().toISOString()}`);
      console.log(`Season: ${currentSeason}`);
      
      // Check if season has changed
      if (lastSeason && lastSeason !== currentSeason) {
        console.log(`🎉 Season transition detected: ${lastSeason} → ${currentSeason}`);
        console.log('Starting fresh sync for new season...');
      }
      lastSeason = currentSeason;
      
      try {
        // Run incremental sync
        const syncResults = await this.runIncrementalSync();
        console.log(`Sync completed: ${syncResults.synced} games processed for season ${currentSeason}`);
        
        // Run archival (less frequently)
        if (runCount % 48 === 0) { // Every 24 hours (48 * 30 minutes)
          console.log('Running archival process...');
          await this.runArchival();
        }
        
        // Run optimization (even less frequently)
        if (runCount % 336 === 0) { // Every week (336 * 30 minutes)
          console.log('Running database optimization...');
          await this.runOptimization();
        }
        
        // Run full season sync if this is the first run of a new season
        if (runCount === 1 || (lastSeason && lastSeason !== currentSeason)) {
          console.log('Running full season sync for new season...');
          await this.syncCurrentSeason();
        }
        
      } catch (error) {
        console.error(`Sync run #${runCount} failed:`, error);
      }
    };
    
    // Run initial sync
    await runSync();
    
    // Set up interval
    setInterval(runSync, this.options.syncInterval);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down automated sync...');
      await prisma.$disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\nShutting down automated sync...');
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  /**
   * Sync all games for the current season
   */
  async syncCurrentSeason() {
    const currentSeason = this.getCurrentSeason();
    console.log(`Starting full season sync for ${currentSeason}...`);
    
    try {
      // Get all games for current season that don't have plays
      const games = await prisma.game.findMany({
        where: {
          season: currentSeason,
          status: 'Final'
        },
        select: {
          id: true,
          season: true,
          dateTime: true,
          homeTeamId: true,
          awayTeamId: true
        },
        orderBy: {
          dateTime: 'desc'
        }
      });

      // Filter out games that already have plays
      const gamesNeedingPlays = [];
      for (const game of games) {
        const hasPlays = await prisma.play.count({
          where: { gameId: game.id }
        }) > 0;
        
        if (!hasPlays) {
          gamesNeedingPlays.push(game);
        }
      }

      console.log(`Found ${gamesNeedingPlays.length} games needing plays for season ${currentSeason}`);
      
      if (gamesNeedingPlays.length === 0) {
        console.log(`All games for season ${currentSeason} already have plays`);
        return { synced: 0, season: currentSeason };
      }

      // Process in batches to avoid overwhelming the API
      const batchSize = 5; // Process 5 games at a time
      let totalSynced = 0;
      const errors = [];

      for (let i = 0; i < gamesNeedingPlays.length; i += batchSize) {
        const batch = gamesNeedingPlays.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(gamesNeedingPlays.length / batchSize)}`);
        
        for (const game of batch) {
          try {
            const result = await this.ingestionService.ingestGamePlays(game.id, {
              season: currentSeason
            });
            
            if (result.success) {
              totalSynced++;
              console.log(`✅ Synced game ${game.id} (${result.playCount} plays)`);
            } else {
              errors.push(`Game ${game.id}: ${result.error}`);
              console.log(`❌ Failed to sync game ${game.id}: ${result.error}`);
            }
          } catch (error) {
            errors.push(`Game ${game.id}: ${error.message}`);
            console.log(`❌ Error syncing game ${game.id}: ${error.message}`);
          }
        }

        // Add delay between batches to respect rate limits
        if (i + batchSize < gamesNeedingPlays.length) {
          console.log('Waiting 10 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      console.log(`\n=== SEASON ${currentSeason} SYNC COMPLETE ===`);
      console.log(`Total games synced: ${totalSynced}`);
      console.log(`Errors: ${errors.length}`);
      
      if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(error => console.log(`  - ${error}`));
      }

      return {
        synced: totalSynced,
        errors,
        season: currentSeason
      };

    } catch (error) {
      console.error(`Season ${currentSeason} sync failed:`, error);
      throw error;
    }
  }

  /**
   * Run one-time sync (automatically detects season)
   */
  async runOnce() {
    const currentSeason = this.getCurrentSeason();
    console.log(`Running one-time play-by-play sync for season ${currentSeason}...`);
    
    try {
      const syncResults = await this.runIncrementalSync();
      await this.generateReport();
      
      return syncResults;
      
    } catch (error) {
      console.error('One-time sync failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const apiKey = process.env.SPORTSDATA_API_KEY;
  if (!apiKey) {
    console.error('SPORTSDATA_API_KEY environment variable is required');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const command = args[0] || 'once';
  
  const options = {
    syncInterval: parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 30 * 60 * 1000,
    maxGamesPerRun: parseInt(args.find(arg => arg.startsWith('--max-games='))?.split('=')[1]) || 10,
    enablePartitioning: !args.includes('--no-partitioning')
  };
  
  const automatedSync = new AutomatedPlaySync(apiKey, options);
  
  try {
    switch (command) {
      case 'once':
        await automatedSync.runOnce();
        break;
        
      case 'loop':
        await automatedSync.startSyncLoop();
        break;
        
      case 'season':
        await automatedSync.syncCurrentSeason();
        break;
        
      case 'report':
        await automatedSync.generateReport();
        break;
        
      case 'archive':
        await automatedSync.runArchival();
        break;
        
      case 'optimize':
        await automatedSync.runOptimization();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node automated-play-sync.js once          # Sync recent games for current season');
        console.log('  node automated-play-sync.js loop          # Start continuous sync loop');
        console.log('  node automated-play-sync.js season        # Sync ALL games for current season');
        console.log('  node automated-play-sync.js report        # Generate sync report');
        console.log('  node automated-play-sync.js archive       # Archive old seasons');
        console.log('  node automated-play-sync.js optimize      # Optimize database');
        console.log('');
        console.log('Options:');
        console.log('  --interval=1800000    # Sync interval in milliseconds (default: 30 minutes)');
        console.log('  --max-games=10        # Max games per sync run (default: 10)');
        console.log('  --no-partitioning     # Disable automatic archiving');
        console.log('');
        console.log('Examples:');
        console.log('  node automated-play-sync.js season        # Sync entire current season');
        console.log('  node automated-play-sync.js loop --interval=600000  # Sync every 10 minutes');
        break;
    }
  } catch (error) {
    console.error('Automated sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AutomatedPlaySync; 