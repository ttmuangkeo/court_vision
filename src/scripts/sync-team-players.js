const prisma = require('../db/client');
const { apiClient, delay } = require('../services/nba/baseService');

async function syncTeamPlayers(teamId) {
  try {
    console.log(`🔄 Syncing players for team ID: ${teamId}...`);
    
    // First, get the team details to confirm it exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!team) {
      console.error(`❌ Team with ID ${teamId} not found in database`);
      return;
    }
    
    console.log(`📋 Syncing players for: ${team.full_name} (${team.abbreviation})`);
    
    // Get players from BallDontLie API for this specific team with pagination
    let allPlayers = [];
    let cursor = null;
    let page = 1;
    
    do {
      console.log(`Fetching page ${page}...`);
      
      const params = {
        per_page: 100,
        team_ids: [team.nbaId]
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
      
      // Rate limiting between pages
      console.log(`Waiting 1 second before next page...`);
      await delay(1000);
      
    } while (cursor && page <= 5); // Limit to 5 pages max to avoid infinite loops
    
    console.log(`Found ${allPlayers.length} total players for ${team.abbreviation} across ${page - 1} pages`);
    
    // Debug: Show draft year distribution
    const draftYears = allPlayers
      .filter(p => p.draft_year)
      .map(p => p.draft_year)
      .sort((a, b) => b - a);
    
    console.log(`Draft years found: ${draftYears.slice(0, 10).join(', ')}...`);
    console.log(`Players without draft years: ${allPlayers.filter(p => !p.draft_year).length}`);
    
    // Filter for current NBA players only
    const currentYear = new Date().getFullYear();
    const maxDraftYear = currentYear - 15; // More restrictive - last 15 years
    
    const currentPlayers = allPlayers.filter(player => {
      // Must have a position
      if (!player.position) {
        return false;
      }
      
      // Prioritize undrafted players (likely current)
      if (!player.draft_year) {
        return true;
      }
      
      // Include players drafted in last 15 years (more restrictive)
      if (player.draft_year >= maxDraftYear) {
        return true;
      }
      
      return false;
    });
    
    console.log(`Filtered to ${currentPlayers.length} current players (drafted after ${maxDraftYear} or undrafted)`);
    
    // Show breakdown of what we're including
    const undraftedCount = currentPlayers.filter(p => !p.draft_year).length;
    const draftedCount = currentPlayers.filter(p => p.draft_year).length;
    console.log(`  - Undrafted players: ${undraftedCount}`);
    console.log(`  - Drafted players: ${draftedCount}`);
    
    // Show some examples of what we're including
    const recentPlayers = currentPlayers
      .filter(p => p.draft_year && p.draft_year >= 2015)
      .slice(0, 5);
    
    if (recentPlayers.length > 0) {
      console.log('Recent drafted players found:');
      recentPlayers.forEach(p => {
        console.log(`  • ${p.first_name} ${p.last_name} (${p.position}, ${p.draft_year})`);
      });
    }
    
    const undraftedPlayers = currentPlayers
      .filter(p => !p.draft_year)
      .slice(0, 5);
    
    if (undraftedPlayers.length > 0) {
      console.log('Undrafted players found:');
      undraftedPlayers.forEach(p => {
        console.log(`  • ${p.first_name} ${p.last_name} (${p.position}, Undrafted)`);
      });
    }
    
    // Process each current player
    for (const player of currentPlayers) {
      console.log(`Processing: ${player.first_name} ${player.last_name} (${player.position}, ${player.draft_year || 'Undrafted'})`);
      
      await prisma.player.upsert({
        where: { nbaId: String(player.id) },
        update: {
          name: `${player.first_name} ${player.last_name}`,
          position: player.position || 'Unknown',
          teamId: team.id, // Link to our team
          height: player.height || null,
          weight: player.weight ? parseInt(player.weight) : null,
          birthDate: player.birth_date ? new Date(player.birth_date) : null,
          college: player.college || null,
          draftYear: player.draft_year || null,
          draftRound: player.draft_round || null,
          draftNumber: player.draft_number || null,
          jerseyNumber: player.jersey_number ? String(player.jersey_number) : null,
          country: player.country || null
        },
        create: {
          nbaId: String(player.id),
          name: `${player.first_name} ${player.last_name}`,
          position: player.position || 'Unknown',
          teamId: team.id, // Link to our team
          height: player.height || null,
          weight: player.weight ? parseInt(player.weight) : null,
          birthDate: player.birth_date ? new Date(player.birth_date) : null,
          college: player.college || null,
          draftYear: player.draft_year || null,
          draftRound: player.draft_round || null,
          draftNumber: player.draft_number || null,
          jerseyNumber: player.jersey_number ? String(player.jersey_number) : null,
          country: player.country || null
        }
      });
      
      // Rate limiting between players
      await delay(100);
    }
    
    console.log(`✅ Successfully synced ${currentPlayers.length} players for ${team.abbreviation}`);
    
    // Show summary
    const teamPlayers = await prisma.player.findMany({
      where: { teamId: team.id },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📊 Team Players Summary:');
    teamPlayers.forEach(player => {
      console.log(`  • ${player.name} (${player.position}) - #${player.jerseyNumber || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing team players:', error.message);
    throw error;
  }
}

// Command line usage
if (require.main === module) {
  const teamId = process.argv[2];
  
  if (!teamId) {
    console.error('❌ Please provide a team ID');
    console.log('Usage: node src/scripts/sync-team-players.js <teamId>');
    console.log('Example: node src/scripts/sync-team-players.js cmccsd5oj00001xhj6xnvor25');
    process.exit(1);
  }
  
  syncTeamPlayers(teamId)
    .then(() => {
      console.log('\n🎉 Team players sync completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Team players sync failed:', error.message);
      process.exit(1);
    });
}

module.exports = { syncTeamPlayers }; 