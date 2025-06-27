const AthleteSyncService = require('../services/espn/athleteSyncService');

async function runAthleteSync() {
  console.log('🏀 NBA Athletes Sync Script');
  console.log('='.repeat(50));
  
  const syncService = new AthleteSyncService();
  
  try {
    // Get current summary before sync
    console.log('📊 Current database status:');
    const beforeSummary = await syncService.getSyncSummary();
    if (beforeSummary) {
      console.log(`  - Total players: ${beforeSummary.totalPlayers}`);
      console.log(`  - Active players: ${beforeSummary.activePlayers}`);
      console.log(`  - Inactive players: ${beforeSummary.inactivePlayers}`);
    }
    
    console.log('\n🚀 Starting athlete sync...');
    console.log('⚠️  This will take several minutes to complete all 817 athletes');
    console.log('💡 You can stop the process with Ctrl+C if needed\n');
    
    const startTime = new Date();
    
    // Run the sync
    const result = await syncService.syncAllAthletes();
    
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`\n⏱️  Sync completed in ${duration} seconds`);
    
    // Get updated summary
    console.log('\n📊 Updated database status:');
    const afterSummary = await syncService.getSyncSummary();
    if (afterSummary) {
      console.log(`  - Total players: ${afterSummary.totalPlayers}`);
      console.log(`  - Active players: ${afterSummary.activePlayers}`);
      console.log(`  - Inactive players: ${afterSummary.inactivePlayers}`);
      
      if (afterSummary.recentPlayers.length > 0) {
        console.log('\n📈 Recently synced players:');
        afterSummary.recentPlayers.forEach(player => {
          console.log(`  - ${player.name} (${player.position}) - ${player.active ? 'Active' : 'Inactive'}`);
        });
      }
    }
    
    console.log('\n🎉 Athlete sync completed successfully!');
    console.log('💡 You now have a complete NBA player database');
    
  } catch (error) {
    console.error('❌ Athlete sync failed:', error.message);
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  runAthleteSync()
    .then(() => {
      console.log('\n✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = runAthleteSync; 