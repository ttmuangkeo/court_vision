const axios = require('axios');
const prisma = require('../../db/client');

class TeamStatsSyncService {
  constructor() {
    this.apiKey = process.env.SPORTSDATA_API_KEY;
    this.baseUrl = 'https://api.sportsdata.io/v3/nba/scores/json';
  }

  async syncTeamSeasonStats(season = 2025) {
    try {
      console.log(`Starting team season stats sync for ${season}...`);
      
      const response = await axios.get(`${this.baseUrl}/TeamSeasonStats/${season}?key=${this.apiKey}`);
      const teamStats = response.data;

      if (!Array.isArray(teamStats)) {
        throw new Error('Invalid response format from API');
      }

      console.log(`Found ${teamStats.length} team stats records`);

      let syncedCount = 0;
      let errorCount = 0;

      for (const teamStat of teamStats) {
        try {
          await this.processTeamStats(teamStat, season);
          syncedCount++;
        } catch (error) {
          console.error(`Error processing team stats for team ${teamStat.TeamID}:`, error.message);
          errorCount++;
        }
      }

      console.log(`Team stats sync completed: ${syncedCount} successful, ${errorCount} errors`);
      return { syncedCount, errorCount };
    } catch (error) {
      console.error('Error syncing team season stats:', error);
      throw error;
    }
  }

  async processTeamStats(teamStat, season) {
    const teamId = teamStat.TeamID;
    const seasonType = teamStat.SeasonType;

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      console.warn(`Team ${teamId} not found in database, skipping...`);
      return;
    }

    // Process offensive stats
    await this.upsertTeamStat(teamId, season, seasonType, 'offensive', {
      wins: teamStat.Wins,
      losses: teamStat.Losses,
      games: teamStat.Games,
      points: teamStat.Points,
      fieldGoalsMade: teamStat.FieldGoalsMade,
      fieldGoalsAttempted: teamStat.FieldGoalsAttempted,
      fieldGoalsPercentage: teamStat.FieldGoalsPercentage,
      effectiveFieldGoalsPercentage: teamStat.EffectiveFieldGoalsPercentage,
      twoPointersMade: teamStat.TwoPointersMade,
      twoPointersAttempted: teamStat.TwoPointersAttempted,
      twoPointersPercentage: teamStat.TwoPointersPercentage,
      threePointersMade: teamStat.ThreePointersMade,
      threePointersAttempted: teamStat.ThreePointersAttempted,
      threePointersPercentage: teamStat.ThreePointersPercentage,
      freeThrowsMade: teamStat.FreeThrowsMade,
      freeThrowsAttempted: teamStat.FreeThrowsAttempted,
      freeThrowsPercentage: teamStat.FreeThrowsPercentage,
      offensiveRebounds: teamStat.OffensiveRebounds,
      assists: teamStat.Assists,
      turnovers: teamStat.Turnovers,
      personalFouls: teamStat.PersonalFouls,
      trueShootingAttempts: teamStat.TrueShootingAttempts,
      trueShootingPercentage: teamStat.TrueShootingPercentage,
      plusMinus: teamStat.PlusMinus,
      possessions: teamStat.Possessions
    });

    // Process defensive stats
    await this.upsertTeamStat(teamId, season, seasonType, 'defensive', {
      defensiveRebounds: teamStat.DefensiveRebounds,
      rebounds: teamStat.Rebounds,
      steals: teamStat.Steals,
      blockedShots: teamStat.BlockedShots,
      defensiveReboundsPercentage: teamStat.DefensiveReboundsPercentage,
      totalReboundsPercentage: teamStat.TotalReboundsPercentage
    });

    // Process advanced stats
    await this.upsertTeamStat(teamId, season, seasonType, 'advanced', {
      playerEfficiencyRating: teamStat.PlayerEfficiencyRating,
      assistsPercentage: teamStat.AssistsPercentage,
      stealsPercentage: teamStat.StealsPercentage,
      blocksPercentage: teamStat.BlocksPercentage,
      turnOversPercentage: teamStat.TurnOversPercentage,
      usageRatePercentage: teamStat.UsageRatePercentage
    });

    // Process fantasy stats
    await this.upsertTeamStat(teamId, season, seasonType, 'fantasy', {
      fantasyPoints: teamStat.FantasyPoints,
      fantasyPointsFanDuel: teamStat.FantasyPointsFanDuel,
      fantasyPointsDraftKings: teamStat.FantasyPointsDraftKings,
      fantasyPointsYahoo: teamStat.FantasyPointsYahoo,
      fantasyPointsFantasyDraft: teamStat.FantasyPointsFantasyDraft,
      doubleDoubles: teamStat.DoubleDoubles,
      tripleDoubles: teamStat.TripleDoubles
    });

    // Process opponent stats if available
    if (teamStat.OpponentStat) {
      await this.processOpponentStats(teamId, season, seasonType, teamStat.OpponentStat);
    }
  }

  async processOpponentStats(teamId, season, seasonType, opponentStat) {
    // Process opponent offensive stats
    await this.upsertTeamStat(teamId, season, seasonType, 'opponent_offensive', {
      opponentPoints: opponentStat.Points,
      opponentFieldGoalsMade: opponentStat.FieldGoalsMade,
      opponentFieldGoalsAttempted: opponentStat.FieldGoalsAttempted,
      opponentFieldGoalsPercentage: opponentStat.FieldGoalsPercentage,
      opponentEffectiveFieldGoalsPercentage: opponentStat.EffectiveFieldGoalsPercentage,
      opponentTwoPointersMade: opponentStat.TwoPointersMade,
      opponentTwoPointersAttempted: opponentStat.TwoPointersAttempted,
      opponentTwoPointersPercentage: opponentStat.TwoPointersPercentage,
      opponentThreePointersMade: opponentStat.ThreePointersMade,
      opponentThreePointersAttempted: opponentStat.ThreePointersAttempted,
      opponentThreePointersPercentage: opponentStat.ThreePointersPercentage,
      opponentFreeThrowsMade: opponentStat.FreeThrowsMade,
      opponentFreeThrowsAttempted: opponentStat.FreeThrowsAttempted,
      opponentFreeThrowsPercentage: opponentStat.FreeThrowsPercentage,
      opponentOffensiveRebounds: opponentStat.OffensiveRebounds,
      opponentAssists: opponentStat.Assists,
      opponentTurnovers: opponentStat.Turnovers,
      opponentPersonalFouls: opponentStat.PersonalFouls,
      opponentTrueShootingAttempts: opponentStat.TrueShootingAttempts,
      opponentTrueShootingPercentage: opponentStat.TrueShootingPercentage,
      opponentPlusMinus: opponentStat.PlusMinus
    });

    // Process opponent defensive stats
    await this.upsertTeamStat(teamId, season, seasonType, 'opponent_defensive', {
      opponentDefensiveRebounds: opponentStat.DefensiveRebounds,
      opponentRebounds: opponentStat.Rebounds,
      opponentSteals: opponentStat.Steals,
      opponentBlockedShots: opponentStat.BlockedShots,
      opponentDefensiveReboundsPercentage: opponentStat.DefensiveReboundsPercentage,
      opponentTotalReboundsPercentage: opponentStat.TotalReboundsPercentage
    });
  }

  async upsertTeamStat(teamId, season, seasonType, category, stats) {
    const seasonStr = season.toString();
    const seasonTypeStr = seasonType.toString();

    for (const [statName, value] of Object.entries(stats)) {
      if (value !== null && value !== undefined) {
        const displayName = this.formatDisplayName(statName);
        const shortDisplayName = this.formatShortDisplayName(statName);
        const abbreviation = this.getAbbreviation(statName);
        const displayValue = this.formatDisplayValue(statName, value);

        await prisma.teamStatistics.upsert({
          where: {
            teamId_season_seasonType_category_statName: {
              teamId,
              season: seasonStr,
              seasonType: seasonTypeStr,
              category,
              statName
            }
          },
          update: {
            value: parseFloat(value),
            displayValue,
            lastSynced: new Date()
          },
          create: {
            teamId,
            season: seasonStr,
            seasonType: seasonTypeStr,
            category,
            statName,
            displayName,
            shortDisplayName,
            abbreviation,
            value: parseFloat(value),
            displayValue,
            description: this.getDescription(statName)
          }
        });
      }
    }
  }

  formatDisplayName(statName) {
    return statName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  formatShortDisplayName(statName) {
    const shortNames = {
      'wins': 'W',
      'losses': 'L',
      'games': 'GP',
      'points': 'PTS',
      'fieldGoalsMade': 'FGM',
      'fieldGoalsAttempted': 'FGA',
      'fieldGoalsPercentage': 'FG%',
      'effectiveFieldGoalsPercentage': 'eFG%',
      'twoPointersMade': '2PM',
      'twoPointersAttempted': '2PA',
      'twoPointersPercentage': '2P%',
      'threePointersMade': '3PM',
      'threePointersAttempted': '3PA',
      'threePointersPercentage': '3P%',
      'freeThrowsMade': 'FTM',
      'freeThrowsAttempted': 'FTA',
      'freeThrowsPercentage': 'FT%',
      'offensiveRebounds': 'OREB',
      'defensiveRebounds': 'DREB',
      'rebounds': 'REB',
      'assists': 'AST',
      'steals': 'STL',
      'blockedShots': 'BLK',
      'turnovers': 'TOV',
      'personalFouls': 'PF',
      'trueShootingPercentage': 'TS%',
      'plusMinus': '+/-',
      'possessions': 'POSS'
    };

    return shortNames[statName] || statName.toUpperCase();
  }

  getAbbreviation(statName) {
    return this.formatShortDisplayName(statName);
  }

  formatDisplayValue(statName, value) {
    if (statName.includes('Percentage')) {
      return `${parseFloat(value).toFixed(1)}%`;
    } else if (statName === 'plusMinus') {
      const numValue = parseFloat(value);
      return numValue >= 0 ? `+${numValue.toFixed(1)}` : numValue.toFixed(1);
    } else if (statName.includes('Made') || statName.includes('Attempted')) {
      return parseFloat(value).toFixed(1);
    } else {
      return parseFloat(value).toFixed(1);
    }
  }

  getDescription(statName) {
    const descriptions = {
      'wins': 'Total wins for the season',
      'losses': 'Total losses for the season',
      'games': 'Total games played',
      'points': 'Total points scored',
      'fieldGoalsMade': 'Total field goals made',
      'fieldGoalsAttempted': 'Total field goals attempted',
      'fieldGoalsPercentage': 'Field goal percentage',
      'effectiveFieldGoalsPercentage': 'Effective field goal percentage (accounts for 3-pointers)',
      'twoPointersMade': 'Total 2-point field goals made',
      'twoPointersAttempted': 'Total 2-point field goals attempted',
      'twoPointersPercentage': '2-point field goal percentage',
      'threePointersMade': 'Total 3-point field goals made',
      'threePointersAttempted': 'Total 3-point field goals attempted',
      'threePointersPercentage': '3-point field goal percentage',
      'freeThrowsMade': 'Total free throws made',
      'freeThrowsAttempted': 'Total free throws attempted',
      'freeThrowsPercentage': 'Free throw percentage',
      'offensiveRebounds': 'Total offensive rebounds',
      'defensiveRebounds': 'Total defensive rebounds',
      'rebounds': 'Total rebounds',
      'assists': 'Total assists',
      'steals': 'Total steals',
      'blockedShots': 'Total blocked shots',
      'turnovers': 'Total turnovers',
      'personalFouls': 'Total personal fouls',
      'trueShootingPercentage': 'True shooting percentage (accounts for 3-pointers and free throws)',
      'plusMinus': 'Point differential',
      'possessions': 'Total possessions'
    };

    return descriptions[statName] || `Team ${statName} for the season`;
  }
}

module.exports = TeamStatsSyncService; 