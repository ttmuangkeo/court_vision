const axios = require('axios');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class ESPNApiTester {
  constructor() {
    this.apiBase = ESPN_API_BASE;
  }

  async testEndpoint(url, description) {
    try {
      console.log(`\n🧪 Testing: ${description}`);
      console.log(`URL: ${url}`);
      
      const response = await axios.get(url);
      console.log(`✅ Status: ${response.status}`);
      
      // Analyze the response structure
      const data = response.data;
      
      if (data.events) {
        console.log(`📊 Events found: ${data.events.length}`);
        
        if (data.events.length > 0) {
          const firstEvent = data.events[0];
          console.log(`🏀 First game: ${firstEvent.name} (${firstEvent.id})`);
          
          if (firstEvent.competitions && firstEvent.competitions[0]) {
            const competition = firstEvent.competitions[0];
            console.log(`👥 Teams: ${competition.competitors.length}`);
            
            // Check for leaders
            let totalLeaders = 0;
            competition.competitors.forEach(competitor => {
              if (competitor.leaders) {
                competitor.leaders.forEach(leader => {
                  totalLeaders += leader.leaders.length;
                });
              }
            });
            console.log(`⭐ Leaders found: ${totalLeaders}`);
          }
        }
      }
      
      // Check for other data structures
      if (data.boxscore) {
        console.log(`📈 Boxscore data found!`);
        console.log(`   - Home team players: ${data.boxscore.gameInfo?.homeTeam?.players?.length || 0}`);
        console.log(`   - Away team players: ${data.boxscore.gameInfo?.awayTeam?.players?.length || 0}`);
      }
      
      if (data.gameInfo) {
        console.log(`🎮 Game info found`);
      }
      
      if (data.stats) {
        console.log(`📊 Stats data found`);
      }
      
      return true;
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
      if (error.response?.status === 404) {
        console.log(`   - Endpoint not found`);
      } else if (error.response?.status === 403) {
        console.log(`   - Access forbidden`);
      }
      return false;
    }
  }

  async runTests() {
    console.log('🏀 ESPN API Parameter Testing');
    console.log('=' .repeat(60));
    
    // Test 1: Basic scoreboard
    await this.testEndpoint(
      `${this.apiBase}/scoreboard`,
      'Basic scoreboard (current implementation)'
    );
    
    // Test 2: Scoreboard with limit parameter
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?limit=1000`,
      'Scoreboard with limit=1000'
    );
    
    // Test 3: Scoreboard with dates parameter
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?dates=${today}`,
      `Scoreboard with today's date (${today})`
    );
    
    // Test 4: Scoreboard with season parameter
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?season=2024`,
      'Scoreboard with season=2024'
    );
    
    // Test 5: Scoreboard with multiple parameters
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?limit=1000&dates=${today}`,
      'Scoreboard with limit and dates'
    );
    
    // Test 6: Try boxscore endpoint for a specific game
    // First get a game ID from scoreboard
    try {
      const scoreboardResponse = await axios.get(`${this.apiBase}/scoreboard`);
      if (scoreboardResponse.data.events && scoreboardResponse.data.events.length > 0) {
        const gameId = scoreboardResponse.data.events[0].id;
        
        await this.testEndpoint(
          `${this.apiBase}/boxscore?id=${gameId}`,
          `Boxscore for game ${gameId}`
        );
        
        // Test 7: Boxscore with different parameters
        await this.testEndpoint(
          `${this.apiBase}/boxscore?id=${gameId}&limit=1000`,
          `Boxscore with limit for game ${gameId}`
        );
        
        await this.testEndpoint(
          `${this.apiBase}/boxscore?id=${gameId}&enable=stats,roster`,
          `Boxscore with enable parameter for game ${gameId}`
        );
      }
    } catch (error) {
      console.log(`❌ Could not get game ID for boxscore tests: ${error.message}`);
    }
    
    // Test 8: Try different view parameters
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?view=boxscore`,
      'Scoreboard with view=boxscore'
    );
    
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?view=stats`,
      'Scoreboard with view=stats'
    );
    
    // Test 9: Try enable parameter
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?enable=stats`,
      'Scoreboard with enable=stats'
    );
    
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?enable=roster,stats`,
      'Scoreboard with enable=roster,stats'
    );
    
    // Test 10: Try xhr parameter
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?xhr=1`,
      'Scoreboard with xhr=1'
    );
    
    // Test 11: Try different date ranges
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0].replace(/-/g, '');
    
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?dates=${yesterdayStr}-${today}`,
      `Scoreboard with date range (${yesterdayStr}-${today})`
    );
    
    // Test 12: Try seasontype parameter
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?seasontype=2`,
      'Scoreboard with seasontype=2 (regular season)'
    );
    
    await this.testEndpoint(
      `${this.apiBase}/scoreboard?seasontype=3`,
      'Scoreboard with seasontype=3 (playoffs)'
    );
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Testing complete!');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new ESPNApiTester();
  tester.runTests()
    .then(() => {
      console.log('\n🎉 All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = ESPNApiTester; 