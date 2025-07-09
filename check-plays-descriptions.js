const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlayDescriptions() {
    try {
        console.log('=== CHECKING PLAY DESCRIPTIONS ===\n');

        // 1. Check plays with different descriptions
        console.log('1. Checking plays with different descriptions...');
        const descriptions = await prisma.play.groupBy({
            by: ['description'],
            _count: {
                description: true
            },
            orderBy: {
                _count: {
                    description: 'desc'
                }
            },
            take: 10
        });
        
        descriptions.forEach(desc => {
            console.log(`  - "${desc.description}": ${desc._count.description} plays`);
        });

        // 2. Check plays with non-scrambled descriptions
        console.log('\n2. Checking plays with non-scrambled descriptions...');
        const goodPlays = await prisma.play.findMany({
            where: {
                NOT: {
                    description: 'Scrambled'
                }
            },
            take: 5,
            include: {
                game: {
                    include: {
                        homeTeam: true,
                        awayTeam: true
                    }
                }
            }
        });
        
        if (goodPlays.length > 0) {
            goodPlays.forEach(play => {
                console.log(`  - Play ${play.playId}: ${play.description}`);
                console.log(`    Game: ${play.game?.homeTeam?.city} ${play.game?.homeTeam?.name} vs ${play.game?.awayTeam?.city} ${play.game?.awayTeam?.name}`);
                console.log(`    Quarter: ${play.quarterName}, Time: ${play.timeRemainingMinutes}:${play.timeRemainingSeconds?.toString().padStart(2, '0')}`);
            });
        } else {
            console.log('  No plays with proper descriptions found');
        }

    } catch (error) {
        console.error('Error checking play descriptions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPlayDescriptions(); 