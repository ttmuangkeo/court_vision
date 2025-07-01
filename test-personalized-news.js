const axios = require('axios');

async function testPersonalizedNews() {
  try {
    console.log('Testing personalized news...\n');

    // First, let's get a user token by logging in
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      emailOrUsername: 'demo@example.com',
      password: 'demo123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test personalized news
    console.log('\n2. Testing personalized news...');
    const personalizedResponse = await axios.get('http://localhost:3000/api/news/personalized', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (personalizedResponse.data.success) {
      const data = personalizedResponse.data.data;
      console.log('✅ Personalized news fetched successfully');
      console.log(`- League news: ${data.league.length} articles`);
      console.log(`- Team news: ${data.teams.length} articles`);
      console.log(`- Player news: ${data.players.length} articles`);
      console.log(`- All news: ${data.all.length} articles`);
      
      if (data.teams.length > 0) {
        console.log('\nSample team news:');
        console.log(`- Title: ${data.teams[0].title}`);
        console.log(`- Team: ${data.teams[0].teamName}`);
      }
      
      if (data.players.length > 0) {
        console.log('\nSample player news:');
        console.log(`- Title: ${data.players[0].title}`);
        console.log(`- Player: ${data.players[0].playerName}`);
      }
    } else {
      console.log('❌ Personalized news failed:', personalizedResponse.data.error);
    }

    // Test dashboard news
    console.log('\n3. Testing dashboard news...');
    const dashboardResponse = await axios.get('http://localhost:3000/api/news/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (dashboardResponse.data.success) {
      const data = dashboardResponse.data.data;
      console.log('✅ Dashboard news fetched successfully');
      console.log(`- League news: ${data.league.length} articles`);
      console.log(`- Team news: ${data.teams.length} articles`);
      console.log(`- Player news: ${data.players.length} articles`);
      console.log(`- Featured news: ${data.featured.length} articles`);
      console.log(`- Recent news: ${data.recent.length} articles`);
      
      console.log('\nUser preferences:');
      console.log(`- Favorite teams: ${dashboardResponse.data.userPreferences.favoriteTeams}`);
      console.log(`- Favorite players: ${dashboardResponse.data.userPreferences.favoritePlayers}`);
    } else {
      console.log('❌ Dashboard news failed:', dashboardResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Error testing personalized news:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPersonalizedNews(); 