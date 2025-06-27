const axios = require('axios');

const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba';

class AthletesDetailsTester {
  constructor() {
    this.apiBase = CORE_API_BASE;
  }

  async fetchAthleteDetails(athleteRef) {
    try {
      const response = await axios.get(athleteRef);
      return response.data;
    } catch (error) {
      console.log(`    ❌ Error fetching athlete details: ${error.response?.status || error.message}`);
      return null;
    }
  }

  async testAthletesWithDetails() {
    console.log('🏀 ESPN Core API - Athletes Details Test');
    console.log('='.repeat(60));
    
    // Get first page of athletes to see the structure
    try {
      const response = await axios.get(`${this.apiBase}/athletes?pageIndex=0&pageSize=25`);
      const data = response.data;
      
      console.log(`📊 Found ${data.items.length} athlete references on first page`);
      console.log(`📈 Total athletes available: ${data.count}`);
      
      // Test the first few athlete references
      const testCount = Math.min(5, data.items.length);
      console.log(`\n🔍 Testing first ${testCount} athletes...`);
      
      const athletes = [];
      
      for (let i = 0; i < testCount; i++) {
        const athleteRef = data.items[i];
        console.log(`\n  👤 Athlete ${i + 1}:`);
        console.log(`    📄 Reference: ${athleteRef.$ref}`);
        
        const athleteDetails = await this.fetchAthleteDetails(athleteRef.$ref);
        
        if (athleteDetails) {
          console.log(`    ✅ Details fetched successfully`);
          console.log(`    🏷️  Name: ${athleteDetails.displayName || 'N/A'}`);
          console.log(`    🏀 Position: ${athleteDetails.position?.abbreviation || 'N/A'}`);
          console.log(`    🏆 Team: ${athleteDetails.team?.displayName || 'N/A'}`);
          console.log(`    ✅ Active: ${athleteDetails.active ? 'Yes' : 'No'}`);
          console.log(`    📊 Has stats: ${athleteDetails.statistics ? 'Yes' : 'No'}`);
          
          athletes.push(athleteDetails);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Show summary of what we found
      console.log(`\n📊 Summary of ${athletes.length} athletes:`);
      const activeAthletes = athletes.filter(a => a.active);
      const inactiveAthletes = athletes.filter(a => !a.active);
      
      console.log(`  - Active: ${activeAthletes.length}`);
      console.log(`  - Inactive: ${inactiveAthletes.length}`);
      
      // Show available fields from first athlete
      if (athletes.length > 0) {
        const sample = athletes[0];
        console.log(`\n📋 Available fields for athletes:`);
        const fields = Object.keys(sample);
        fields.forEach(field => {
          console.log(`  - ${field}`);
        });
      }
      
      // Test getting statistics for one active athlete
      const activeAthlete = athletes.find(a => a.active);
      if (activeAthlete) {
        console.log(`\n📈 Testing statistics for ${activeAthlete.displayName}...`);
        
        try {
          const statsResponse = await axios.get(`${this.apiBase}/athletes/${activeAthlete.id}/statistics`);
          const statsData = statsResponse.data;
          
          console.log(`  ✅ Statistics fetched successfully`);
          console.log(`  📊 Available stats data:`);
          
          if (statsData.splits) {
            console.log(`    - Splits: ${statsData.splits.length} categories`);
            statsData.splits.forEach((split, index) => {
              console.log(`      ${index + 1}. ${split.name || 'Unknown'}`);
            });
          }
          
          if (statsData.athlete) {
            console.log(`    - Athlete info included`);
          }
          
        } catch (error) {
          console.log(`  ❌ Could not fetch statistics: ${error.response?.status || error.message}`);
        }
      }
      
      return athletes;
      
    } catch (error) {
      console.error(`❌ Error fetching athletes: ${error.message}`);
      return [];
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new AthletesDetailsTester();
  tester.testAthletesWithDetails()
    .then((athletes) => {
      console.log('\n🎉 Athletes details test completed!');
      if (athletes) {
        console.log(`📈 Total athletes with details: ${athletes.length}`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = AthletesDetailsTester; 