const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlays() {
    try {
        console.log('=== CHECKING PLAYS DATABASE ===\n');

        // 1. Check total plays count
        console.log('1. Checking plays count...');
        const playCount = await prisma.play.count();
        console.log(`Total plays in database: ${playCount}\n`);

        if (playCount > 0) {
            // 2. Check sample plays
            console.log('2. Checking sample plays...');
            const samplePlays = await prisma.play.findMany({
                take: 3,
                include: {
                    game: {
                        include: {
                            homeTeam: true,
                            awayTeam: true
                        }
                    }
                }
            });
            
            samplePlays.forEach(play => {
                console.log(`  - Play ${play.playId}: ${play.description}`);
                console.log(`    Game: ${play.game?.homeTeam?.city} ${play.game?.homeTeam?.name} vs ${play.game?.awayTeam?.city} ${play.game?.awayTeam?.name}`);
                console.log(`    Quarter: ${play.quarterName}, Time: ${play.timeRemainingMinutes}:${play.timeRemainingSeconds?.toString().padStart(2, '0')}`);
            });
        } else {
            console.log('No plays found in database. You may need to sync plays from sportsdata.io');
        }

    } catch (error) {
        console.error('Error checking plays:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPlays(); 