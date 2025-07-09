const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlayers() {
    try {
        console.log('=== CHECKING PLAYERS DATABASE ===\n');

        // 1. Check if database is connected
        console.log('1. Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully\n');

        // 2. Check total players count
        console.log('2. Checking players count...');
        const playerCount = await prisma.player.count();
        console.log(`Total players in database: ${playerCount}\n`);

        // 3. Check if there are any players with team associations
        if (playerCount > 0) {
            console.log('3. Checking players with team associations...');
            const playersWithTeams = await prisma.player.findMany({
                where: {
                    teamId: { not: null }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    teamId: true,
                    team: {
                        select: {
                            id: true,
                            key: true,
                            name: true
                        }
                    }
                },
                take: 5
            });
            
            console.log(`Players with teams: ${playersWithTeams.length}`);
            playersWithTeams.forEach(player => {
                console.log(`  - ${player.firstName} ${player.lastName} (Team: ${player.team?.name || 'Unknown'})`);
            });
        }

        // 4. Check team 9 specifically
        console.log('\n4. Checking team 9 (Boston Celtics)...');
        const team9 = await prisma.team.findUnique({
            where: { id: 9 },
            include: {
                players: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        
        if (team9) {
            console.log(`Team: ${team9.city} ${team9.name}`);
            console.log(`Players: ${team9.players.length}`);
            team9.players.forEach(player => {
                console.log(`  - ${player.firstName} ${player.lastName}`);
            });
        } else {
            console.log('Team 9 not found');
        }

    } catch (error) {
        console.error('Error checking players:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPlayers(); 