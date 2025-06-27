const GameSyncService = require('../services/espn/gameSyncService');

async function runFullGameSync() {
  try {
    const syncService = new GameSyncService();
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalGames = 0;

    // Try both 2024 and 2025 (NBA season spans both years)
    const years = ['2024', '2025'];
    for (const year of years) {
      console.log(`\n🔄 Syncing games for year: ${year}`);
      const result = await syncService.syncAllGames(year);
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalSkipped += result.skipped;
      totalErrors += result.errors;
      totalGames += result.totalGames;
      if (result.totalGames === 0) {
        console.log(`⚠️  No games found for year ${year} (ESPN may not have data yet)`);
      }
    }

    console.log('\n📈 Full Game Sync Summary:');
    console.log(`  Total Games Processed: ${totalGames}`);
    console.log(`  Created: ${totalCreated}`);
    console.log(`  Updated: ${totalUpdated}`);
    console.log(`  Skipped: ${totalSkipped}`);
    console.log(`  Errors: ${totalErrors}`);
    console.log('\n✅ All games sync completed!');
  } catch (error) {
    console.error('❌ Full game sync failed:', error);
    process.exit(1);
  }
}

runFullGameSync(); 