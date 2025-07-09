const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGames() {
    try {
        console.log('=== CHECKING GAMES DATABASE ===\n');

        // 1. Check if database is connected
        console.log('1. Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully\n');

        // 2. Check total games count
        console.log('2. Checking games count...');
        const gameCount = await prisma.game.count();
        console.log(`Total games in database: ${gameCount}\n`);

        // 3. Check if there are any games with team associations
        if (gameCount > 0) {
            console.log('3. Checking games with team associations...');
            const gamesWithTeams = await prisma.game.findMany({
                include: {
                    homeTeam: true,
                    awayTeam: true
                },
                take: 3
            });
            
            console.log(`Sample games with teams: ${gamesWithTeams.length}`);
            gamesWithTeams.forEach(game => {
                console.log(`  - Game ${game.id}: ${game.homeTeam?.city} ${game.homeTeam?.name} vs ${game.awayTeam?.city} ${game.awayTeam?.name}`);
                console.log(`    Date: ${game.date}, Status: ${game.status}`);
            });
        }

        // 4. Check the Game model structure
        console.log('\n4. Checking Game model structure...');
        const sampleGame = await prisma.game.findFirst({
            select: {
                id: true,
                season: true,
                status: true,
                date: true,
                homeTeamId: true,
                awayTeamId: true
            }
        });
        
        if (sampleGame) {
            console.log('Sample game structure:', sampleGame);
        } else {
            console.log('No games found in database');
        }

    } catch (error) {
        console.error('Error checking games:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkGames(); 