const { PrismaClient } = require('@prisma/client');

async function checkIdConsistency() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking ESPN ID consistency across database tables...\n');
    
    // Check Games table
    console.log('📊 GAMES TABLE:');
    const games = await prisma.game.findMany({
      take: 5,
      select: {
        espnId: true,
        homeTeamId: true,
        awayTeamId: true,
        date: true
      },
      orderBy: { date: 'desc' }
    });
    
    games.forEach(game => {
      console.log(`  Game ${game.espnId}: Home=${game.homeTeamId}, Away=${game.awayTeamId}, Date=${game.date.toDateString()}`);
    });
    
    // Check Teams table
    console.log('\n🏀 TEAMS TABLE:');
    const teams = await prisma.team.findMany({
      take: 5,
      select: {
        espnId: true,
        name: true,
        abbreviation: true
      }
    });
    
    teams.forEach(team => {
      console.log(`  ${team.name} (${team.abbreviation}): ID=${team.espnId}`);
    });
    
    // Check Player Game Stats
    console.log('\n📈 PLAYER GAME STATS:');
    const playerStats = await prisma.playerGameStat.findMany({
      take: 5,
      select: {
        playerId: true,
        gameId: true,
        points: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    playerStats.forEach(stat => {
      console.log(`  Player ${stat.playerId} in Game ${stat.gameId}: ${stat.points} pts`);
    });
    
    // Check Plays table
    console.log('\n🏃 PLAYS TABLE:');
    const plays = await prisma.play.findMany({
      take: 5,
      select: {
        ballHandlerId: true,
        primaryPlayerId: true,
        secondaryPlayerId: true,
        gameId: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    plays.forEach(play => {
      console.log(`  Game ${play.gameId}: BallHandler=${play.ballHandlerId}, Primary=${play.primaryPlayerId}, Secondary=${play.secondaryPlayerId}`);
    });
    
    // Check Team Game Stats
    console.log('\n🏆 TEAM GAME STATS:');
    const teamStats = await prisma.teamGameStat.findMany({
      take: 5,
      select: {
        teamId: true,
        gameId: true,
        points: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    teamStats.forEach(stat => {
      console.log(`  Team ${stat.teamId} in Game ${stat.gameId}: ${stat.points} pts`);
    });
    
    // Analyze ID patterns
    console.log('\n🔍 ID PATTERN ANALYSIS:');
    
    // Count 7-digit vs shorter IDs in players
    const sevenDigitPlayers = await prisma.player.count({
      where: {
        espnId: {
          not: {
            in: Array.from({length: 1000000}, (_, i) => String(i))
          }
        }
      }
    });
    
    const legacyPlayers = await prisma.player.count({
      where: {
        espnId: {
          in: Array.from({length: 1000000}, (_, i) => String(i))
        }
      }
    });
    
    console.log(`  Players with 7-digit IDs (Core API): ${sevenDigitPlayers}`);
    console.log(`  Players with legacy IDs: ${legacyPlayers}`);
    
    // Check if games reference legacy or core API IDs
    const gamesWithLegacyTeams = await prisma.game.findMany({
      where: {
        OR: [
          { homeTeamId: { in: Array.from({length: 1000000}, (_, i) => String(i)) } },
          { awayTeamId: { in: Array.from({length: 1000000}, (_, i) => String(i)) } }
        ]
      },
      take: 3,
      select: {
        espnId: true,
        homeTeamId: true,
        awayTeamId: true
      }
    });
    
    if (gamesWithLegacyTeams.length > 0) {
      console.log(`  Games with legacy team IDs: ${gamesWithLegacyTeams.length} found`);
      gamesWithLegacyTeams.forEach(game => {
        console.log(`    Game ${game.espnId}: Home=${game.homeTeamId}, Away=${game.awayTeamId}`);
      });
    } else {
      console.log('  All games use Core API team IDs');
    }
    
    // Check if player stats reference legacy or core API IDs
    const statsWithLegacyPlayers = await prisma.playerGameStat.findMany({
      where: {
        playerId: {
          in: Array.from({length: 1000000}, (_, i) => String(i))
        }
      },
      take: 3,
      select: {
        playerId: true,
        gameId: true
      }
    });
    
    if (statsWithLegacyPlayers.length > 0) {
      console.log(`  Player stats with legacy player IDs: ${statsWithLegacyPlayers.length} found`);
      statsWithLegacyPlayers.forEach(stat => {
        console.log(`    Player ${stat.playerId} in Game ${stat.gameId}`);
      });
    } else {
      console.log('  All player stats use Core API player IDs');
    }
    
  } catch (error) {
    console.error('Error checking ID consistency:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIdConsistency(); 