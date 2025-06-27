const { PrismaClient } = require('@prisma/client');

async function checkPlayerIds() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Player IDs...');
    console.log('='.repeat(50));
    
    const totalPlayers = await prisma.player.count();
    console.log(`📊 Total players: ${totalPlayers}`);
    
    // Get sample players with their IDs
    const samplePlayers = await prisma.player.findMany({
      take: 20,
      select: {
        espnId: true,
        name: true,
        position: true,
        active: true
      },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Sample Players:');
    samplePlayers.forEach(player => {
      const idLength = player.espnId.length;
      const type = idLength < 7 ? 'LEGACY' : 'CORE_API';
      console.log(`  - ${player.name} (${player.position}) - ID: ${player.espnId} (${idLength} digits, ${type}) - ${player.active ? 'Active' : 'Inactive'}`);
    });
    
    // Count by ID length
    const playersByLength = await prisma.player.groupBy({
      by: ['espnId'],
      _count: true
    });
    
    const lengthCounts = {};
    playersByLength.forEach(p => {
      const length = p.espnId.length;
      lengthCounts[length] = (lengthCounts[length] || 0) + 1;
    });
    
    console.log('\n📊 ID Length Distribution:');
    Object.keys(lengthCounts).sort().forEach(length => {
      console.log(`  - ${length} digits: ${lengthCounts[length]} players`);
    });
    
    // Check for any short IDs
    const shortIdPlayers = await prisma.player.findMany({
      where: {
        espnId: {
          lt: '1000000'
        }
      },
      take: 10,
      select: {
        espnId: true,
        name: true,
        position: true
      }
    });
    
    if (shortIdPlayers.length > 0) {
      console.log('\n⚠️  Found players with short IDs:');
      shortIdPlayers.forEach(player => {
        console.log(`  - ${player.name} (${player.position}) - ID: ${player.espnId}`);
      });
    } else {
      console.log('\n✅ All players have 7+ digit IDs (Core API format)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkPlayerIds()
    .then(() => {
      console.log('\n✅ Check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = checkPlayerIds; 