
// Pattern Recognition API Endpoints (Phase 1B)
const express = require('express');
const router = express.Router();
const patternRecognition = require('../../services/tagging/patternRecognition');

// GET /api/patterns - Get all common patterns
router.get('/', async (req, res) => {
  try {
    const patterns = require('../../data/patterns/common-patterns.json');
    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patterns'
    });
  }
});

// POST /api/patterns/analyze - Analyze play sequence
router.post('/analyze', async (req, res) => {
  try {
    const { playTags } = req.body;
    const patterns = patternRecognition.analyzeSequence(playTags);
    
    res.json({
      success: true,
      data: {
        patterns,
        count: patterns.length
      }
    });
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze patterns'
    });
  }
});

// POST /api/patterns/predict - Predict next action
router.post('/predict', async (req, res) => {
  try {
    const { currentSequence } = req.body;
    const prediction = patternRecognition.predictNextAction(currentSequence);
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Error predicting next action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to predict next action'
    });
  }
});

// GET /api/patterns/team-tendencies/:teamId - Get team tendencies
router.get('/team-tendencies/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit = 50 } = req.query;

    // Get recent plays for the team
    const recentPlays = await prisma.play.findMany({
      where: {
        OR: [
          { offensiveTeamId: teamId },
          { defensiveTeamId: teamId }
        ]
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    const tendencies = patternRecognition.getTeamTendencies(teamId, recentPlays);
    
    res.json({
      success: true,
      data: tendencies
    });
  } catch (error) {
    console.error('Error getting team tendencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team tendencies'
    });
  }
});

module.exports = router;
