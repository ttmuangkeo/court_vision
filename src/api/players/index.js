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
            sort = 'name',
            order = 'asc',
            search = '',
            with_stats = false
        } = req.query;

        const skip = (page - 1) * limit;

        const where = {};
        
        // Handle team filtering
        if (team) {
            where.teamId = parseInt(team);
        }
        
        if (team_ids) {
            const teamIdArray = team_ids.split(',').map(id => parseInt(id.trim()));
            where.teamId = { in: teamIdArray };
        }
        
        if (position) {
            where.position = position;
        }
        
        // Handle search
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where.OR = [
                {
                    firstName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    firstName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Handle sorting
        let orderBy = {};
        if (sort === 'recent_activity') {
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
        } else if (sort === 'stats' && with_stats === 'true') {
            orderBy = {
                avgPoints: order === 'desc' ? 'desc' : 'asc'
            };
        } else {
            orderBy = {
                firstName: order,
                lastName: order
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

// GET /api/players/:id - Get player by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { include } = req.query;

        const player = await prisma.player.findUnique({
            where: { id: parseInt(id) },
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
            }
        });

        if (!player) {
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