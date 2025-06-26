const prisma = require('../../db/client');
const { apiClient, delay, filterCurrentNBATeams } = require('./baseService');

async function syncTeamsFromAPI() {
  try {
    console.log('🔄 Syncing current NBA teams from BallDontLie API...');
    
    const response = await apiClient.get('/teams');
    const allTeams = response.data.data;
    const currentTeams = filterCurrentNBATeams(allTeams);
    
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

module.exports = { syncTeamsFromAPI };
