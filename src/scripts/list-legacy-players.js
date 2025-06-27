const { PrismaClient } = require('@prisma/client');

async function listLegacyPlayers() {
  const prisma = new PrismaClient();
  try {
    // Find players whose ESPN ID is less than 7 digits (legacy IDs)
    const legacyPlayers = await prisma.$queryRaw`
      SELECT "espnId", name, "lastSynced"
      FROM players
      WHERE LENGTH("espnId") < 7
      ORDER BY "lastSynced" ASC
      LIMIT 20;
    `;
    if (legacyPlayers.length === 0) {
      console.log('✅ No legacy players found. All players are from the Core API.');
    } else {
      console.log('📋 Sample of legacy players (not in Core API, showing up to 20):');
      legacyPlayers.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.espnId}) - Last synced: ${p.lastSynced}`);
      });
    }
  } catch (error) {
    console.error('Error listing legacy players:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listLegacyPlayers(); 