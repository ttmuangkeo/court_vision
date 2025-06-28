const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTeamGamesPlayed() {
  try {
    console.log('Calculating actual games played for each team...');
    
    // Get all active teams
    const teams = await prisma.team.findMany({
      where: { isActive: true },
      select: { espnId: true, name: true }
    });
    
    console.log(`Found ${teams.length} active teams`);
    
    let totalUpdated = 0;
    
    for (const team of teams) {
      // Count games where this team is either home or away from both 2024 and 2025 seasons
      const gamesCount = await prisma.game.count({
        where: {
          OR: [
            { homeTeamId: team.espnId },
            { awayTeamId: team.espnId }
          ],
          season: {
            in: ['2024', '2025']
          }
        }
      });
      
      console.log(`${team.name}: ${gamesCount} games`);
      
      // Update the gamesPlayed statistic in TeamStatistics
      const updatedStat = await prisma.teamStatistics.upsert({
        where: {
          teamId_season_seasonType_category_statName: {
            teamId: team.espnId,
            season: '2024-25',
            seasonType: 'regular',
            category: 'general',
            statName: 'gamesPlayed'
          }
        },
        update: {
          value: gamesCount,
          displayValue: gamesCount.toString(),
          lastSynced: new Date()
        },
        create: {
          teamId: team.espnId,
          season: '2024-25',
          seasonType: 'regular',
          category: 'general',
          statName: 'gamesPlayed',
          displayName: 'Games Played',
          shortDisplayName: 'GP',
          description: 'Games Played',
          abbreviation: 'GP',
          value: gamesCount,
          displayValue: gamesCount.toString(),
          lastSynced: new Date()
        }
      });
      
      totalUpdated++;
      console.log(`Updated ${team.name} games played to ${gamesCount}`);
    }
    
    console.log(`\nCompleted! Updated games played for ${totalUpdated} teams`);
    
    // Verify the fix for Bucks
    const bucksStats = await prisma.teamStatistics.findFirst({
      where: {
        teamId: '15',
        season: '2024-25',
        seasonType: 'regular',
        category: 'general',
        statName: 'gamesPlayed'
      }
    });
    
    if (bucksStats) {
      console.log(`\nBucks games played verification: ${bucksStats.value} (should be 55)`);
    }
    
  } catch (error) {
    console.error('Error fixing team games played:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTeamGamesPlayed(); 