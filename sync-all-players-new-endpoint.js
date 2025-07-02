const prisma = require('./src/db/client');
const axios = require('axios');

async function syncAllPlayersWithNewEndpoint() {
  try {
    console.log('🔄 Starting full player sync with new ESPN overview endpoint...\n');
    
    // Get all players from database
    const players = await prisma.player.findMany({
      select: {
        espnId: true,
        fullName: true
      }
    });

    console.log(`Found ${players.length} players to update\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    let noStatsCount = 0;

    for (const player of players) {
      try {
        console.log(`Processing ${player.fullName} (${player.espnId})...`);
        
        // Fetch stats using the new endpoint
        const response = await axios.get(`https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${player.espnId}/overview`, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const data = response.data;
        
        if (data.statistics) {
          const statistics = data.statistics;
          const stats = {};

          // Parse statistics from the new format
          if (statistics.names && statistics.splits && statistics.splits.length > 0) {
            // Get Regular Season stats (first split) as primary stats
            const regularSeasonSplit = statistics.splits.find(split => 
              split.displayName === 'Regular Season'
            ) || statistics.splits[0]; // Fallback to first split if no Regular Season

            if (regularSeasonSplit && regularSeasonSplit.stats) {
              // Map the stats array to our database fields
              statistics.names.forEach((statName, index) => {
                const statValue = regularSeasonSplit.stats[index];
                if (statValue !== undefined && statValue !== null) {
                  switch (statName) {
                    case 'avgPoints':
                      stats.avgPoints = parseFloat(statValue);
                      break;
                    case 'avgRebounds':
                      stats.avgRebounds = parseFloat(statValue);
                      break;
                    case 'avgAssists':
                      stats.avgAssists = parseFloat(statValue);
                      break;
                    case 'avgSteals':
                      stats.avgSteals = parseFloat(statValue);
                      break;
                    case 'avgBlocks':
                      stats.avgBlocks = parseFloat(statValue);
                      break;
                    case 'avgTurnovers':
                      stats.avgTurnovers = parseFloat(statValue);
                      break;
                    case 'avgFouls':
                      stats.avgFouls = parseFloat(statValue);
                      break;
                    case 'fieldGoalPct':
                      stats.fieldGoalPct = parseFloat(statValue);
                      break;
                    case 'threePointPct':
                      stats.threePointPct = parseFloat(statValue);
                      break;
                    case 'freeThrowPct':
                      stats.freeThrowPct = parseFloat(statValue);
                      break;
                    case 'gamesPlayed':
                      stats.gamesPlayed = parseInt(statValue);
                      break;
                    case 'avgMinutes':
                      stats.minutesPerGame = parseFloat(statValue);
                      break;
                  }
                }
              });
            }
          }

          // Update the player in the database
          await prisma.player.update({
            where: { espnId: player.espnId },
            data: {
              ...stats,
              statsSummary: statistics,
              hasStatistics: Object.keys(stats).length > 0,
              lastStatsSync: new Date()
            }
          });

          updatedCount++;
          console.log(`✅ Updated ${player.fullName} with ${Object.keys(stats).length} stats`);
        } else {
          noStatsCount++;
          console.log(`⚠️  No statistics found for ${player.fullName}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating ${player.fullName}:`, error.message);
      }

      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📈 Sync Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} players`);
    console.log(`⚠️  No stats available: ${noStatsCount} players`);
    console.log(`❌ Errors: ${errorCount} players`);
    console.log(`📊 Total processed: ${players.length} players`);

  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAllPlayersWithNewEndpoint(); 