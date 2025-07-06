const SportsdataGameSyncService = require('../services/sportsdata/gameSyncService');

async function run() {
  const season = process.argv[2] || '2025';
  console.log(`🏀 NBA Games Sync Script (sportsdata.io) for season ${season}`);
  const syncService = new SportsdataGameSyncService();
  try {
    const result = await syncService.syncGamesForSeason(season);
    console.log(`\n✅ Game sync completed: ${result.synced} games synced, ${result.failed} failed.`);
  } catch (error) {
    console.error('❌ Game sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = run; 