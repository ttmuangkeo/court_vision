const axios = require('axios');

async function examineStatsData() {
  const playerId = '4278039'; // Nickeil Alexander-Walker
  const endpoint = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${playerId}`;
  
  console.log(`Examining stats data from: ${endpoint}`);
  
  try {
    const response = await axios.get(endpoint);
    const data = response.data;
    
    if (data.athlete) {
      console.log('\n=== Athlete Basic Info ===');
      console.log('Name:', data.athlete.fullName);
      console.log('Position:', data.athlete.position?.abbreviation);
      console.log('Team:', data.athlete.team?.name);
      
      console.log('\n=== Stats Summary ===');
      if (data.athlete.statsSummary) {
        console.log('Stats Summary:', JSON.stringify(data.athlete.statsSummary, null, 2));
      } else {
        console.log('No statsSummary found');
      }
      
      console.log('\n=== Season Data ===');
      if (data.season) {
        console.log('Season keys:', Object.keys(data.season));
        if (data.season.stats) {
          console.log('Season stats:', JSON.stringify(data.season.stats, null, 2));
        }
      }
      
      console.log('\n=== League Data ===');
      if (data.league) {
        console.log('League keys:', Object.keys(data.league));
        if (data.league.stats) {
          console.log('League stats:', JSON.stringify(data.league.stats, null, 2));
        }
      }
      
      // Check if there are any other stats-related fields
      console.log('\n=== All Athlete Fields ===');
      Object.keys(data.athlete).forEach(key => {
        if (key.toLowerCase().includes('stat') || key.toLowerCase().includes('score') || key.toLowerCase().includes('point')) {
          console.log(`${key}:`, JSON.stringify(data.athlete[key], null, 2));
        }
      });
    }
    
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

examineStatsData(); 