const axios = require('axios');

const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba';

class AthletesPaginationTester {
  constructor() {
    this.apiBase = CORE_API_BASE;
  }

  async fetchAthletesPage(pageIndex = 0, pageSize = 100) {
    try {
      const url = `${this.apiBase}/athletes?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      console.log(`  📄 Fetching page ${pageIndex + 1} (${pageSize} items)...`);
      
      const response = await axios.get(url);
      const data = response.data;
      
      console.log(`    ✅ Status: ${response.status}`);
      console.log(`    📊 Page ${pageIndex + 1} of ${data.pageCount}`);
      console.log(`    👥 Items on this page: ${data.items.length}`);
      
      return data;
    } catch (error) {
      console.log(`    ❌ Error: ${error.response?.status || error.message}`);
      return null;
    }
  }

  async getAllAthletes() {
    console.log('🏀 ESPN Core API - Athletes Pagination Test');
    console.log('='.repeat(60));
    
    // Start with page 0 to get metadata
    const firstPage = await this.fetchAthletesPage(0, 100);
    if (!firstPage) {
      console.log('❌ Could not fetch first page');
      return;
    }
    
    console.log(`\n📈 Pagination Info:`);
    console.log(`  - Total pages: ${firstPage.pageCount}`);
    console.log(`  - Page size: ${firstPage.pageSize}`);
    console.log(`  - Total count: ${firstPage.count}`);
    
    const allAthletes = [...firstPage.items];
    
    // Fetch remaining pages
    for (let pageIndex = 1; pageIndex < firstPage.pageCount; pageIndex++) {
      const pageData = await this.fetchAthletesPage(pageIndex, firstPage.pageSize);
      if (pageData && pageData.items) {
        allAthletes.push(...pageData.items);
      }
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎉 Pagination Complete!`);
    console.log(`  - Total athletes fetched: ${allAthletes.length}`);
    
    // Show sample data structure
    if (allAthletes.length > 0) {
      console.log(`\n📋 Sample Athlete Data Structure:`);
      const sample = allAthletes[0];
      console.log(`  - ID: ${sample.id}`);
      console.log(`  - Name: ${sample.displayName}`);
      console.log(`  - Position: ${sample.position?.abbreviation || 'N/A'}`);
      console.log(`  - Team: ${sample.team?.displayName || 'N/A'}`);
      console.log(`  - Active: ${sample.active || 'N/A'}`);
      
      // Show available fields
      const fields = Object.keys(sample);
      console.log(`  - Available fields: ${fields.join(', ')}`);
    }
    
    // Show some stats
    console.log(`\n📊 Athletes Summary:`);
    const activeAthletes = allAthletes.filter(a => a.active);
    const inactiveAthletes = allAthletes.filter(a => !a.active);
    
    console.log(`  - Active athletes: ${activeAthletes.length}`);
    console.log(`  - Inactive athletes: ${inactiveAthletes.length}`);
    
    // Show position breakdown
    const positions = {};
    allAthletes.forEach(athlete => {
      const pos = athlete.position?.abbreviation || 'Unknown';
      positions[pos] = (positions[pos] || 0) + 1;
    });
    
    console.log(`\n🏀 Position Breakdown:`);
    Object.entries(positions).forEach(([pos, count]) => {
      console.log(`  - ${pos}: ${count} players`);
    });
    
    // Show team breakdown
    const teams = {};
    allAthletes.forEach(athlete => {
      const team = athlete.team?.displayName || 'No Team';
      teams[team] = (teams[team] || 0) + 1;
    });
    
    console.log(`\n🏀 Team Breakdown (top 10):`);
    Object.entries(teams)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([team, count]) => {
        console.log(`  - ${team}: ${count} players`);
      });
    
    return allAthletes;
  }
}

// Run the test
if (require.main === module) {
  const tester = new AthletesPaginationTester();
  tester.getAllAthletes()
    .then((athletes) => {
      console.log('\n🎉 Athletes pagination test completed!');
      if (athletes) {
        console.log(`📈 Total athletes available: ${athletes.length}`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = AthletesPaginationTester; 