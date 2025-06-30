const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');

// Get player patterns and tendencies
router.get('/player-patterns/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { gameId } = req.query;

        // Get all plays where this player was involved
        const playerPlays = await prisma.playTag.findMany({
            where: {
                playerId: playerId,
                ...(gameId && { play: { gameId } })
            },
            include: {
                tag: true,
                play: {
                    include: {
                        game: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Analyze patterns
        const tagCounts = {};
        const quarterPatterns = {};
        const recentPlays = playerPlays.slice(0, 5);

        playerPlays.forEach(playTag => {
            const tagName = playTag.tag.name;
            const quarter = playTag.play.quarter;

            // Count tag frequency
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;

            // Quarter patterns
            if (!quarterPatterns[quarter]) {
                quarterPatterns[quarter] = {};
            }
            quarterPatterns[quarter][tagName] = (quarterPatterns[quarter][tagName] || 0) + 1;
        });

        // Get most common actions
        const mostCommonActions = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / playerPlays.length) * 100) }));

        res.json({
            success: true,
            data: {
                totalPlays: playerPlays.length,
                mostCommonActions,
                quarterPatterns,
                recentPlays: recentPlays.map(pt => ({
                    id: pt.play.id,
                    tag: pt.tag.name,
                    quarter: pt.play.quarter,
                    gameTime: pt.play.gameTime,
                    description: pt.play.description,
                    createdAt: pt.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching player patterns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player patterns'
        });
    }
});

// Get team tendencies
router.get('/team-tendencies/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { gameId } = req.query;

        // Get all plays for this team
        const teamPlays = await prisma.playTag.findMany({
            where: {
                teamId: teamId,
                ...(gameId && { play: { gameId } })
            },
            include: {
                tag: true,
                play: {
                    include: {
                        game: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Analyze team patterns
        const tagCounts = {};
        const quarterPatterns = {};
        const recentPlays = teamPlays.slice(0, 5);

        teamPlays.forEach(playTag => {
            const tagName = playTag.tag.name;
            const quarter = playTag.play.quarter;

            // Count tag frequency
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;

            // Quarter patterns
            if (!quarterPatterns[quarter]) {
                quarterPatterns[quarter] = {};
            }
            quarterPatterns[quarter][tagName] = (quarterPatterns[quarter][tagName] || 0) + 1;
        });

        // Get most common plays
        const mostCommonPlays = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count, percentage: Math.round((count / teamPlays.length) * 100) }));

        res.json({
            success: true,
            data: {
                totalPlays: teamPlays.length,
                mostCommonPlays,
                quarterPatterns,
                recentPlays: recentPlays.map(pt => ({
                    id: pt.play.id,
                    tag: pt.tag.name,
                    quarter: pt.play.quarter,
                    gameTime: pt.play.gameTime,
                    description: pt.play.description,
                    createdAt: pt.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching team tendencies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team tendencies'
        });
    }
});

// Get defensive scouting report for a player
router.get('/defensive-scouting/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { gameId } = req.query;

        // Get all plays with sequences for this player
        const playerPlays = await prisma.playTag.findMany({
            where: {
                playerId: playerId,
                ...(gameId && { play: { gameId } })
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

        // Analyze specific patterns
        Object.values(playSequences).forEach(sequence => {
            const sortedSequence = sequence.sort((a, b) => a.sequence - b.sequence);
            const tags = sortedSequence.map(s => s.tag);

            // Screen usage analysis
            if (tags.includes('Calling for Screen')) {
                const screenIndex = tags.indexOf('Calling for Screen');
                const nextAction = tags[screenIndex + 1];
                if (nextAction) {
                    if (!offensivePatterns.screenUsage[nextAction]) {
                        offensivePatterns.screenUsage[nextAction] = 0;
                    }
                    offensivePatterns.screenUsage[nextAction]++;
                }
            }

            // Isolation analysis
            if (tags.includes('Isolation')) {
                const isolationIndex = tags.indexOf('Isolation');
                const nextAction = tags[isolationIndex + 1];
                if (nextAction) {
                    if (!offensivePatterns.isolationTendencies[nextAction]) {
                        offensivePatterns.isolationTendencies[nextAction] = 0;
                    }
                    offensivePatterns.isolationTendencies[nextAction]++;
                }
            }

            // Pressure response analysis
            if (tags.includes('Double Teamed')) {
                const pressureIndex = tags.indexOf('Double Teamed');
                const nextAction = tags[pressureIndex + 1];
                if (nextAction) {
                    if (!offensivePatterns.pressureResponses[nextAction]) {
                        offensivePatterns.pressureResponses[nextAction] = 0;
                    }
                    offensivePatterns.pressureResponses[nextAction]++;
                }
            }

            // Shot selection analysis
            const shotActions = ['Pull Up Shot', 'Step Back Shot', 'Fade Away', 'Layup/Dunk'];
            shotActions.forEach(shotAction => {
                if (tags.includes(shotAction)) {
                    if (!offensivePatterns.shotSelection[shotAction]) {
                        offensivePatterns.shotSelection[shotAction] = 0;
                    }
                    offensivePatterns.shotSelection[shotAction]++;
                }
            });
        });

        // Generate defensive strategies
        const defensiveStrategies = {
            primaryDefensiveFocus: [],
            screenDefense: [],
            isolationDefense: [],
            pressureDefense: [],
            shotContest: [],
            gamePlan: []
        };

        // Analyze most frequent sequences and create counter-strategies
        const sortedSequences = Object.entries(offensivePatterns.mostFrequentSequences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        sortedSequences.forEach(([sequence, count]) => {
            const tags = sequence.split(' → ');
            
            // Counter-strategies based on sequence patterns
            if (sequence.includes('Calling for Screen → Screen Mismatch')) {
                defensiveStrategies.screenDefense.push({
                    strategy: 'Switch Screens Early',
                    reasoning: `Player used screen mismatch ${count} times - prevent mismatch creation`,
                    execution: 'Switch on screen calls before mismatch develops',
                    priority: 'High'
                });
            }

            if (sequence.includes('Calling for Screen → Pick and Roll')) {
                defensiveStrategies.screenDefense.push({
                    strategy: 'Hedge and Recover',
                    reasoning: `Player frequently uses pick and roll (${count} times)`,
                    execution: 'Hedge the screen, then recover to prevent drive',
                    priority: 'High'
                });
            }

            if (sequence.includes('Isolation')) {
                const isolationResponses = offensivePatterns.isolationTendencies;
                const mostCommonResponse = Object.entries(isolationResponses)
                    .sort(([,a], [,b]) => b - a)[0];
                
                if (mostCommonResponse) {
                    defensiveStrategies.isolationDefense.push({
                        strategy: `Force ${mostCommonResponse[0]}`,
                        reasoning: `In isolation, player most often responds with ${mostCommonResponse[0]} (${mostCommonResponse[1]} times)`,
                        execution: `Take away ${mostCommonResponse[0]} option, force counter`,
                        priority: 'Medium'
                    });
                }
            }

            if (sequence.includes('Double Teamed')) {
                const pressureResponses = offensivePatterns.pressureResponses;
                const mostCommonResponse = Object.entries(pressureResponses)
                    .sort(([,a], [,b]) => b - a)[0];
                
                if (mostCommonResponse) {
                    defensiveStrategies.pressureDefense.push({
                        strategy: `Prevent ${mostCommonResponse[0]}`,
                        reasoning: `When pressured, player most often responds with ${mostCommonResponse[0]} (${mostCommonResponse[1]} times)`,
                        execution: `Take away ${mostCommonResponse[0]} option, force different response`,
                        priority: 'High'
                    });
                }
            }
        });

        // Shot contest strategies
        const shotPatterns = offensivePatterns.shotSelection;
        Object.entries(shotPatterns).forEach(([shotType, count]) => {
            if (shotType === 'Pull Up Shot' && count > 2) {
                defensiveStrategies.shotContest.push({
                    strategy: 'Contest Pull-Ups Aggressively',
                    reasoning: `Player frequently uses pull-up shots (${count} times)`,
                    execution: 'Close out hard, contest every pull-up attempt',
                    priority: 'High'
                });
            }

            if (shotType === 'Step Back Shot' && count > 2) {
                defensiveStrategies.shotContest.push({
                    strategy: 'Stay Attached on Step-Backs',
                    reasoning: `Player uses step-back shots (${count} times)`,
                    execution: 'Stay close, don\'t bite on step-back fakes',
                    priority: 'Medium'
                });
            }
        });

        // Generate overall game plan
        const totalPlays = Object.keys(playSequences).length;
        const screenUsage = Object.values(offensivePatterns.screenUsage).reduce((sum, count) => sum + count, 0);
        const screenPercentage = (screenUsage / totalPlays) * 100;

        if (screenPercentage > 50) {
            defensiveStrategies.gamePlan.push({
                strategy: 'Disrupt Screen Actions',
                reasoning: `Player heavily relies on screens (${screenPercentage.toFixed(1)}% of plays)`,
                execution: 'Switch screens, hedge aggressively, prevent clean screen execution',
                priority: 'Critical'
            });
        }

        const isolationCount = Object.values(offensivePatterns.isolationTendencies).reduce((sum, count) => sum + count, 0);
        if (isolationCount > 3) {
            defensiveStrategies.gamePlan.push({
                strategy: 'Force Isolation Decisions',
                reasoning: `Player uses isolation frequently (${isolationCount} times)`,
                execution: 'Force isolation but take away preferred counter-moves',
                priority: 'High'
            });
        }

        // Set primary defensive focus
        if (screenPercentage > 50) {
            defensiveStrategies.primaryDefensiveFocus.push('Screen Defense');
        }
        if (isolationCount > 3) {
            defensiveStrategies.primaryDefensiveFocus.push('Isolation Defense');
        }
        if (Object.keys(offensivePatterns.pressureResponses).length > 0) {
            defensiveStrategies.primaryDefensiveFocus.push('Pressure Defense');
        }

        res.json({
            success: true,
            data: {
                playerId,
                totalPlays,
                offensivePatterns,
                defensiveStrategies,
                keyInsights: {
                    mostFrequentSequence: sortedSequences[0] ? sortedSequences[0][0] : 'None',
                    screenDependency: screenPercentage,
                    isolationFrequency: isolationCount,
                    pressureResponse: Object.keys(offensivePatterns.pressureResponses).length > 0 ? 
                        Object.entries(offensivePatterns.pressureResponses).sort(([,a], [,b]) => b - a)[0] : null
                }
            }
        });
    } catch (error) {
        console.error('Error generating defensive scouting report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate defensive scouting report'
        });
    }
});

// Get game context and recent plays
router.get('/game-context/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;

        // Get game details
        const game = await prisma.game.findUnique({
            where: { espnId: gameId },
            include: {
                homeTeam: true,
                awayTeam: true,
                plays: {
                    include: {
                        tags: {
                            include: {
                                tag: true,
                                player: true,
                                team: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        // Analyze recent plays (show last 10 for display, but analyze all)
        const recentPlays = game.plays.slice(0,0, 10);
        const playPatterns = recentPlays.map(play => ({
            id: play.id,
            quarter: play.quarter,
            gameTime: play.gameTime,
            description: play.description,
            tags: play.tags.map(pt => ({
                name: pt.tag.name,
                player: pt.player?.name,
                team: pt.team?.abbreviation
            }))
        }));

        // Get most common actions in this game (analyze ALL plays)
        const gameTagCounts = {};
        game.plays.forEach(play => {
            play.tags.forEach(pt => {
                const tagName = pt.tag.name;
                gameTagCounts[tagName] = (gameTagCounts[tagName] || 0) + 1;
            });
        });

        const mostCommonInGame = Object.entries(gameTagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5) // Show top 5 instead of 3
            .map(([tag, count]) => ({ tag, count }));

        res.json({
            success: true,
            data: {
                game: {
                    id: game.id,
                    homeTeam: game.homeTeam,
                    awayTeam: game.awayTeam,
                    homeScore: game.homeScore,
                    awayScore: game.awayScore,
                    status: game.status,
                    quarter: game.quarter,
                    timeRemaining: game.timeRemaining
                },
                recentPlays: playPatterns,
                mostCommonInGame,
                totalPlays: game.plays.length
            }
        });
    } catch (error) {
        console.error('Error fetching game context:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game context'
        });
    }
});

// Get smart suggestions based on current context
router.get('/suggestions', async (req, res) => {
    try {
        const { gameId, playerId, teamId, quarter, gameTime } = req.query;

        // Get recent plays for context (more data for better analysis)
        const recentPlays = await prisma.playTag.findMany({
            where: {
                ...(gameId && { play: { gameId } }),
                ...(playerId && { playerId }),
                ...(teamId && { teamId })
            },
            include: {
                tag: true,
                play: true,
                player: true,
                team: true
            },
            orderBy: [
                { createdAt: 'desc' }
            ],
            take: 50 // More data for better patterns
        });

        const suggestions = [];

        // 1. NEXT ACTION PREDICTION (based on sequence patterns)
        if (recentPlays.length >= 2) {
            const lastAction = recentPlays[0].tag.name;
            const secondLastAction = recentPlays[1].tag.name;
            
            // Find all sequences that start with the last action
            const sequencesStartingWithLast = recentPlays.filter((pt, index) => {
                if (index === recentPlays.length - 1) return false; // Can't be last
                return pt.tag.name === lastAction;
            });

            if (sequencesStartingWithLast.length > 0) {
                // Find what comes after this action
                const nextActions = {};
                sequencesStartingWithLast.forEach(pt => {
                    const playIndex = recentPlays.findIndex(p => p.id === pt.id);
                    if (playIndex < recentPlays.length - 1) {
                        const nextAction = recentPlays[playIndex + 1].tag.name;
                        nextActions[nextAction] = (nextActions[nextAction] || 0) + 1;
                    }
                });

                // Calculate confidence based on frequency and sample size
                const totalSequences = Object.values(nextActions).reduce((sum, count) => sum + count, 0);
                const mostLikelyNext = Object.entries(nextActions)
                    .sort(([,a], [,b]) => b - a)[0];

                if (mostLikelyNext && totalSequences >= 2) {
                    const confidence = Math.min(0.95, (mostLikelyNext[1] / totalSequences) * (1 + Math.log10(totalSequences) * 0.1));
                    const percentage = Math.round(confidence * 100);
                    
                    suggestions.push({
                        type: 'next_action_prediction',
                        message: `After "${lastAction}", this player typically follows with "${mostLikelyNext[0]}"`,
                        confidence: confidence,
                        context: `Based on ${totalSequences} recent sequences. ${mostLikelyNext[1]} out of ${totalSequences} times (${Math.round((mostLikelyNext[1] / totalSequences) * 100)}% frequency)`,
                        action: mostLikelyNext[0]
                    });
                }
            }
        }

        // 2. DEFENSIVE ADJUSTMENT PREDICTION (pattern recognition)
        if (recentPlays.length >= 3) {
            const lastThreeActions = recentPlays.slice(0, 3).map(pt => pt.tag.name);
            
            // Check for repeated patterns that defenses might catch
            if (lastThreeActions[0] === lastThreeActions[1] && lastThreeActions[1] === lastThreeActions[2]) {
                const repeatedAction = lastThreeActions[0];
                
                // Look for defensive responses to repeated actions
                const defensiveResponses = recentPlays.filter(pt => 
                    ['Double Teamed', 'Double Team Defense', 'Block', 'Steal'].includes(pt.tag.name)
                );

                if (defensiveResponses.length > 0) {
                    const recentDefensiveCount = defensiveResponses.filter(pt => 
                        new Date(pt.createdAt) > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
                    ).length;

                    const confidence = Math.min(0.9, 0.6 + (recentDefensiveCount * 0.1));
                    
                    suggestions.push({
                        type: 'defensive_adjustment',
                        message: `Defense may adjust to repeated "${repeatedAction}" - consider mixing up the play`,
                        confidence: confidence,
                        context: `"${repeatedAction}" used 3 times in a row. ${recentDefensiveCount} defensive plays in last 10 minutes.`,
                        warning: true
                    });
                }
            }
        }

        // 3. PLAYER TENDENCY ANALYSIS (based on frequency and recency)
        if (playerId && recentPlays.length > 0) {
            const playerPlays = recentPlays.filter(pt => pt.playerId === playerId);
            
            if (playerPlays.length >= 3) {
                const actionFrequency = {};
                const recentActions = playerPlays.slice(0, 10); // Last 10 actions
                
                recentActions.forEach(pt => {
                    actionFrequency[pt.tag.name] = (actionFrequency[pt.tag.name] || 0) + 1;
                });

                const totalActions = recentActions.length;
                const mostFrequent = Object.entries(actionFrequency)
                    .sort(([,a], [,b]) => b - a)[0];

                if (mostFrequent && mostFrequent[1] >= 3) {
                    const frequency = mostFrequent[1] / totalActions;
                    const recencyBonus = recentActions.slice(0, 3).filter(pt => pt.tag.name === mostFrequent[0]).length / 3;
                    const confidence = Math.min(0.85, frequency * 0.7 + recencyBonus * 0.3);
                    
                    suggestions.push({
                        type: 'player_tendency',
                        message: `"${mostFrequent[0]}" is ${selectedPlayer?.name || 'this player'}'s go-to move recently`,
                        confidence: confidence,
                        context: `${mostFrequent[1]} out of ${totalActions} recent actions (${Math.round(frequency * 100)}% frequency). ${recencyBonus > 0.5 ? 'Very recent trend.' : 'Established pattern.'}`,
                        action: mostFrequent[0]
                    });
                }
            }
        }

        // 4. GAME CONTEXT PREDICTION (quarter/time based patterns)
        if (quarter && gameTime) {
            const quarterPlays = recentPlays.filter(pt => pt.play.quarter === parseInt(quarter));
            
            if (quarterPlays.length >= 2) {
                const quarterActions = quarterPlays.reduce((acc, pt) => {
                    acc[pt.tag.name] = (acc[pt.tag.name] || 0) + 1;
                    return acc;
                }, {});

                const totalQuarterPlays = quarterPlays.length;
                const quarterTrend = Object.entries(quarterActions)
                    .sort(([,a], [,b]) => b - a)[0];

                if (quarterTrend && quarterTrend[1] >= 2) {
                    const quarterConfidence = Math.min(0.75, (quarterTrend[1] / totalQuarterPlays) * 0.8);
                    
                    suggestions.push({
                        type: 'quarter_pattern',
                        message: `"${quarterTrend[0]}" is working well in Q${quarter}`,
                        confidence: quarterConfidence,
                        context: `${quarterTrend[1]} successful uses this quarter. Quarter-specific pattern.`,
                        action: quarterTrend[0]
                    });
                }
            }
        }

        // Sort suggestions by confidence (highest first)
        suggestions.sort((a, b) => b.confidence - a.confidence);

        res.json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 5), // Top 5 suggestions
                totalPlaysAnalyzed: recentPlays.length,
                confidenceExplanation: {
                    next_action_prediction: "Confidence in predicting the next action based on recent sequence patterns",
                    defensive_adjustment: "Likelihood that defense will adjust to repeated patterns",
                    player_tendency: "Strength of player's recent behavioral pattern",
                    quarter_pattern: "Effectiveness of specific actions in current game context"
                },
                recentContext: recentPlays.slice(0, 5).map(pt => ({
                    tag: pt.tag.name,
                    player: pt.player?.name,
                    team: pt.team?.abbreviation,
                    quarter: pt.play.quarter,
                    gameTime: pt.play.gameTime,
                    timestamp: pt.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate suggestions'
        });
    }
});

// Get player decision quality analysis
router.get('/decision-quality/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { gameId } = req.query;

        // Get all plays with sequences for this player
        const playerPlays = await prisma.playTag.findMany({
            where: {
                playerId: playerId,
                ...(gameId && { play: { gameId } })
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

        // Analyze decision quality
        const decisionAnalysis = {
            totalSequences: Object.keys(playSequences).length,
            defensiveResponses: {},
            offensiveDecisions: {},
            poorDecisions: {}, // New category for tracking bad decisions
            overallQuality: {}
        };

        // Define "good" vs "questionable" decisions with enhanced basketball intelligence
        const decisionQuality = {
            // INITIAL SITUATIONS
            'Bringing Ball Up': {
                'Calling for Screen': { quality: 'excellent', reason: 'Smart setup, creates advantage' },
                'Isolation': { quality: 'good', reason: 'Direct attack, but could create better opportunities' },
                'Quick Shot': { quality: 'questionable', reason: 'Rushes the offense, could be more patient' },
                'Turnover': { quality: 'risky', reason: 'Poor ball control early in possession' }
            },
            'Off-Ball Movement': {
                'Calling for Screen': { quality: 'excellent', reason: 'Good off-ball awareness' },
                'Quick Shot': { quality: 'good', reason: 'Uses movement to create space' },
                'Turnover': { quality: 'risky', reason: 'Poor off-ball execution' }
            },

            // SCREEN ACTIONS
            'Calling for Screen': {
                'Pick and Roll': { quality: 'excellent', reason: 'Perfect execution of screen call' },
                'Pick and Pop': { quality: 'excellent', reason: 'Smart variation, creates spacing' },
                'Screen Mismatch': { quality: 'excellent', reason: 'Identifies and exploits defensive weakness' },
                'Screen Rejection': { quality: 'questionable', reason: 'Wastes screen opportunity' },
                'Turnover': { quality: 'risky', reason: 'Poor screen execution' }
            },
            'Pick and Roll': {
                'Drive to Basket': { quality: 'excellent', reason: 'Attacks the advantage created by screen' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses screen effectively for space' },
                'Pass to Roller': { quality: 'excellent', reason: 'Makes the right play, finds open teammate' },
                'Pass to Corner': { quality: 'good', reason: 'Good ball movement, creates open shot' },
                'Double Teamed': { quality: 'neutral', reason: 'Defense responds well, but creates opportunity' },
                'Step Back': { quality: 'questionable', reason: 'Gives up pick advantage' },
                'Turnover': { quality: 'risky', reason: 'Poor pick and roll execution' }
            },
            'Pick and Pop': {
                'Pull Up Shot': { quality: 'excellent', reason: 'Perfect execution of pick and pop' },
                'Drive to Basket': { quality: 'good', reason: 'Attacks the advantage' },
                'Pass to Popper': { quality: 'excellent', reason: 'Makes the right play, finds open shooter' },
                'Double Teamed': { quality: 'neutral', reason: 'Defense responds, but creates opportunity' },
                'Turnover': { quality: 'risky', reason: 'Poor pick and pop execution' }
            },
            'Screen Mismatch': {
                'Drive to Basket': { quality: 'excellent', reason: 'Exploits the mismatch perfectly' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses mismatch advantage' },
                'Post Up': { quality: 'excellent', reason: 'Smart to post up smaller defender' },
                'Step Back': { quality: 'good', reason: 'Creates space against slower defender' },
                'Pass Out': { quality: 'questionable', reason: 'Gives up mismatch advantage' },
                'Turnover': { quality: 'risky', reason: 'Poor mismatch exploitation' }
            },

            // ISOLATION SCENARIOS
            'Isolation': {
                'Drive to Basket': { quality: 'good', reason: 'Direct attack, but could create better opportunities' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses space effectively' },
                'Step Back': { quality: 'good', reason: 'Creates space for shot' },
                'Fade Away': { quality: 'good', reason: 'Creates separation' },
                'Double Teamed': { quality: 'neutral', reason: 'Defense responds, but creates opportunity' },
                'Pass Out': { quality: 'questionable', reason: 'Gives up isolation opportunity' },
                'Turnover': { quality: 'risky', reason: 'Poor isolation execution' }
            },

            // POST UP SCENARIOS
            'Post Up': {
                'Drive to Basket': { quality: 'good', reason: 'Attacks from post position' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses post advantage' },
                'Fade Away': { quality: 'good', reason: 'Creates separation from post' },
                'Pass Out': { quality: 'good', reason: 'Finds open teammate from post' },
                'Step Back': { quality: 'questionable', reason: 'Gives up post advantage' },
                'Double Teamed': { quality: 'neutral', reason: 'Defense responds, but creates opportunity' },
                'Turnover': { quality: 'risky', reason: 'Poor post play execution' }
            },

            // DOUBLE TEAM RESPONSES (CRITICAL DECISION POINT)
            'Double Teamed': {
                'Pass Out': { quality: 'excellent', reason: 'Makes the right play, finds open teammate' },
                'Split Defense': { quality: 'good', reason: 'Aggressive but effective if successful' },
                'Pull Up Shot': { quality: 'questionable', reason: 'Forces the issue against double team' },
                'Drive to Basket': { quality: 'risky', reason: 'High difficulty against double team' },
                'Step Back': { quality: 'questionable', reason: 'Forces the issue against double team' },
                'Fade Away': { quality: 'risky', reason: 'High difficulty against double team' },
                'Turnover': { quality: 'risky', reason: 'Poor decision under pressure' }
            },

            // DRIVE SCENARIOS
            'Drive to Basket': {
                'Layup/Dunk': { quality: 'excellent', reason: 'Perfect finish at the rim' },
                'Pull Up Shot': { quality: 'good', reason: 'Good mid-range option' },
                'Pass Out': { quality: 'good', reason: 'Good court vision, finds open teammate' },
                'Foul Drawn': { quality: 'good', reason: 'Gets to the line' },
                'Turnover': { quality: 'risky', reason: 'Poor ball control or decision' },
                'Missed Shot': { quality: 'questionable', reason: 'Inefficient drive finish' }
            },

            // TRANSITION SCENARIOS
            'Transition': {
                'Drive to Basket': { quality: 'excellent', reason: 'Attacks in transition' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses transition advantage' },
                'Pass Out': { quality: 'good', reason: 'Finds open teammate in transition' },
                'Layup/Dunk': { quality: 'excellent', reason: 'Perfect transition finish' },
                'Step Back': { quality: 'questionable', reason: 'Slows down transition' },
                'Turnover': { quality: 'risky', reason: 'Poor transition execution' },
                'Missed Shot': { quality: 'questionable', reason: 'Inefficient transition' }
            },

            // DEFENSIVE SCENARIOS
            'Defensive Play': {
                'Steal': { quality: 'excellent', reason: 'Great defensive play' },
                'Block': { quality: 'excellent', reason: 'Excellent rim protection' },
                'Defensive Rebound': { quality: 'good', reason: 'Good defensive positioning' },
                'Foul': { quality: 'questionable', reason: 'Could be cleaner defense' },
                'Turnover': { quality: 'risky', reason: 'Poor defensive execution' }
            },

            // SHOT RESULT SCENARIOS
            'Pull Up Shot': {
                'Made Shot': { quality: 'excellent', reason: 'Perfect execution' },
                'Missed Shot': { quality: 'questionable', reason: 'Inefficient shot selection' },
                'Blocked': { quality: 'risky', reason: 'Poor shot selection' },
                'Foul Drawn': { quality: 'good', reason: 'Gets to the line' }
            },
            'Step Back': {
                'Made Shot': { quality: 'excellent', reason: 'Perfect execution' },
                'Missed Shot': { quality: 'questionable', reason: 'Inefficient shot selection' },
                'Blocked': { quality: 'risky', reason: 'Poor shot selection' },
                'Foul Drawn': { quality: 'good', reason: 'Gets to the line' }
            },
            'Fade Away': {
                'Made Shot': { quality: 'excellent', reason: 'Perfect execution' },
                'Missed Shot': { quality: 'questionable', reason: 'Inefficient shot selection' },
                'Blocked': { quality: 'risky', reason: 'Poor shot selection' },
                'Foul Drawn': { quality: 'good', reason: 'Gets to the line' }
            },

            // PASS RESULT SCENARIOS
            'Pass Out': {
                'Assist': { quality: 'excellent', reason: 'Perfect pass execution' },
                'Turnover': { quality: 'risky', reason: 'Poor pass execution' },
                'Shot Attempt': { quality: 'good', reason: 'Good pass leads to shot' }
            },
            'Pass to Roller': {
                'Assist': { quality: 'excellent', reason: 'Perfect pick and roll execution' },
                'Turnover': { quality: 'risky', reason: 'Poor pick and roll execution' },
                'Shot Attempt': { quality: 'good', reason: 'Good pick and roll execution' }
            },
            'Pass to Corner': {
                'Assist': { quality: 'excellent', reason: 'Perfect ball movement' },
                'Turnover': { quality: 'risky', reason: 'Poor ball movement' },
                'Shot Attempt': { quality: 'good', reason: 'Good ball movement' }
            }
        };

        // Enhanced multi-step sequence analysis with negative sequences
        const sequenceQuality = {
            // EXCELLENT SEQUENCES (3+ steps)
            'Calling for Screen → Pick and Roll → Drive to Basket': { quality: 'excellent', reason: 'Perfect execution of modern basketball' },
            'Calling for Screen → Screen Mismatch → Drive to Basket': { quality: 'excellent', reason: 'Smart identification and exploitation of mismatch' },
            'Post Up → Double Teamed → Pass Out': { quality: 'excellent', reason: 'Perfect response to defensive pressure' },
            'Pick and Roll → Double Teamed → Pass Out': { quality: 'excellent', reason: 'Makes the right play under pressure' },
            'Bringing Ball Up → Calling for Screen → Pick and Roll': { quality: 'excellent', reason: 'Smart offensive setup' },

            // GOOD SEQUENCES
            'Isolation → Drive to Basket': { quality: 'good', reason: 'Direct but effective' },
            'Transition → Layup/Dunk': { quality: 'excellent', reason: 'Perfect transition execution' },
            'Pick and Pop → Pull Up Shot': { quality: 'excellent', reason: 'Perfect pick and pop execution' },

            // QUESTIONABLE SEQUENCES (Bad decisions)
            'Calling for Screen → Screen Rejection': { quality: 'questionable', reason: 'Wastes screen opportunity' },
            'Screen Mismatch → Pass Out': { quality: 'questionable', reason: 'Gives up mismatch advantage' },
            'Isolation → Pass Out': { quality: 'questionable', reason: 'Gives up isolation opportunity' },
            'Bringing Ball Up → Quick Shot': { quality: 'questionable', reason: 'Rushes the offense' },
            'Post Up → Step Back': { quality: 'questionable', reason: 'Gives up post advantage' },
            'Transition → Step Back': { quality: 'questionable', reason: 'Slows down transition' },
            'Pick and Roll → Step Back': { quality: 'questionable', reason: 'Gives up pick advantage' },
            'Screen Mismatch → Step Back': { quality: 'questionable', reason: 'Gives up mismatch advantage' },

            // RISKY SEQUENCES (Very bad decisions)
            'Double Teamed → Drive to Basket': { quality: 'risky', reason: 'Forces the issue against double team' },
            'Double Teamed → Pull Up Shot': { quality: 'questionable', reason: 'Forces the issue against double team' },
            'Double Teamed → Step Back': { quality: 'questionable', reason: 'Forces the issue against double team' },
            'Double Teamed → Fade Away': { quality: 'risky', reason: 'High difficulty against double team' },
            'Drive to Basket → Turnover': { quality: 'risky', reason: 'Poor ball control or decision' },
            'Pick and Roll → Turnover': { quality: 'risky', reason: 'Poor execution of pick and roll' },
            'Post Up → Turnover': { quality: 'risky', reason: 'Poor post play execution' },
            'Isolation → Turnover': { quality: 'risky', reason: 'Poor isolation execution' },

            // TERRIBLE SEQUENCES (Worst decisions)
            'Calling for Screen → Screen Rejection → Turnover': { quality: 'risky', reason: 'Wastes screen and turns it over' },
            'Screen Mismatch → Pass Out → Turnover': { quality: 'risky', reason: 'Gives up advantage and turns it over' },
            'Double Teamed → Drive to Basket → Turnover': { quality: 'risky', reason: 'Forces the issue and turns it over' },
            'Bringing Ball Up → Quick Shot → Missed Shot': { quality: 'questionable', reason: 'Rushes offense and misses' },
            'Isolation → Pull Up Shot → Missed Shot': { quality: 'questionable', reason: 'Inefficient isolation' },
            'Post Up → Fade Away → Missed Shot': { quality: 'questionable', reason: 'Inefficient post play' }
        };

        // Debug: Log what sequences we're finding
        console.log('Found sequences:', Object.values(playSequences).map(seq => 
            seq.sort((a, b) => a.sequence - b.sequence).map(s => s.tag)
        ));

        // Enhanced sequence analysis with multi-step intelligence
        let analyzedCount = 0;
        Object.values(playSequences).forEach(sequence => {
            if (sequence.length >= 2) {
                const sortedSequence = sequence.sort((a, b) => a.sequence - b.sequence);
                const sequenceTags = sortedSequence.map(s => s.tag);
                const sequenceString = sequenceTags.join(' → ');

                console.log(`Analyzing sequence: ${sequenceString}`);

                // First, check for multi-step sequence quality
                let sequenceQualityResult = null;
                if (sequence.length >= 3) {
                    // Check for 3+ step sequences
                    sequenceQualityResult = sequenceQuality[sequenceString];
                }

                if (sequenceQualityResult) {
                    // Multi-step sequence found
                    analyzedCount++;
                    const quality = sequenceQualityResult;
                    
                    // Track as complex sequence
                    if (!decisionAnalysis.complexSequences) {
                        decisionAnalysis.complexSequences = {};
                    }
                    if (!decisionAnalysis.complexSequences[sequenceString]) {
                        decisionAnalysis.complexSequences[sequenceString] = { count: 0, quality: quality.quality, reason: quality.reason };
                    }
                    decisionAnalysis.complexSequences[sequenceString].count++;
                    
                    console.log(`Multi-step sequence: ${sequenceString} - ${quality.quality}`);
                } else {
                    // Analyze 2-step sequences
                    const initialAction = sequenceTags[0];
                    const response = sequenceTags[1];

                    if (initialAction && response && decisionQuality[initialAction]?.[response]) {
                        const quality = decisionQuality[initialAction][response];
                        analyzedCount++;
                        
                        // Enhanced categorization based on basketball context
                        if (initialAction === 'Double Teamed') {
                            if (!decisionAnalysis.defensiveResponses[response]) {
                                decisionAnalysis.defensiveResponses[response] = { count: 0, quality: quality.quality, reason: quality.reason };
                            }
                            decisionAnalysis.defensiveResponses[response].count++;
                        } else if (['Calling for Screen', 'Screen Mismatch', 'Pick and Roll', 'Pick and Pop'].includes(initialAction)) {
                            // Screen-based actions
                            if (!decisionAnalysis.screenActions) {
                                decisionAnalysis.screenActions = {};
                            }
                            if (!decisionAnalysis.screenActions[response]) {
                                decisionAnalysis.screenActions[response] = { count: 0, quality: quality.quality, reason: quality.reason };
                            }
                            decisionAnalysis.screenActions[response].count++;
                        } else if (['Isolation', 'Post Up', 'Transition'].includes(initialAction)) {
                            // Offensive decisions
                            if (!decisionAnalysis.offensiveDecisions[response]) {
                                decisionAnalysis.offensiveDecisions[response] = { count: 0, quality: quality.quality, reason: quality.reason };
                            }
                            decisionAnalysis.offensiveDecisions[response].count++;
                        } else if (['Bringing Ball Up', 'Off-Ball Movement'].includes(initialAction)) {
                            // Setup actions
                            if (!decisionAnalysis.setupActions) {
                                decisionAnalysis.setupActions = {};
                            }
                            if (!decisionAnalysis.setupActions[response]) {
                                decisionAnalysis.setupActions[response] = { count: 0, quality: quality.quality, reason: quality.reason };
                            }
                            decisionAnalysis.setupActions[response].count++;
                        } else if (['Drive to Basket', 'Defensive Play'].includes(initialAction)) {
                            // Execution actions
                            if (!decisionAnalysis.executionActions) {
                                decisionAnalysis.executionActions = {};
                            }
                            if (!decisionAnalysis.executionActions[response]) {
                                decisionAnalysis.executionActions[response] = { count: 0, quality: quality.quality, reason: quality.reason };
                            }
                            decisionAnalysis.executionActions[response].count++;
                        }

                        // Track poor decisions specifically (questionable and risky)
                        if (quality.quality === 'questionable' || quality.quality === 'risky') {
                            if (!decisionAnalysis.poorDecisions[response]) {
                                decisionAnalysis.poorDecisions[response] = { count: 0, quality: quality.quality, reason: quality.reason, context: initialAction };
                            }
                            decisionAnalysis.poorDecisions[response].count++;
                        }
                    } else {
                        console.log(`No quality definition for: ${initialAction} → ${response}`);
                        // Add fallback quality for undefined sequences
                        if (initialAction && response) {
                            const fallbackQuality = 'neutral';
                            analyzedCount++;
                            
                            // Categorize fallback sequences
                            if (initialAction === 'Double Teamed') {
                                if (!decisionAnalysis.defensiveResponses[response]) {
                                    decisionAnalysis.defensiveResponses[response] = { count: 0, quality: fallbackQuality, reason: 'Undefined sequence' };
                                }
                                decisionAnalysis.defensiveResponses[response].count++;
                            } else {
                                // Add to offensive decisions as fallback
                                if (!decisionAnalysis.offensiveDecisions[response]) {
                                    decisionAnalysis.offensiveDecisions[response] = { count: 0, quality: fallbackQuality, reason: 'Undefined sequence' };
                                }
                                decisionAnalysis.offensiveDecisions[response].count++;
                            }
                        }
                    }
                }
            }
        });

        console.log(`Analyzed ${analyzedCount} sequences out of ${Object.keys(playSequences).length} total`);

        // Calculate overall quality scores
        const qualityScores = {
            excellent: 4,
            good: 3,
            neutral: 2.5, // Neutral gets middle score
            questionable: 2,
            risky: 1
        };

        let totalScore = 0;
        let totalDecisions = 0;

        // Include all decision categories in scoring
        Object.values(decisionAnalysis.defensiveResponses || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
            totalDecisions += decision.count;
        });

        Object.values(decisionAnalysis.offensiveDecisions || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
            totalDecisions += decision.count;
        });

        // Include new categories
        Object.values(decisionAnalysis.screenActions || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
            totalDecisions += decision.count;
        });

        Object.values(decisionAnalysis.setupActions || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
            totalDecisions += decision.count;
        });

        Object.values(decisionAnalysis.executionActions || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
            totalDecisions += decision.count;
        });

        // Include complex sequences (weighted higher for multi-step intelligence)
        Object.values(decisionAnalysis.complexSequences || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count * 1.2; // 20% bonus for complex sequences
            totalDecisions += decision.count;
        });

        // Include poor decisions (weighted to penalize bad decisions)
        Object.values(decisionAnalysis.poorDecisions || {}).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count * 0.8; // 20% penalty for poor decisions
            totalDecisions += decision.count;
        });

        decisionAnalysis.overallQuality = {
            averageScore: totalDecisions > 0 ? (totalScore / totalDecisions).toFixed(2) : 0,
            totalDecisions,
            grade: totalDecisions > 0 ? 
                (totalScore / totalDecisions >= 3.5 ? 'A' : 
                 totalScore / totalDecisions >= 3.0 ? 'B' : 
                 totalScore / totalDecisions >= 2.5 ? 'C' : 'D') : 'N/A'
        };

        // Get recent sequences for context
        const recentSequences = Object.values(playSequences)
            .slice(0, 5)
            .map(sequence => ({
                actions: sequence.sort((a, b) => a.sequence - b.sequence).map(s => s.tag),
                quality: sequence.length >= 2 ? 
                    decisionQuality[sequence[0]?.tag]?.[sequence[1]?.tag]?.quality || 'neutral' : 'neutral'
            }));

        res.json({
            success: true,
            data: {
                decisionAnalysis,
                recentSequences,
                decisionQuality // Include the quality definitions for reference
            }
        });
    } catch (error) {
        console.error('Error analyzing decision quality:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze decision quality'
        });
    }
});

// Get next tag suggestions based on historic data
router.get('/next-tag-suggestions', async (req, res) => {
    try {
        const { tag } = req.query;
        if (!tag) {
            return res.status(400).json({ success: false, error: 'Missing tag parameter' });
        }

        // Get all plays with their tags and sequence order
        const playTags = await prisma.playTag.findMany({
            include: {
                tag: true,
                play: true
            },
            orderBy: [
                { playId: 'asc' },
                { createdAt: 'asc' }
            ]
        });

        // Group playTags by playId and sort by sequence
        const playsById = {};
        playTags.forEach(pt => {
            if (!playsById[pt.playId]) playsById[pt.playId] = [];
            playsById[pt.playId].push(pt);
        });
        Object.values(playsById).forEach(arr => arr.sort((a, b) => (a.context?.sequence || 1) - (b.context?.sequence || 1)));

        // Find all next tags after the given tag
        const nextTagCounts = {};
        Object.values(playsById).forEach(sequence => {
            for (let i = 0; i < sequence.length - 1; i++) {
                if (sequence[i].tag && sequence[i].tag.name === tag) {
                    const nextTag = sequence[i + 1].tag && sequence[i + 1].tag.name;
                    if (nextTag) {
                        nextTagCounts[nextTag] = (nextTagCounts[nextTag] || 0) + 1;
                    }
                }
            }
        });

        // Sort and return top 3 suggestions
        const suggestions = Object.entries(nextTagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

        res.json({
            success: true,
            data: {
                tag,
                suggestions
            }
        });
    } catch (error) {
        console.error('Error generating next tag suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate next tag suggestions'
        });
    }
});

// Get defensive scouting report for a player
router.get('/defensive-scouting/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { gameId } = req.query;

        // Get all plays with sequences for this player
        const playerPlays = await prisma.playTag.findMany({
            where: {
                playerId: playerId,
                ...(gameId && { play: { gameId } })
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

        // Analyze specific patterns
        Object.values(playSequences).forEach(sequence => {
            const sortedSequence = sequence.sort((a, b) => a.sequence - b.sequence);
            const tags = sortedSequence.map(s => s.tag);

            // Screen usage analysis
            if (tags.includes('Calling for Screen')) {
                const screenIndex = tags.indexOf('Calling for Screen');
                const nextAction = tags[screenIndex + 1];
                if (nextAction) {
                    if (!offensivePatterns.screenUsage[nextAction]) {
                        offensivePatterns.screenUsage[nextAction] = 0;
                    }
                    offensivePatterns.screenUsage[nextAction]++;
                }
            }

            // Isolation analysis
            if (tags.includes('Isolation')) {
                const isolationIndex = tags.indexOf('Isolation');
                const nextAction = tags[isolationIndex + 1];
                if (nextAction) {
                    if (!offensivePatterns.isolationTendencies[nextAction]) {
                        offensivePatterns.isolationTendencies[nextAction] = 0;
                    }
                    offensivePatterns.isolationTendencies[nextAction]++;
                }
            }

            // Pressure response analysis
            if (tags.includes('Double Teamed')) {
                const pressureIndex = tags.indexOf('Double Teamed');
                const nextAction = tags[pressureIndex + 1];
                if (nextAction) {
                    if (!offensivePatterns.pressureResponses[nextAction]) {
                        offensivePatterns.pressureResponses[nextAction] = 0;
                    }
                    offensivePatterns.pressureResponses[nextAction]++;
                }
            }

            // Shot selection analysis
            const shotActions = ['Pull Up Shot', 'Step Back Shot', 'Fade Away', 'Layup/Dunk'];
            shotActions.forEach(shotAction => {
                if (tags.includes(shotAction)) {
                    if (!offensivePatterns.shotSelection[shotAction]) {
                        offensivePatterns.shotSelection[shotAction] = 0;
                    }
                    offensivePatterns.shotSelection[shotAction]++;
                }
            });
        });

        // Generate defensive strategies
        const defensiveStrategies = {
            primaryDefensiveFocus: [],
            screenDefense: [],
            isolationDefense: [],
            pressureDefense: [],
            shotContest: [],
            gamePlan: []
        };

        // Analyze most frequent sequences and create counter-strategies
        const sortedSequences = Object.entries(offensivePatterns.mostFrequentSequences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        sortedSequences.forEach(([sequence, count]) => {
            const tags = sequence.split(' → ');
            
            // Counter-strategies based on sequence patterns
            if (sequence.includes('Calling for Screen → Screen Mismatch')) {
                defensiveStrategies.screenDefense.push({
                    strategy: 'Switch Screens Early',
                    reasoning: `Player used screen mismatch ${count} times - prevent mismatch creation`,
                    execution: 'Switch on screen calls before mismatch develops',
                    priority: 'High'
                });
            }

            if (sequence.includes('Calling for Screen → Pick and Roll')) {
                defensiveStrategies.screenDefense.push({
                    strategy: 'Hedge and Recover',
                    reasoning: `Player frequently uses pick and roll (${count} times)`,
                    execution: 'Hedge the screen, then recover to prevent drive',
                    priority: 'High'
                });
            }

            if (sequence.includes('Isolation')) {
                const isolationResponses = offensivePatterns.isolationTendencies;
                const mostCommonResponse = Object.entries(isolationResponses)
                    .sort(([,a], [,b]) => b - a)[0];
                
                if (mostCommonResponse) {
                    defensiveStrategies.isolationDefense.push({
                        strategy: `Force ${mostCommonResponse[0]}`,
                        reasoning: `In isolation, player most often responds with ${mostCommonResponse[0]} (${mostCommonResponse[1]} times)`,
                        execution: `Take away ${mostCommonResponse[0]} option, force counter`,
                        priority: 'Medium'
                    });
                }
            }

            if (sequence.includes('Double Teamed')) {
                const pressureResponses = offensivePatterns.pressureResponses;
                const mostCommonResponse = Object.entries(pressureResponses)
                    .sort(([,a], [,b]) => b - a)[0];
                
                if (mostCommonResponse) {
                    defensiveStrategies.pressureDefense.push({
                        strategy: `Prevent ${mostCommonResponse[0]}`,
                        reasoning: `When pressured, player most often responds with ${mostCommonResponse[0]} (${mostCommonResponse[1]} times)`,
                        execution: `Take away ${mostCommonResponse[0]} option, force different response`,
                        priority: 'High'
                    });
                }
            }
        });

        // Shot contest strategies
        const shotPatterns = offensivePatterns.shotSelection;
        Object.entries(shotPatterns).forEach(([shotType, count]) => {
            if (shotType === 'Pull Up Shot' && count > 2) {
                defensiveStrategies.shotContest.push({
                    strategy: 'Contest Pull-Ups Aggressively',
                    reasoning: `Player frequently uses pull-up shots (${count} times)`,
                    execution: 'Close out hard, contest every pull-up attempt',
                    priority: 'High'
                });
            }

            if (shotType === 'Step Back Shot' && count > 2) {
                defensiveStrategies.shotContest.push({
                    strategy: 'Stay Attached on Step-Backs',
                    reasoning: `Player uses step-back shots (${count} times)`,
                    execution: 'Stay close, don\'t bite on step-back fakes',
                    priority: 'Medium'
                });
            }
        });

        // Generate overall game plan
        const totalPlays = Object.keys(playSequences).length;
        const screenUsage = Object.values(offensivePatterns.screenUsage).reduce((sum, count) => sum + count, 0);
        const screenPercentage = (screenUsage / totalPlays) * 100;

        if (screenPercentage > 50) {
            defensiveStrategies.gamePlan.push({
                strategy: 'Disrupt Screen Actions',
                reasoning: `Player heavily relies on screens (${screenPercentage.toFixed(1)}% of plays)`,
                execution: 'Switch screens, hedge aggressively, prevent clean screen execution',
                priority: 'Critical'
            });
        }

        const isolationCount = Object.values(offensivePatterns.isolationTendencies).reduce((sum, count) => sum + count, 0);
        if (isolationCount > 3) {
            defensiveStrategies.gamePlan.push({
                strategy: 'Force Isolation Decisions',
                reasoning: `Player uses isolation frequently (${isolationCount} times)`,
                execution: 'Force isolation but take away preferred counter-moves',
                priority: 'High'
            });
        }

        // Set primary defensive focus
        if (screenPercentage > 50) {
            defensiveStrategies.primaryDefensiveFocus.push('Screen Defense');
        }
        if (isolationCount > 3) {
            defensiveStrategies.primaryDefensiveFocus.push('Isolation Defense');
        }
        if (Object.keys(offensivePatterns.pressureResponses).length > 0) {
            defensiveStrategies.primaryDefensiveFocus.push('Pressure Defense');
        }

        res.json({
            success: true,
            data: {
                playerId,
                totalPlays,
                offensivePatterns,
                defensiveStrategies,
                keyInsights: {
                    mostFrequentSequence: sortedSequences[0] ? sortedSequences[0][0] : 'None',
                    screenDependency: screenPercentage,
                    isolationFrequency: isolationCount,
                    pressureResponse: Object.keys(offensivePatterns.pressureResponses).length > 0 ? 
                        Object.entries(offensivePatterns.pressureResponses).sort(([,a], [,b]) => b - a)[0] : null
                }
            }
        });
    } catch (error) {
        console.error('Error generating defensive scouting report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate defensive scouting report'
        });
    }
});

module.exports = router; 