const SportsdataPlayerStatsSyncService = require('../services/sportsdata/playerStatsSyncService');

async function run() {
  const season = process.argv[2] || '2025';
  console.log(`🏀 NBA Player Season Stats Sync Script (sportsdata.io) for season ${season}`);
  const syncService = new SportsdataPlayerStatsSyncService();
  try {
    const result = await syncService.syncPlayerSeasonStats(season);
    console.log(`\n✅ Player season stats sync completed: ${result.synced} stats synced, ${result.failed} failed.`);
  } catch (error) {
    console.error('❌ Player season stats sync failed:', error.message);
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