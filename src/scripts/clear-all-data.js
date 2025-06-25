const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('��️ Clearing all data from database...');
    
    // Clear in order to respect foreign key constraints
    console.log('Clearing predictions...');
    await prisma.prediction.deleteMany({});
    
    console.log('Clearing play tags...');
    await prisma.playTag.deleteMany({});
    
    console.log('Clearing plays...');
    await prisma.play.deleteMany({});
    
    console.log('Clearing game viewers...');
    await prisma.gameViewer.deleteMany({});
    
    console.log('Clearing games...');
    await prisma.game.deleteMany({});
    
    console.log('Clearing glossary entries...');
    await prisma.glossaryEntry.deleteMany({});
    
    console.log('Clearing tags...');
    await prisma.tag.deleteMany({});
    
    console.log('Clearing players...');
    await prisma.player.deleteMany({});
    
    console.log('Clearing teams...');
    await prisma.team.deleteMany({});
    
    console.log('Clearing users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ All data cleared successfully!');
    console.log('Ready for fresh data sync!');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();