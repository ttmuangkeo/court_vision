const axios = require('axios');
const prisma = require('../../db/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class GameSyncService {
  constructor() {
    this.apiBase = ESPN_API_BASE;
  }

  /**
   * Fetch games from ESPN scoreboard
   */
  async fetchGamesFromESPN(dates = null) {
    try {
      console.log('Fetching games from ESPN scoreboard...');
      
      let url = `${this.apiBase}/scoreboard`;
      if (dates) {
        url += `?dates=${dates}`;
      }
      
      const response = await axios.get(url);
      const events = response.data.events || [];
      
      console.log(`Found ${events.length} games from ESPN`);
      return events;
    } catch (error) {
      console.error('Error fetching games from ESPN:', error.message);
      throw error;
    }
  }

  /**
   * Extract team data from ESPN competition
   */
  extractTeamData(competition, homeAway) {
    const competitor = competition.competitors.find(c => c.homeAway === homeAway);
    if (!competitor) return null;

    return {
      espnId: competitor.team.id,
      name: competitor.team.name,
      abbreviation: competitor.team.abbreviation,
      score: competitor.score || '0',
      homeAway: competitor.homeAway
    };
  }

  /**
   * Map ESPN status to GameStatus enum
   */
  mapStatus(espnStatus) {
    switch (espnStatus) {
      case 'STATUS_SCHEDULED':
        return 'SCHEDULED';
      case 'STATUS_IN_PROGRESS':
      case 'STATUS_LIVE':
        return 'LIVE';
      case 'STATUS_FINAL':
        return 'FINISHED';
      case 'STATUS_POSTPONED':
        return 'POSTPONED';
      case 'STATUS_CANCELED':
        return 'CANCELLED';
      default:
        return 'SCHEDULED';
    }
  }

  /**
   * Sync a single game
   */
  async syncGame(espnGame) {
    try {
      // Find existing game by ESPN ID
      const existingGame = await prisma.game.findUnique({
        where: { espnId: espnGame.id }
      });

      // Extract competition data (ESPN games have one competition with two competitors)
      const competition = espnGame.competitions?.[0];
      if (!competition) {
        console.warn(`No competition data for game ${espnGame.id}`);
        return { action: 'skipped', game: espnGame.name, reason: 'No competition data' };
      }

      // Extract team data
      const homeTeam = this.extractTeamData(competition, 'home');
      const awayTeam = this.extractTeamData(competition, 'away');

      if (!homeTeam || !awayTeam) {
        console.warn(`Missing team data for game ${espnGame.id}`);
        return { action: 'skipped', game: espnGame.name, reason: 'Missing team data' };
      }

      // Verify teams exist in our database
      const homeTeamExists = await prisma.team.findUnique({
        where: { espnId: homeTeam.espnId }
      });
      const awayTeamExists = await prisma.team.findUnique({
        where: { espnId: awayTeam.espnId }
      });

      if (!homeTeamExists || !awayTeamExists) {
        console.warn(`Teams not found in database for game ${espnGame.id}`);
        return { action: 'skipped', game: espnGame.name, reason: 'Teams not in database' };
      }

      // Prepare game data
      const gameData = {
        date: new Date(espnGame.date),
        status: this.mapStatus(espnGame.status?.type?.name),
        homeTeamId: homeTeam.espnId,
        awayTeamId: awayTeam.espnId,
        homeScore: parseInt(homeTeam.score) || 0,
        awayScore: parseInt(awayTeam.score) || 0,
        season: espnGame.season?.year?.toString() || new Date().getFullYear().toString(),
        lastSynced: new Date()
      };

      let result;
      if (existingGame) {
        // Update existing game
        result = await prisma.game.update({
          where: { espnId: espnGame.id },
          data: gameData
        });
        return { action: 'updated', game: espnGame.name, id: result.espnId };
      } else {
        // Create new game
        result = await prisma.game.create({
          data: {
            espnId: espnGame.id,
            ...gameData
          }
        });
        return { action: 'created', game: espnGame.name, id: result.espnId };
      }
    } catch (error) {
      console.error(`Error syncing game ${espnGame.id}:`, error.message);
      return { action: 'error', game: espnGame.name, error: error.message };
    }
  }

  /**
   * Sync all games from ESPN
   */
  async syncAllGames(dates = null) {
    try {
      console.log('🔄 Starting ESPN Game Sync...\n');
      
      const games = await this.fetchGamesFromESPN(dates);
      
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const game of games) {
        const result = await this.syncGame(game);
        
        switch (result.action) {
          case 'created':
            createdCount++;
            console.log(`  ✅ Created: ${result.game}`);
            break;
          case 'updated':
            updatedCount++;
            console.log(`  🔄 Updated: ${result.game}`);
            break;
          case 'skipped':
            skippedCount++;
            console.log(`  ⏭️  Skipped: ${result.game} (${result.reason})`);
            break;
          case 'error':
            errorCount++;
            console.log(`  ❌ Error: ${result.game} (${result.error})`);
            break;
        }
      }

      return {
        totalGames: games.length,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errorCount
      };
    } catch (error) {
      console.error('Error in syncAllGames:', error);
      throw error;
    }
  }

  /**
   * Get sync status for games
   */
  async getSyncStatus() {
    try {
      const totalGames = await prisma.game.count();
      const gamesToday = await prisma.game.count({
        where: {
          lastSynced: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
      const gamesThisWeek = await prisma.game.count({
        where: {
          lastSynced: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      });

      return {
        status: {
          total: totalGames,
          syncedToday: gamesToday,
          syncedThisWeek: gamesThisWeek,
          needsSync: totalGames - gamesToday
        }
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  /**
   * Sync games for specific dates
   */
  async syncGamesForDates(dateRange) {
    try {
      console.log(`🔄 Syncing games for dates: ${dateRange}`);
      return await this.syncAllGames(dateRange);
    } catch (error) {
      console.error('Error syncing games for dates:', error);
      throw error;
    }
  }

  /**
   * Sync today's games
   */
  async syncTodaysGames() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return await this.syncGamesForDates(today);
  }

  /**
   * Sync this week's games
   */
  async syncThisWeeksGames() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = weekAgo.toISOString().slice(0, 10).replace(/-/g, '');
    const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
    const dateRange = `${startDate}-${endDate}`;
    
    return await this.syncGamesForDates(dateRange);
  }
}

module.exports = GameSyncService; 