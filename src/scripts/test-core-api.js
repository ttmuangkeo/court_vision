const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba';

class CoreApiTester {
  constructor() {
    this.apiBase = CORE_API_BASE;
    this.prisma = new PrismaClient();
  }

  async testEndpoint(url, label) {
    try {
      console.log(`\n🔍 Testing: ${label}`);
      console.log(`URL: ${url}`);
      const response = await axios.get(url);
      console.log(`  ✅ Status: ${response.status}`);
      const data = response.data;
      // Print top-level keys and a preview
      if (typeof data === 'object') {
        const keys = Object.keys(data);
        console.log(`  📦 Top-level keys: ${keys.join(', ')}`);
        if (data.items && Array.isArray(data.items)) {
          console.log(`  📋 items: ${data.items.length} items`);
        }
        if (data.athletes && Array.isArray(data.athletes)) {
          console.log(`  👥 athletes: ${data.athletes.length} athletes`);
        }
        if (data.boxscore) {
          console.log('  📊 boxscore found!');
        }
        if (data.plays) {
          console.log('  ▶️ plays found!');
        }
        if (data.statistics) {
          console.log('  📈 statistics found!');
        }
        if (data.splits) {
          console.log('  📊 splits found!');
        }
        if (data.events && Array.isArray(data.events)) {
          console.log(`  🏀 events: ${data.events.length} events`);
        }
      } else {
        console.log('  (Non-object response)');
      }
      return data;
    } catch (error) {
      console.log(`  ❌ ${error.response?.status || error.message}`);
      return null;
    }
  }

  async runTests() {
    console.log('🏀 ESPN Core API Endpoint Testing');
    console.log('='.repeat(60));
    // Get a recent game and player from DB
    let gameId = null;
    let athleteId = null;
    try {
      const game = await this.prisma.game.findFirst();
      if (game) gameId = game.espnId;
      const player = await this.prisma.player.findFirst();
      if (player) athleteId = player.espnId;
    } catch (e) {
      console.log('  ⚠️ Could not get game/player from DB');
    }
    // 1. League root
    await this.testEndpoint(`${this.apiBase}/`, 'League root');
    // 2. Scoreboard (events)
    await this.testEndpoint(`${this.apiBase}/events`, 'Scoreboard/events');
    // 3. Games (with gameId)
    if (gameId) {
      await this.testEndpoint(`${this.apiBase}/events/${gameId}`, 'Event/game details');
      await this.testEndpoint(`${this.apiBase}/events/${gameId}/boxscore`, 'Boxscore for game');
      await this.testEndpoint(`${this.apiBase}/events/${gameId}/plays`, 'Plays for game');
      await this.testEndpoint(`${this.apiBase}/events/${gameId}/competitions`, 'Competitions for game');
      await this.testEndpoint(`${this.apiBase}/events/${gameId}/statistics`, 'Statistics for game');
    }
    // 4. Athletes (with athleteId)
    await this.testEndpoint(`${this.apiBase}/athletes`, 'All athletes');
    if (athleteId) {
      await this.testEndpoint(`${this.apiBase}/athletes/${athleteId}`, 'Athlete details');
      await this.testEndpoint(`${this.apiBase}/athletes/${athleteId}/statistics`, 'Athlete statistics');
      await this.testEndpoint(`${this.apiBase}/athletes/${athleteId}/gamelog`, 'Athlete gamelog');
      await this.testEndpoint(`${this.apiBase}/athletes/${athleteId}/splits`, 'Athlete splits');
    }
    // 5. Teams
    await this.testEndpoint(`${this.apiBase}/teams`, 'All teams');
    // 6. Standings
    await this.testEndpoint(`${this.apiBase}/standings`, 'Standings');
    // 7. Seasons
    await this.testEndpoint(`${this.apiBase}/seasons`, 'Seasons');
    // 8. Schedule
    await this.testEndpoint(`${this.apiBase}/schedule`, 'Schedule');
    // 9. Odds
    await this.testEndpoint(`${this.apiBase}/odds`, 'Odds');
    // 10. Venues
    await this.testEndpoint(`${this.apiBase}/venues`, 'Venues');
    console.log('\n' + '='.repeat(60));
    console.log('✅ Core API endpoint testing complete!');
    await this.prisma.$disconnect();
  }
}

if (require.main === module) {
  const tester = new CoreApiTester();
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

module.exports = CoreApiTester; 