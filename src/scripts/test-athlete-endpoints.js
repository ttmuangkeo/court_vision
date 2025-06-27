const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class AthleteEndpointTester {
  constructor() {
    this.apiBase = ESPN_API_BASE;
    this.prisma = new PrismaClient();
  }

  async testAthleteEndpoints(athleteId, athleteName) {
    try {
      console.log(`\n🏀 Testing endpoints for ${athleteName} (ID: ${athleteId})...`);
      
      // Test different athlete endpoints
      const endpoints = [
        `${this.apiBase}/athletes/${athleteId}`,
        `${this.apiBase}/athletes/${athleteId}?enable=stats`,
        `${this.apiBase}/athletes/${athleteId}?enable=stats,game-log`,
        `${this.apiBase}/athletes/${athleteId}/stats`,
        `${this.apiBase}/athletes/${athleteId}/stats?limit=1000`,
        `${this.apiBase}/athletes/${athleteId}/stats?season=2024`,
        `${this.apiBase}/athletes/${athleteId}/stats?seasontype=2`,
        `${this.apiBase}/athletes/${athleteId}/game-log`,
        `${this.apiBase}/athletes/${athleteId}/game-log?limit=1000`,
        `${this.apiBase}/athletes/${athleteId}/game-log?season=2024`,
        `${this.apiBase}/athletes/${athleteId}/splits`,
        `${this.apiBase}/athletes/${athleteId}/splits?season=2024`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`  🔍 Testing: ${endpoint}`);
          const response = await axios.get(endpoint);
          console.log(`    ✅ Status: ${response.status}`);
          
          const data = response.data;
          
          if (data.athlete) {
            console.log(`    👤 Found athlete: ${data.athlete.displayName}`);
          }
          
          if (data.stats) {
            console.log(`    📊 Found stats data`);
            if (Array.isArray(data.stats)) {
              console.log(`      - ${data.stats.length} stat categories`);
            }
          }
          
          if (data.splits) {
            console.log(`    📈 Found splits data`);
            if (Array.isArray(data.splits)) {
              console.log(`      - ${data.splits.length} split categories`);
            }
          }
          
          if (data.games) {
            console.log(`    🎮 Found games data`);
            console.log(`      - ${data.games.length} games`);
          }
          
          if (data.events) {
            console.log(`    🏆 Found events data`);
            console.log(`      - ${data.events.length} events`);
          }
          
          // Check for specific game stats
          if (data.stats && Array.isArray(data.stats)) {
            data.stats.forEach((stat, index) => {
              if (stat.name && stat.value) {
                console.log(`      📊 ${stat.name}: ${stat.value}`);
              }
            });
          }
          
        } catch (error) {
          console.log(`    ❌ ${error.response?.status || error.message}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing athlete ${athleteName}: ${error.message}`);
    }
  }

  async testGameSpecificEndpoints(gameId, gameName) {
    try {
      console.log(`\n🏀 Testing game-specific endpoints for ${gameName} (ID: ${gameId})...`);
      
      // Test different game endpoints
      const endpoints = [
        `${this.apiBase}/events/${gameId}`,
        `${this.apiBase}/events/${gameId}?enable=stats`,
        `${this.apiBase}/events/${gameId}?enable=stats,roster`,
        `${this.apiBase}/events/${gameId}/summary`,
        `${this.apiBase}/events/${gameId}/summary?enable=stats`,
        `${this.apiBase}/events/${gameId}/boxscore`,
        `${this.apiBase}/events/${gameId}/boxscore?enable=stats`,
        `${this.apiBase}/events/${gameId}/leaders`,
        `${this.apiBase}/events/${gameId}/leaders?limit=1000`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`  🔍 Testing: ${endpoint}`);
          const response = await axios.get(endpoint);
          console.log(`    ✅ Status: ${response.status}`);
          
          const data = response.data;
          
          if (data.event) {
            console.log(`    🏀 Found event: ${data.event.name}`);
          }
          
          if (data.boxscore) {
            console.log(`    📈 Found boxscore data!`);
            if (data.boxscore.gameInfo) {
              console.log(`      - Game info available`);
            }
            if (data.boxscore.players) {
              console.log(`      - Players data available`);
            }
          }
          
          if (data.leaders) {
            console.log(`    ⭐ Found leaders data`);
            if (Array.isArray(data.leaders)) {
              console.log(`      - ${data.leaders.length} leader categories`);
            }
          }
          
          if (data.summary) {
            console.log(`    📋 Found summary data`);
          }
          
          if (data.competitors) {
            console.log(`    👥 Found competitors data`);
            console.log(`      - ${data.competitors.length} teams`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${error.response?.status || error.message}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error testing game ${gameName}: ${error.message}`);
    }
  }

  async runTests() {
    console.log('🏀 Athlete and Game Endpoint Testing');
    console.log('=' .repeat(60));
    
    try {
      // Get some athletes from our database
      const athletes = await this.prisma.player.findMany({
        take: 3
      });
      
      console.log(`📊 Found ${athletes.length} athletes in database`);
      
      for (const athlete of athletes) {
        await this.testAthleteEndpoints(athlete.espnId, athlete.name);
      }
      
      // Get some games from our database
      const games = await this.prisma.game.findMany({
        take: 2
      });
      
      console.log(`\n📊 Found ${games.length} games in database`);
      
      for (const game of games) {
        const gameName = `${game.awayTeam} @ ${game.homeTeam}`;
        await this.testGameSpecificEndpoints(game.espnId, gameName);
      }
      
    } catch (error) {
      console.error(`❌ Error getting data from database: ${error.message}`);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Athlete and game endpoint testing complete!');
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AthleteEndpointTester();
  tester.runTests()
    .then(async () => {
      await tester.cleanup();
      console.log('\n🎉 All tests completed');
      process.exit(0);
    })
    .catch(async (error) => {
      await tester.cleanup();
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = AthleteEndpointTester; 