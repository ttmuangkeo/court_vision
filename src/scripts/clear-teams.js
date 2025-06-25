const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTeams() {
  try {
    console.log('🗑️ Clearing all teams from database...');
    
    const deletedTeams = await prisma.team.deleteMany({});
    
    console.log(`✅ Deleted ${deletedTeams.count} teams`);
    console.log('Ready for fresh NBA data sync!');
  } catch (error) {
    console.error('❌ Error clearing teams:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearTeams();