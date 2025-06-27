const TeamStatsSyncService = require('../services/espn/teamStatsSyncService');

async function main() {
  const syncService = new TeamStatsSyncService();
  
  try {
    console.log('🚀 Starting team statistics sync...');
    
    // Sync statistics for all teams
    const results = await syncService.syncAllTeamsStatistics('2024-25', 'regular');
    
    console.log('\n📊 Team Statistics Sync Summary:');
    console.log('================================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length} teams`);
    console.log(`❌ Failed: ${failed.length} teams`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successfully synced teams:');
      successful.forEach(result => {
        console.log(`  - ${result.teamName}: ${result.statsCount} statistics`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed teams:');
      failed.forEach(result => {
        console.log(`  - ${result.teamName} (${result.teamId}): ${result.error}`);
      });
    }
    
    console.log('\n🎉 Team statistics sync completed!');
    
  } catch (error) {
    console.error('❌ Error during team statistics sync:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
main(); 