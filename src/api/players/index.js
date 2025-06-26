const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');

router.get('/', async (req, res) => {
    try {
        const {
            include, 
            team, 
            team_ids, 
            position,
            limit = 20,
            page = 1,
            sort = 'name', // name, team, position, recent_activity
            order = 'asc',
            search = '' // Add search parameter
        } = req.query;

        const skip = (page - 1) * limit;

        const where = {};
        if(team) where.teamId = team;
        if(team_ids) {
            const teamIdArray = team_ids.split(',');
            where.teamId = { in: teamIdArray };
        }
        if(position) where.position = position;
        
        // Add search functionality
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where.OR = [
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive' // Case-insensitive search
                    }
                },
                {
                    name: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Handle different sorting options
        let orderBy = {};
        if (sort === 'recent_activity') {
            // Sort by players who have been tagged most recently
            orderBy = {
                playTags: {
                    _count: 'desc'
                }
            };
        } else if (sort === 'team') {
            orderBy = {
                team: {
                    name: order
                }
            };
        } else if (sort === 'position') {
            orderBy = {
                position: order
            };
        } else {
            // Default: sort by name
            orderBy = {
                name: order
            };
        }

        const players = await prisma.player.findMany({
            where,
            include: include === 'team' ? { 
                team: true,
                _count: {
                    select: {
                        playTags: true
                    }
                }
            } : {
                _count: {
                    select: {
                        playTags: true
                    }
                }
            },
            orderBy,
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const total = await prisma.player.count({ where });

        res.json({
            success: true,
            data: players,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch(error) {
        console.error('Error fetching players:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch players'
        });
    }
});

// GET /api/players/recently-active - Get players with recent activity
router.get('/recently-active', async (req, res) => {
    try {
        const { limit = 50, search = '' } = req.query;

        const where = {
            playTags: {
                some: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            }
        };

        // Add search functionality
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where.OR = [
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    name: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Get players who have been tagged recently
        const recentPlayers = await prisma.player.findMany({
            where,
            include: {
                team: true,
                _count: {
                    select: {
                        playTags: true
                    }
                }
            },
            orderBy: {
                playTags: {
                    _count: 'desc'
                }
            },
            take: parseInt(limit)
        });

        res.json({
            success: true,
            data: recentPlayers,
            count: recentPlayers.length
        });
    } catch(error) {
        console.error('Error fetching recently active players:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recently active players'
        });
    }
});

// GET /api/players/most-tagged - Get players with most tags
router.get('/most-tagged', async (req, res) => {
    try {
        const { limit = 50, timeframe = 'all', search = '' } = req.query; // timeframe: all, week, month

        let dateFilter = {};
        if (timeframe === 'week') {
            dateFilter = {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            };
        } else if (timeframe === 'month') {
            dateFilter = {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            };
        }

        const where = {
            playTags: {
                ...(Object.keys(dateFilter).length > 0 ? {
                    some: {
                        createdAt: dateFilter
                    }
                } : {
                    some: {} // Ensure player has at least one tag
                })
            }
        };

        // Add search functionality
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where.OR = [
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    name: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        const mostTaggedPlayers = await prisma.player.findMany({
            where,
            include: {
                team: true,
                _count: {
                    select: {
                        playTags: {
                            ...(Object.keys(dateFilter).length > 0 && {
                                where: {
                                    createdAt: dateFilter
                                }
                            })
                        }
                    }
                }
            },
            orderBy: {
                playTags: {
                    _count: 'desc'
                }
            },
            take: parseInt(limit)
        });

        res.json({
            success: true,
            data: mostTaggedPlayers,
            count: mostTaggedPlayers.length
        });
    } catch(error) {
        console.error('Error fetching most tagged players:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch most tagged players'
        });
    }
});

// GET /api/players/by-team/:teamId - Get players by team with activity stats
router.get('/by-team/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { limit = 50 } = req.query;

        const teamPlayers = await prisma.player.findMany({
            where: {
                teamId: teamId
            },
            include: {
                team: true,
                _count: {
                    select: {
                        playTags: true
                    }
                }
            },
            orderBy: {
                playTags: {
                    _count: 'desc'
                }
            },
            take: parseInt(limit)
        });

        res.json({
            success: true,
            data: teamPlayers,
            count: teamPlayers.length
        });
    } catch(error) {
        console.error('Error fetching team players:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team players'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {include} = req.query;

        const player = await prisma.player.findUnique({
            where: {id},
            include: include === 'team' ? { team: true } : undefined
        });

        if(!player) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }

        res.json({
            success: true,
            data: player
        });
    } catch(error) {
        console.error('Error fetching player:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player'
        });
    }
});

module.exports = router;