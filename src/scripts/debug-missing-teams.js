const axios = require('axios');
const prisma = require('../db/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

async function debugMissingTeams() {
  try {
    // Get teams from ESPN
    const response = await axios.get(`${ESPN_API_BASE}/teams`);
    const espnTeams = response.data.sports[0].leagues[0].teams;
    
    // Get teams from our database
    const dbTeams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        primaryColor: true,
        logoUrl: true
      }
    });
    
    console.log('ESPN Teams:');
    espnTeams.forEach(team => {
      console.log(`${team.team.abbreviation}: ${team.team.displayName}`);
    });
    
    console.log('\nDatabase Teams:');
    dbTeams.forEach(team => {
      console.log(`${team.abbreviation}: ${team.name} ${team.logoUrl ? '✅' : '❌'}`);
    });
    
    // Find missing teams
    const missingTeams = dbTeams.filter(dbTeam => !dbTeam.logoUrl);
    console.log('\nMissing branding:');
    missingTeams.forEach(team => {
      const espnTeam = espnTeams.find(et => 
        et.team.abbreviation === team.abbreviation ||
        et.team.abbreviation === 'SA' && team.abbreviation === 'SAS' ||
        et.team.abbreviation === 'UTAH' && team.abbreviation === 'UTA' ||
        et.team.abbreviation === 'WSH' && team.abbreviation === 'WAS'
      );
      
      if (espnTeam) {
        console.log(`❌ ${team.abbreviation}: ${team.name} - ESPN has: ${espnTeam.team.abbreviation}`);
      } else {
        console.log(`❌ ${team.abbreviation}: ${team.name} - Not found in ESPN data`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMissingTeams(); 