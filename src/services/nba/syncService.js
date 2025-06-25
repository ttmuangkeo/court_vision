const axios = require('axios');
const prisma = require('../../db/client');

async function syncTeamsFromAPI() {
  const response = await axios.get('https://www.balldontlie.io/api/v1/teams');
  const teams = response.data.data;

  for (const team of teams) {
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
  console.log('✅ Synced teams from balldontlie');
}

module.exports = { syncTeamsFromAPI };
