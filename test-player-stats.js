const axios = require('axios');

async function testPlayerStats() {
  try {
    console.log('Testing ESPN Player Stats API...\n');

    // First, let's get some NBA player IDs from the news API
    console.log('1. Getting NBA player IDs from news...');
    const newsResponse = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=10');
    
    // Extract player IDs from the news articles
    const playerIds = new Set();
    newsResponse.data.articles.forEach(article => {
      if (article.categories) {
        article.categories.forEach(category => {
          if (category.type === 'athlete' && category.athleteId) {
            playerIds.add(category.athleteId);
          }
        });
      }
    });

    console.log(`Found ${playerIds.size} unique player IDs:`, Array.from(playerIds).slice(0, 5));
    console.log('');

    // Test the player stats endpoint for a few players
    const testPlayerIds = Array.from(playerIds).slice(0, 3);
    
    for (let i = 0; i < testPlayerIds.length; i++) {
      const playerId = testPlayerIds[i];
      console.log(`\n=== Testing Player Stats for ID: ${playerId} ===`);
      
      // Test the basketball/nba endpoint (not football/nfl)
      const statsUrl = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${playerId}/gamelog`;
      console.log(`Stats URL: ${statsUrl}`);
      
      try {
        const statsResponse = await axios.get(statsUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('✅ Stats API Response:');
        console.log('Status:', statsResponse.status);
        console.log('Response keys:', Object.keys(statsResponse.data));
        
        if (statsResponse.data.athletes && statsResponse.data.athletes.length > 0) {
          const athlete = statsResponse.data.athletes[0];
          console.log('\n🏀 Athlete Info:');
          console.log('Name:', athlete.fullName);
          console.log('Position:', athlete.position?.abbreviation);
          console.log('Team:', athlete.team?.name);
          console.log('Available keys:', Object.keys(athlete));
          
          // Check for stats
          if (athlete.stats) {
            console.log('\n📊 Stats available:');
            console.log('Stats keys:', Object.keys(athlete.stats));
            
            // Check for different stat types
            const statTypes = ['splits', 'categories', 'gamelog', 'season', 'career'];
            statTypes.forEach(type => {
              if (athlete.stats[type]) {
                console.log(`✅ ${type} stats found`);
                if (type === 'gamelog' && athlete.stats[type].length > 0) {
                  console.log(`   - ${athlete.stats[type].length} games in gamelog`);
                  const sampleGame = athlete.stats[type][0];
                  console.log('   - Sample game keys:', Object.keys(sampleGame));
                }
              }
            });
          }
          
          // Check for gamelog specifically
          if (athlete.gamelog) {
            console.log('\n🎮 Gamelog data:');
            console.log('Gamelog keys:', Object.keys(athlete.gamelog));
            if (athlete.gamelog.length > 0) {
              console.log(`Found ${athlete.gamelog.length} games`);
              const sampleGame = athlete.gamelog[0];
              console.log('Sample game:', sampleGame);
            }
          }
          
        } else {
          console.log('❌ No athlete data found');
          console.log('Full response:', JSON.stringify(statsResponse.data, null, 2));
        }
        
      } catch (statsError) {
        console.log('❌ Stats API error:', statsError.message);
        if (statsError.response) {
          console.log('Response status:', statsError.response.status);
          console.log('Response data:', statsError.response.data);
        }
      }
      
      console.log('\n' + '='.repeat(80));
    }

    // Also test the general athlete endpoint
    console.log('\n2. Testing general athlete endpoint...');
    try {
      const generalAthleteUrl = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${testPlayerIds[0]}`;
      console.log(`Testing: ${generalAthleteUrl}`);
      
      const generalResponse = await axios.get(generalAthleteUrl, {
        timeout: 10000
      });
      
      console.log('✅ General athlete API response:');
      console.log('Status:', generalResponse.status);
      console.log('Response keys:', Object.keys(generalResponse.data));
      
      if (generalResponse.data.athletes && generalResponse.data.athletes.length > 0) {
        const athlete = generalResponse.data.athletes[0];
        console.log('Athlete info:', {
          name: athlete.fullName,
          position: athlete.position?.abbreviation,
          team: athlete.team?.name,
          availableKeys: Object.keys(athlete)
        });
      }
      
    } catch (generalError) {
      console.log('❌ General athlete API error:', generalError.message);
    }

    // Test season stats endpoint
    console.log('\n3. Testing season stats endpoint...');
    try {
      const seasonStatsUrl = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${testPlayerIds[0]}/stats`;
      console.log(`Testing: ${seasonStatsUrl}`);
      
      const seasonResponse = await axios.get(seasonStatsUrl, {
        timeout: 10000
      });
      
      console.log('✅ Season stats API response:');
      console.log('Status:', seasonResponse.status);
      console.log('Response keys:', Object.keys(seasonResponse.data));
      
      if (seasonResponse.data.athletes && seasonResponse.data.athletes.length > 0) {
        const athlete = seasonResponse.data.athletes[0];
        console.log('Season stats available:', Object.keys(athlete.stats || {}));
      }
      
    } catch (seasonError) {
      console.log('❌ Season stats API error:', seasonError.message);
    }

  } catch (error) {
    console.error('Error testing player stats:', error.message);
  }
}

testPlayerStats(); 