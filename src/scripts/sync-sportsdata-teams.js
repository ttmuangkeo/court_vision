const SportsdataTeamSyncService = require('../services/sportsdata/teamSyncService');

async function run() {
  console.log('🏀 NBA Teams Sync Script (sportsdata.io)');
  const syncService = new SportsdataTeamSyncService();
  try {
    const result = await syncService.syncAllTeams();
    console.log(`\n✅ Team sync completed: ${result.synced} teams synced, ${result.failed} failed.`);
  } catch (error) {
    console.error('❌ Team sync failed:', error.message);
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