const prisma = require('../db/client');

async function cleanupPlaysAndTags() {
  try {
    console.log('Deleting all PlayTag records...');
    await prisma.playTag.deleteMany();
    console.log('Deleting all Play records...');
    await prisma.play.deleteMany();
    // Uncomment below if you want to clear all tags as well
    // console.log('Deleting all Tag records...');
    // await prisma.tag.deleteMany();
    console.log('Cleanup complete!');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupPlaysAndTags(); 