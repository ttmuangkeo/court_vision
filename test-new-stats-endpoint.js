const prisma = require('./src/db/client');
const axios = require('axios');

async function testNewStatsEndpoint() {
  try {
    console.log('Testing new stats endpoint for a few players...\n');
    
    // Test players with their ESPN IDs
    const testPlayers = [
      { espnId: '4067017', name: 'A.J. Lawson' },
      { espnId: '4397475', name: 'AJ Green' },
      { espnId: '3945274', name: 'Luka Doncic' }
    ];

    for (const player of testPlayers) {
      try {
        console.log(`Testing ${player.name} (${player.espnId})...`);
        
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

          console.log(`✅ Updated ${player.name} with complete stats:`);
          console.log(`   Points: ${stats.avgPoints}, Rebounds: ${stats.avgRebounds}, Assists: ${stats.avgAssists}`);
          console.log(`   FG%: ${stats.fieldGoalPct}, 3P%: ${stats.threePointPct}, FT%: ${stats.freeThrowPct}`);
          console.log(`   Games: ${stats.gamesPlayed}, Minutes: ${stats.minutesPerGame}`);
          console.log(`   Steals: ${stats.avgSteals}, Blocks: ${stats.avgBlocks}, Turnovers: ${stats.avgTurnovers}, Fouls: ${stats.avgFouls}\n`);
        } else {
          console.log(`❌ No statistics found for ${player.name}\n`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${player.name}:`, error.message, '\n');
      }
    }

    console.log('Test complete!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewStatsEndpoint(); 