const { PrismaClient } = require('@prisma/client');

async function cleanupLegacyPlayers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Cleaning up Legacy Players...');
    
    // Get current counts
    const totalPlayers = await prisma.player.count();
    const legacyPlayers = await prisma.player.count({
      where: {
        espnId: {
          lt: '100000'  // Less than 5 digits (4-digit legacy IDs)
        }
      }
    });
    
    console.log(`📊 Total players: ${totalPlayers}`);
    console.log(`🗑️  Legacy players to remove: ${legacyPlayers}`);
    console.log(`✅ Core API players to keep: ${totalPlayers - legacyPlayers}`);
    
    if (legacyPlayers === 0) {
      console.log('✅ No legacy players found!');
      return;
    }
    
    // Show sample legacy players
    console.log('\n🗑️  Sample legacy players to be removed:');
    const sampleLegacy = await prisma.player.findMany({
      where: {
        espnId: {
          lt: '100000'
        }
      },
      take: 10,
      select: {
        espnId: true,
        name: true,
        position: true,
        active: true
      }
    });
    
    sampleLegacy.forEach(player => {
      console.log(`  - ${player.name} (${player.position}) - ID: ${player.espnId} - ${player.active ? 'Active' : 'Inactive'}`);
    });
    
    // Delete legacy players
    const result = await prisma.player.deleteMany({
      where: {
        espnId: {
          lt: '100000'  // Less than 5 digits
        }
      }
    });
    
    const remaining = await prisma.player.count();
    console.log(`\n🎉 Removed ${result.count} legacy players`);
    console.log(`📊 Remaining players: ${remaining}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  cleanupLegacyPlayers()
    .then(() => {
      console.log('✅ Cleanup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = cleanupLegacyPlayers; 