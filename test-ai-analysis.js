const GameAnalysisAI = require('./src/services/ai/gameAnalysisAI');

async function testAIAnalysis() {
  try {
    console.log('Testing AI Game Analysis...');
    
    const aiAnalyzer = new GameAnalysisAI();
    
    // Mock box score data for testing
    const mockBoxScore = {
      Game: {
        GameID: 22154,
        DateTime: "2024-01-15T00:00:00",
        AwayTeamScore: 108,
        HomeTeamScore: 102
      },
      TeamGames: [
        {
          Team: "LAL",
          Points: 108,
          FieldGoalsPercentage: 45.2,
          ThreePointersPercentage: 38.5,
          FreeThrowsPercentage: 85.7,
          Rebounds: 42,
          OffensiveRebounds: 8,
          DefensiveRebounds: 34,
          Assists: 24,
          Steals: 7,
          BlockedShots: 4,
          Turnovers: 12,
          PersonalFouls: 18,
          PlusMinus: 6,
          Possessions: 95,
          EffectiveFieldGoalsPercentage: 52.1,
          TrueShootingPercentage: 58.3
        },
        {
          Team: "GSW",
          Points: 102,
          FieldGoalsPercentage: 42.1,
          ThreePointersPercentage: 35.2,
          FreeThrowsPercentage: 78.9,
          Rebounds: 38,
          OffensiveRebounds: 6,
          DefensiveRebounds: 32,
          Assists: 22,
          Steals: 8,
          BlockedShots: 3,
          Turnovers: 15,
          PersonalFouls: 20,
          PlusMinus: -6,
          Possessions: 92,
          EffectiveFieldGoalsPercentage: 48.7,
          TrueShootingPercentage: 54.2
        }
      ]
    };
    
    const analysis = await aiAnalyzer.generateAIAnalysis(mockBoxScore);
    
    console.log('AI Analysis Result:');
    console.log(JSON.stringify(analysis, null, 2));
    
  } catch (error) {
    console.error('Error testing AI analysis:', error);
  }
}

testAIAnalysis(); 