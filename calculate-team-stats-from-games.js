const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculateTeamStatsFromGames() {
  try {
    console.log('Calculating team statistics from games data...');
    
    // Get all active teams
    const teams = await prisma.team.findMany({
      where: { isActive: true },
      select: { espnId: true, name: true }
    });
    
    console.log(`Found ${teams.length} active teams`);
    
    let totalUpdated = 0;
    
    for (const team of teams) {
      console.log(`\nCalculating stats for ${team.name}...`);
      
      // Get all games for this team (both home and away)
      const games = await prisma.game.findMany({
        where: {
          OR: [
            { homeTeamId: team.espnId },
            { awayTeamId: team.espnId }
          ],
          season: {
            in: ['2024', '2025']
          },
          status: 'FINISHED'
        },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true
        }
      });
      
      if (games.length === 0) {
        console.log(`No finished games found for ${team.name}`);
        continue;
      }
      
      // Calculate stats
      let wins = 0;
      let losses = 0;
      let pointsScored = 0;
      let pointsAllowed = 0;
      
      games.forEach(game => {
        const isHome = game.homeTeamId === team.espnId;
        const teamScore = isHome ? game.homeScore : game.awayScore;
        const opponentScore = isHome ? game.awayScore : game.homeScore;
        
        if (teamScore > opponentScore) {
          wins++;
        } else {
          losses++;
        }
        
        pointsScored += teamScore || 0;
        pointsAllowed += opponentScore || 0;
      });
      
      const gamesPlayed = wins + losses;
      const winPercentage = gamesPlayed > 0 ? (wins / gamesPlayed * 100).toFixed(1) : '0.0';
      const avgPointsScored = gamesPlayed > 0 ? (pointsScored / gamesPlayed).toFixed(1) : '0.0';
      const avgPointsAllowed = gamesPlayed > 0 ? (pointsAllowed / gamesPlayed).toFixed(1) : '0.0';
      
      console.log(`${team.name}: ${wins}W-${losses}L (${winPercentage}%), ${avgPointsScored} PPG, ${avgPointsAllowed} PAPG`);
      
      // Update or create key statistics
      const statsToUpdate = [
        {
          statName: 'gamesPlayed',
          value: gamesPlayed,
          displayValue: gamesPlayed.toString(),
          category: 'general'
        },
        {
          statName: 'wins',
          value: wins,
          displayValue: wins.toString(),
          category: 'general'
        },
        {
          statName: 'losses',
          value: losses,
          displayValue: losses.toString(),
          category: 'general'
        },
        {
          statName: 'winPct',
          value: parseFloat(winPercentage),
          displayValue: `${winPercentage}%`,
          category: 'general'
        },
        {
          statName: 'points',
          value: pointsScored,
          displayValue: pointsScored.toString(),
          category: 'offensive'
        },
        {
          statName: 'avgPoints',
          value: parseFloat(avgPointsScored),
          displayValue: avgPointsScored,
          category: 'offensive'
        },
        {
          statName: 'pointsAllowed',
          value: pointsAllowed,
          displayValue: pointsAllowed.toString(),
          category: 'defensive'
        },
        {
          statName: 'avgPointsAllowed',
          value: parseFloat(avgPointsAllowed),
          displayValue: avgPointsAllowed,
          category: 'defensive'
        }
      ];
      
      // Update each stat
      for (const stat of statsToUpdate) {
        await prisma.teamStatistics.upsert({
          where: {
            teamId_season_seasonType_category_statName: {
              teamId: team.espnId,
              season: '2024-25',
              seasonType: 'regular',
              category: stat.category,
              statName: stat.statName
            }
          },
          update: {
            value: stat.value,
            displayValue: stat.displayValue,
            lastSynced: new Date()
          },
          create: {
            teamId: team.espnId,
            season: '2024-25',
            seasonType: 'regular',
            category: stat.category,
            statName: stat.statName,
            displayName: stat.statName === 'winPct' ? 'Win %' : 
                        stat.statName === 'avgPoints' ? 'Avg Points' :
                        stat.statName === 'avgPointsAllowed' ? 'Avg Points Allowed' :
                        stat.statName === 'pointsAllowed' ? 'Points Allowed' :
                        stat.statName.charAt(0).toUpperCase() + stat.statName.slice(1),
            shortDisplayName: stat.statName === 'winPct' ? 'Win%' :
                             stat.statName === 'avgPoints' ? 'PPG' :
                             stat.statName === 'avgPointsAllowed' ? 'PAPG' :
                             stat.statName === 'pointsAllowed' ? 'PA' :
                             stat.statName.toUpperCase(),
            description: stat.statName === 'winPct' ? 'Win Percentage' :
                        stat.statName === 'avgPoints' ? 'Average Points Per Game' :
                        stat.statName === 'avgPointsAllowed' ? 'Average Points Allowed Per Game' :
                        stat.statName === 'pointsAllowed' ? 'Total Points Allowed' :
                        stat.statName.charAt(0).toUpperCase() + stat.statName.slice(1),
            abbreviation: stat.statName === 'winPct' ? 'Win%' :
                         stat.statName === 'avgPoints' ? 'PPG' :
                         stat.statName === 'avgPointsAllowed' ? 'PAPG' :
                         stat.statName === 'pointsAllowed' ? 'PA' :
                         stat.statName.toUpperCase(),
            value: stat.value,
            displayValue: stat.displayValue,
            lastSynced: new Date()
          }
        });
      }
      
      totalUpdated++;
    }
    
    console.log(`\nCompleted! Updated statistics for ${totalUpdated} teams`);
    
    // Verify the fix for Bucks
    const bucksStats = await prisma.teamStatistics.findMany({
      where: {
        teamId: '15',
        season: '2024-25',
        seasonType: 'regular',
        statName: {
          in: ['gamesPlayed', 'wins', 'losses', 'winPct', 'points', 'avgPoints']
        }
      }
    });
    
    if (bucksStats.length > 0) {
      console.log('\nBucks stats verification:');
      bucksStats.forEach(stat => {
        console.log(`${stat.statName}: ${stat.value} (${stat.displayValue})`);
      });
    }
    
  } catch (error) {
    console.error('Error calculating team stats from games:', error);
  } finally {
    await prisma.$disconnect();
  }
}

calculateTeamStatsFromGames(); 