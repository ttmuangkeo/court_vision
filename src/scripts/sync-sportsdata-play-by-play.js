const { PrismaClient } = require('@prisma/client');
const PlayByPlayService = require('../services/sportsdata/playByPlayService');

const prisma = new PrismaClient();

class PlayByPlayIngestionService {
  constructor(apiKey, options = {}) {
    this.playByPlayService = new PlayByPlayService(apiKey);
    this.options = {
      batchSize: options.batchSize || 1, // Process games one at a time for rate limiting
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      dryRun: options.dryRun || false,
      season: options.season || null, // Filter by season
      gameIds: options.gameIds || null, // Specific game IDs to process
      ...options
    };
  }

  /**
   * Get games to process based on filters
   */
  async getGamesToProcess() {
    const where = {};
    
    if (this.options.season) {
      where.season = this.options.season;
    }
    
    if (this.options.gameIds) {
      where.id = { in: this.options.gameIds };
    }

    // Only get games that are finished and don't have plays yet
    where.status = 'Final';
    
    const games = await prisma.game.findMany({
      where,
      select: {
        id: true,
        season: true,
        status: true,
        dateTime: true,
        homeTeamId: true,
        awayTeamId: true
      },
      orderBy: {
        dateTime: 'desc'
      }
    });

    console.log(`Found ${games.length} games to process`);
    return games;
  }

  /**
   * Check if game already has plays
   */
  async gameHasPlays(gameId) {
    const playCount = await prisma.play.count({
      where: { gameId }
    });
    return playCount > 0;
  }

  /**
   * Ingest plays for a single game
   */
  async ingestGamePlays(gameId, gameData) {
    try {
      console.log(`Processing game ${gameId}...`);
      
      // Check if game already has plays
      if (await this.gameHasPlays(gameId)) {
        console.log(`Game ${gameId} already has plays, skipping...`);
        return { success: true, skipped: true, reason: 'already_has_plays' };
      }

      // Get play-by-play data from API
      const apiData = await this.playByPlayService.getPlayByPlay(gameId);
      const normalizedData = this.playByPlayService.normalizePlayData(apiData);

      if (this.options.dryRun) {
        console.log(`[DRY RUN] Would ingest ${normalizedData.plays.length} plays for game ${gameId}`);
        return { success: true, dryRun: true, playCount: normalizedData.plays.length };
      }

      // Ingest plays in batches
      const playCount = await this.ingestPlaysBatch(gameId, normalizedData.plays, gameData.season);
      
      console.log(`Successfully ingested ${playCount} plays for game ${gameId}`);
      return { success: true, playCount };

    } catch (error) {
      console.error(`Error ingesting plays for game ${gameId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ingest plays in batches to avoid memory issues
   */
  async ingestPlaysBatch(gameId, plays, season, batchSize = 100) {
    let totalIngested = 0;
    
    for (let i = 0; i < plays.length; i += batchSize) {
      const batch = plays.slice(i, i + batchSize);
      
      const playData = batch.map(play => ({
        playId: play.playId,
        quarterId: play.quarterId,
        quarterName: play.quarterName,
        sequence: play.sequence,
        season: season,
        timeRemainingMinutes: play.timeRemainingMinutes,
        timeRemainingSeconds: play.timeRemainingSeconds,
        awayTeamScore: play.awayTeamScore,
        homeTeamScore: play.homeTeamScore,
        potentialPoints: play.potentialPoints,
        points: play.points,
        shotMade: play.shotMade,
        category: play.category,
        type: play.type,
        teamId: play.teamId,
        team: play.team,
        opponentId: play.opponentId,
        opponent: play.opponent,
        receivingTeamId: play.receivingTeamId,
        receivingTeam: play.receivingTeam,
        description: play.description,
        playerId: play.playerId,
        assistedByPlayerId: play.assistedByPlayerId,
        blockedByPlayerId: play.blockedByPlayerId,
        fastBreak: play.fastBreak,
        sideOfBasket: play.sideOfBasket,
        substituteInPlayerId: play.substituteInPlayerId,
        substituteOutPlayerId: play.substituteOutPlayerId,
        awayPlayerId: play.awayPlayerId,
        homePlayerId: play.homePlayerId,
        receivingPlayerId: play.receivingPlayerId,
        baselineOffsetPercentage: play.baselineOffsetPercentage,
        sidelineOffsetPercentage: play.sidelineOffsetPercentage,
        coordinates: play.coordinates,
        stolenByPlayerId: play.stolenByPlayerId,
        gameId: gameId,
        gameTime: `${play.timeRemainingMinutes}:${play.timeRemainingSeconds.toString().padStart(2, '0')}`,
        quarter: parseInt(play.quarterName),
        createdById: 'demo-user-1', // Use demo user for API imports
        isVerified: true // Mark as verified since it's from official API
      }));

      // Use upsert to handle duplicates
      const upsertPromises = playData.map(play => 
        prisma.play.upsert({
          where: { playId: play.playId },
          update: play,
          create: play
        })
      );

      const results = await Promise.all(upsertPromises);
      totalIngested += results.length;
      
      console.log(`  Ingested batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(plays.length / batchSize)} (${results.length} plays)`);
    }

    return totalIngested;
  }

  /**
   * Main ingestion process
   */
  async run() {
    console.log('Starting play-by-play ingestion...');
    console.log('Options:', this.options);

    try {
      // Get games to process
      const games = await this.getGamesToProcess();
      
      if (games.length === 0) {
        console.log('No games found to process');
        return;
      }

      // Filter out games that already have plays
      const gamesToProcess = [];
      for (const game of games) {
        if (!(await this.gameHasPlays(game.id))) {
          gamesToProcess.push(game);
        }
      }

      console.log(`${gamesToProcess.length} games need play-by-play data`);

      // Process games in batches
      const results = {
        total: gamesToProcess.length,
        successful: 0,
        failed: 0,
        skipped: 0,
        totalPlays: 0,
        errors: []
      };

      for (let i = 0; i < gamesToProcess.length; i += this.options.batchSize) {
        const batch = gamesToProcess.slice(i, i + this.options.batchSize);
        
        const batchPromises = batch.map(game => 
          this.ingestGamePlays(game.id, game)
        );

        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(result => {
          if (result.success) {
            if (result.skipped) {
              results.skipped++;
            } else if (result.dryRun) {
              results.totalPlays += result.playCount || 0;
            } else {
              results.successful++;
              results.totalPlays += result.playCount || 0;
            }
          } else {
            results.failed++;
            results.errors.push(result.error);
          }
        });

        console.log(`Progress: ${Math.min(i + this.options.batchSize, gamesToProcess.length)}/${gamesToProcess.length} games processed`);
      }

      // Print summary
      console.log('\n=== INGESTION SUMMARY ===');
      console.log(`Total games: ${results.total}`);
      console.log(`Successful: ${results.successful}`);
      console.log(`Failed: ${results.failed}`);
      console.log(`Skipped: ${results.skipped}`);
      console.log(`Total plays ingested: ${results.totalPlays}`);
      
      if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

    } catch (error) {
      console.error('Fatal error during ingestion:', error);
      throw error;
    }
  }

  /**
   * Archive old seasons to improve performance
   */
  async archiveOldSeasons(seasonsToArchive) {
    console.log(`Archiving seasons: ${seasonsToArchive.join(', ')}`);
    
    // This would involve moving data to archive tables or partitions
    // Implementation depends on your specific archiving strategy
    console.log('Archive functionality not yet implemented');
  }
}

// CLI interface
async function main() {
  const apiKey = process.env.SPORTSDATA_API_KEY;
  if (!apiKey) {
    console.error('SPORTSDATA_API_KEY environment variable is required');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    season: args.find(arg => arg.startsWith('--season='))?.split('=')[1],
    gameIds: args.find(arg => arg.startsWith('--game-ids='))?.split('=')[1]?.split(',').map(Number),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 1
  };

  const ingestionService = new PlayByPlayIngestionService(apiKey, options);
  
  try {
    await ingestionService.run();
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PlayByPlayIngestionService; 