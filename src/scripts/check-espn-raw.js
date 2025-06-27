const axios = require('axios');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

async function checkESPNRaw() {
  try {
    console.log('Fetching raw ESPN data...');
    const response = await axios.get(`${ESPN_API_BASE}/teams`);
    const teams = response.data.sports[0].leagues[0].teams;
    
    console.log(`Total teams from ESPN: ${teams.length}`);
    console.log('\nAll ESPN teams:');
    
    teams.forEach((teamData, index) => {
      const team = teamData.team;
      console.log(`${index + 1}. ${team.abbreviation}: ${team.displayName}`);
    });
    
    // Check for specific missing teams
    const missingAbbreviations = ['GSW', 'NOP', 'NYK'];
    console.log('\nLooking for missing teams:');
    
    missingAbbreviations.forEach(abbr => {
      const found = teams.find(t => t.team.abbreviation === abbr);
      if (found) {
        console.log(`✅ Found ${abbr}: ${found.team.displayName}`);
      } else {
        console.log(`❌ Not found: ${abbr}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkESPNRaw(); 