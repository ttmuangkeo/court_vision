const GameSyncService = require('../services/espn/gameSyncService');

async function testGameSync() {
  try {
    console.log('🧪 Testing ESPN Game Sync Service...\n');
    
    const syncService = new GameSyncService();
    
    // Test 1: Get current sync status
    console.log('📊 Current sync status:');
    const status = await syncService.getSyncStatus();
    console.log(`Total games: ${status.status.total}`);
    console.log(`Synced today: ${status.status.syncedToday}`);
    console.log(`Synced this week: ${status.status.syncedThisWeek}`);
    console.log(`Needs sync: ${status.status.needsSync}\n`);
    
    // Test 2: Fetch games from ESPN
    console.log('🌐 Fetching games from ESPN scoreboard...');
    const games = await syncService.fetchGamesFromESPN();
    console.log(`Found ${games.length} games from ESPN\n`);
    
    // Test 3: Show sample game data
    if (games.length > 0) {
      console.log('📋 Sample game data:');
      const sampleGame = games[0];
      console.log(`  ID: ${sampleGame.id}`);
      console.log(`  Name: ${sampleGame.name}`);
      console.log(`  Date: ${sampleGame.date}`);
      console.log(`  Status: ${sampleGame.status?.type?.name || 'UNKNOWN'}`);
      
      if (sampleGame.competitions?.[0]) {
        const competition = sampleGame.competitions[0];
        const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
        const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
        
        if (homeTeam && awayTeam) {
          console.log(`  ${awayTeam.team.name} @ ${homeTeam.team.name}`);
          console.log(`  Score: ${awayTeam.score || '0'} - ${homeTeam.score || '0'}\n`);
        }
      }
    }
    
    // Test 4: Sync first 2 games (if any exist)
    if (games.length > 0) {
      console.log('🔄 Testing game sync with first 2 games...');
      const gamesToSync = games.slice(0, 2);
      
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const game of gamesToSync) {
        const result = await syncService.syncGame(game);
        
        switch (result.action) {
          case 'created':
            createdCount++;
            console.log(`  ✅ Created: ${result.game}`);
            break;
          case 'updated':
            updatedCount++;
            console.log(`  🔄 Updated: ${result.game}`);
            break;
          case 'skipped':
            skippedCount++;
            console.log(`  ⏭️  Skipped: ${result.game} (${result.reason})`);
            break;
          case 'error':
            errorCount++;
            console.log(`  ❌ Error: ${result.game} (${result.error})`);
            break;
        }
      }
      
      console.log(`\n📈 Test Results:`);
      console.log(`  Created: ${createdCount}`);
      console.log(`  Updated: ${updatedCount}`);
      console.log(`  Skipped: ${skippedCount}`);
      console.log(`  Errors: ${errorCount}`);
    } else {
      console.log('⚠️  No games found to sync');
    }
    
    console.log('\n✅ Game sync test completed!');
    
  } catch (error) {
    console.error('❌ Game sync test failed:', error);
    process.exit(1);
  }
}

testGameSync(); 