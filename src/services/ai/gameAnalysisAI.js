const axios = require('axios');

class GameAnalysisAI {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.lastApiCall = null; // Track last API call for rate limiting
    this.analysisCache = new Map(); // Cache for analysis results
    this.gameCooldowns = new Map(); // Track cooldowns per game
  }

  async generateAIAnalysis(boxScoreData) {
    try {
      const game = boxScoreData.Game;
      const teamGames = boxScoreData.TeamGames;
      const [awayTeam, homeTeam] = teamGames;

      // Check cache first
      const cacheKey = `game_${game.GameID}`;
      if (this.analysisCache.has(cacheKey)) {
        console.log(`Using cached analysis for game ${game.GameID}`);
        return this.analysisCache.get(cacheKey);
      }

      // Check if this specific game is in cooldown
      const now = Date.now();
      const gameCooldown = this.gameCooldowns.get(game.GameID);
      if (gameCooldown && now < gameCooldown) {
        console.log(`Game ${game.GameID} in cooldown, using fallback analysis`);
        const fallbackAnalysis = this.generateFallbackAnalysis(this.prepareAnalysisData(boxScoreData));
        this.analysisCache.set(cacheKey, fallbackAnalysis);
        return fallbackAnalysis;
      }

      // Prepare data for AI analysis
      const analysisData = this.prepareAnalysisData(boxScoreData);
      const prompt = this.createAnalysisPrompt(analysisData);
      
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
        console.log('OpenAI API key not configured, using fallback analysis');
        const fallbackAnalysis = this.generateFallbackAnalysis(analysisData);
        this.analysisCache.set(cacheKey, fallbackAnalysis);
        return fallbackAnalysis;
      }

      // Global rate limiting - only make API calls every 30 seconds
      if (this.lastApiCall && (now - this.lastApiCall) < 30000) {
        console.log('Global rate limiting: Using fallback analysis to avoid API rate limits');
        const fallbackAnalysis = this.generateFallbackAnalysis(analysisData);
        this.analysisCache.set(cacheKey, fallbackAnalysis);
        return fallbackAnalysis;
      }

      // Make direct HTTP request to OpenAI API
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: "gpt-3.5-turbo", // Use 3.5-turbo instead of gpt-4
          messages: [
            {
              role: "system",
              content: "You are an expert NBA analyst with deep knowledge of basketball strategy, statistics, and game analysis. Provide insightful, data-driven analysis of NBA games."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500 // Reduced to save tokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update last API call time
      this.lastApiCall = now;
      const aiAnalysis = response.data.choices[0].message.content;
      
      // Parse the AI response and structure it
      const structuredAnalysis = this.structureAIAnalysis(aiAnalysis, analysisData);
      
      // Cache the result
      this.analysisCache.set(cacheKey, structuredAnalysis);
      
      return structuredAnalysis;
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      
      // Handle different types of API errors
      if (error.response) {
        const status = error.response.status;
        console.log(`OpenAI API error (${status}), using fallback analysis`);
        
        // For rate limits (429), set a longer cooldown for this specific game
        if (status === 429) {
          const cooldownUntil = Date.now() + 300000; // 5 minute cooldown
          this.gameCooldowns.set(game.GameID, cooldownUntil);
          console.log(`Rate limit hit for game ${game.GameID}, setting 5-minute cooldown`);
        }
        
        // Use fallback for any API error (401, 404, 429, etc.)
        const analysisData = this.prepareAnalysisData(boxScoreData);
        const fallbackAnalysis = this.generateFallbackAnalysis(analysisData);
        
        // Cache the fallback result
        const cacheKey = `game_${game.GameID}`;
        this.analysisCache.set(cacheKey, fallbackAnalysis);
        
        return fallbackAnalysis;
      }
      
      throw error;
    }
  }

  createAnalysisPrompt(analysisData) {
    return `
Please analyze this NBA game data and provide a comprehensive analysis in the following JSON format:

Game Data:
- Away Team: ${analysisData.gameInfo.awayTeam} (${analysisData.gameInfo.awayScore} points)
- Home Team: ${analysisData.gameInfo.homeTeam} (${analysisData.gameInfo.homeScore} points)
- Winner: ${analysisData.gameInfo.winner}
- Margin: ${analysisData.gameInfo.margin} points

Away Team Stats:
- Field Goal %: ${analysisData.awayTeamStats.fieldGoalPercentage}%
- 3-Point %: ${analysisData.awayTeamStats.threePointPercentage}%
- Free Throw %: ${analysisData.awayTeamStats.freeThrowPercentage}%
- Rebounds: ${analysisData.awayTeamStats.rebounds} (${analysisData.awayTeamStats.offensiveRebounds} offensive, ${analysisData.awayTeamStats.defensiveRebounds} defensive)
- Assists: ${analysisData.awayTeamStats.assists}
- Steals: ${analysisData.awayTeamStats.steals}
- Blocks: ${analysisData.awayTeamStats.blocks}
- Turnovers: ${analysisData.awayTeamStats.turnovers}
- Plus/Minus: ${analysisData.awayTeamStats.plusMinus}
- Effective FG %: ${analysisData.awayTeamStats.effectiveFieldGoalPercentage}%
- True Shooting %: ${analysisData.awayTeamStats.trueShootingPercentage}%

Home Team Stats:
- Field Goal %: ${analysisData.homeTeamStats.fieldGoalPercentage}%
- 3-Point %: ${analysisData.homeTeamStats.threePointPercentage}%
- Free Throw %: ${analysisData.homeTeamStats.freeThrowPercentage}%
- Rebounds: ${analysisData.homeTeamStats.rebounds} (${analysisData.homeTeamStats.offensiveRebounds} offensive, ${analysisData.homeTeamStats.defensiveRebounds} defensive)
- Assists: ${analysisData.homeTeamStats.assists}
- Steals: ${analysisData.homeTeamStats.steals}
- Blocks: ${analysisData.homeTeamStats.blocks}
- Turnovers: ${analysisData.homeTeamStats.turnovers}
- Plus/Minus: ${analysisData.homeTeamStats.plusMinus}
- Effective FG %: ${analysisData.homeTeamStats.effectiveFieldGoalPercentage}%
- True Shooting %: ${analysisData.homeTeamStats.trueShootingPercentage}%

Please provide your analysis in this exact JSON format:

{
  "summary": "Brief 2-3 sentence summary of the game outcome and key factors",
  "keyInsights": [
    "Insight 1 about what determined the outcome",
    "Insight 2 about team performance",
    "Insight 3 about strategic elements"
  ],
  "teamAnalysis": {
    "away": {
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "performance": "Detailed analysis of away team performance"
    },
    "home": {
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "performance": "Detailed analysis of home team performance"
    }
  },
  "matchupAnalysis": {
    "advantages": {
      "away": ["Advantage 1", "Advantage 2"],
      "home": ["Advantage 1", "Advantage 2"]
    },
    "keyFactors": ["Factor 1 that determined the outcome", "Factor 2", "Factor 3"]
  },
  "strategicInsights": {
    "offensiveStrategy": "Analysis of offensive strategies used",
    "defensiveStrategy": "Analysis of defensive strategies used",
    "adjustments": "Key adjustments that could have been made"
  },
  "gamePlan": {
    "forWinner": "Strategic advice for the winning team going forward",
    "forLoser": "Strategic advice for the losing team going forward",
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
  }
}

Focus on providing actionable insights, statistical analysis, and strategic observations. Be specific about what worked, what didn't, and why the game turned out the way it did.
`;
  }

  structureAIAnalysis(aiResponse, analysisData) {
    try {
      // Try to parse the AI response as JSON
      const parsedAnalysis = JSON.parse(aiResponse);
      
      return {
        gameInfo: analysisData.gameInfo,
        teamAnalysis: {
          away: {
            ...analysisData.awayTeamStats,
            aiInsights: parsedAnalysis.teamAnalysis.away
          },
          home: {
            ...analysisData.homeTeamStats,
            aiInsights: parsedAnalysis.teamAnalysis.home
          }
        },
        aiAnalysis: {
          summary: parsedAnalysis.summary,
          keyInsights: parsedAnalysis.keyInsights,
          matchupAnalysis: parsedAnalysis.matchupAnalysis,
          strategicInsights: parsedAnalysis.strategicInsights,
          gamePlan: parsedAnalysis.gamePlan
        },
        rawStats: {
          away: analysisData.awayTeamStats,
          home: analysisData.homeTeamStats
        }
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback to structured analysis if JSON parsing fails
      return {
        gameInfo: analysisData.gameInfo,
        teamAnalysis: {
          away: analysisData.awayTeamStats,
          home: analysisData.homeTeamStats
        },
        aiAnalysis: {
          summary: aiResponse,
          keyInsights: ["AI analysis generated but formatting needs improvement"],
          matchupAnalysis: {
            advantages: { away: [], home: [] },
            keyFactors: []
          },
          strategicInsights: {
            offensiveStrategy: "Analysis available in summary",
            defensiveStrategy: "Analysis available in summary",
            adjustments: "Analysis available in summary"
          },
          gamePlan: {
            forWinner: "See summary for insights",
            forLoser: "See summary for insights",
            keyTakeaways: []
          }
        },
        rawStats: {
          away: analysisData.awayTeamStats,
          home: analysisData.homeTeamStats
        }
      };
    }
  }

  generateFallbackAnalysis(analysisData) {
    // Generate a simple analysis without AI
    const awayTeam = analysisData.awayTeamStats;
    const homeTeam = analysisData.homeTeamStats;
    
    return {
      gameInfo: analysisData.gameInfo,
      teamAnalysis: {
        away: {
          ...analysisData.awayTeamStats,
          aiInsights: {
            strengths: [
              `Strong shooting with ${awayTeam.FieldGoalsPercentage}% field goal percentage`,
              `Good ball movement with ${awayTeam.Assists} assists`
            ],
            weaknesses: [
              `Turnover issues with ${awayTeam.Turnovers} turnovers`,
              `Defensive rebounding could improve`
            ],
            performance: `The away team showed solid offensive efficiency but needs to reduce turnovers.`
          }
        },
        home: {
          ...analysisData.homeTeamStats,
          aiInsights: {
            strengths: [
              `Effective shooting with ${homeTeam.FieldGoalsPercentage}% field goal percentage`,
              `Strong defensive presence with ${homeTeam.BlockedShots} blocks`
            ],
            weaknesses: [
              `Limited assists with ${homeTeam.Assists} assists`,
              `Rebounding could be improved`
            ],
            performance: `The home team played well defensively but could improve ball movement.`
          }
        }
      },
      aiAnalysis: {
        summary: `${analysisData.gameInfo.winner} won by ${analysisData.gameInfo.margin} points in a competitive matchup.`,
        keyInsights: [
          "Shooting efficiency was a key factor in the outcome",
          "Turnover differential played a significant role",
          "Rebounding and ball movement were crucial"
        ],
        matchupAnalysis: {
          advantages: {
            away: ["Better shooting percentage", "More assists"],
            home: ["Stronger defense", "Better shot blocking"]
          },
          keyFactors: ["Field goal percentage", "Turnover differential", "Assist-to-turnover ratio"]
        },
        strategicInsights: {
          offensiveStrategy: "Both teams focused on efficient shooting and ball movement",
          defensiveStrategy: "Defensive intensity and shot blocking were key",
          adjustments: "Reducing turnovers and improving rebounding would benefit both teams"
        },
        gamePlan: {
          forWinner: "Continue the efficient shooting while improving ball security",
          forLoser: "Focus on reducing turnovers and improving defensive rebounding",
          keyTakeaways: ["Shooting efficiency wins games", "Ball security is crucial", "Defense creates opportunities"]
        }
      },
      rawStats: {
        away: analysisData.awayTeamStats,
        home: analysisData.homeTeamStats
      }
    };
  }

  prepareAnalysisData(boxScoreData) {
    const game = boxScoreData.Game;
    const teamGames = boxScoreData.TeamGames;
    const [awayTeam, homeTeam] = teamGames;

    return {
      gameInfo: {
        gameId: game.GameID,
        date: game.DateTime,
        awayTeam: awayTeam.Team,
        homeTeam: homeTeam.Team,
        awayScore: game.AwayTeamScore,
        homeScore: game.HomeTeamScore,
        winner: game.AwayTeamScore > game.HomeTeamScore ? awayTeam.Team : homeTeam.Team,
        margin: Math.abs(game.AwayTeamScore - game.HomeTeamScore)
      },
      awayTeamStats: {
        points: awayTeam.Points,
        fieldGoalPercentage: awayTeam.FieldGoalsPercentage,
        threePointPercentage: awayTeam.ThreePointersPercentage,
        freeThrowPercentage: awayTeam.FreeThrowsPercentage,
        rebounds: awayTeam.Rebounds,
        offensiveRebounds: awayTeam.OffensiveRebounds,
        defensiveRebounds: awayTeam.DefensiveRebounds,
        assists: awayTeam.Assists,
        steals: awayTeam.Steals,
        blocks: awayTeam.BlockedShots,
        turnovers: awayTeam.Turnovers,
        personalFouls: awayTeam.PersonalFouls,
        plusMinus: awayTeam.PlusMinus,
        possessions: awayTeam.Possessions,
        effectiveFieldGoalPercentage: awayTeam.EffectiveFieldGoalsPercentage,
        trueShootingPercentage: awayTeam.TrueShootingPercentage
      },
      homeTeamStats: {
        points: homeTeam.Points,
        fieldGoalPercentage: homeTeam.FieldGoalsPercentage,
        threePointPercentage: homeTeam.ThreePointersPercentage,
        freeThrowPercentage: homeTeam.FreeThrowsPercentage,
        rebounds: homeTeam.Rebounds,
        offensiveRebounds: homeTeam.OffensiveRebounds,
        defensiveRebounds: homeTeam.DefensiveRebounds,
        assists: homeTeam.Assists,
        steals: homeTeam.Steals,
        blocks: homeTeam.BlockedShots,
        turnovers: homeTeam.Turnovers,
        personalFouls: homeTeam.PersonalFouls,
        plusMinus: homeTeam.PlusMinus,
        possessions: homeTeam.Possessions,
        effectiveFieldGoalPercentage: homeTeam.EffectiveFieldGoalsPercentage,
        trueShootingPercentage: homeTeam.TrueShootingPercentage
      }
    };
  }
}

module.exports = GameAnalysisAI; 