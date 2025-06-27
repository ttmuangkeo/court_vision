const axios = require('axios');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class TeamRosterTester {
  constructor() {
    this.apiBase = ESPN_API_BASE;
  }

  async testTeamRoster(teamId, teamName) {
    try {
      console.log(`\n🏀 Testing roster for ${teamName} (ID: ${teamId})...`);
      
      // Test different roster endpoints
      const endpoints = [
        `${this.apiBase}/teams/${teamId}/roster`,
        `${this.apiBase}/teams/${teamId}/roster?enable=stats`,
        `${this.apiBase}/teams/${teamId}/roster?limit=1000`,
        `${this.apiBase}/teams/${teamId}?enable=roster`,
        `${this.apiBase}/teams/${teamId}?enable=roster,stats`,
        `${this.apiBase}/teams/${teamId}/athletes`,
        `${this.apiBase}/teams/${teamId}/athletes?active=true`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`  🔍 Testing: ${endpoint}`);
          const response = await axios.get(endpoint);
          console.log(`    ✅ Status: ${response.status}`);
          
          const data = response.data;
          
          if (data.athletes) {
            console.log(`    👥 Found ${data.athletes.length} athletes`);
            
            // Show first few athletes
            data.athletes.slice(0, 3).forEach((athlete, index) => {
              console.log(`      ${index + 1}. ${athlete.displayName} (${athlete.position?.abbreviation || 'N/A'})`);
            });
          }
          
          if (data.roster) {
            console.log(`    📋 Found roster data`);
            if (data.roster.athletes) {
              console.log(`      👥 Roster has ${data.roster.athletes.length} athletes`);
            }
          }
          
          if (data.team) {
            console.log(`    🏀 Found team data`);
            if (data.team.athletes) {
              console.log(`      👥 Team has ${data.team.athletes.length} athletes`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ ${error.response?.status || error.message}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing roster for ${teamName}: ${error.message}`);
    }
  }

  async runTests() {
    console.log('🏀 Team Roster Testing');
    console.log('=' .repeat(60));
    
    // Get teams from the scoreboard response
    try {
      const scoreboardResponse = await axios.get(`${this.apiBase}/scoreboard`);
      const game = scoreboardResponse.data.events[0];
      
      if (game && game.competitions && game.competitions[0]) {
        const competitors = game.competitions[0].competitors;
        
        for (const competitor of competitors) {
          const teamId = competitor.team.id;
          const teamName = competitor.team.displayName;
          
          await this.testTeamRoster(teamId, teamName);
        }
      }
    } catch (error) {
      console.error(`❌ Error getting teams: ${error.message}`);
    }
    
    // Also test with some known team IDs
    const knownTeams = [
      { id: '2', name: 'Boston Celtics' },
      { id: '17', name: 'Brooklyn Nets' },
      { id: '13', name: 'Los Angeles Lakers' }
    ];
    
    console.log('\n🔍 Testing known teams...');
    for (const team of knownTeams) {
      await this.testTeamRoster(team.id, team.name);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Team roster testing complete!');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new TeamRosterTester();
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

module.exports = TeamRosterTester; 