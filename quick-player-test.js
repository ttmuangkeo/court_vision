const axios = require('axios');

async function quickPlayerTest() {
  try {
    console.log('Quick test of ESPN Player Stats API...\n');

    // Use LeBron James' ESPN ID (2544) as a test
    const playerId = 2544;
    console.log(`Testing with LeBron James (ID: ${playerId})`);
    
    // Test the gamelog endpoint
    const gamelogUrl = `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${playerId}/gamelog`;
    console.log(`Gamelog URL: ${gamelogUrl}`);
    
    try {
      const response = await axios.get(gamelogUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('✅ Response received!');
      console.log('Status:', response.status);
      console.log('Response keys:', Object.keys(response.data));
      
      if (response.data.athletes && response.data.athletes.length > 0) {
        const athlete = response.data.athletes[0];
        console.log('\n🏀 Player Info:');
        console.log('Name:', athlete.fullName);
        console.log('Position:', athlete.position?.abbreviation);
        console.log('Team:', athlete.team?.name);
        
        // Check for stats
        if (athlete.stats) {
          console.log('\n📊 Stats available:');
          console.log('Stats keys:', Object.keys(athlete.stats));
          
          // Check for gamelog
          if (athlete.stats.gamelog) {
            console.log(`\n🎮 Gamelog: ${athlete.stats.gamelog.length} games`);
            if (athlete.stats.gamelog.length > 0) {
              const sampleGame = athlete.stats.gamelog[0];
              console.log('Sample game keys:', Object.keys(sampleGame));
              console.log('Sample game:', sampleGame);
            }
          }
        }
        
        // Check for direct gamelog property
        if (athlete.gamelog) {
          console.log(`\n🎮 Direct gamelog: ${athlete.gamelog.length} games`);
        }
        
      } else {
        console.log('❌ No athlete data found');
        console.log('Response structure:', JSON.stringify(response.data, null, 2));
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }

  } catch (error) {
    console.error('Error in quick test:', error.message);
  }
}

quickPlayerTest(); 