const AthleteSyncService = require('./src/services/espn/athleteSyncService');

async function testSync() {
  const syncService = new AthleteSyncService();
  
  try {
    // Test with just one athlete
    const firstPage = await syncService.fetchAthletesPage(0, 1);
    if (firstPage && firstPage.items && firstPage.items.length > 0) {
      const athleteRef = firstPage.items[0];
      const athleteId = athleteRef.$ref.split('/').pop().split('?')[0];
      
      console.log(`Testing sync for athlete ID: ${athleteId}`);
      
      // Fetch stats
      const statsData = await syncService.fetchAthleteStatistics(athleteId);
      console.log('Stats data available:', !!statsData);
      
      // Log the stats data structure
      if (statsData) {
        console.log('\nStats data structure:');
        console.log(JSON.stringify(statsData, null, 2));
      }
      
      // Test sync
      const result = await syncService.syncAthlete(athleteRef.$ref, statsData);
      console.log('\nSync result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success) {
        console.log('Player stats fields:');
        console.log('- avgPoints:', result.athlete.avgPoints);
        console.log('- avgRebounds:', result.athlete.avgRebounds);
        console.log('- avgAssists:', result.athlete.avgAssists);
        console.log('- hasStatistics:', result.athlete.hasStatistics);
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await syncService.prisma.$disconnect();
  }
}

testSync(); 