const TeamSyncService = require('../services/espn/teamSyncService');

async function testTeamSync() {
  try {
    console.log('🧪 Testing ESPN Team Sync Service...\n');
    
    const syncService = new TeamSyncService();
    
    // Test 1: Get current sync status
    console.log('📊 Current sync status:');
    const status = await syncService.getSyncStatus();
    console.log(`Total teams: ${status.status.total}`);
    console.log(`Synced today: ${status.status.syncedToday}`);
    console.log(`Needs sync: ${status.status.needsSync}`);
    console.log(`Missing ESPN ID: ${status.status.missingEspnId}`);
    console.log(`Missing branding: ${status.status.missingBranding}\n`);
    
    // Test 2: Fetch teams from ESPN
    console.log('🌐 Fetching teams from ESPN...');
    const espnTeams = await syncService.fetchTeamsFromESPN();
    console.log(`Found ${espnTeams.length} teams from ESPN\n`);
    
    // Test 3: Sync first 3 teams as a test
    console.log('🔄 Testing sync with first 3 teams...');
    const testTeams = espnTeams.slice(0, 3);
    
    for (const team of testTeams) {
      const result = await syncService.syncTeam(team);
      console.log(`${result.action}: ${result.team}`);
    }
    
    console.log('\n✅ Team sync test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testTeamSync(); 