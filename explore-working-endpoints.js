const axios = require('axios');

async function exploreWorkingEndpoints() {
  try {
    console.log('Exploring working ESPN endpoints for player stats...\n');

    // Test 1: Luka Doncic athlete endpoint (this one worked)
    console.log('1. Testing Luka Doncic athlete endpoint...');
    try {
      const lukaResponse = await axios.get('https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/4066268', {
        timeout: 10000
      });
      
      console.log('✅ Luka endpoint response:');
      console.log('Keys:', Object.keys(lukaResponse.data));
      
      if (lukaResponse.data.athlete) {
        const athlete = lukaResponse.data.athlete;
        console.log('\n🏀 Athlete Info:');
        console.log('Name:', athlete.fullName);
        console.log('Position:', athlete.position?.abbreviation);
        console.log('Team:', athlete.team?.name);
        console.log('Available keys:', Object.keys(athlete));
        
        // Check for stats
        if (athlete.stats) {
          console.log('\n📊 Stats available:');
          console.log('Stats keys:', Object.keys(athlete.stats));
          
          // Explore different stat types
          Object.keys(athlete.stats).forEach(statType => {
            const statData = athlete.stats[statType];
            console.log(`\n${statType.toUpperCase()} stats:`);
            if (Array.isArray(statData)) {
              console.log(`  - Array with ${statData.length} items`);
              if (statData.length > 0) {
                console.log('  - Sample item keys:', Object.keys(statData[0]));
                console.log('  - Sample item:', statData[0]);
              }
            } else if (typeof statData === 'object') {
              console.log('  - Object keys:', Object.keys(statData));
              console.log('  - Object sample:', statData);
            } else {
              console.log('  - Type:', typeof statData, 'Value:', statData);
            }
          });
        }
        
        // Check for statsSummary
        if (athlete.statsSummary) {
          console.log('\n📈 Stats Summary:');
          console.log('Summary keys:', Object.keys(athlete.statsSummary));
          console.log('Summary data:', athlete.statsSummary);
        }
      }
      
    } catch (error) {
      console.log('❌ Luka endpoint error:', error.message);
    }

    // Test 2: Celtics team endpoint (this one worked)
    console.log('\n\n2. Testing Celtics team endpoint...');
    try {
      const celticsResponse = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/2', {
        timeout: 10000
      });
      
      console.log('✅ Celtics endpoint response:');
      console.log('Keys:', Object.keys(celticsResponse.data));
      
      if (celticsResponse.data.team) {
        const team = celticsResponse.data.team;
        console.log('\n🏀 Team Info:');
        console.log('Name:', team.name);
        console.log('Record:', team.record?.items?.[0]?.summary);
        console.log('Available keys:', Object.keys(team));
        
        // Check for groups (roster)
        if (team.groups && Array.isArray(team.groups)) {
          console.log('\n👥 Groups available:');
          team.groups.forEach(group => {
            console.log(`- ${group.name}: ${group.items?.length || 0} items`);
            if (group.name === 'roster' && group.items && group.items.length > 0) {
              console.log('  Roster players:', group.items.length);
              const samplePlayer = group.items[0];
              console.log('  Sample player keys:', Object.keys(samplePlayer));
              console.log('  Sample player:', {
                name: samplePlayer.fullName,
                position: samplePlayer.position?.abbreviation,
                stats: samplePlayer.stats ? Object.keys(samplePlayer.stats) : 'No stats'
              });
            }
          });
        } else if (team.groups) {
          console.log('\n👥 Groups (not array):', typeof team.groups);
          console.log('Groups keys:', Object.keys(team.groups));
        }
      }
      
    } catch (error) {
      console.log('❌ Celtics endpoint error:', error.message);
    }

    // Test 3: Try a different team to see if we can get roster data
    console.log('\n\n3. Testing Lakers team endpoint...');
    try {
      const lakersResponse = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/13', {
        timeout: 10000
      });
      
      console.log('✅ Lakers endpoint response:');
      console.log('Keys:', Object.keys(lakersResponse.data));
      
      if (lakersResponse.data.team) {
        const team = lakersResponse.data.team;
        console.log('\n🏀 Lakers Info:');
        console.log('Name:', team.name);
        console.log('Available keys:', Object.keys(team));
        
        // Check for groups
        if (team.groups) {
          console.log('\n👥 Groups type:', typeof team.groups);
          if (Array.isArray(team.groups)) {
            console.log('Groups array length:', team.groups.length);
            team.groups.forEach((group, index) => {
              console.log(`Group ${index}:`, group.name, group.items?.length || 0, 'items');
            });
          } else {
            console.log('Groups object keys:', Object.keys(team.groups));
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Lakers endpoint error:', error.message);
    }

    // Test 4: Try to get season stats for a player
    console.log('\n\n4. Testing season stats endpoint...');
    try {
      const seasonStatsUrl = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/4066268/stats';
      console.log('Testing:', seasonStatsUrl);
      
      const seasonResponse = await axios.get(seasonStatsUrl, {
        timeout: 10000
      });
      
      console.log('✅ Season stats response:');
      console.log('Keys:', Object.keys(seasonResponse.data));
      
      if (seasonResponse.data.athletes && seasonResponse.data.athletes.length > 0) {
        const athlete = seasonResponse.data.athletes[0];
        console.log('Athlete stats keys:', Object.keys(athlete));
        
        if (athlete.stats) {
          console.log('Stats available:', Object.keys(athlete.stats));
          Object.keys(athlete.stats).forEach(statType => {
            console.log(`\n${statType}:`, athlete.stats[statType]);
          });
        }
      }
      
    } catch (error) {
      console.log('❌ Season stats error:', error.message);
    }

  } catch (error) {
    console.error('Error exploring endpoints:', error.message);
  }
}

exploreWorkingEndpoints(); 