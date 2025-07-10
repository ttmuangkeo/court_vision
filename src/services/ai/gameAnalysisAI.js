const axios = require('axios');

// Static cooldown tracking shared across all instances
const staticCooldowns = new Map();
let staticLastApiCall = null; // Changed to let for proper assignment

class GameAnalysisAI {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.analysisCache = new Map(); // Cache for analysis results
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
      const gameCooldown = staticCooldowns.get(game.GameID);
      if (gameCooldown && now < gameCooldown) {
        const remainingTime = Math.ceil((gameCooldown - now) / 1000 / 60);
        console.log(`Game ${game.GameID} in cooldown (${remainingTime} minutes remaining), using fallback analysis`);
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

      // Stricter rate limiting for free trial accounts - 2 minutes between calls
      if (staticLastApiCall && (now - staticLastApiCall) < 120000) {
        const remainingTime = Math.ceil((120000 - (now - staticLastApiCall)) / 1000 / 60);
        console.log(`Rate limiting: ${remainingTime} minutes remaining, using fallback analysis`);
        const fallbackAnalysis = this.generateFallbackAnalysis(analysisData);
        this.analysisCache.set(cacheKey, fallbackAnalysis);
        return fallbackAnalysis;
      }

      console.log(`Making OpenAI API call for game ${game.GameID}...`);
      
      // Make direct HTTP request to OpenAI API with shorter prompt
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an NBA analyst. Provide brief, insightful analysis in JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800 // Reduced token usage
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update last API call time
      staticLastApiCall = now;
      console.log(`Successfully received AI analysis for game ${game.GameID}`);
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
        
        // Extract game ID from boxScoreData for error handling
        const game = boxScoreData.Game;
        const gameId = game.GameID;
        
        // For rate limits (429), set a longer cooldown for this specific game
        if (status === 429) {
          const cooldownUntil = Date.now() + 300000; // 5 minute cooldown
          staticCooldowns.set(gameId, cooldownUntil);
          console.log(`Rate limit hit for game ${gameId}, setting 5-minute cooldown until ${new Date(cooldownUntil).toLocaleTimeString()}`);
        }
        
        // Use fallback for any API error (401, 404, 429, etc.)
        const analysisData = this.prepareAnalysisData(boxScoreData);
        const fallbackAnalysis = this.generateFallbackAnalysis(analysisData);
        
        // Cache the fallback result
        const cacheKey = `game_${gameId}`;
        this.analysisCache.set(cacheKey, fallbackAnalysis);
        
        return fallbackAnalysis;
      }
      
      throw error;
    }
  }

  createAnalysisPrompt(analysisData) {
    return `Analyze this NBA game: ${analysisData.gameInfo.awayTeam} (${analysisData.gameInfo.awayScore}) vs ${analysisData.gameInfo.homeTeam} (${analysisData.gameInfo.homeScore}). Winner: ${analysisData.gameInfo.winner} by ${analysisData.gameInfo.margin} points.

Key stats - Away: ${analysisData.awayTeamStats.fieldGoalPercentage}% FG, ${analysisData.awayTeamStats.threePointPercentage}% 3P, ${analysisData.awayTeamStats.assists} assists, ${analysisData.awayTeamStats.turnovers} turnovers. Home: ${analysisData.homeTeamStats.fieldGoalPercentage}% FG, ${analysisData.homeTeamStats.threePointPercentage}% 3P, ${analysisData.homeTeamStats.assists} assists, ${analysisData.homeTeamStats.turnovers} turnovers.

Provide analysis in JSON: {"summary": "2-3 sentence summary", "keyInsights": ["insight1", "insight2"], "teamAnalysis": {"away": {"strengths": ["s1"], "weaknesses": ["w1"], "performance": "analysis"}, "home": {"strengths": ["s1"], "weaknesses": ["w1"], "performance": "analysis"}}, "matchupAnalysis": {"advantages": {"away": ["a1"], "home": ["a1"]}, "keyFactors": ["f1", "f2"]}, "strategicInsights": {"offensiveStrategy": "analysis", "defensiveStrategy": "analysis", "adjustments": "analysis"}, "gamePlan": {"forWinner": "advice", "forLoser": "advice", "keyTakeaways": ["t1", "t2"]}}`;
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