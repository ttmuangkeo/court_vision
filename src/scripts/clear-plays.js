const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearPlays() {
  try {
    console.log('🗑️ Deleting all play tags...');
    await prisma.playTag.deleteMany({});
    console.log('🗑️ Deleting all plays...');
    await prisma.play.deleteMany({});
    console.log('✅ All plays and play tags deleted!');
  } catch (error) {
    console.error('❌ Error clearing plays:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearPlays();
