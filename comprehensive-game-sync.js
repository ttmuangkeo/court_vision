const GameSyncService = require('./src/services/espn/gameSyncService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function comprehensiveGameSync() {
  try {
    const syncService = new GameSyncService();
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalGames = 0;

    // NBA 2024-25 season: October 2024 to April 2025
    // Use more granular date ranges to ensure we get all games
    const dateRanges = [
      '20241001-20241015', // October 1-15, 2024
      '20241016-20241031', // October 16-31, 2024
      '20241101-20241115', // November 1-15, 2024
      '20241116-20241130', // November 16-30, 2024
      '20241201-20241215', // December 1-15, 2024
      '20241216-20241231', // December 16-31, 2024
      '20250101-20250115', // January 1-15, 2025
      '20250116-20250131', // January 16-31, 2025
      '20250201-20250215', // February 1-15, 2025
      '20250216-20250228', // February 16-28, 2025
      '20250301-20250315', // March 1-15, 2025
      '20250316-20250331', // March 16-31, 2025
      '20250401-20250415', // April 1-15, 2025
      '20250416-20250430', // April 16-30, 2025
    ];

    console.log('Starting comprehensive game sync for 2024-25 season...');
    console.log(`Will sync ${dateRanges.length} date ranges`);

    for (let i = 0; i < dateRanges.length; i++) {
      const dateRange = dateRanges[i];
      console.log(`\n[${i + 1}/${dateRanges.length}] Syncing games for range: ${dateRange}`);
      
      try {
        const result = await syncService.syncGamesForDates(dateRange);
        totalCreated += result.created || 0;
        totalUpdated += result.updated || 0;
        totalSkipped += result.skipped || 0;
        totalErrors += result.errors || 0;
        totalGames += result.totalGames || 0;
        
        console.log(`  Results: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`);
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`  Error syncing date range ${dateRange}:`, error.message);
        totalErrors++;
      }
    }

    // Print summary
    console.log(`\n=== COMPREHENSIVE SYNC SUMMARY ===`);
    console.log(`Total Games Processed: ${totalGames}`);
    console.log(`Created: ${totalCreated}`);
    console.log(`Updated: ${totalUpdated}`);
    console.log(`Skipped: ${totalSkipped}`);
    console.log(`Errors: ${totalErrors}`);
    
    // Print total games in database
    const dbCount = await prisma.game.count();
    console.log(`Total games in database after sync: ${dbCount}`);

    // Check games by season
    const gamesBySeason = await prisma.game.groupBy({
      by: ['season'],
      _count: {
        season: true
      }
    });
    
    console.log('\nGames by season:');
    gamesBySeason.forEach(group => {
      console.log(`  ${group.season}: ${group._count.season} games`);
    });

    // Check date range of games
    const minDate = await prisma.game.findFirst({ 
      orderBy: { date: 'asc' }, 
      select: { date: true } 
    });
    const maxDate = await prisma.game.findFirst({ 
      orderBy: { date: 'desc' }, 
      select: { date: true } 
    });
    
    console.log(`\nDate range: ${minDate?.date.toISOString().split('T')[0]} to ${maxDate?.date.toISOString().split('T')[0]}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error in comprehensive game sync:', error);
    await prisma.$disconnect();
  }
}

comprehensiveGameSync(); 