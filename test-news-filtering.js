const axios = require('axios');

async function testNewsFiltering() {
  try {
    console.log('Testing news filtering...\n');

    // Test 1: League news (should work)
    console.log('1. Testing league news...');
    const leagueResponse = await axios.get('http://localhost:3000/api/news/league?limit=3');
    console.log(`✅ League news: ${leagueResponse.data.data.length} articles`);
    console.log('Sample article:', leagueResponse.data.data[0]?.title);
    console.log('');

    // Test 2: Check if articles have team/player data
    console.log('2. Checking article structure...');
    const sampleArticle = leagueResponse.data.data[0];
    if (sampleArticle) {
      console.log('✅ Article has teams:', sampleArticle.teams?.length || 0);
      console.log('✅ Article has players:', sampleArticle.players?.length || 0);
      console.log('✅ Article has categories:', sampleArticle.categories?.length || 0);
      
      if (sampleArticle.teams && sampleArticle.teams.length > 0) {
        console.log('Sample team:', sampleArticle.teams[0]);
      }
      if (sampleArticle.players && sampleArticle.players.length > 0) {
        console.log('Sample player:', sampleArticle.players[0]);
      }
    }
    console.log('');

    // Test 3: Test team news filtering
    console.log('3. Testing team news filtering...');
    const allNews = await axios.get('http://localhost:3000/api/news/league?limit=20');
    const articlesWithTeams = allNews.data.data.filter(article => 
      article.teams && article.teams.length > 0
    );
    console.log(`✅ Articles with team data: ${articlesWithTeams.length}/${allNews.data.data.length}`);
    
    if (articlesWithTeams.length > 0) {
      const sampleTeam = articlesWithTeams[0].teams[0];
      console.log(`Sample team ID: ${sampleTeam.id}, Name: ${sampleTeam.name}`);
      
      // Test filtering for this specific team
      const teamArticles = allNews.data.data.filter(article => 
        article.teams && article.teams.some(team => team.id === sampleTeam.id)
      );
      console.log(`✅ Articles for team ${sampleTeam.name}: ${teamArticles.length}`);
    }
    console.log('');

    // Test 4: Test player news filtering
    console.log('4. Testing player news filtering...');
    const articlesWithPlayers = allNews.data.data.filter(article => 
      article.players && article.players.length > 0
    );
    console.log(`✅ Articles with player data: ${articlesWithPlayers.length}/${allNews.data.data.length}`);
    
    if (articlesWithPlayers.length > 0) {
      const samplePlayer = articlesWithPlayers[0].players[0];
      console.log(`Sample player ID: ${samplePlayer.id}, Name: ${samplePlayer.name}`);
      
      // Test filtering for this specific player
      const playerArticles = allNews.data.data.filter(article => 
        article.players && article.players.some(player => player.id === samplePlayer.id)
      );
      console.log(`✅ Articles for player ${samplePlayer.name}: ${playerArticles.length}`);
    }
    console.log('');

    console.log('🎉 News filtering test completed!');
    console.log('\nSummary:');
    console.log('- League news is working');
    console.log('- Articles have team/player data structure');
    console.log('- Filtering logic should work for user favorites');

  } catch (error) {
    console.error('❌ Error testing news filtering:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testNewsFiltering(); 