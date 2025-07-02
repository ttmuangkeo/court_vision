const axios = require('axios');
const prisma = require('../../db/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const ESPN_WEB_API_BASE = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba';

class PlayerSyncService {
  constructor() {
    this.apiBase = ESPN_API_BASE;
    this.webApiBase = ESPN_WEB_API_BASE;
  }

  async fetchTeamsFromESPN() {
    try {
      console.log('Fetching teams from ESPN...');
      const response = await axios.get(`${this.apiBase}/teams`);
      const teams = response.data.sports[0].leagues[0].teams;
      console.log(`Found ${teams.length} teams from ESPN`);
      return teams;
    } catch (error) {
      console.error('Error fetching teams from ESPN:', error.message);
      throw error;
    }
  }

  async fetchTeamRoster(teamId) {
    try {
      const response = await axios.get(`${this.apiBase}/teams/${teamId}/roster`);
      return response.data.athletes || [];
    } catch (error) {
      console.error(`Error fetching roster for team ${teamId}:`, error.message);
      return [];
    }
  }

  async fetchPlayerStats(espnId) {
    try {
      const response = await axios.get(`${this.webApiBase}/athletes/${espnId}/overview`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data.statistics) {
        const statistics = response.data.statistics;
        const stats = {};

        // Parse statistics from the new format
        if (statistics.names && statistics.splits && statistics.splits.length > 0) {
          // Get Regular Season stats (first split) as primary stats
          const regularSeasonSplit = statistics.splits.find(split => 
            split.displayName === 'Regular Season'
          ) || statistics.splits[0]; // Fallback to first split if no Regular Season

          if (regularSeasonSplit && regularSeasonSplit.stats) {
            // Map the stats array to our database fields
            statistics.names.forEach((statName, index) => {
              const statValue = regularSeasonSplit.stats[index];
              if (statValue !== undefined && statValue !== null) {
                switch (statName) {
                  case 'avgPoints':
                    stats.avgPoints = parseFloat(statValue);
                    break;
                  case 'avgRebounds':
                    stats.avgRebounds = parseFloat(statValue);
                    break;
                  case 'avgAssists':
                    stats.avgAssists = parseFloat(statValue);
                    break;
                  case 'avgSteals':
                    stats.avgSteals = parseFloat(statValue);
                    break;
                  case 'avgBlocks':
                    stats.avgBlocks = parseFloat(statValue);
                    break;
                  case 'avgTurnovers':
                    stats.avgTurnovers = parseFloat(statValue);
                    break;
                  case 'avgFouls':
                    stats.avgFouls = parseFloat(statValue);
                    break;
                  case 'fieldGoalPct':
                    stats.fieldGoalPct = parseFloat(statValue);
                    break;
                  case 'threePointPct':
                    stats.threePointPct = parseFloat(statValue);
                    break;
                  case 'freeThrowPct':
                    stats.freeThrowPct = parseFloat(statValue);
                    break;
                  case 'gamesPlayed':
                    stats.gamesPlayed = parseInt(statValue);
                    break;
                  case 'avgMinutes':
                    stats.minutesPerGame = parseFloat(statValue);
                    break;
                }
              }
            });
          }

          // Store all splits data for potential future use
          stats.statsSplits = statistics.splits;
        }

        return {
          ...stats,
          statsSummary: statistics,
          hasStatistics: Object.keys(stats).length > 0
        };
      }

      return { hasStatistics: false };
    } catch (error) {
      console.error(`Error fetching stats for player ${espnId}:`, error.message);
      return { hasStatistics: false };
    }
  }

  async fetchPlayerNews(espnId) {
    try {
      const response = await axios.get(`${this.webApiBase}/athletes/${espnId}/overview`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data.news && Array.isArray(response.data.news)) {
        return response.data.news.map(newsItem => ({
          espnId: newsItem.id,
          headline: newsItem.headline,
          description: newsItem.description,
          published: newsItem.published ? new Date(newsItem.published) : null,
          type: newsItem.type,
          section: newsItem.section,
          playerEspnId: espnId,
          lastSynced: new Date()
        }));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching news for player ${espnId}:`, error.message);
      return [];
    }
  }

  async syncPlayer(espnPlayer, teamEspnId) {
    try {
      // Find existing player by ESPN ID (now the primary key)
      const existingPlayer = await prisma.player.findUnique({
        where: { espnId: espnPlayer.id }
      });

      // Fetch player stats
      const statsData = await this.fetchPlayerStats(espnPlayer.id);

      // Convert ESPN data to match our schema
      const playerData = {
        espnUid: espnPlayer.uid,
        espnSlug: espnPlayer.slug,
        firstName: espnPlayer.firstName,
        lastName: espnPlayer.lastName,
        shortName: espnPlayer.shortName,
        fullName: espnPlayer.fullName,
        position: espnPlayer.position?.abbreviation || espnPlayer.position?.name,
        teamEspnId: teamEspnId, // Use ESPN team ID
        jerseyNumber: espnPlayer.jersey,
        height: espnPlayer.height ? String(espnPlayer.height) : null, // Convert to string
        weight: espnPlayer.weight || null,
        displayHeight: espnPlayer.displayHeight,
        displayWeight: espnPlayer.displayWeight,
        age: espnPlayer.age || null,
        experience: espnPlayer.experience?.years || null,
        dateOfBirth: espnPlayer.dateOfBirth ? new Date(espnPlayer.dateOfBirth) : null,
        birthPlace: (typeof espnPlayer.birthPlace === 'string')
          ? espnPlayer.birthPlace
          : (espnPlayer.birthPlace && typeof espnPlayer.birthPlace === 'object')
            ? Object.values(espnPlayer.birthPlace).filter(Boolean).join(', ')
            : null,
        debutYear: espnPlayer.debutYear || null,
        headshot: espnPlayer.headshot?.href || null,
        status: espnPlayer.status?.name || null,
        injuries: espnPlayer.injuries || null,
        contract: espnPlayer.contract || null,
        contracts: espnPlayer.contracts || null,
        alternateIds: espnPlayer.alternateIds || null,
        espnLinks: espnPlayer.links || null,
        lastSynced: new Date(),
        
        // Add stats data
        ...statsData,
        lastStatsSync: statsData.hasStatistics ? new Date() : null
      };

      if (existingPlayer) {
        // Update existing player
        await prisma.player.update({
          where: { espnId: espnPlayer.id },
          data: playerData
        });
        return { 
          action: 'updated', 
          player: espnPlayer.displayName,
          hasStats: statsData.hasStatistics
        };
      } else {
        // Create new player
        await prisma.player.create({
          data: {
            espnId: espnPlayer.id, // ESPN ID as primary key
            ...playerData
          }
        });
        return { 
          action: 'synced', 
          player: espnPlayer.displayName,
          hasStats: statsData.hasStatistics
        };
      }
    } catch (error) {
      console.error(`Error syncing player ${espnPlayer.displayName}:`, error.message);
      throw error;
    }
  }

  async syncTeamPlayers(team) {
    try {
      console.log(`\n🔄 Syncing players for ${team.team.displayName}...`);
      
      const roster = await this.fetchTeamRoster(team.team.id);
      console.log(`Found ${roster.length} players in roster`);
      
      let syncedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;
      let statsCount = 0;

      for (const player of roster) {
        try {
          const result = await this.syncPlayer(player, team.team.id);
          if (result.action === 'synced') {
            syncedCount++;
          } else {
            updatedCount++;
          }
          if (result.hasStats) {
            statsCount++;
          }
          console.log(`  ${result.action}: ${result.player}${result.hasStats ? ' (with stats)' : ''}`);
        } catch (error) {
          errorCount++;
          console.error(`  ❌ Failed to sync ${player.displayName}:`, error.message);
        }
      }

      return {
        team: team.team.displayName,
        synced: syncedCount,
        updated: updatedCount,
        errors: errorCount,
        withStats: statsCount,
        total: roster.length
      };
    } catch (error) {
      console.error(`Error syncing team ${team.team.displayName}:`, error.message);
      throw error;
    }
  }

  async syncAllPlayers() {
    try {
      console.log('🔄 Starting ESPN Player Sync for All Teams...\n');
      
      const teams = await this.fetchTeamsFromESPN();
      console.log(`Found ${teams.length} teams to process\n`);
      
      let totalSynced = 0;
      let totalUpdated = 0;
      let totalErrors = 0;
      let totalWithStats = 0;
      const results = [];

      for (const team of teams) {
        try {
          const result = await this.syncTeamPlayers(team);
          results.push(result);
          totalSynced += result.synced;
          totalUpdated += result.updated;
          totalErrors += result.errors;
          totalWithStats += result.withStats;
        } catch (error) {
          console.error(`❌ Failed to sync team ${team.team.displayName}:`, error.message);
          totalErrors++;
        }
      }

      console.log('\n📈 Player Sync Summary:');
      console.log(`✅ Total Synced: ${totalSynced}`);
      console.log(`🔄 Total Updated: ${totalUpdated}`);
      console.log(`📊 Players with Stats: ${totalWithStats}`);
      console.log(`❌ Total Errors: ${totalErrors}`);
      console.log(`📊 Teams Processed: ${teams.length}`);

      return {
        totalSynced,
        totalUpdated,
        totalErrors,
        totalWithStats,
        teamsProcessed: teams.length,
        results
      };
    } catch (error) {
      console.error('❌ Player sync failed:', error);
      throw error;
    }
  }

  async syncPlayerNews(espnId) {
    try {
      const newsItems = await this.fetchPlayerNews(espnId);
      let syncedCount = 0;

      for (const newsItem of newsItems) {
        try {
          // Upsert news item
          await prisma.playerNews.upsert({
            where: { espnId: newsItem.espnId },
            update: newsItem,
            create: newsItem
          });
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing news item ${newsItem.espnId}:`, error.message);
        }
      }

      return { synced: syncedCount, total: newsItems.length };
    } catch (error) {
      console.error(`Error syncing news for player ${espnId}:`, error.message);
      return { synced: 0, total: 0 };
    }
  }

  async getSyncStatus() {
    try {
      const totalPlayers = await prisma.player.count();
      const playersSyncedToday = await prisma.player.count({
        where: {
          lastSynced: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
      const playersWithStats = await prisma.player.count({
        where: {
          hasStatistics: true
        }
      });

      return {
        status: {
          total: totalPlayers,
          withEspnId: totalPlayers, // All players now have espnId as primary key
          syncedToday: playersSyncedToday,
          withStats: playersWithStats,
          missingEspnId: 0 // No players can be missing espnId since it's the primary key
        }
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
}

module.exports = new PlayerSyncService(); 