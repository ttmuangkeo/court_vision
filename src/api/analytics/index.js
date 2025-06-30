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
        const recentPlays = game.plays.slice(0, 10);
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
            overallQuality: {}
        };

        // Define "good" vs "questionable" decisions
        const decisionQuality = {
            'Double Teamed': {
                'Pass Out': { quality: 'excellent', reason: 'Makes the right play, finds open teammate' },
                'Split Defense': { quality: 'good', reason: 'Aggressive but effective if successful' },
                'Pull Up Shot': { quality: 'questionable', reason: 'Forces the issue against double team' },
                'Drive to Basket': { quality: 'risky', reason: 'High difficulty against double team' },
                'Step Back': { quality: 'questionable', reason: 'Forces the issue against double team' },
                'Fade Away': { quality: 'risky', reason: 'High difficulty against double team' }
            },
            'Isolation': {
                'Step Back': { quality: 'good', reason: 'Creates space for shot' },
                'Drive to Basket': { quality: 'good', reason: 'Attacks the rim' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses space effectively' },
                'Pass Out': { quality: 'questionable', reason: 'Gives up isolation opportunity' },
                'Fade Away': { quality: 'good', reason: 'Creates separation' }
            },
            'Pick and Roll': {
                'Drive to Basket': { quality: 'excellent', reason: 'Attacks the advantage' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses screen effectively' },
                'Pass Out': { quality: 'good', reason: 'Finds open teammate' },
                'Step Back': { quality: 'questionable', reason: 'Gives up pick advantage' },
                'Fade Away': { quality: 'questionable', reason: 'Gives up pick advantage' }
            },
            'Post Up': {
                'Drive to Basket': { quality: 'good', reason: 'Attacks from post position' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses post advantage' },
                'Fade Away': { quality: 'good', reason: 'Creates separation from post' },
                'Pass Out': { quality: 'good', reason: 'Finds open teammate from post' },
                'Step Back': { quality: 'questionable', reason: 'Gives up post advantage' }
            },
            'Transition': {
                'Drive to Basket': { quality: 'excellent', reason: 'Attacks in transition' },
                'Pull Up Shot': { quality: 'good', reason: 'Uses transition advantage' },
                'Pass Out': { quality: 'good', reason: 'Finds open teammate in transition' },
                'Step Back': { quality: 'questionable', reason: 'Slows down transition' }
            }
        };

        // Debug: Log what sequences we're finding
        console.log('Found sequences:', Object.values(playSequences).map(seq => 
            seq.sort((a, b) => a.sequence - b.sequence).map(s => s.tag)
        ));

        // Analyze each sequence
        let analyzedCount = 0;
        Object.values(playSequences).forEach(sequence => {
            if (sequence.length >= 2) {
                const initialAction = sequence.find(s => s.sequence === 1)?.tag;
                const response = sequence.find(s => s.sequence === 2)?.tag;

                console.log(`Analyzing sequence: ${initialAction} → ${response}`);

                if (initialAction && response && decisionQuality[initialAction]?.[response]) {
                    const quality = decisionQuality[initialAction][response];
                    analyzedCount++;
                    
                    // Track defensive responses
                    if (initialAction === 'Double Teamed') {
                        if (!decisionAnalysis.defensiveResponses[response]) {
                            decisionAnalysis.defensiveResponses[response] = { count: 0, quality: quality.quality };
                        }
                        decisionAnalysis.defensiveResponses[response].count++;
                    }

                    // Track offensive decisions
                    if (['Isolation', 'Pick and Roll', 'Post Up', 'Transition'].includes(initialAction)) {
                        if (!decisionAnalysis.offensiveDecisions[response]) {
                            decisionAnalysis.offensiveDecisions[response] = { count: 0, quality: quality.quality };
                        }
                        decisionAnalysis.offensiveDecisions[response].count++;
                    }
                } else {
                    console.log(`No quality definition for: ${initialAction} → ${response}`);
                    // Add fallback quality for undefined sequences
                    if (initialAction && response) {
                        const fallbackQuality = 'neutral'; // Default to neutral for undefined combinations
                        analyzedCount++;
                        
                        if (initialAction === 'Double Teamed') {
                            if (!decisionAnalysis.defensiveResponses[response]) {
                                decisionAnalysis.defensiveResponses[response] = { count: 0, quality: fallbackQuality };
                            }
                            decisionAnalysis.defensiveResponses[response].count++;
                        }

                        if (['Isolation', 'Pick and Roll', 'Post Up', 'Transition'].includes(initialAction)) {
                            if (!decisionAnalysis.offensiveDecisions[response]) {
                                decisionAnalysis.offensiveDecisions[response] = { count: 0, quality: fallbackQuality };
                            }
                            decisionAnalysis.offensiveDecisions[response].count++;
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

        Object.values(decisionAnalysis.defensiveResponses).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
            totalDecisions += decision.count;
        });

        Object.values(decisionAnalysis.offensiveDecisions).forEach(decision => {
            totalScore += qualityScores[decision.quality] * decision.count;
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

module.exports = router; 