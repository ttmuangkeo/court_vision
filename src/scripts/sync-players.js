const { syncPlayersFromAPI } = require('../services/nba/playersService');

async function main() {
  try {
    console.log('🏀 Court Vision - Players Sync (Resumable)');
    console.log('=========================================');
    
    // Get starting page from command line argument
    const startPage = process.argv[2] ? parseInt(process.argv[2]) : 1;
    
    // Sync 2 pages starting from the specified page
    await syncPlayersFromAPI(2024, 2, startPage);
    
    console.log('\n🎉 Players sync completed successfully!');
    console.log(`💡 Next run: npm run sync:players ${startPage + 2}`);
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Players sync failed:', error.message);
    process.exit(1);
  }
}

main();
