const SportsdataPlayerNewsSyncService = require('../services/sportsdata/playerNewsSyncService');

async function run() {
  console.log('📰 NBA Player News Sync Script (sportsdata.io)');
  const syncService = new SportsdataPlayerNewsSyncService();
  try {
    const result = await syncService.syncAllNews();
    console.log(`\n✅ Player news sync completed: ${result.synced} news synced, ${result.failed} failed, ${result.skipped} skipped.`);
  } catch (error) {
    console.error('❌ Player news sync failed:', error.message);
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