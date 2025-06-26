const prisma = require('../../db/client');
const { apiClient, delay } = require('./baseService');

async function syncGamesFromAPI(season = 2024, daysBack = 7) {
  try {
    console.log(`🔄 Syncing latest NBA games from BallDontLie API for season ${season} (last ${daysBack} days)...`);
    
    // Calculate date range for recent games
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const params = { 
      per_page: 100,
      seasons: [season],
      start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      end_date: endDate.toISOString().split('T')[0]
    };
    
    console.log(`Fetching games from ${params.start_date} to ${params.end_date}...`);
    
    const response = await apiClient.get('/games', { params });
    const games = response.data.data;
    
    console.log(`Found ${games.length} recent games...`);

    for (const game of games) {
      console.log(`Processing game: ${game.home_team.full_name} vs ${game.visitor_team.full_name} (${game.date})`);
      
      // Find home and away teams in our database
      const homeTeam = await prisma.team.findUnique({
        where: { nbaId: String(game.home_team.id) }
      });
      
      const awayTeam = await prisma.team.findUnique({
        where: { nbaId: String(game.visitor_team.id) }
      });

      if (!homeTeam || !awayTeam) {
        console.warn(`⚠️ Teams not found for game ${game.id}: ${game.home_team.full_name} vs ${game.visitor_team.full_name}`);
        continue;
      }

      // Determine game status based on BallDontLie API response
      let status = 'SCHEDULED';
      if (game.status === 'Final') {
        status = 'FINISHED';
      } else if (game.status.includes('Qtr') || game.status === 'Halftime') {
        status = 'LIVE';
      } else if (game.status.includes('pm') || game.status.includes('am')) {
        // Game has a start time but hasn't started yet
        status = 'SCHEDULED';
      }

      // Determine quarter (period)
      let quarter = 1;
      if (game.period) {
        quarter = game.period;
      } else if (game.status === 'Final') {
        quarter = 4; // Default to 4 for finished games
      }

      // Handle time remaining
      let timeRemaining = null;
      if (game.time && game.time !== 'Final' && game.time !== ' ') {
        timeRemaining = game.time;
      }

      await prisma.game.upsert({
        where: { nbaId: String(game.id) },
        update: {
          date: new Date(game.date),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore: game.home_team_score,
          awayScore: game.visitor_team_score,
          status: status,
          quarter: quarter,
          timeRemaining: timeRemaining,
          season: `${season}-${String(season + 1).slice(-2)}` // "2024-25" format
        },
        create: {
          nbaId: String(game.id),
          date: new Date(game.date),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore: game.home_team_score,
          awayScore: game.visitor_team_score,
          status: status,
          quarter: quarter,
          timeRemaining: timeRemaining,
          season: `${season}-${String(season + 1).slice(-2)}` // "2024-25" format
        }
      });

      // Rate limiting between games
      await delay(100);
    }
    
    console.log(`✅ Synced ${games.length} recent games`);
  } catch (error) {
    console.error('❌ Error syncing games:', error.message);
    throw error;
  }
}

// Function to sync just today's games
async function syncTodaysGames(season = 2024) {
  return syncGamesFromAPI(season, 1);
}

// Function to sync this week's games
async function syncThisWeeksGames(season = 2024) {
  return syncGamesFromAPI(season, 7);
}

module.exports = { 
  syncGamesFromAPI, 
  syncTodaysGames, 
  syncThisWeeksGames 
};
