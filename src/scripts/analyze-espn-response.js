const axios = require('axios');
const fs = require('fs');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class ESPNAnalyzer {
  constructor() {
    this.apiBase = ESPN_API_BASE;
  }

  async analyzeResponse(url, description) {
    try {
      console.log(`\n🔍 Analyzing: ${description}`);
      console.log(`URL: ${url}`);
      
      const response = await axios.get(url);
      const data = response.data;
      
      // Save the raw response for inspection
      const filename = `espn_response_${Date.now()}.json`;
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`💾 Raw response saved to: ${filename}`);
      
      // Analyze the structure
      this.analyzeStructure(data, '');
      
      return data;
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || error.message}`);
      return null;
    }
  }

  analyzeStructure(obj, path, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      console.log(`${'  '.repeat(currentDepth)}... (max depth reached)`);
      return;
    }

    if (Array.isArray(obj)) {
      console.log(`${'  '.repeat(currentDepth)}📋 Array with ${obj.length} items`);
      if (obj.length > 0 && currentDepth < maxDepth - 1) {
        this.analyzeStructure(obj[0], path + '[0]', maxDepth, currentDepth + 1);
      }
    } else if (obj && typeof obj === 'object') {
      const keys = Object.keys(obj);
      console.log(`${'  '.repeat(currentDepth)}📦 Object with keys: ${keys.join(', ')}`);
      
      // Look for interesting keys
      const interestingKeys = ['leaders', 'stats', 'players', 'boxscore', 'gameInfo', 'competitors', 'athletes'];
      const foundInteresting = keys.filter(key => interestingKeys.includes(key));
      
      if (foundInteresting.length > 0) {
        console.log(`${'  '.repeat(currentDepth)}🎯 Interesting keys found: ${foundInteresting.join(', ')}`);
      }
      
      // Analyze interesting keys in detail
      for (const key of foundInteresting) {
        if (obj[key] && currentDepth < maxDepth - 1) {
          console.log(`${'  '.repeat(currentDepth)}🔍 Analyzing ${key}:`);
          this.analyzeStructure(obj[key], path + '.' + key, maxDepth, currentDepth + 1);
        }
      }
    } else {
      console.log(`${'  '.repeat(currentDepth)}📄 ${typeof obj}: ${String(obj).substring(0, 100)}`);
    }
  }

  async analyzeGameLeaders(gameId) {
    try {
      console.log(`\n🏀 Analyzing game leaders for game ${gameId}...`);
      
      const response = await axios.get(`${this.apiBase}/scoreboard`);
      const game = response.data.events.find(event => event.id === gameId);
      
      if (!game) {
        console.log(`❌ Game ${gameId} not found`);
        return;
      }
      
      console.log(`✅ Found game: ${game.name}`);
      
      if (game.competitions && game.competitions[0]) {
        const competition = game.competitions[0];
        
        competition.competitors.forEach((competitor, index) => {
          console.log(`\n👥 Team ${index + 1}: ${competitor.team.displayName}`);
          
          if (competitor.leaders) {
            console.log(`  📊 Leaders categories: ${competitor.leaders.length}`);
            
            competitor.leaders.forEach((leader, leaderIndex) => {
              console.log(`    📈 Category ${leaderIndex + 1}: ${leader.name} (${leader.leaders.length} players)`);
              
              leader.leaders.forEach((playerLeader, playerIndex) => {
                const player = playerLeader.athlete;
                console.log(`      👤 Player ${playerIndex + 1}: ${player.displayName} (${playerLeader.value} ${leader.name})`);
              });
            });
          } else {
            console.log(`  ❌ No leaders data`);
          }
          
          // Check for other potential data sources
          const otherKeys = Object.keys(competitor).filter(key => 
            !['team', 'score', 'homeAway', 'leaders'].includes(key)
          );
          
          if (otherKeys.length > 0) {
            console.log(`  🔍 Other data keys: ${otherKeys.join(', ')}`);
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ Error analyzing game leaders: ${error.message}`);
    }
  }

  async runAnalysis() {
    console.log('🔍 ESPN API Response Analysis');
    console.log('=' .repeat(60));
    
    // Get a game ID first
    const scoreboardResponse = await axios.get(`${this.apiBase}/scoreboard`);
    const gameId = scoreboardResponse.data.events?.[0]?.id;
    
    if (!gameId) {
      console.log('❌ No games found in scoreboard');
      return;
    }
    
    // Analyze basic scoreboard
    await this.analyzeResponse(
      `${this.apiBase}/scoreboard`,
      'Basic scoreboard'
    );
    
    // Analyze scoreboard with different parameters
    await this.analyzeResponse(
      `${this.apiBase}/scoreboard?view=boxscore&enable=stats,roster`,
      'Scoreboard with view=boxscore and enable=stats,roster'
    );
    
    // Analyze specific game leaders
    await this.analyzeGameLeaders(gameId);
    
    // Try to find any additional endpoints
    console.log('\n🔍 Testing additional endpoints...');
    
    const additionalEndpoints = [
      `${this.apiBase}/teams`,
      `${this.apiBase}/teams?enable=roster`,
      `${this.apiBase}/athletes`,
      `${this.apiBase}/athletes?active=true`,
      `${this.apiBase}/stats`,
      `${this.apiBase}/stats?limit=1000`
    ];
    
    for (const endpoint of additionalEndpoints) {
      try {
        const response = await axios.get(endpoint);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        
        if (response.data.athletes) {
          console.log(`  👥 Found ${response.data.athletes.length} athletes`);
        }
        if (response.data.teams) {
          console.log(`  🏀 Found ${response.data.teams.length} teams`);
        }
        if (response.data.stats) {
          console.log(`  📊 Found stats data`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Analysis complete! Check the saved JSON files for detailed structure.');
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new ESPNAnalyzer();
  analyzer.runAnalysis()
    .then(() => {
      console.log('\n🎉 Analysis completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = ESPNAnalyzer; 