const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');
const TeamAnalytics = require('../../services/analytics/teamAnalytics');

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

// GET /api/teams/sleepers - Get sleeper teams
router.get('/sleepers', async (req, res) => {
    try {
        const analytics = new TeamAnalytics();
        
        // Get all teams stats for analysis
        const allTeamStats = await analytics.getAllTeamsStats();
        const leagueAverages = analytics.calculateLeagueAverages(allTeamStats);
        
        // Get sleeper teams
        const sleepers = await analytics.getSleeperTeams(allTeamStats, leagueAverages);
        
        res.json({
            success: true,
            data: sleepers
        });
    } catch (error) {
        console.error('Error fetching sleeper teams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sleeper teams'
        });
    }
});

// GET /api/teams/:id - Get team by ID
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {include} = req.query;

        const team = await prisma.team.findUnique({
            where: {espnId: id},
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

// GET /api/teams/:id/statistics - Get team statistics by team ID
router.get('/:id/statistics', async (req, res) => {
    try {
        const { id } = req.params;
        const { season = '2024-25', seasonType = 'regular' } = req.query;

        const stats = await prisma.teamStatistics.findMany({
            where: {
                teamId: id,
                season,
                seasonType
            },
            orderBy: [
                { category: 'asc' },
                { displayName: 'asc' }
            ]
        });

        // Group by category
        const groupedStats = stats.reduce((acc, stat) => {
            if (!acc[stat.category]) {
                acc[stat.category] = [];
            }
            acc[stat.category].push(stat);
            return acc;
        }, {});

        res.json({
            success: true,
            data: groupedStats
        });
    } catch (error) {
        console.error('Error fetching team statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team statistics'
        });
    }
});

// GET /api/teams/:id/analytics - Get team analytics and insights
router.get('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const analytics = new TeamAnalytics();
        
        // Get all teams stats for comparison
        const allTeamStats = await analytics.getAllTeamsStats();
        const leagueAverages = analytics.calculateLeagueAverages(allTeamStats);
        
        // Analyze the specific team
        const teamAnalysis = analytics.analyzeTeamPerformance(id, allTeamStats, leagueAverages);
        
        if (!teamAnalysis) {
            return res.status(404).json({
                success: false,
                error: 'Team analysis not found'
            });
        }

        // Get team trends
        const trends = await analytics.getTeamTrends(id);

        res.json({
            success: true,
            data: {
                analysis: teamAnalysis,
                trends: trends
            }
        });
    } catch (error) {
        console.error('Error fetching team analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team analytics'
        });
    }
});

// GET /api/teams/:id/compare/:rivalId - Compare two teams
router.get('/:id/compare/:rivalId', async (req, res) => {
    try {
        const { id, rivalId } = req.params;
        const analytics = new TeamAnalytics();
        
        // Get all teams stats for comparison
        const allTeamStats = await analytics.getAllTeamsStats();
        const leagueAverages = analytics.calculateLeagueAverages(allTeamStats);
        
        // Compare the teams
        const comparison = analytics.compareTeams(id, rivalId, allTeamStats, leagueAverages);
        
        if (!comparison) {
            return res.status(404).json({
                success: false,
                error: 'Team comparison not found'
            });
        }

        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        console.error('Error comparing teams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compare teams'
        });
    }
});

// GET /api/teams/:id/rivals - Get conference rivals for comparison
router.get('/:id/rivals', async (req, res) => {
    try {
        const { id } = req.params;
        const analytics = new TeamAnalytics();
        
        const rivals = await analytics.getConferenceRivals(id);
        
        res.json({
            success: true,
            data: rivals
        });
    } catch (error) {
        console.error('Error fetching rivals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rivals'
        });
    }
});

module.exports = router;