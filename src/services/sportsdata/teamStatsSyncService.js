const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_KEY = process.env.SPORTSDATA_API_KEY;
const BASE_URL = 'https://api.sportsdata.io/v3/nba';

class SportsdataTeamStatsSyncService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchTeamStandings(season = '2024-25') {
    try {
      const url = `${BASE_URL}/scores/json/Standings/${season}?key=${API_KEY}`;
      console.log(`Fetching team standings from: ${url}`);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching team standings:', error.message);
      throw error;
    }
  }

  async fetchTeamStats(season = '2024-25') {
    try {
      const url = `${BASE_URL}/stats/json/TeamSeasonStats/${season}?key=${API_KEY}`;
      console.log(`Fetching team stats from: ${url}`);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching team stats:', error.message);
      throw error;
    }
  }

  transformStandingsData(standings) {
    const transformedStats = [];
    
    standings.forEach(team => {
      // Offensive stats
      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'offensive',
        statName: 'points',
        displayName: 'Points Per Game',
        shortDisplayName: 'PPG',
        description: 'Average points scored per game',
        abbreviation: 'PPG',
        value: team.Points || 0,
        displayValue: `${team.Points || 0}`,
        perGameValue: team.Points || 0,
        perGameDisplayValue: `${team.Points || 0}`
      });

      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'offensive',
        statName: 'fieldGoalsPercentage',
        displayName: 'Field Goal Percentage',
        shortDisplayName: 'FG%',
        description: 'Field goal shooting percentage',
        abbreviation: 'FG%',
        value: team.FieldGoalsPercentage || 0,
        displayValue: `${(team.FieldGoalsPercentage || 0).toFixed(1)}%`,
        perGameValue: team.FieldGoalsPercentage || 0,
        perGameDisplayValue: `${(team.FieldGoalsPercentage || 0).toFixed(1)}%`
      });

      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'offensive',
        statName: 'threePointPercentage',
        displayName: 'Three Point Percentage',
        shortDisplayName: '3P%',
        description: 'Three point shooting percentage',
        abbreviation: '3P%',
        value: team.ThreePointersPercentage || 0,
        displayValue: `${(team.ThreePointersPercentage || 0).toFixed(1)}%`,
        perGameValue: team.ThreePointersPercentage || 0,
        perGameDisplayValue: `${(team.ThreePointersPercentage || 0).toFixed(1)}%`
      });

      // Defensive stats
      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'defensive',
        statName: 'pointsAllowed',
        displayName: 'Points Allowed Per Game',
        shortDisplayName: 'PAPG',
        description: 'Average points allowed per game',
        abbreviation: 'PAPG',
        value: team.PointsAgainst || 0,
        displayValue: `${team.PointsAgainst || 0}`,
        perGameValue: team.PointsAgainst || 0,
        perGameDisplayValue: `${team.PointsAgainst || 0}`
      });

      // General stats
      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'general',
        statName: 'wins',
        displayName: 'Wins',
        shortDisplayName: 'W',
        description: 'Total wins',
        abbreviation: 'W',
        value: team.Wins || 0,
        displayValue: `${team.Wins || 0}`,
        perGameValue: team.Wins || 0,
        perGameDisplayValue: `${team.Wins || 0}`
      });

      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'general',
        statName: 'losses',
        displayName: 'Losses',
        shortDisplayName: 'L',
        description: 'Total losses',
        abbreviation: 'L',
        value: team.Losses || 0,
        displayValue: `${team.Losses || 0}`,
        perGameValue: team.Losses || 0,
        perGameDisplayValue: `${team.Losses || 0}`
      });

      transformedStats.push({
        teamId: team.TeamID,
        season: '2024-25',
        seasonType: 'regular',
        category: 'general',
        statName: 'winPercentage',
        displayName: 'Win Percentage',
        shortDisplayName: 'WIN%',
        description: 'Win percentage',
        abbreviation: 'WIN%',
        value: team.Percentage || 0,
        displayValue: `${(team.Percentage || 0).toFixed(3)}`,
        perGameValue: team.Percentage || 0,
        perGameDisplayValue: `${(team.Percentage || 0).toFixed(3)}`
      });
    });

    return transformedStats;
  }

  async saveTeamStatistics(statsData) {
    const savedStats = [];
    
    for (const stat of statsData) {
      try {
        const savedStat = await this.prisma.teamStatistics.upsert({
          where: {
            teamId_season_seasonType_category_statName: {
              teamId: stat.teamId,
              season: stat.season,
              seasonType: stat.seasonType,
              category: stat.category,
              statName: stat.statName
            }
          },
          update: stat,
          create: stat
        });
        
        savedStats.push(savedStat);
      } catch (error) {
        console.error(`Error saving stat ${stat.statName} for team ${stat.teamId}:`, error.message);
      }
    }
    
    return savedStats;
  }

  async syncAllTeamsStatistics(season = '2024-25', seasonType = 'regular') {
    try {
      console.log('🚀 Starting team statistics sync from sportsdata.io...');
      
      // Fetch standings data
      const standings = await this.fetchTeamStandings(season);
      
      if (!standings || standings.length === 0) {
        console.log('No standings data found');
        return [];
      }
      
      console.log(`Found ${standings.length} teams in standings`);
      
      // Transform the data
      const transformedStats = this.transformStandingsData(standings);
      
      // Save to database
      const savedStats = await this.saveTeamStatistics(transformedStats);
      
      console.log(`✅ Successfully synced ${savedStats.length} team statistics`);
      
      return savedStats;
    } catch (error) {
      console.error('❌ Error during team statistics sync:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

module.exports = SportsdataTeamStatsSyncService; 