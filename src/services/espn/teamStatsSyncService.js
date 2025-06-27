const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

class TeamStatsSyncService {
  constructor() {
    this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
  }

  async fetchTeamStatistics(teamId) {
    try {
      const url = `${this.baseUrl}/teams/${teamId}/statistics`;
      console.log(`Fetching team statistics for team ${teamId}...`);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team statistics for team ${teamId}:`, error.message);
      throw error;
    }
  }

  async processTeamStatistics(teamId, season = '2024-25', seasonType = 'regular') {
    try {
      const statsData = await this.fetchTeamStatistics(teamId);
      
      if (!statsData.results?.stats?.categories) {
        console.log(`No statistics data found for team ${teamId}`);
        return [];
      }

      const processedStats = [];
      
      // Process each category (general, offensive, defensive)
      for (const category of statsData.results.stats.categories) {
        const categoryName = category.name;
        
        if (!category.stats) continue;
        
        // Process each stat in the category
        for (const stat of category.stats) {
          const statData = {
            teamId,
            season,
            seasonType,
            category: categoryName,
            statName: stat.name,
            displayName: stat.displayName || stat.name,
            shortDisplayName: stat.shortDisplayName || stat.abbreviation || stat.name,
            description: stat.description,
            abbreviation: stat.abbreviation || stat.name.toUpperCase(),
            value: this.parseValue(stat.value),
            displayValue: stat.displayValue || stat.value?.toString() || '0',
            perGameValue: this.parseValue(stat.perGameValue),
            perGameDisplayValue: stat.perGameDisplayValue || stat.perGameValue?.toString()
          };
          
          processedStats.push(statData);
        }
      }
      
      return processedStats;
    } catch (error) {
      console.error(`Error processing team statistics for team ${teamId}:`, error);
      throw error;
    }
  }

  parseValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  async saveTeamStatistics(statsData) {
    try {
      const savedStats = [];
      
      for (const stat of statsData) {
        const savedStat = await prisma.teamStatistics.upsert({
          where: {
            teamId_season_seasonType_category_statName: {
              teamId: stat.teamId,
              season: stat.season,
              seasonType: stat.seasonType,
              category: stat.category,
              statName: stat.statName
            }
          },
          update: {
            displayName: stat.displayName,
            shortDisplayName: stat.shortDisplayName,
            description: stat.description,
            abbreviation: stat.abbreviation,
            value: stat.value,
            displayValue: stat.displayValue,
            perGameValue: stat.perGameValue,
            perGameDisplayValue: stat.perGameDisplayValue,
            lastSynced: new Date()
          },
          create: {
            ...stat,
            lastSynced: new Date()
          }
        });
        
        savedStats.push(savedStat);
      }
      
      return savedStats;
    } catch (error) {
      console.error('Error saving team statistics:', error);
      throw error;
    }
  }

  async syncTeamStatistics(teamId, season = '2024-25', seasonType = 'regular') {
    try {
      console.log(`Syncing team statistics for team ${teamId}...`);
      
      const statsData = await this.processTeamStatistics(teamId, season, seasonType);
      const savedStats = await this.saveTeamStatistics(statsData);
      
      console.log(`Successfully synced ${savedStats.length} statistics for team ${teamId}`);
      return savedStats;
    } catch (error) {
      console.error(`Error syncing team statistics for team ${teamId}:`, error);
      throw error;
    }
  }

  async syncAllTeamsStatistics(season = '2024-25', seasonType = 'regular') {
    try {
      console.log('Starting team statistics sync for all teams...');
      
      // Get all teams from database
      const teams = await prisma.team.findMany({
        where: { isActive: true }
      });
      
      console.log(`Found ${teams.length} active teams to sync`);
      
      const results = [];
      
      for (const team of teams) {
        try {
          const teamStats = await this.syncTeamStatistics(team.espnId, season, seasonType);
          results.push({
            teamId: team.espnId,
            teamName: team.name,
            statsCount: teamStats.length,
            success: true
          });
        } catch (error) {
          console.error(`Failed to sync statistics for team ${team.espnId}:`, error);
          results.push({
            teamId: team.espnId,
            teamName: team.name,
            error: error.message,
            success: false
          });
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(`Team statistics sync completed:`);
      console.log(`- Successful: ${successful.length} teams`);
      console.log(`- Failed: ${failed.length} teams`);
      
      if (failed.length > 0) {
        console.log('Failed teams:', failed.map(f => `${f.teamName} (${f.teamId}): ${f.error}`));
      }
      
      return results;
    } catch (error) {
      console.error('Error syncing all teams statistics:', error);
      throw error;
    }
  }

  async getTeamStatistics(teamId, season = '2024-25', seasonType = 'regular') {
    try {
      const stats = await prisma.teamStatistics.findMany({
        where: {
          teamId,
          season,
          seasonType
        },
        orderBy: [
          { category: 'asc' },
          { displayName: 'asc' }
        ]
      });
      
      // Group by category
      const groupedStats = stats.reduce((acc, stat) => {
        if (!acc[stat.category]) {
          acc[stat.category] = [];
        }
        acc[stat.category].push(stat);
        return acc;
      }, {});
      
      return groupedStats;
    } catch (error) {
      console.error(`Error getting team statistics for team ${teamId}:`, error);
      throw error;
    }
  }
}

module.exports = TeamStatsSyncService; 