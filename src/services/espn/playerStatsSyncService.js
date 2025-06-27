const axios = require('axios');
const prisma = require('../../db/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class PlayerStatsSyncService {
  constructor() {
    this.apiBase = ESPN_API_BASE;
  }

  async fetchScoreboardGames() {
    try {
      console.log('Fetching current scoreboard games...');
      const response = await axios.get(`${this.apiBase}/scoreboard`);
      
      if (!response.data.events) {
        console.log('No events found in scoreboard');
        return [];
      }

      const games = response.data.events.map(event => ({
        espnId: event.id,
        name: event.name,
        date: new Date(event.date),
        status: event.status.type.name,
        homeTeam: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.team?.displayName,
        awayTeam: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.team?.displayName,
        homeTeamId: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.team?.id,
        awayTeamId: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.team?.id,
        homeScore: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.score,
        awayScore: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.score
      }));

      console.log(`Found ${games.length} games in scoreboard`);
      return games;
    } catch (error) {
      console.error('Error fetching scoreboard games:', error.message);
      return [];
    }
  }

  async fetchGameLeaders(gameId) {
    try {
      console.log(`Fetching game leaders for game ${gameId}...`);
      const response = await axios.get(`${this.apiBase}/scoreboard`);
      
      // Find the specific game
      const game = response.data.events.find(event => event.id === gameId);
      if (!game) {
        console.log(`Game ${gameId} not found in scoreboard`);
        return [];
      }

      const stats = [];
      
      // Extract stats from both teams
      game.competitions[0].competitors.forEach(competitor => {
        const teamId = competitor.team.id;
        
        // Get leaders stats
        if (competitor.leaders) {
          competitor.leaders.forEach(leader => {
            leader.leaders.forEach(playerLeader => {
              const playerId = playerLeader.athlete.id;
              const statName = leader.name;
              const statValue = playerLeader.value;
              
              // Find existing stat or create new one
              let existingStat = stats.find(s => s.playerId === playerId && s.gameId === gameId);
              if (!existingStat) {
                existingStat = {
                  gameId,
                  playerId,
                  teamId,
                  points: 0,
                  rebounds: 0,
                  assists: 0,
                  steals: 0,
                  blocks: 0,
                  turnovers: 0,
                  fouls: 0,
                  threesMade: 0,
                  threesAtt: 0,
                  fieldGoalsMade: 0,
                  fieldGoalsAtt: 0,
                  freeThrowsMade: 0,
                  freeThrowsAtt: 0,
                  plusMinus: 0,
                  minutes: 0,
                  starter: false
                };
                stats.push(existingStat);
              }
              
              // Update the specific stat
              switch (statName) {
                case 'points':
                  existingStat.points = Math.round(statValue);
                  break;
                case 'rebounds':
                  existingStat.rebounds = Math.round(statValue);
                  break;
                case 'assists':
                  existingStat.assists = Math.round(statValue);
                  break;
                case 'steals':
                  existingStat.steals = Math.round(statValue);
                  break;
                case 'blocks':
                  existingStat.blocks = Math.round(statValue);
                  break;
                case 'turnovers':
                  existingStat.turnovers = Math.round(statValue);
                  break;
                case 'fouls':
                  existingStat.fouls = Math.round(statValue);
                  break;
                case 'threesMade':
                  existingStat.threesMade = Math.round(statValue);
                  break;
                case 'threesAtt':
                  existingStat.threesAtt = Math.round(statValue);
                  break;
                case 'fieldGoalsMade':
                  existingStat.fieldGoalsMade = Math.round(statValue);
                  break;
                case 'fieldGoalsAtt':
                  existingStat.fieldGoalsAtt = Math.round(statValue);
                  break;
                case 'freeThrowsMade':
                  existingStat.freeThrowsMade = Math.round(statValue);
                  break;
                case 'freeThrowsAtt':
                  existingStat.freeThrowsAtt = Math.round(statValue);
                  break;
                case 'plusMinus':
                  existingStat.plusMinus = Math.round(statValue);
                  break;
                case 'minutes':
                  existingStat.minutes = Math.round(statValue);
                  break;
                // Add more stat mappings as needed
              }
            });
          });
        }
      });

      console.log(`Found ${stats.length} player stats from game leaders`);
      return stats;
    } catch (error) {
      console.error(`Error fetching game leaders for game ${gameId}:`, error.message);
      return [];
    }
  }

  async syncGamePlayerStats(gameId) {
    try {
      console.log(`Syncing player stats for game ${gameId}...`);
      
      // Get stats from game leaders
      const stats = await this.fetchGameLeaders(gameId);
      
      if (stats.length === 0) {
        console.log(`No player stats found for game ${gameId}`);
        return { synced: 0, errors: 0 };
      }

      let synced = 0;
      let errors = 0;

      for (const stat of stats) {
        try {
          // Check if player and game exist
          const player = await prisma.player.findUnique({
            where: { espnId: stat.playerId }
          });

          const game = await prisma.game.findUnique({
            where: { espnId: stat.gameId }
          });

          if (!player) {
            console.log(`Player ${stat.playerId} not found in database`);
            continue;
          }

          if (!game) {
            console.log(`Game ${stat.gameId} not found in database`);
            continue;
          }

          // Upsert the player game stat
          await prisma.playerGameStat.upsert({
            where: {
              gameId_playerId: {
                gameId: stat.gameId,
                playerId: stat.playerId
              }
            },
            update: {
              teamId: stat.teamId,
              points: stat.points,
              rebounds: stat.rebounds,
              assists: stat.assists,
              steals: stat.steals,
              blocks: stat.blocks,
              turnovers: stat.turnovers,
              fouls: stat.fouls,
              threesMade: stat.threesMade,
              threesAtt: stat.threesAtt,
              fieldGoalsMade: stat.fieldGoalsMade,
              fieldGoalsAtt: stat.fieldGoalsAtt,
              freeThrowsMade: stat.freeThrowsMade,
              freeThrowsAtt: stat.freeThrowsAtt,
              plusMinus: stat.plusMinus,
              minutes: stat.minutes,
              starter: stat.starter,
              updatedAt: new Date()
            },
            create: {
              gameId: stat.gameId,
              playerId: stat.playerId,
              teamId: stat.teamId,
              points: stat.points,
              rebounds: stat.rebounds,
              assists: stat.assists,
              steals: stat.steals,
              blocks: stat.blocks,
              turnovers: stat.turnovers,
              fouls: stat.fouls,
              threesMade: stat.threesMade,
              threesAtt: stat.threesAtt,
              fieldGoalsMade: stat.fieldGoalsMade,
              fieldGoalsAtt: stat.fieldGoalsAtt,
              freeThrowsMade: stat.freeThrowsMade,
              freeThrowsAtt: stat.freeThrowsAtt,
              plusMinus: stat.plusMinus,
              minutes: stat.minutes,
              starter: stat.starter
            }
          });

          synced++;
        } catch (error) {
          console.error(`Error syncing stat for player ${stat.playerId} in game ${stat.gameId}:`, error.message);
          errors++;
        }
      }

      console.log(`Synced ${synced} player stats for game ${gameId} (${errors} errors)`);
      return { synced, errors };
    } catch (error) {
      console.error(`Error syncing player stats for game ${gameId}:`, error.message);
      return { synced: 0, errors: 1 };
    }
  }

  async syncRecentGamesFromScoreboard() {
    try {
      console.log('Starting sync of recent games from scoreboard...');
      
      // Get games from scoreboard
      const scoreboardGames = await this.fetchScoreboardGames();
      
      if (scoreboardGames.length === 0) {
        console.log('No games found in scoreboard');
        return { totalSynced: 0, totalErrors: 0, gamesProcessed: 0 };
      }

      let totalSynced = 0;
      let totalErrors = 0;
      let gamesProcessed = 0;

      for (const scoreboardGame of scoreboardGames) {
        try {
          console.log(`Processing game ${scoreboardGame.espnId}: ${scoreboardGame.awayTeam} @ ${scoreboardGame.homeTeam} (${scoreboardGame.status})`);
          
          // Check if this game exists in our database
          const existingGame = await prisma.game.findUnique({
            where: { espnId: scoreboardGame.espnId }
          });

          if (!existingGame) {
            console.log(`Game ${scoreboardGame.espnId} not found in database, skipping...`);
            continue;
          }

          // Only sync stats for finished games
          if (scoreboardGame.status === 'STATUS_FINAL') {
            const result = await this.syncGamePlayerStats(scoreboardGame.espnId);
            totalSynced += result.synced;
            totalErrors += result.errors;
          } else {
            console.log(`Game ${scoreboardGame.espnId} is not finished yet (${scoreboardGame.status}), skipping stats sync`);
          }
          
          gamesProcessed++;
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing game ${scoreboardGame.espnId}:`, error.message);
          totalErrors++;
        }
      }

      console.log(`Recent games sync complete! Games processed: ${gamesProcessed}, Total stats synced: ${totalSynced}, Total errors: ${totalErrors}`);
      return { totalSynced, totalErrors, gamesProcessed };
    } catch (error) {
      console.error('Error in syncRecentGamesFromScoreboard:', error.message);
      throw error;
    }
  }

  async syncAllGamePlayerStats() {
    try {
      console.log('Starting sync of all game player stats...');
      
      // Get all finished games from the database
      const games = await prisma.game.findMany({
        where: {
          status: 'FINISHED'
        },
        select: {
          espnId: true,
          date: true,
          status: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      console.log(`Found ${games.length} finished games to sync`);

      let totalSynced = 0;
      let totalErrors = 0;

      for (const game of games) {
        console.log(`Processing game ${game.espnId} from ${game.date.toISOString().split('T')[0]}...`);
        
        const result = await this.syncGamePlayerStats(game.espnId);
        totalSynced += result.synced;
        totalErrors += result.errors;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Sync complete! Total stats synced: ${totalSynced}, Total errors: ${totalErrors}`);
      return { totalSynced, totalErrors };
    } catch (error) {
      console.error('Error in syncAllGamePlayerStats:', error.message);
      throw error;
    }
  }

  async syncRecentGamePlayerStats(days = 7) {
    try {
      console.log(`Starting sync of recent game player stats (last ${days} days)...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Get recent finished games from the database
      const games = await prisma.game.findMany({
        where: {
          status: 'FINISHED',
          date: {
            gte: cutoffDate
          }
        },
        select: {
          espnId: true,
          date: true,
          status: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      console.log(`Found ${games.length} recent finished games to sync`);

      let totalSynced = 0;
      let totalErrors = 0;

      for (const game of games) {
        console.log(`Processing game ${game.espnId} from ${game.date.toISOString().split('T')[0]}...`);
        
        const result = await this.syncGamePlayerStats(game.espnId);
        totalSynced += result.synced;
        totalErrors += result.errors;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Recent sync complete! Total stats synced: ${totalSynced}, Total errors: ${totalErrors}`);
      return { totalSynced, totalErrors };
    } catch (error) {
      console.error('Error in syncRecentGamePlayerStats:', error.message);
      throw error;
    }
  }
}

module.exports = PlayerStatsSyncService; 