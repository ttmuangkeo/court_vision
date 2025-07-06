const SportsdataPlayerSyncService = require('../services/sportsdata/playerSyncService');
const { PrismaClient } = require('@prisma/client');

async function run() {
  console.log('🏀 NBA Players Sync Script (sportsdata.io)');
  const prisma = new PrismaClient();
  const syncService = new SportsdataPlayerSyncService();
  try {
    const teams = await prisma.team.findMany({ where: { active: true } });
    let totalSynced = 0, totalFailed = 0;
    for (const team of teams) {
      console.log(`\n--- Syncing players for ${team.name} (${team.key}) ---`);
      const { synced, failed } = await syncService.syncPlayersForTeam(team.key);
      totalSynced += synced;
      totalFailed += failed;
    }
    console.log(`\n✅ Player sync completed: ${totalSynced} players synced, ${totalFailed} failed.`);
  } catch (error) {
    console.error('❌ Player sync failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = run; 