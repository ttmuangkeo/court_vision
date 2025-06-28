const GameSyncService = require('./src/services/espn/gameSyncService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync2024Season() {
  try {
    const syncService = new GameSyncService();
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalGames = 0;

    // NBA 2024-25 season: October 2024 to April 2025
    const dateRanges = [
      '20241001-20241031', // October 2024
      '20241101-20241130', // November 2024
      '20241201-20241231', // December 2024
      '20250101-20250131', // January 2025
      '20250201-20250228', // February 2025
      '20250301-20250331', // March 2025
      '20250401-20250430', // April 2025
    ];

    for (const dateRange of dateRanges) {
      console.log(`Syncing games for range: ${dateRange}`);
      const { created = 0, updated = 0, skipped = 0, errors = 0, totalGames: total = 0 } = await syncService.syncGamesForDates(dateRange);
      totalCreated += created;
      totalUpdated += updated;
      totalSkipped += skipped;
      totalErrors += errors;
      totalGames += total;
    }

    // Print summary
    console.log(`\nSync complete!`);
    console.log(`Created: ${totalCreated}, Updated: ${totalUpdated}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
    
    // Print total games in database
    const dbCount = await prisma.game.count();
    console.log(`Total games in database after sync: ${dbCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error syncing 2024-25 season:', error);
    await prisma.$disconnect();
  }
}

sync2024Season(); 