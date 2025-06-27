// Pattern Recognition Functions (Phase 1B)
const patternRecognition = {
  // Analyze play sequence for common patterns
  analyzeSequence: (playTags) => {
    const sequence = playTags.map(pt => pt.tag.name);
    const patterns = require('../../data/patterns/common-patterns.json');
    
    return patterns.patterns.filter(pattern => {
      return pattern.sequence.every((step, index) => 
        sequence[index] === step
      );
    });
  },

  // Predict next likely action based on current sequence
  predictNextAction: (currentSequence) => {
    const patterns = require('../../data/patterns/common-patterns.json');
    
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
