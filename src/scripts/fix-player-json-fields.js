const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPlayerJsonFields() {
  const players = await prisma.player.findMany();
  let fixedContracts = 0;
  let fixedAlternateIds = 0;

  for (const player of players) {
    let needsUpdate = false;
    const updateData = {};

    // Fix contracts
    if (player.contracts && typeof player.contracts === 'string') {
      try {
        updateData.contracts = JSON.parse(player.contracts);
      } catch {
        updateData.contracts = null;
      }
      fixedContracts++;
      needsUpdate = true;
    }

    // Fix alternateIds
    if (player.alternateIds && typeof player.alternateIds === 'string') {
      try {
        updateData.alternateIds = JSON.parse(player.alternateIds);
      } catch {
        updateData.alternateIds = null;
      }
      fixedAlternateIds++;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.player.update({
        where: { espnId: player.espnId },
        data: updateData
      });
    }
  }

  console.log('--- Player JSON Fields Fix Summary ---');
  console.log('Players with contracts fixed:', fixedContracts);
  console.log('Players with alternateIds fixed:', fixedAlternateIds);
}

if (require.main === module) {
  fixPlayerJsonFields()
    .then(() => {
      console.log('\n✅ Player JSON fields fix complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
} 