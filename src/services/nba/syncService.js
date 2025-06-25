const axios = require('axios');
const prisma = require('../../db/client');

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function syncTeamsFromAPI() {
  try {
    console.log('🔄 Syncing current NBA teams from BallDontLie API...');
    
    const response = await axios.get('https://api.balldontlie.io/v1/teams', {
      headers: {
        'Authorization': `Bearer ${process.env.BALLDONTLIE_API_KEY}`
      }
    });
    
    const allTeams = response.data.data;
    
    // Filter for current NBA teams only (30 teams)
    const currentTeams = allTeams.filter(team => {
      // Current NBA teams have these conferences
      return team.conference === 'East' || team.conference === 'West';
    });
    
    console.log(`Found ${allTeams.length} total teams, syncing ${currentTeams.length} current NBA teams...`);

    for (const team of currentTeams) {
      console.log(`Processing team: ${team.full_name} (${team.abbreviation})`);
      
      await prisma.team.upsert({
        where: { nbaId: String(team.id) },
        update: {
          name: team.full_name,
          abbreviation: team.abbreviation,
          city: team.city,
          conference: team.conference,
          division: team.division
        },
        create: {
          nbaId: String(team.id),
          name: team.full_name,
          abbreviation: team.abbreviation,
          city: team.city,
          conference: team.conference,
          division: team.division
        }
      });
    }
    console.log(`✅ Synced ${currentTeams.length} current NBA teams`);
  } catch (error) {
    console.error('❌ Error syncing teams:', error.message);
    throw error;
  }
}

module.exports = { 
  syncTeamsFromAPI
};