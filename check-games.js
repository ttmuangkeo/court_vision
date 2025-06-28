const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGames() {
    try {
        const games = await prisma.game.findMany({
            take: 10,
            include: {
                homeTeam: true,
                awayTeam: true
            },
            orderBy: { date: 'desc' }
        });
        
        console.log('Games found:', games.length);
        games.forEach(g => {
            console.log(`${g.date.toISOString().split('T')[0]} - ${g.homeTeam.name} vs ${g.awayTeam.name} (${g.status})`);
        });
        
        // Check total count
        const totalGames = await prisma.game.count();
        console.log('\nTotal games in database:', totalGames);

        // Print earliest and latest game dates
        const min = await prisma.game.findFirst({ orderBy: { date: 'asc' }, select: { date: true } });
        const max = await prisma.game.findFirst({ orderBy: { date: 'desc' }, select: { date: true } });
        console.log('Earliest game:', min?.date);
        console.log('Latest game:', max?.date);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkGames(); 