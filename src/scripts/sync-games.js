const { syncThisWeeksGames } = require('../services/nba/gamesService');

async function main() {
  try {
    console.log('🏀 Court Vision - Games Sync');
    console.log('============================');
    
    await syncThisWeeksGames();
    
    console.log('\n🎉 Games sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Games sync failed:', error.message);
    process.exit(1);
  }
}

main();
