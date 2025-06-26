const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSamplePlays() {
    try {
        console.log('🌱 Seeding sample plays with tags...');

        // Get demo user
        const demoUser = await prisma.user.findFirst({
            where: { email: 'demo@courtvision.com' }
        });

        if (!demoUser) {
            console.log('❌ Demo user not found. Please run create-demo-user.js first.');
            return;
        }

        // Get a game
        const game = await prisma.game.findFirst({
            include: {
                homeTeam: true,
                awayTeam: true
            }
        });

        if (!game) {
            console.log('❌ No games found. Please sync games first.');
            return;
        }

        // Get some players
        const players = await prisma.player.findMany({
            where: {
                teamId: {
                    in: [game.homeTeamId, game.awayTeamId]
                }
            },
            take: 4
        });

        if (players.length === 0) {
            console.log('❌ No players found. Please sync players first.');
            return;
        }

        // Get tags
        const tags = await prisma.tag.findMany();
        if (tags.length === 0) {
            console.log('❌ No tags found. Please seed tags first.');
            return;
        }

        console.log(`📊 Using game: ${game.homeTeam.abbreviation} vs ${game.awayTeam.abbreviation}`);
        console.log(`👥 Using ${players.length} players`);
        console.log(`🏷️  Using ${tags.length} tags`);

        // Create sample plays with patterns
        const samplePlays = [
            // Player 1 - Lots of isolations
            {
                description: "Isolation play by star player",
                quarter: 1,
                gameTime: "10:30",
                tags: [
                    { tagName: "Isolation", playerIndex: 0, teamId: players[0].teamId }
                ]
            },
            {
                description: "Another isolation opportunity",
                quarter: 1,
                gameTime: "8:45",
                tags: [
                    { tagName: "Isolation", playerIndex: 0, teamId: players[0].teamId }
                ]
            },
            {
                description: "Isolation play in crunch time",
                quarter: 4,
                gameTime: "2:15",
                tags: [
                    { tagName: "Isolation", playerIndex: 0, teamId: players[0].teamId }
                ]
            },
            {
                description: "Double team on isolation",
                quarter: 4,
                gameTime: "1:45",
                tags: [
                    { tagName: "Double Team", playerIndex: 0, teamId: players[0].teamId }
                ]
            },

            // Player 2 - Pick and roll specialist
            {
                description: "Pick and roll action",
                quarter: 2,
                gameTime: "9:20",
                tags: [
                    { tagName: "Pick and Roll", playerIndex: 1, teamId: players[1].teamId }
                ]
            },
            {
                description: "Another pick and roll",
                quarter: 2,
                gameTime: "7:10",
                tags: [
                    { tagName: "Pick and Roll", playerIndex: 1, teamId: players[1].teamId }
                ]
            },
            {
                description: "Pick and roll with screen",
                quarter: 3,
                gameTime: "11:30",
                tags: [
                    { tagName: "Pick and Roll", playerIndex: 1, teamId: players[1].teamId }
                ]
            },

            // Player 3 - Defensive specialist
            {
                description: "Great defensive stop",
                quarter: 1,
                gameTime: "6:15",
                tags: [
                    { tagName: "Defensive Stop", playerIndex: 2, teamId: players[2].teamId }
                ]
            },
            {
                description: "Another defensive play",
                quarter: 2,
                gameTime: "4:30",
                tags: [
                    { tagName: "Defensive Stop", playerIndex: 2, teamId: players[2].teamId }
                ]
            },
            {
                description: "Steal and fast break",
                quarter: 3,
                gameTime: "8:45",
                tags: [
                    { tagName: "Steal", playerIndex: 2, teamId: players[2].teamId }
                ]
            },

            // Player 4 - Three point specialist
            {
                description: "Three point attempt",
                quarter: 1,
                gameTime: "5:20",
                tags: [
                    { tagName: "Three Point Shot", playerIndex: 3, teamId: players[3].teamId }
                ]
            },
            {
                description: "Another three point shot",
                quarter: 2,
                gameTime: "3:45",
                tags: [
                    { tagName: "Three Point Shot", playerIndex: 3, teamId: players[3].teamId }
                ]
            },
            {
                description: "Three point shot in transition",
                quarter: 3,
                gameTime: "6:20",
                tags: [
                    { tagName: "Three Point Shot", playerIndex: 3, teamId: players[3].teamId }
                ]
            },

            // Team patterns - Home team likes post ups
            {
                description: "Post up play",
                quarter: 1,
                gameTime: "4:10",
                tags: [
                    { tagName: "Post Up", playerIndex: 0, teamId: game.homeTeamId }
                ]
            },
            {
                description: "Another post up",
                quarter: 2,
                gameTime: "2:30",
                tags: [
                    { tagName: "Post Up", playerIndex: 0, teamId: game.homeTeamId }
                ]
            },
            {
                description: "Post up with good position",
                quarter: 3,
                gameTime: "9:15",
                tags: [
                    { tagName: "Post Up", playerIndex: 0, teamId: game.homeTeamId }
                ]
            },

            // Away team likes fast breaks
            {
                description: "Fast break opportunity",
                quarter: 1,
                gameTime: "3:20",
                tags: [
                    { tagName: "Fast Break", playerIndex: 1, teamId: game.awayTeamId }
                ]
            },
            {
                description: "Another fast break",
                quarter: 2,
                gameTime: "1:45",
                tags: [
                    { tagName: "Fast Break", playerIndex: 1, teamId: game.awayTeamId }
                ]
            },
            {
                description: "Fast break after steal",
                quarter: 4,
                gameTime: "10:30",
                tags: [
                    { tagName: "Fast Break", playerIndex: 1, teamId: game.awayTeamId }
                ]
            }
        ];

        // Create plays
        for (const playData of samplePlays) {
            const player = players[playData.tags[0].playerIndex];
            const tag = tags.find(t => t.name === playData.tags[0].tagName);

            if (!tag) {
                console.log(`⚠️  Tag "${playData.tags[0].tagName}" not found, skipping...`);
                continue;
            }

            // Create play with tags in one transaction
            const result = await prisma.play.create({
                data: {
                    gameId: game.id,
                    description: playData.description,
                    quarter: playData.quarter,
                    gameTime: playData.gameTime,
                    createdById: demoUser.id,
                    tags: {
                        create: {
                            tagId: tag.id,
                            playerId: player.id,
                            teamId: playData.tags[0].teamId,
                            context: { action: tag.name },
                            createdById: demoUser.id
                        }
                    }
                },
                include: {
                    tags: true
                }
            });

            console.log(`✅ Created play: ${playData.description} (${tag.name})`);
        }

        console.log('🎉 Sample plays seeded successfully!');
        console.log(`📊 Created ${samplePlays.length} plays with tags`);
        console.log(`🎯 You can now test the prediction system in the tagging interface`);

    } catch (error) {
        console.error('❌ Error seeding sample plays:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedSamplePlays(); 