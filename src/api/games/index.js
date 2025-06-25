const express = require('express');
const router = express.Router();
const prisma = require('../../../src/db/client');

// GET /api/games - Get all games
router.get('/', async (req, res) => {
    try {
        const {
            include,
            status,
            team,
            date,
            season,
            limit = 20,
            page = 1
        } = req.query;

        const skip = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (season) where.season = season;
        if (date) {
            const searchDate = new Date(date);
            where.date = {
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

        const games = await prisma.game.findMany({
            where,
            include: include === 'teams' ? {
                homeTeam: true,
                awayTeam: true
            } : undefined,
            orderBy: {date: 'desc'},
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
            where: {id},
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
            orderBy: {date: 'desc'}
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
                date: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true
            },
            orderBy: {date: 'asc'}
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

module.exports = router;