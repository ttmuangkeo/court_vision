const express = require('express');
const router = express.Router();
const prisma = require('../../../src/db/client');
const BoxScoreService = require('../../services/sportsdata/boxScoreService');

// GET /api/games - Get all games
router.get('/', async (req, res) => {
    try {
        const {
            include,
            status,
            team,
            date,
            season,
            limit = 50, // Increased default limit
            page = 1,
            sortBy = 'dateTime',
            sortOrder = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (season) where.season = season;
        if (date) {
            const searchDate = new Date(date);
            where.dateTime = {
                gte: searchDate,
                lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000) // Next day
            };
        }
        if (team) {
            where.OR = [
                {homeTeamId: team},
                {awayTeamId: team}
            ];
        }

                // Validate sortBy parameter
        const allowedSortFields = ['dateTime', 'homeTeamScore', 'awayTeamScore', 'status'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'dateTime';
        const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

        const games = await prisma.game.findMany({
            where,
            include: include === 'teams' ? {
                homeTeam: true,
                awayTeam: true
            } : undefined,
            orderBy: {dateTime: 'desc'},
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const total = await prisma.game.count({where});

        res.json({
            success: true,
            data: games,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch(error) {
        console.error('Error fetching games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch games'
        });
    }
});

// GET /api/games/:id - Get game by ID
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {include} = req.query;

        const game = await prisma.game.findUnique({
            where: {id: parseInt(id)},
            include: include === 'teams' ? {
                homeTeam: true,
                awayTeam: true
            } : include === 'full' ? {
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
                        },
                        ballHandler: true,
                        primaryPlayer: true,
                        secondaryPlayer: true
                    },
                    orderBy: { timestamp: 'asc' }
                }
            } : undefined
        });

        if(!game) {
            return res.status(404).json({
                success: false,
                error: 'Game not found'
            });
        }

        res.json({
            success: true,
            data: game
        });
    } catch(error) {
        console.error('Error fetching game:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game'
        });
    }
});

// GET /api/games/live - Get live games
router.get('/live/current', async (req, res) => {
    try {
        const liveGames = await prisma.game.findMany({
            where: {
                status: 'LIVE'
            },
            include: {
                homeTeam: true,
                awayTeam: true
            },
            orderBy: {[validSortBy]: validSortOrder}
        });

        res.json({
            success: true,
            data: liveGames,
            count: liveGames.length
        });
    } catch(error) {
        console.error('Error fetching live games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch live games'
        });
    }
});

// GET /api/games/today - Get today's games
router.get('/schedule/today', async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const todaysGames = await prisma.game.findMany({
            where: {
                dateTime: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true
            },
            orderBy: {dateTime: 'asc'}
        });

        res.json({
            success: true,
            data: todaysGames,
            count: todaysGames.length
        });
    } catch(error) {
        console.error('Error fetching today\'s games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch today\'s games'
        });
    }
});


// GET /api/games/:id/analysis - Get detailed game analysis and matchup comparison
router.get('/:id/analysis', async (req, res) => {
  try {
    const { id } = req.params;
    const boxScoreService = new BoxScoreService();

    // Get game analysis
    const analysis = await boxScoreService.analyzeGameMatchup(id);
    
    // Save analysis for future reference
    await boxScoreService.saveGameAnalysis(id, analysis);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error fetching game analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game analysis'
    });
  }
});

// GET /api/games/:id/matchup - Get team matchup comparison
router.get('/:id/matchup', async (req, res) => {
  try {
    const { id } = req.params;
    const boxScoreService = new BoxScoreService();

    const analysis = await boxScoreService.analyzeGameMatchup(id);
    
    // Return just the matchup comparison
    res.json({
      success: true,
      data: {
        gameInfo: analysis.gameInfo,
        matchup: analysis.matchup,
        gamePlan: analysis.gamePlan
      }
    });
  } catch (error) {
    console.error('Error fetching matchup analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matchup analysis'
    });
  }
});

module.exports = router;