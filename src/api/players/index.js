const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');

router.get('/', async (req, res) => {
    try {
        const {include, team, team_ids, position } = req.query;

        const where = {};
        if(team) where.teamId = team;
        if(team_ids) {
            const teamIdArray = team_ids.split(',');
            where.teamId = { in: teamIdArray };
        }
        if(position) where.position = position;

        const players = await prisma.player.findMany({
            where,
            include: include === 'team'? { team: true } : undefined,
            orderBy: {
                name: 'asc' 
            }
        });

        res.json({
            success: true,
            data: players,
            count: players.length
        });
    } catch(error) {
        console.error('Error fetching players:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch players'
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