const PlayerSyncService = require('../services/espn/playerSyncService');

async function runFullPlayerSync() {
  try {
    console.log('🔄 Starting full ESPN Player Sync for all teams...\n');
    const syncService = new PlayerSyncService();
    const results = await syncService.syncAllPlayers();
    console.log('\n📈 Full Player Sync Summary:');
    console.log(`✅ Total Synced: ${results.totalSynced}`);
    console.log(`🔄 Total Updated: ${results.totalUpdated}`);
    console.log(`❌ Total Errors: ${results.totalErrors}`);
    console.log(`📊 Teams Processed: ${results.teamsProcessed}`);
    console.log('\n✅ All players sync completed!');
  } catch (error) {
    console.error('❌ Full player sync failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runFullPlayerSync(); 