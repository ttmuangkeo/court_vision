const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');
const { syncAllData } = require('../../services/nba/syncService');

router.get('/', async (req, res) => {
    try {
        const {include} = req.query;;

        const teams = await prisma.team.findMany({
            include: include === 'players' ? {
                players: true
            }
            : undefined,
            orderBy: {
                name: 'asc'
            }
        })
        res.json({
            success: true,
            data: teams,
            count: teams.length
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({
            success: false,
            message: 'failed to fetch teams'
        });
    }
});

router.get('/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const {include} = req.query;

        const team = await prisma.team.findUnique({
            where: {id},
            include: include === 'players' ? { players: true } : undefined
        });

        if(!teams) {
            return res.status(404).json({
                success: false,
                error: 'Team not found'
            });
        }

        res.json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team'
        });
    }
});

// Sync endpoint to populate data from BallDontLie API
router.post('/sync', async (req, res) => {
    try {
        const { season = '2023-24' } = req.body;
        
        console.log(`🔄 Starting sync for season ${season}...`);
        
        // Start the sync process
        await syncAllData(season);
        
        res.json({
            success: true,
            message: `Successfully synced data for season ${season}`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error during sync:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync data from BallDontLie API',
            details: error.message
        });
    }
});

module.exports = router;