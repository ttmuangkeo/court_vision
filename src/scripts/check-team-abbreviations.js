const prisma = require('../db/client');

async function checkAbbreviations() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        primaryColor: true,
        logoUrl: true
      },
      orderBy: { abbreviation: 'asc' }
    });
    
    console.log('Teams in database:');
    teams.forEach(team => {
      console.log(`${team.abbreviation}: ${team.name} ${team.logoUrl ? '✅' : '❌'}`);
    });
    
    console.log(`\nTotal teams: ${teams.length}`);
    console.log(`Teams with branding: ${teams.filter(t => t.logoUrl).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAbbreviations(); 