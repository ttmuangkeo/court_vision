const TeamSyncService = require('../services/espn/teamSyncService');

async function runTeamSync() {
  console.log('🏀 NBA Teams Sync Script');
  console.log('='.repeat(50));
  
  const syncService = new TeamSyncService();
  
  try {
    console.log('🚀 Starting team sync from Core API...');
    const result = await syncService.syncAllTeams();
    console.log(`\n✅ Team sync completed: ${result.synced} teams synced, ${result.failed} failed.`);
  } catch (error) {
    console.error('❌ Team sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTeamSync()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = runTeamSync; 