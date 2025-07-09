const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Create a clean, working version of the players API
const cleanPlayersAPI = `const express = require('express');
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
            // Default: sort by firstName, then lastName
            orderBy = {
                firstName: order,
                lastName: order
            };
        }

        // Debug logging
        console.log('DEBUG /api/players where:', JSON.stringify(where, null, 2));
        console.log('DEBUG /api/players orderBy:', JSON.stringify(orderBy, null, 2));

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

module.exports = router;`;

// Write the clean version
fs.writeFileSync(playersApiFile, cleanPlayersAPI, 'utf8');

console.log('✅ Completely rewrote players API with clean, working code');
console.log('Changes made:');
console.log('- Removed all problematic nested OR clauses');
console.log('- Fixed team_ids parsing to convert strings to integers');
console.log('- Simplified search logic');
console.log('- Added proper error handling');
console.log('- Added debug logging'); 