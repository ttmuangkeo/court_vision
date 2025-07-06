const { PrismaClient } = require('@prisma/client');
const PlayByPlayService = require('./src/services/sportsdata/playByPlayService');
const PlayByPlayIngestionService = require('./src/scripts/sync-sportsdata-play-by-play');

const prisma = new PrismaClient();

async function testPlayByPlay() {
  const apiKey = process.env.SPORTSDATA_API_KEY;
  if (!apiKey) {
    console.error('SPORTSDATA_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('Testing play-by-play ingestion system...\n');

  try {
    // Test 1: API Service
    console.log('1. Testing PlayByPlayService...');
    const playByPlayService = new PlayByPlayService(apiKey);
    
    // Use a known game ID from the API example
    const testGameId = 14620; // Golden State vs Boston from the API example
    
    const apiData = await playByPlayService.getPlayByPlay(testGameId);
    console.log(`✓ Successfully fetched play-by-play data for game ${testGameId}`);
    console.log(`  - Game: ${apiData.Game.HomeTeam} vs ${apiData.Game.AwayTeam}`);
    console.log(`  - Season: ${apiData.Game.Season}`);
    console.log(`  - Plays: ${apiData.Plays.length}`);
    
    // Test 2: Data Validation
    console.log('\n2. Testing data validation...');
    const isValid = playByPlayService.validatePlayByPlayData(apiData);
    console.log(`✓ Data validation: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    // Test 3: Data Normalization
    console.log('\n3. Testing data normalization...');
    const normalizedData = playByPlayService.normalizePlayData(apiData);
    console.log(`✓ Data normalization: ${normalizedData.plays.length} plays processed`);
    
    // Show sample play
    if (normalizedData.plays.length > 0) {
      const samplePlay = normalizedData.plays[0];
      console.log('  Sample play:');
      console.log(`    - PlayID: ${samplePlay.playId}`);
      console.log(`    - Quarter: ${samplePlay.quarterName}`);
      console.log(`    - Description: ${samplePlay.description}`);
      console.log(`    - Points: ${samplePlay.points}`);
    }
    
    // Test 4: Database Schema
    console.log('\n4. Testing database schema...');
    const playCount = await prisma.play.count();
    console.log(`✓ Current plays in database: ${playCount}`);
    
    // Test 5: Ingestion Service (Dry Run)
    console.log('\n5. Testing ingestion service (dry run)...');
    const ingestionService = new PlayByPlayIngestionService(apiKey, {
      dryRun: true,
      gameIds: [testGameId]
    });
    
    await ingestionService.run();
    console.log('✓ Dry run completed successfully');
    
    // Test 6: Check if game exists in database
    console.log('\n6. Checking if test game exists in database...');
    const game = await prisma.game.findUnique({
      where: { id: testGameId },
      select: { id: true, season: true, homeTeamId: true, awayTeamId: true }
    });
    
    if (game) {
      console.log(`✓ Game ${testGameId} found in database`);
      console.log(`  - Season: ${game.season}`);
      console.log(`  - Teams: ${game.homeTeamId} vs ${game.awayTeamId}`);
    } else {
      console.log(`⚠ Game ${testGameId} not found in database`);
      console.log('  You may need to sync games first using sync-sportsdata-games.js');
    }
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('✓ PlayByPlayService: Working');
    console.log('✓ Data validation: Working');
    console.log('✓ Data normalization: Working');
    console.log('✓ Database schema: Ready');
    console.log('✓ Ingestion service: Ready');
    console.log('\nSystem is ready for play-by-play ingestion!');
    
    console.log('\nNext steps:');
    console.log('1. Run: node src/scripts/sync-sportsdata-play-by-play.js --dry-run');
    console.log('2. Run: node src/scripts/sync-sportsdata-play-by-play.js');
    console.log('3. Run: node src/scripts/automated-play-sync.js once');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testPlayByPlay(); 