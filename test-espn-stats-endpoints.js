const axios = require('axios');

async function testESPNStatsEndpoints() {
  try {
    console.log('Testing various ESPN stats endpoints...\n');

    // Test different endpoint patterns
    const endpoints = [
      // Pattern 1: site.web.api.espn.com
      'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/2544',
      'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/2544/stats',
      
      // Pattern 2: site.api.espn.com
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/athletes/2544',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/athletes/2544/stats',
      
      // Pattern 3: content.core.api.espn.com
      'https://content.core.api.espn.com/v1/sports/basketball/nba/athletes/2544',
      
      // Pattern 4: Different athlete ID (try a more recent player)
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/athletes/4066268', // Luka Doncic
      'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/4066268',
      
      // Pattern 5: Team stats endpoint
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/2', // Celtics
      'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/teams/2'
    ];

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`\n${i + 1}. Testing: ${endpoint}`);
      
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('✅ Success! Status:', response.status);
        console.log('Response keys:', Object.keys(response.data));
        
        // Check for athlete/player data
        if (response.data.athletes) {
          console.log(`Found ${response.data.athletes.length} athletes`);
          if (response.data.athletes.length > 0) {
            const athlete = response.data.athletes[0];
            console.log('Athlete keys:', Object.keys(athlete));
            console.log('Name:', athlete.fullName || athlete.name);
            
            // Check for stats
            if (athlete.stats) {
              console.log('📊 Stats available:', Object.keys(athlete.stats));
            }
          }
        }
        
        // Check for team data
        if (response.data.team) {
          console.log('🏀 Team data found');
          console.log('Team keys:', Object.keys(response.data.team));
        }
        
        // Check for players in team
        if (response.data.athletes) {
          console.log(`Found ${response.data.athletes.length} players`);
        }
        
      } catch (error) {
        console.log('❌ Failed:', error.response?.status || error.message);
        if (error.response?.status === 404) {
          console.log('   - Endpoint not found');
        }
      }
    }

    // Test the general NBA stats endpoint
    console.log('\n\nTesting general NBA stats endpoints...');
    const generalEndpoints = [
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/statistics',
      'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/statistics',
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings'
    ];

    for (let i = 0; i < generalEndpoints.length; i++) {
      const endpoint = generalEndpoints[i];
      console.log(`\n${i + 1}. Testing: ${endpoint}`);
      
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000
        });
        
        console.log('✅ Success! Status:', response.status);
        console.log('Response keys:', Object.keys(response.data));
        
      } catch (error) {
        console.log('❌ Failed:', error.response?.status || error.message);
      }
    }

  } catch (error) {
    console.error('Error testing endpoints:', error.message);
  }
}

testESPNStatsEndpoints(); 