const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDefensiveScouting() {
    try {
        const playerId = '3945274';
        
        console.log('Testing defensive scouting for player:', playerId);
        
        // Get all plays with sequences for this player
        const playerPlays = await prisma.playTag.findMany({
            where: {
                playerId: playerId
            },
            include: {
                tag: true,
                play: {
                    include: {
                        tags: {
                            include: {
                                tag: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('Found', playerPlays.length, 'play tags for player');
        
        if (playerPlays.length === 0) {
            console.log('No play tags found for this player');
            return;
        }

        // Show first few play tags
        console.log('\nFirst 3 play tags:');
        playerPlays.slice(0, 3).forEach((playTag, index) => {
            console.log(`${index + 1}. Tag: ${playTag.tag.name}, Play ID: ${playTag.playId}, Context:`, playTag.context);
        });

        // Group plays by their sequences
        const playSequences = {};
        playerPlays.forEach(playTag => {
            const playId = playTag.playId;
            if (!playSequences[playId]) {
                playSequences[playId] = [];
            }
            playSequences[playId].push({
                tag: playTag.tag.name,
                sequence: playTag.context?.sequence || 1,
                context: playTag.context
            });
        });

        console.log('\nPlay sequences:', Object.keys(playSequences).length, 'unique plays');
        
        // Show first few sequences
        const sequenceEntries = Object.entries(playSequences);
        console.log('\nFirst 3 sequences:');
        sequenceEntries.slice(0, 3).forEach(([playId, sequence], index) => {
            console.log(`${index + 1}. Play ${playId}:`, sequence.map(s => s.tag).join(' → '));
        });

        // Analyze offensive patterns
        const offensivePatterns = {
            mostFrequentSequences: {},
            screenUsage: {},
            isolationTendencies: {},
            pressureResponses: {},
            shotSelection: {},
            timingPatterns: {}
        };

        // Count sequence frequencies
        Object.values(playSequences).forEach(sequence => {
            const sortedSequence = sequence.sort((a, b) => a.sequence - b.sequence);
            const sequenceString = sortedSequence.map(s => s.tag).join(' → ');
            
            if (!offensivePatterns.mostFrequentSequences[sequenceString]) {
                offensivePatterns.mostFrequentSequences[sequenceString] = 0;
            }
            offensivePatterns.mostFrequentSequences[sequenceString]++;
        });

        console.log('\nMost frequent sequences:');
        const sortedSequences = Object.entries(offensivePatterns.mostFrequentSequences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        sortedSequences.forEach(([sequence, count]) => {
            console.log(`- ${sequence}: ${count} times`);
        });

        console.log('\nTest completed successfully!');

    } catch (error) {
        console.error('Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDefensiveScouting(); 