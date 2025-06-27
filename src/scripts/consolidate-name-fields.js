const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function consolidateNameFields() {
  console.log('🔄 Starting name field analysis...\n');
  
  // Get final stats
  const totalPlayers = await prisma.player.count();
  const withFullName = await prisma.player.count({
    where: { fullName: { not: null } }
  });

  console.log(`📈 Total players: ${totalPlayers}`);
  console.log(`📈 Players with fullName: ${withFullName} (${Math.round((withFullName/totalPlayers)*100)}%)`);

  // Check if name and fullName are identical
  const samplePlayers = await prisma.player.findMany({
    select: { name: true, fullName: true },
    take: 20
  });

  const identicalCount = samplePlayers.filter(p => p.name === p.fullName).length;
  console.log(`\n🔍 Sample check: ${identicalCount}/20 players have identical name and fullName`);
  
  if (identicalCount === 20) {
    console.log('✅ All sample players have identical name and fullName fields');
    console.log('💡 You can safely remove the name field from the schema');
    
    // Show some examples
    console.log('\n📝 Sample data:');
    samplePlayers.slice(0, 5).forEach(p => {
      console.log(`  "${p.name}" | "${p.fullName}" | Same: ${p.name === p.fullName}`);
    });
  } else {
    console.log('⚠️  Some players have different name and fullName values');
    
    // Show differences
    const different = samplePlayers.filter(p => p.name !== p.fullName);
    console.log('\n❌ Different values found:');
    different.forEach(p => {
      console.log(`  name: "${p.name}" | fullName: "${p.fullName}"`);
    });
  }

  // Check if any players are missing fullName
  const missingFullName = await prisma.player.findMany({
    where: { fullName: null },
    select: { espnId: true, name: true },
    take: 5
  });

  if (missingFullName.length > 0) {
    console.log(`\n⚠️  Found ${missingFullName.length} players missing fullName:`);
    missingFullName.forEach(p => {
      console.log(`  ${p.name} (${p.espnId})`);
    });
  } else {
    console.log('\n✅ All players have fullName populated');
  }
}

consolidateNameFields()
  .then(() => {
    console.log('\n✅ Name field analysis completed!');
    console.log('\nNext steps:');
    console.log('1. If all players have identical name/fullName, you can safely remove the name field');
    console.log('2. Update your sync services to only use fullName');
    console.log('3. Create a migration to remove the name field');
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 