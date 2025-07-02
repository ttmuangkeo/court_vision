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
            sort = 'name', // name, team, position, recent_activity, stats
            order = 'asc',
            search = '', // Add search parameter
            with_stats = false // Include player stats
        } = req.query;

        const skip = (page - 1) * limit;

        const where = {};
        if(team) where.teamEspnId = team;
        if(team_ids) {
            const teamIdArray = team_ids.split(',');
            where.teamEspnId = { in: teamIdArray };
        }
        if(position) where.position = position;
        
        // Add search functionality
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where.OR = [
                {
                    fullName: {
                        contains: searchTerm,
                        mode: 'insensitive' // Case-insensitive search
                    }
                },
                {
                    fullName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                },
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
        } else if (sort === 'stats' && with_stats === 'true') {
            // Sort by points per game
            orderBy = {
                avgPoints: order === 'desc' ? 'desc' : 'asc'
            };
        } else {
            // Default: sort by fullName
            orderBy = {
                fullName: order
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
                    fullName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    fullName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                },
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
                    fullName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    fullName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                },
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
                teamEspnId: teamId
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
            where: {espnId: id},
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

// GET /api/players/stats/sync - Sync recent player stats
router.get('/stats/sync', async (req, res) => {
    try {
        const PlayerStatsSyncService = require('../../services/espn/playerStatsSyncService');
        const statsService = new PlayerStatsSyncService();
        
        console.log('API: Starting player stats sync...');
        
        const result = await statsService.syncRecentGamesFromScoreboard();
        
        res.json({
            success: true,
            message: 'Player stats sync completed',
            data: {
                gamesProcessed: result.gamesProcessed,
                totalSynced: result.totalSynced,
                totalErrors: result.totalErrors
            }
        });
    } catch(error) {
        console.error('API: Error syncing player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync player stats'
        });
    }
});

// GET /api/players/stats/game/:gameId - Get player stats for a specific game
router.get('/stats/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const stats = await prisma.playerGameStat.findMany({
            where: {
                gameId: gameId
            },
            include: {
                player: {
                    select: {
                        fullName: true,
                        position: true,
                        team: {
                            select: {
                                name: true,
                                abbreviation: true
                            }
                        }
                    }
                },
                game: {
                    select: {
                        date: true,
                        homeTeam: true,
                        awayTeam: true,
                        homeScore: true,
                        awayScore: true
                    }
                }
            },
            orderBy: [
                { points: 'desc' },
                { rebounds: 'desc' },
                { assists: 'desc' }
            ]
        });
        
        res.json({
            success: true,
            data: stats,
            count: stats.length
        });
    } catch(error) {
        console.error('Error fetching game player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game player stats'
        });
    }
});

// GET /api/players/stats/player/:playerId - Get stats for a specific player
router.get('/stats/player/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { limit = 10 } = req.query;
        
        const stats = await prisma.playerGameStat.findMany({
            where: {
                playerId: playerId
            },
            include: {
                game: {
                    select: {
                        date: true,
                        homeTeam: true,
                        awayTeam: true,
                        homeScore: true,
                        awayScore: true
                    }
                },
                player: {
                    select: {
                        fullName: true,
                        position: true,
                        team: {
                            select: {
                                name: true,
                                abbreviation: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                game: {
                    date: 'desc'
                }
            },
            take: parseInt(limit)
        });
        
        // Calculate averages
        const averages = stats.reduce((acc, stat) => {
            acc.points += stat.points || 0;
            acc.rebounds += stat.rebounds || 0;
            acc.assists += stat.assists || 0;
            acc.steals += stat.steals || 0;
            acc.blocks += stat.blocks || 0;
            acc.turnovers += stat.turnovers || 0;
            acc.fouls += stat.fouls || 0;
            acc.threesMade += stat.threesMade || 0;
            acc.threesAtt += stat.threesAtt || 0;
            acc.fieldGoalsMade += stat.fieldGoalsMade || 0;
            acc.fieldGoalsAtt += stat.fieldGoalsAtt || 0;
            acc.freeThrowsMade += stat.freeThrowsMade || 0;
            acc.freeThrowsAtt += stat.freeThrowsAtt || 0;
            acc.plusMinus += stat.plusMinus || 0;
            acc.minutes += stat.minutes || 0;
            return acc;
        }, {
            points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
            turnovers: 0, fouls: 0, threesMade: 0, threesAtt: 0,
            fieldGoalsMade: 0, fieldGoalsAtt: 0, freeThrowsMade: 0,
            freeThrowsAtt: 0, plusMinus: 0, minutes: 0
        });
        
        const gameCount = stats.length;
        if (gameCount > 0) {
            Object.keys(averages).forEach(key => {
                averages[key] = Math.round((averages[key] / gameCount) * 10) / 10;
            });
        }
        
        res.json({
            success: true,
            data: {
                stats: stats,
                averages: averages,
                gameCount: gameCount
            },
            count: stats.length
        });
    } catch(error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player stats'
        });
    }
});

// GET /api/players/stats/team/:teamId - Get stats for all players on a team
router.get('/stats/team/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const { limit = 50 } = req.query;
        
        const stats = await prisma.playerGameStat.findMany({
            where: {
                teamId: teamId
            },
            include: {
                player: {
                    select: {
                        fullName: true,
                        position: true
                    }
                },
                game: {
                    select: {
                        date: true,
                        homeTeam: true,
                        awayTeam: true
                    }
                }
            },
            orderBy: [
                { game: { date: 'desc' } },
                { points: 'desc' }
            ],
            take: parseInt(limit)
        });
        
        // Group by player and calculate totals/averages
        const playerStats = {};
        stats.forEach(stat => {
            const playerId = stat.playerId;
            if (!playerStats[playerId]) {
                playerStats[playerId] = {
                    player: stat.player,
                    games: 0,
                    totals: {
                        points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
                        turnovers: 0, fouls: 0, threesMade: 0, threesAtt: 0,
                        fieldGoalsMade: 0, fieldGoalsAtt: 0, freeThrowsMade: 0,
                        freeThrowsAtt: 0, plusMinus: 0, minutes: 0
                    },
                    averages: {},
                    recentGames: []
                };
            }
            
            playerStats[playerId].games++;
            playerStats[playerId].totals.points += stat.points || 0;
            playerStats[playerId].totals.rebounds += stat.rebounds || 0;
            playerStats[playerId].totals.assists += stat.assists || 0;
            playerStats[playerId].totals.steals += stat.steals || 0;
            playerStats[playerId].totals.blocks += stat.blocks || 0;
            playerStats[playerId].totals.turnovers += stat.turnovers || 0;
            playerStats[playerId].totals.fouls += stat.fouls || 0;
            playerStats[playerId].totals.threesMade += stat.threesMade || 0;
            playerStats[playerId].totals.threesAtt += stat.threesAtt || 0;
            playerStats[playerId].totals.fieldGoalsMade += stat.fieldGoalsMade || 0;
            playerStats[playerId].totals.fieldGoalsAtt += stat.fieldGoalsAtt || 0;
            playerStats[playerId].totals.freeThrowsMade += stat.freeThrowsMade || 0;
            playerStats[playerId].totals.freeThrowsAtt += stat.freeThrowsAtt || 0;
            playerStats[playerId].totals.plusMinus += stat.plusMinus || 0;
            playerStats[playerId].totals.minutes += stat.minutes || 0;
            
            // Keep track of recent games
            if (playerStats[playerId].recentGames.length < 5) {
                playerStats[playerId].recentGames.push({
                    date: stat.game.date,
                    opponent: stat.game.homeTeam === stat.game.awayTeam ? stat.game.awayTeam : stat.game.homeTeam,
                    points: stat.points,
                    rebounds: stat.rebounds,
                    assists: stat.assists
                });
            }
        });
        
        // Calculate averages for each player
        Object.values(playerStats).forEach(player => {
            player.averages = {};
            Object.keys(player.totals).forEach(key => {
                player.averages[key] = Math.round((player.totals[key] / player.games) * 10) / 10;
            });
        });
        
        const playerStatsArray = Object.values(playerStats).sort((a, b) => 
            b.averages.points - a.averages.points
        );
        
        res.json({
            success: true,
            data: playerStatsArray,
            count: playerStatsArray.length
        });
    } catch(error) {
        console.error('Error fetching team player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team player stats'
        });
    }
});

// GET /api/players/search?query=lebron
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }
    const players = await prisma.player.findMany({
      where: {
        fullName: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: 10, // limit results for performance
      orderBy: { fullName: 'asc' }
    });
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ success: false, error: 'Failed to search players' });
  }
});

// GET /api/players/with-stats - Get players with their season stats
router.get('/with-stats', async (req, res) => {
    try {
        const {
            team, 
            team_ids, 
            position,
            limit = 50,
            page = 1,
            sort = 'avgPoints', // avgPoints, avgRebounds, avgAssists, name, team
            order = 'desc',
            search = '',
            min_games = 0 // Minimum games played filter
        } = req.query;

        const skip = (page - 1) * limit;

        const where = {
            hasStatistics: true // Only players with stats
        };
        
        if(team) where.teamEspnId = team;
        if(team_ids) {
            const teamIdArray = team_ids.split(',');
            where.teamEspnId = { in: teamIdArray };
        }
        if(position) where.position = position;
        if(min_games > 0) where.gamesPlayed = { gte: parseInt(min_games) };
        
        // Add search functionality
        if (search && search.trim()) {
            const searchTerm = search.trim();
            where.OR = [
                {
                    fullName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    fullName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                },
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

        // Handle different sorting options
        let orderBy = {};
        if (sort === 'avgPoints') {
            orderBy = { avgPoints: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'avgRebounds') {
            orderBy = { avgRebounds: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'avgAssists') {
            orderBy = { avgAssists: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'avgSteals') {
            orderBy = { avgSteals: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'avgBlocks') {
            orderBy = { avgBlocks: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'fieldGoalPct') {
            orderBy = { fieldGoalPct: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'threePointPct') {
            orderBy = { threePointPct: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'freeThrowPct') {
            orderBy = { freeThrowPct: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'minutesPerGame') {
            orderBy = { minutesPerGame: order === 'desc' ? 'desc' : 'asc' };
        } else if (sort === 'team') {
            orderBy = {
                team: {
                    name: order
                }
            };
        } else {
            // Default: sort by fullName
            orderBy = { fullName: order };
        }

        const players = await prisma.player.findMany({
            where,
            include: {
                team: true,
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
        console.error('Error fetching players with stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch players with stats'
        });
    }
});

module.exports = router;