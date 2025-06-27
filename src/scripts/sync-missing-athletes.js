const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const AthleteSyncService = require('../services/espn/athleteSyncService');

const CORE_API_ATHLETES_URL = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes?limit=1000';

function extractIdFromRef(ref) {
  const match = ref.match(/athletes\/(\d+)/);
  return match ? match[1] : undefined;
}

async function getMissingAthleteIds() {
  console.log('🔍 Getting missing athlete IDs...');
  
  // Get Core API athlete IDs
  let url = CORE_API_ATHLETES_URL;
  let coreApiIds = [];
  let page = 1;
  
  while (url) {
    console.log(`  Fetching Core API athletes page ${page}...`);
    const res = await fetch(url);
    const data = await res.json();
    if (data.items) {
      coreApiIds.push(...data.items.map(item => extractIdFromRef(item['$ref'])));
    }
    url = data.next || null;
    page++;
  }
  coreApiIds = coreApiIds.filter(Boolean);
  
  // Get DB player IDs
  const prisma = new PrismaClient();
  const dbPlayers = await prisma.player.findMany({ select: { espnId: true } });
  const dbIds = dbPlayers.map(p => String(p.espnId));
  await prisma.$disconnect();
  
  // Find missing IDs
  const missingIds = coreApiIds.filter(id => !dbIds.includes(id));
  
  console.log(`📊 Found ${missingIds.length} missing athletes`);
  return missingIds;
}

async function syncMissingAthletes() {
  const syncService = new AthleteSyncService();
  
  try {
    console.log('🚀 Starting Missing Athletes Sync...');
    console.log('='.repeat(60));
    
    // Get missing athlete IDs
    const missingIds = await getMissingAthleteIds();
    
    if (missingIds.length === 0) {
      console.log('✅ No missing athletes found!');
      return;
    }
    
    console.log(`\n📋 Missing Athlete IDs (first 20):`);
    missingIds.slice(0, 20).forEach(id => console.log(`  - ${id}`));
    if (missingIds.length > 20) {
      console.log(`  ... and ${missingIds.length - 20} more`);
    }
    
    // Sync missing athletes one by one
    console.log(`\n🔄 Syncing ${missingIds.length} missing athletes...`);
    
    let synced = 0;
    let errors = 0;
    
    for (let i = 0; i < missingIds.length; i++) {
      const athleteId = missingIds[i];
      console.log(`  [${i + 1}/${missingIds.length}] Syncing athlete ${athleteId}...`);
      
      try {
        const athleteRef = `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/${athleteId}`;
        
        // Fetch statistics for this athlete
        let statsData = null;
        try {
          statsData = await syncService.fetchAthleteStatistics(athleteId);
        } catch (error) {
          // Statistics not available, continue without them
        }
        
        const result = await syncService.syncAthlete(athleteRef, statsData);
        
        if (result.success) {
          synced++;
          console.log(`    ✅ Synced: ${result.athlete.name} (${result.athlete.active ? 'Active' : 'Inactive'})`);
        } else {
          errors++;
          console.log(`    ❌ Failed: ${result.error}`);
        }
      } catch (error) {
        errors++;
        console.log(`    ❌ Error syncing ${athleteId}: ${error.message}`);
      }
      
      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Missing Athletes Sync Complete!');
    console.log(`📊 Summary:`);
    console.log(`  - Athletes processed: ${missingIds.length}`);
    console.log(`  - Athletes synced: ${synced}`);
    console.log(`  - Errors: ${errors}`);
    
    if (errors > 0) {
      console.log(`\n⚠️  Some athletes failed to sync. Check the logs above for details.`);
    }
    
    // Verify final count
    const prisma = new PrismaClient();
    const finalCount = await prisma.player.count();
    await prisma.$disconnect();
    
    console.log(`\n📊 Final player count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  } finally {
    await syncService.prisma.$disconnect();
  }
}

if (require.main === module) {
  syncMissingAthletes()
    .then(() => {
      console.log('\n✅ Missing athletes sync completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sync script failed:', error);
      process.exit(1);
    });
}

module.exports = syncMissingAthletes; 