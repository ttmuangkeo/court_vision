const PlayerSyncService = require('../services/espn/playerSyncService');

async function testPlayerSync() {
  try {
    console.log('🧪 Testing ESPN Player Sync Service...\n');
    
    const syncService = new PlayerSyncService();
    
    // Test 1: Get current sync status
    console.log('📊 Current sync status:');
    const status = await syncService.getSyncStatus();
    console.log(`Total players: ${status.status.total}`);
    console.log(`With ESPN ID: ${status.status.withEspnId}`);
    console.log(`Synced today: ${status.status.syncedToday}`);
    console.log(`Missing ESPN ID: ${status.status.missingEspnId}\n`);
    
    // Test 2: Fetch teams from ESPN
    console.log('🌐 Fetching teams from ESPN...');
    const teams = await syncService.fetchTeamsFromESPN();
    console.log(`Found ${teams.length} teams from ESPN\n`);
    
    // Test 3: Test with first 2 teams
    console.log('🔄 Testing sync with first 2 teams...');
    const testTeams = teams.slice(0, 2);
    
    for (const team of testTeams) {
      console.log(`\n📋 Testing ${team.team.displayName}...`);
      
      // Test roster fetch
      const roster = await syncService.fetchTeamRoster(team.team.id);
      console.log(`  Found ${roster.length} players in roster`);
      
      // Test syncing first 3 players
      const testPlayers = roster.slice(0, 3);
      for (const player of testPlayers) {
        const result = await syncService.syncPlayer(player, team.team.id);
        console.log(`  ${result.action}: ${result.player}`);
      }
    }
    
    console.log('\n✅ Player sync test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testPlayerSync(); 