const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧠 Implementing basic pattern recognition for Phase 1B...');

  // Common basketball play patterns
  const commonPatterns = [
    {
      name: 'Pick and Roll Sequence',
      description: 'Screen set, ball handler uses screen, screener rolls',
      sequence: ['Screen', 'Pick and Roll', 'Pass to Roller'],
      category: 'OFFENSIVE_ACTION',
      frequency: 'HIGH',
      successRate: 0.65
    },
    {
      name: 'Isolation to Double Team',
      description: 'Star player isolated, defense sends double team',
      sequence: ['Isolation', 'Double Team', 'Pass to Open Player'],
      category: 'OFFENSIVE_ACTION',
      frequency: 'HIGH',
      successRate: 0.55
    },
    {
      name: 'Transition Fast Break',
      description: 'Defensive rebound leads to fast break',
      sequence: ['Rebound', 'Transition Offense', 'Layup'],
      category: 'TRANSITION',
      frequency: 'MEDIUM',
      successRate: 0.70
    },
    {
      name: 'Post Up to Kick Out',
      description: 'Post player gets ball, kicks out to shooter',
      sequence: ['Post Up', 'Double Team', 'Pass Out'],
      category: 'OFFENSIVE_ACTION',
      frequency: 'MEDIUM',
      successRate: 0.60
    },
    {
      name: 'Zone Defense Response',
      description: 'Team faces zone defense, finds open shooter',
      sequence: ['Zone Defense 2-3', 'Perimeter Shot', 'Three Point Shot'],
      category: 'DEFENSIVE_ACTION',
      frequency: 'MEDIUM',
      successRate: 0.45
    },
    {
      name: 'End of Game Foul Strategy',
      description: 'Team down late, fouls to extend game',
      sequence: ['End-of-Game Scenario', 'Strategic Foul', 'Free Throw'],
      category: 'SPECIAL_SITUATION',
      frequency: 'LOW',
      successRate: 0.30
    }
  ];

  // Create pattern recognition data structure
  const patternData = {
    patterns: commonPatterns,
    metadata: {
      totalPatterns: commonPatterns.length,
      categories: ['OFFENSIVE_ACTION', 'DEFENSIVE_ACTION', 'TRANSITION', 'SPECIAL_SITUATION'],
      lastUpdated: new Date().toISOString()
    }
  };

  // Store patterns in a JSON file for now (we'll enhance this in Phase 1C)
  const fs = require('fs');
  const path = require('path');
  
  const patternsDir = path.join(__dirname, '..', 'data', 'patterns');
  if (!fs.existsSync(patternsDir)) {
    fs.mkdirSync(patternsDir, { recursive: true });
  }

  const patternsFile = path.join(patternsDir, 'common-patterns.json');
  fs.writeFileSync(patternsFile, JSON.stringify(patternData, null, 2));

  console.log(`✅ Created ${commonPatterns.length} common patterns`);
  console.log(`📁 Patterns saved to: ${patternsFile}`);

  // Create pattern recognition functions
  const patternRecognitionCode = `
// Pattern Recognition Functions (Phase 1B)
const patternRecognition = {
  // Analyze play sequence for common patterns
  analyzeSequence: (playTags) => {
    const sequence = playTags.map(pt => pt.tag.name);
    const patterns = require('./data/patterns/common-patterns.json');
    
    return patterns.patterns.filter(pattern => {
      return pattern.sequence.every((step, index) => 
        sequence[index] === step
      );
    });
  },

  // Predict next likely action based on current sequence
  predictNextAction: (currentSequence) => {
    const patterns = require('./data/patterns/common-patterns.json');
    
    const matchingPatterns = patterns.patterns.filter(pattern => {
      return pattern.sequence.slice(0, currentSequence.length).every((step, index) => 
        currentSequence[index] === step
      );
    });

    if (matchingPatterns.length === 0) return null;

    // Return the most likely next action
    const nextActions = matchingPatterns.map(pattern => ({
      action: pattern.sequence[currentSequence.length],
      confidence: pattern.successRate,
      pattern: pattern.name
    }));

    return nextActions.sort((a, b) => b.confidence - a.confidence)[0];
  },

  // Get team tendencies based on recent plays
  getTeamTendencies: (teamId, recentPlays) => {
    const tendencies = {
      offensivePatterns: {},
      defensiveSchemes: {},
      playerUsage: {},
      successRates: {}
    };

    recentPlays.forEach(play => {
      play.tags.forEach(tag => {
        if (tag.teamId === teamId) {
          // Track offensive patterns
          if (tag.tag.category === 'OFFENSIVE_ACTION') {
            tendencies.offensivePatterns[tag.tag.name] = 
              (tendencies.offensivePatterns[tag.tag.name] || 0) + 1;
          }
          
          // Track defensive schemes
          if (tag.tag.category === 'DEFENSIVE_ACTION') {
            tendencies.defensiveSchemes[tag.tag.name] = 
              (tendencies.defensiveSchemes[tag.tag.name] || 0) + 1;
          }
        }
      });
    });

    return tendencies;
  }
};

module.exports = patternRecognition;
`;

  const patternRecognitionFile = path.join(__dirname, '..', 'services', 'tagging', 'patternRecognition.js');
  fs.writeFileSync(patternRecognitionFile, patternRecognitionCode);

  console.log(`✅ Created pattern recognition service`);
  console.log(`📁 Service saved to: ${patternRecognitionFile}`);

  // Create API endpoint for pattern recognition
  const apiEndpointCode = `
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
`;

  const patternsApiFile = path.join(__dirname, '..', 'api', 'patterns', 'index.js');
  const patternsApiDir = path.dirname(patternsApiFile);
  if (!fs.existsSync(patternsApiDir)) {
    fs.mkdirSync(patternsApiDir, { recursive: true });
  }
  fs.writeFileSync(patternsApiFile, apiEndpointCode);

  console.log(`✅ Created patterns API endpoints`);
  console.log(`📁 API saved to: ${patternsApiFile}`);

  console.log(`\n🎉 Phase 1B Pattern Recognition Complete!`);
  console.log(`📊 Created ${commonPatterns.length} common patterns`);
  console.log(`🧠 Implemented pattern recognition service`);
  console.log(`🔗 Created API endpoints for pattern analysis`);
  console.log(`📈 Added team tendency tracking`);
}

main()
  .catch((e) => {
    console.error('❌ Error implementing pattern recognition:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 