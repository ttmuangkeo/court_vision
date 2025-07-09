const SportsdataTeamStatsSyncService = require('./src/services/sportsdata/teamStatsSyncService');

if (!process.env.SPORTSDATA_API_KEY) {
  console.error('❌ Please set SPORTSDATA_API_KEY in your .env file');
  process.exit(1);
}

async function main() {
  const syncService = new SportsdataTeamStatsSyncService();
  
  try {
    console.log('🚀 Starting team statistics sync from sportsdata.io...');
    
    // Sync statistics for all teams
    const results = await syncService.syncAllTeamsStatistics('2024-25', 'regular');
    
    console.log('\n📊 Team Statistics Sync Summary:');
    console.log('================================');
    console.log(`✅ Successfully synced ${results.length} team statistics`);
    
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