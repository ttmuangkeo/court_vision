const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTeamStats() {
    try {
        console.log('=== CHECKING TEAM STATISTICS ===\n');

        // 1. Check total team statistics count
        console.log('1. Checking team statistics count...');
        const statsCount = await prisma.teamStatistics.count();
        console.log(`Total team statistics in database: ${statsCount}\n`);

        if (statsCount > 0) {
            // 2. Check sample team statistics
            console.log('2. Checking sample team statistics...');
            const sampleStats = await prisma.teamStatistics.findMany({
                take: 5,
                include: {
                    team: {
                        select: {
                            id: true,
                            city: true,
                            name: true,
                            conference: true,
                            division: true
                        }
                    }
                }
            });
            
            sampleStats.forEach(stat => {
                console.log(`  - ${stat.team?.city} ${stat.team?.name}: ${stat.category} - ${stat.displayName} = ${stat.displayValue}`);
            });

            // 3. Check if team 20 has statistics
            console.log('\n3. Checking team 20 statistics...');
            const team20Stats = await prisma.teamStatistics.findMany({
                where: {
                    teamId: 20
                },
                take: 3
            });
            
            console.log(`Team 20 has ${team20Stats.length} statistics`);
            team20Stats.forEach(stat => {
                console.log(`  - ${stat.category}: ${stat.displayName} = ${stat.displayValue}`);
            });
        } else {
            console.log('No team statistics found in database. You may need to sync team statistics from sportsdata.io');
        }

    } catch (error) {
        console.error('Error checking team statistics:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTeamStats(); 