const express = require('express');
const router = express.Router();
const prisma = require('../../db/client');
const authenticateJWT = require('../../middleware/auth');

// GET /api/plays - Get all plays (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { gameId, playerId, tagId, teamId, include, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (gameId) where.gameId = gameId;
    if (playerId) where.tags = { some: { playerId } };
    if (tagId) where.tags = { some: { tagId } };
    if (teamId) where.tags = { some: { teamId } };

    const plays = await prisma.play.findMany({
      where,
      include: include === 'full'
        ? {
            game: { include: { homeTeam: true, awayTeam: true } },
            tags: {
              include: {
                tag: true,
                player: true,
                team: true,
              },
            },
            ballHandler: true,
            primaryPlayer: true,
            secondaryPlayer: true,
          }
        : include === 'tags'
        ? {
            tags: {
              include: {
                tag: true,
                player: true,
                team: true,
              },
            },
          }
        : undefined,
      orderBy: { timestamp: 'asc' },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const total = await prisma.play.count({ where });

    res.json({
      success: true,
      data: plays,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching plays:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plays',
    });
  }
});

// GET /api/plays/:id - Get play by ID (with tags)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    const play = await prisma.play.findUnique({
      where: { id },
      include: include === 'full'
        ? {
            game: { include: { homeTeam: true, awayTeam: true } },
            tags: {
              include: {
                tag: true,
                player: true,
                team: true,
              },
            },
            ballHandler: true,
            primaryPlayer: true,
            secondaryPlayer: true,
          }
        : include === 'tags'
        ? {
            tags: {
              include: {
                tag: true,
                player: true,
                team: true,
              },
            },
          }
        : undefined,
    });

    if (!play) {
      return res.status(404).json({
        success: false,
        error: 'Play not found',
      });
    }

    res.json({
      success: true,
      data: play,
    });
  } catch (error) {
    console.error('Error fetching play:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch play',
    });
  }
});

// POST /api/plays - Create a new play (and tags)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const {
      gameId,
      timestamp,
      gameTime,
      quarter,
      timeInQuarter,
      description,
      possession,
      playType,
      ballLocation,
      ballHandlerId,
      primaryPlayerId,
      secondaryPlayerId,
      result,
      points,
      createdById,
      tags = [],
    } = req.body;

    // Use authenticated user's ID instead of provided createdById
    const userId = req.user.id;

    // Create the play
    const play = await prisma.play.create({
      data: {
        gameId,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        gameTime,
        quarter,
        timeInQuarter,
        description,
        possession,
        playType,
        ballLocation,
        ballHandlerId,
        primaryPlayerId,
        secondaryPlayerId,
        result,
        points,
        createdById: userId, // Use authenticated user's ID
        tags: {
          create: tags.map((tag) => ({
            tagId: tag.tagId,
            playerId: tag.playerId,
            teamId: tag.teamId,
            context: tag.context,
            confidence: tag.confidence ?? 1.0,
            createdById: userId, // Use authenticated user's ID
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
            player: true,
            team: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: play,
    });
  } catch (error) {
    console.error('Error creating play:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create play',
    });
  }
});

module.exports = router;
