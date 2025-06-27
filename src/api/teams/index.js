const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');

// GET /api/teams - Get all teams
router.get('/', async (req, res) => {
    try {
        const { include, conference, division, limit = 30, page = 1 } = req.query;

        const skip = (page - 1) * limit;

        const where = {};
        if (conference) where.conference = conference;
        if (division) where.division = division;

        const teams = await prisma.team.findMany({
            where,
            include: include === 'players' ? {
                players: {
                    include: {
                        _count: {
                            select: {
                                playTags: true
                            }
                        }
                    }
                }
            } : undefined,
            orderBy: { name: 'asc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const total = await prisma.team.count({ where });

        res.json({
            success: true,
            data: teams,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch(error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch teams'
        });
    }
});

// GET /api/teams/:id - Get team by ID
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {include} = req.query;

        const team = await prisma.team.findUnique({
            where: {id},
            include: include === 'players' ? {
                players: {
                    include: {
                        _count: {
                            select: {
                                playTags: true
                            }
                        }
                    }
                }
            } : include === 'full' ? {
                players: {
                    include: {
                        _count: {
                            select: {
                                playTags: true
                            }
                        }
                    }
                },
                homeGames: {
                    include: {
                        awayTeam: true
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                },
                awayGames: {
                    include: {
                        homeTeam: true
                    },
                    orderBy: { date: 'desc' },
                    take: 10
                }
            } : undefined
        });

        if(!team) {
            return res.status(404).json({
                success: false,
                error: 'Team not found'
            });
        }

        res.json({
            success: true,
            data: team
        });
    } catch(error) {
        console.error('Error fetching team:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team'
        });
    }
});

module.exports = router;