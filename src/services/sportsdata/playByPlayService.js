const axios = require('axios');

class PlayByPlayService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.sportsdata.io/v3/nba/pbp/json';
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  /**
   * Get play-by-play data for a specific game
   * @param {number} gameId - The GameID from sportsdata.io
   * @returns {Promise<Object>} - Play-by-play data including game info and plays array
   */
  async getPlayByPlay(gameId) {
    try {
      const url = `${this.baseUrl}/PlayByPlay/${gameId}`;
      const response = await axios.get(url, {
        params: {
          key: this.apiKey
        },
        timeout: 30000 // 30 second timeout
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // API error response
        console.error(`API Error for game ${gameId}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 404) {
          throw new Error(`Game ${gameId} not found or no play-by-play data available`);
        }
        if (error.response.status === 429) {
          throw new Error(`Rate limit exceeded for game ${gameId}`);
        }
        if (error.response.status === 401) {
          throw new Error(`Invalid API key for game ${gameId}`);
        }
      } else if (error.request) {
        // Network error
        console.error(`Network error for game ${gameId}:`, error.message);
        throw new Error(`Network error fetching play-by-play for game ${gameId}: ${error.message}`);
      } else {
        // Other error
        console.error(`Error fetching play-by-play for game ${gameId}:`, error.message);
        throw new Error(`Error fetching play-by-play for game ${gameId}: ${error.message}`);
      }
    }
  }

  /**
   * Get play-by-play data for multiple games with rate limiting
   * @param {number[]} gameIds - Array of GameIDs
   * @param {number} batchSize - Number of games to process in parallel (default: 1 for rate limiting)
   * @returns {Promise<Array>} - Array of play-by-play data objects
   */
  async getPlayByPlayBatch(gameIds, batchSize = 1) {
    const results = [];
    const errors = [];

    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (gameId) => {
        try {
          // Add delay between requests to respect rate limits
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
          }
          
          const data = await this.getPlayByPlay(gameId);
          return { gameId, success: true, data };
        } catch (error) {
          return { gameId, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result);
        } else {
          errors.push(result);
          console.error(`Failed to fetch play-by-play for game ${result.gameId}:`, result.error);
        }
      });

      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(gameIds.length / batchSize)}`);
    }

    if (errors.length > 0) {
      console.warn(`${errors.length} games failed to fetch play-by-play data`);
    }

    return { results, errors };
  }

  /**
   * Validate play-by-play data structure
   * @param {Object} data - Play-by-play data from API
   * @returns {boolean} - Whether data is valid
   */
  validatePlayByPlayData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.Game || !data.Plays || !Array.isArray(data.Plays)) {
      return false;
    }

    // Validate game data
    const game = data.Game;
    if (!game.GameID || !game.Season || !game.Status) {
      return false;
    }

    // Validate plays array
    if (data.Plays.length === 0) {
      console.warn(`No plays found for game ${game.GameID}`);
      return true; // Empty plays array is valid
    }

    // Validate first play has required fields
    const firstPlay = data.Plays[0];
    if (!firstPlay.PlayID || firstPlay.QuarterID === undefined) {
      return false;
    }

    return true;
  }

  /**
   * Extract and normalize play data from API response
   * @param {Object} apiData - Raw API response
   * @returns {Object} - Normalized play data
   */
  normalizePlayData(apiData) {
    if (!this.validatePlayByPlayData(apiData)) {
      throw new Error('Invalid play-by-play data structure');
    }

    const game = apiData.Game;
    const plays = apiData.Plays || [];

    return {
      game: {
        gameId: game.GameID,
        season: game.Season,
        status: game.Status,
        dateTime: new Date(game.DateTime),
        homeTeamId: game.HomeTeamID,
        awayTeamId: game.AwayTeamID,
        homeTeamScore: game.HomeTeamScore,
        awayTeamScore: game.AwayTeamScore,
        lastPlay: game.LastPlay,
        updated: game.Updated ? new Date(game.Updated) : null
      },
      plays: plays.map(play => ({
        playId: play.PlayID,
        quarterId: play.QuarterID,
        quarterName: play.QuarterName,
        sequence: play.Sequence,
        timeRemainingMinutes: play.TimeRemainingMinutes,
        timeRemainingSeconds: play.TimeRemainingSeconds,
        awayTeamScore: play.AwayTeamScore,
        homeTeamScore: play.HomeTeamScore,
        potentialPoints: play.PotentialPoints,
        points: play.Points,
        shotMade: play.ShotMade,
        category: play.Category,
        type: play.Type,
        teamId: play.TeamID,
        team: play.Team,
        opponentId: play.OpponentID,
        opponent: play.Opponent,
        receivingTeamId: play.ReceivingTeamID,
        receivingTeam: play.ReceivingTeam,
        description: play.Description,
        playerId: play.PlayerID,
        assistedByPlayerId: play.AssistedByPlayerID,
        blockedByPlayerId: play.BlockedByPlayerID,
        fastBreak: play.FastBreak,
        sideOfBasket: play.SideOfBasket,
        substituteInPlayerId: play.SubstituteInPlayerID,
        substituteOutPlayerId: play.SubstituteOutPlayerID,
        awayPlayerId: play.AwayPlayerID,
        homePlayerId: play.HomePlayerID,
        receivingPlayerId: play.ReceivingPlayerID,
        baselineOffsetPercentage: play.BaselineOffsetPercentage,
        sidelineOffsetPercentage: play.SidelineOffsetPercentage,
        coordinates: play.Coordinates,
        stolenByPlayerId: play.StolenByPlayerID,
        updated: play.Updated ? new Date(play.Updated) : null,
        created: play.Created ? new Date(play.Created) : null
      }))
    };
  }
}

module.exports = PlayByPlayService; 