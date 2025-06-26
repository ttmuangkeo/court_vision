const prisma = require('../../db/client');
const { apiClient, delay, filterCurrentNBAPlayers } = require('./baseService');

async function syncPlayersFromAPI(season = 2024, maxPages = 2, startPage = 1) {
  try {
    console.log(`🔄 Syncing current NBA players from BallDontLie API for season ${season}...`);
    console.log(`🔄 Starting from page ${startPage}, will sync up to ${maxPages} pages...`);
    
    let allPlayers = [];
    let cursor = null;
    let page = 1;
    
    // Skip to the starting page by fetching without processing
    if (startPage > 1) {
      console.log(`⏭️ Skipping to page ${startPage}...`);
      let skipPage = 1;
      let skipCursor = null;
      
      while (skipPage < startPage) {
        const skipParams = { 
          per_page: 25,
          season: season
        };
        if (skipCursor) {
          skipParams.cursor = skipCursor;
        }
        
        const skipResponse = await apiClient.get('/players', { params: skipParams });
        skipCursor = skipResponse.data.meta.next_cursor;
        skipPage++;
        
        if (!skipCursor) break;
      }
      cursor = skipCursor;
      page = startPage;
    }
    
    // Now fetch the pages we actually want
    do {
      console.log(`Fetching page ${page}...`);
      
      const params = { 
        per_page: 25,
        season: season
      };
      if (cursor) {
        params.cursor = cursor;
      }
      
      const response = await apiClient.get('/players', { params });
      const pagePlayers = response.data.data;
      const pageMeta = response.data.meta;
      
      allPlayers = allPlayers.concat(pagePlayers);
      cursor = pageMeta.next_cursor;
      page++;
      
      if (page > startPage + maxPages - 1) {
        console.log(`Reached max pages, stopping...`);
        break;
      }
      
      console.log(`Waiting 3 seconds before next page...`);
      await delay(3000);
      
    } while (cursor);
    
    const currentPlayers = filterCurrentNBAPlayers(allPlayers);
    
    console.log(`Found ${allPlayers.length} total players, syncing ${currentPlayers.length} current NBA players...`);

    for (const player of currentPlayers) {
      console.log(`Processing player: ${player.first_name} ${player.last_name} (${player.team?.abbreviation})`);
      
      // Find the team in our database
      const team = await prisma.team.findUnique({
        where: { nbaId: String(player.team.id) }
      });

      if (!team) {
        console.warn(`⚠️ Team not found for player ${player.first_name} ${player.last_name} (Team ID: ${player.team.id})`);
        continue;
      }

      await prisma.player.upsert({
        where: { nbaId: String(player.id) },
        update: {
          name: `${player.first_name} ${player.last_name}`,
          position: player.position || 'Unknown',
          teamId: team.id,
          height: player.height || null,
          weight: player.weight ? parseInt(player.weight) : null,
          birthDate: null,
          college: player.college || null,
          draftYear: player.draft_year || null,
          draftRound: player.draft_round || null,
          draftNumber: player.draft_number || null,
          jerseyNumber: player.jersey_number || null,
          country: player.country || null
        },
        create: {
          nbaId: String(player.id),
          name: `${player.first_name} ${player.last_name}`,
          position: player.position || 'Unknown',
          teamId: team.id,
          height: player.height || null,
          weight: player.weight ? parseInt(player.weight) : null,
          birthDate: null,
          college: player.college || null,
          draftYear: player.draft_year || null,
          draftRound: player.draft_round || null,
          draftNumber: player.draft_number || null,
          jerseyNumber: player.jersey_number || null,
          country: player.country || null
        }
      });

      await delay(200);
    }
    
    console.log(`✅ Synced ${currentPlayers.length} current NBA players`);
    console.log(`🔄 Processed ${page - 1} pages`);
    
    if (cursor) {
      console.log(`🔄 More pages available. Run again to continue...`);
    }
  } catch (error) {
    console.error('❌ Error syncing players:', error.message);
    throw error;
  }
}

module.exports = { syncPlayersFromAPI };
