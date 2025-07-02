const AthleteSyncService = require('./src/services/espn/athleteSyncService');
const prisma = require('./src/db/client');

async function syncPlayerStats() {
  const syncService = new AthleteSyncService();
  
  console.log('🏀 Starting Player Stats Sync...');
  console.log('='.repeat(50));
  
  try {
    // Get all players that don't have stats yet
    const players = await prisma.player.findMany({
      where: {
        OR: [
          { hasStatistics: false },
          { hasStatistics: null }
        ]
      },
      select: {
        espnId: true,
        fullName: true,
        active: true
      }
    });
    
    console.log(`📊 Found ${players.length} players without stats`);
    
    let syncedCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.log(`\n[${i + 1}/${players.length}] Syncing stats for ${player.fullName} (ID: ${player.espnId})`);
      
      try {
        // Fetch stats for this player
        const statsData = await syncService.fetchAthleteStatistics(player.espnId);
        
        if (statsData && statsData.athlete && statsData.athlete.statsSummary && statsData.athlete.statsSummary.statistics) {
          // Extract stats
          const statistics = statsData.athlete.statsSummary.statistics;
          const statsFields = {};
          
          statistics.forEach(stat => {
            switch (stat.name) {
              case 'avgPoints':
                statsFields.avgPoints = stat.value;
                break;
              case 'avgRebounds':
                statsFields.avgRebounds = stat.value;
                break;
              case 'avgAssists':
                statsFields.avgAssists = stat.value;
                break;
              case 'avgSteals':
                statsFields.avgSteals = stat.value;
                break;
              case 'avgBlocks':
                statsFields.avgBlocks = stat.value;
                break;
              case 'avgTurnovers':
                statsFields.avgTurnovers = stat.value;
                break;
              case 'avgFouls':
                statsFields.avgFouls = stat.value;
                break;
              case 'fieldGoalPct':
                statsFields.fieldGoalPct = stat.value;
                break;
              case 'threePointPct':
                statsFields.threePointPct = stat.value;
                break;
              case 'freeThrowPct':
                statsFields.freeThrowPct = stat.value;
                break;
              case 'gamesPlayed':
                statsFields.gamesPlayed = stat.value;
                break;
              case 'gamesStarted':
                statsFields.gamesStarted = stat.value;
                break;
              case 'minutesPerGame':
                statsFields.minutesPerGame = stat.value;
                break;
            }
          });
          
          if (Object.keys(statsFields).length > 0) {
            statsFields.hasStatistics = true;
            statsFields.lastStatsSync = new Date();
            
            // Update the player with stats
            await prisma.player.update({
              where: { espnId: player.espnId },
              data: statsFields
            });
            
            syncedCount++;
            console.log(`  ✅ Stats synced: ${Object.keys(statsFields).filter(k => k !== 'hasStatistics' && k !== 'lastStatsSync').length} fields`);
          } else {
            console.log(`  ⚠️  No stats found`);
          }
        } else {
          console.log(`  ⚠️  No stats data available`);
        }
        
      } catch (error) {
        failedCount++;
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Progress update every 10 players
      if ((i + 1) % 10 === 0) {
        console.log(`\n📈 Progress: ${((i + 1) / players.length * 100).toFixed(1)}% (${syncedCount} synced, ${failedCount} failed)`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Player Stats Sync Complete!');
    console.log(`📊 Summary:`);
    console.log(`  - Total players processed: ${players.length}`);
    console.log(`  - Successfully synced: ${syncedCount}`);
    console.log(`  - Failed: ${failedCount}`);
    
  } catch (error) {
    console.error('❌ Error during stats sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncPlayerStats(); 