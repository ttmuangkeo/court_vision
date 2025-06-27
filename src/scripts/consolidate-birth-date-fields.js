const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function consolidateBirthDateFields() {
  console.log('🔄 Starting birth date field consolidation...\n');
  
  // Get all players with birthDate but no dateOfBirth
  const playersToUpdate = await prisma.player.findMany({
    where: {
      birthDate: { not: null },
      dateOfBirth: null
    },
    select: {
      espnId: true,
      name: true,
      birthDate: true
    }
  });

  console.log(`Found ${playersToUpdate.length} players with birthDate but no dateOfBirth`);

  let updated = 0;
  let failed = 0;

  for (const player of playersToUpdate) {
    try {
      await prisma.player.update({
        where: { espnId: player.espnId },
        data: { dateOfBirth: player.birthDate }
      });
      updated++;
      console.log(`  ✅ Updated ${player.name} (${player.espnId}): ${player.birthDate}`);
    } catch (error) {
      failed++;
      console.error(`  ❌ Failed to update ${player.name} (${player.espnId}):`, error.message);
    }
  }

  // Get summary stats
  const totalPlayers = await prisma.player.count();
  const playersWithBirthDate = await prisma.player.count({
    where: { birthDate: { not: null } }
  });
  const playersWithDateOfBirth = await prisma.player.count({
    where: { dateOfBirth: { not: null } }
  });
  const playersWithBoth = await prisma.player.count({
    where: {
      birthDate: { not: null },
      dateOfBirth: { not: null }
    }
  });

  console.log('\n📊 Birth Date Field Consolidation Summary:');
  console.log(`✅ Players updated: ${updated}`);
  console.log(`❌ Players failed: ${failed}`);
  console.log(`📈 Total players: ${totalPlayers}`);
  console.log(`📈 Players with birthDate: ${playersWithBirthDate}`);
  console.log(`📈 Players with dateOfBirth: ${playersWithDateOfBirth}`);
  console.log(`📈 Players with both fields: ${playersWithBoth}`);
  
  if (playersWithBoth > 0) {
    console.log('\n⚠️  Note: Some players have both fields populated. You may want to verify data consistency.');
  }
}

consolidateBirthDateFields()
  .then(() => {
    console.log('\n✅ Birth date consolidation completed!');
    console.log('\nNext steps:');
    console.log('1. Verify the data looks correct');
    console.log('2. Update your sync services to only use dateOfBirth');
    console.log('3. Create a migration to remove the birthDate field');
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 