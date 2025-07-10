const axios = require('axios');
const prisma = require('../../db/client');

class BoxScoreService {
  constructor() {
    this.apiKey = process.env.SPORTSDATA_API_KEY;
    this.baseUrl = 'https://api.sportsdata.io/v3/nba/stats/json';
  }

  async getBoxScore(gameId) {
    try {
      console.log(`Fetching box score for game ${gameId}...`);
      
      const response = await axios.get(`${this.baseUrl}/BoxScoreFinal/${gameId}?key=${this.apiKey}`);
      const boxScore = response.data;

      if (!boxScore.Game || !boxScore.TeamGames) {
        throw new Error('Invalid box score data');
      }

      return boxScore;
    } catch (error) {
      console.error('Error fetching box score:', error);
      throw error;
    }
  }

  async analyzeGameMatchup(gameId) {
    try {
      const boxScore = await this.getBoxScore(gameId);
      const game = boxScore.Game;
      const teamGames = boxScore.TeamGames;

      if (teamGames.length !== 2) {
        throw new Error('Expected exactly 2 teams in box score');
      }

      const [awayTeam, homeTeam] = teamGames;
      
      // Analyze team performance
      const analysis = {
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
        teamAnalysis: {
          away: this.analyzeTeamPerformance(awayTeam),
          home: this.analyzeTeamPerformance(homeTeam)
        },
        matchup: this.compareTeams(awayTeam, homeTeam),
        gamePlan: this.generateGamePlan(awayTeam, homeTeam)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing game matchup:', error);
      throw error;
    }
  }

  analyzeTeamPerformance(teamData) {
    return {
      basic: {
        points: teamData.Points,
        fieldGoalPercentage: teamData.FieldGoalsPercentage,
        threePointPercentage: teamData.ThreePointersPercentage,
        freeThrowPercentage: teamData.FreeThrowsPercentage,
        rebounds: teamData.Rebounds,
        assists: teamData.Assists,
        steals: teamData.Steals,
        blocks: teamData.BlockedShots,
        turnovers: teamData.Turnovers,
        personalFouls: teamData.PersonalFouls
      },
      advanced: {
        effectiveFieldGoalPercentage: teamData.EffectiveFieldGoalsPercentage,
        trueShootingPercentage: teamData.TrueShootingPercentage,
        offensiveRebounds: teamData.OffensiveRebounds,
        defensiveRebounds: teamData.DefensiveRebounds,
        plusMinus: teamData.PlusMinus,
        possessions: teamData.Possessions
      },
      efficiency: {
        pointsPerPossession: teamData.Points / teamData.Possessions,
        fieldGoalsMade: teamData.FieldGoalsMade,
        fieldGoalsAttempted: teamData.FieldGoalsAttempted,
        threePointersMade: teamData.ThreePointersMade,
        threePointersAttempted: teamData.ThreePointersAttempted,
        freeThrowsMade: teamData.FreeThrowsMade,
        freeThrowsAttempted: teamData.FreeThrowsAttempted
      }
    };
  }

  compareTeams(awayTeam, homeTeam) {
    const advantages = {
      away: [],
      home: []
    };

    const disadvantages = {
      away: [],
      home: []
    };

    // Compare shooting efficiency
    if (awayTeam.FieldGoalsPercentage > homeTeam.FieldGoalsPercentage) {
      advantages.away.push({
        category: 'Shooting',
        stat: 'Field Goal %',
        awayValue: awayTeam.FieldGoalsPercentage,
        homeValue: homeTeam.FieldGoalsPercentage,
        difference: awayTeam.FieldGoalsPercentage - homeTeam.FieldGoalsPercentage
      });
      disadvantages.home.push({
        category: 'Shooting',
        stat: 'Field Goal %',
        awayValue: awayTeam.FieldGoalsPercentage,
        homeValue: homeTeam.FieldGoalsPercentage,
        difference: awayTeam.FieldGoalsPercentage - homeTeam.FieldGoalsPercentage
      });
    } else {
      advantages.home.push({
        category: 'Shooting',
        stat: 'Field Goal %',
        awayValue: awayTeam.FieldGoalsPercentage,
        homeValue: homeTeam.FieldGoalsPercentage,
        difference: homeTeam.FieldGoalsPercentage - awayTeam.FieldGoalsPercentage
      });
      disadvantages.away.push({
        category: 'Shooting',
        stat: 'Field Goal %',
        awayValue: awayTeam.FieldGoalsPercentage,
        homeValue: homeTeam.FieldGoalsPercentage,
        difference: homeTeam.FieldGoalsPercentage - awayTeam.FieldGoalsPercentage
      });
    }

    // Compare 3-point shooting
    if (awayTeam.ThreePointersPercentage > homeTeam.ThreePointersPercentage) {
      advantages.away.push({
        category: 'Shooting',
        stat: '3-Point %',
        awayValue: awayTeam.ThreePointersPercentage,
        homeValue: homeTeam.ThreePointersPercentage,
        difference: awayTeam.ThreePointersPercentage - homeTeam.ThreePointersPercentage
      });
      disadvantages.home.push({
        category: 'Shooting',
        stat: '3-Point %',
        awayValue: awayTeam.ThreePointersPercentage,
        homeValue: homeTeam.ThreePointersPercentage,
        difference: awayTeam.ThreePointersPercentage - homeTeam.ThreePointersPercentage
      });
    } else {
      advantages.home.push({
        category: 'Shooting',
        stat: '3-Point %',
        awayValue: awayTeam.ThreePointersPercentage,
        homeValue: homeTeam.ThreePointersPercentage,
        difference: homeTeam.ThreePointersPercentage - awayTeam.ThreePointersPercentage
      });
      disadvantages.away.push({
        category: 'Shooting',
        stat: '3-Point %',
        awayValue: awayTeam.ThreePointersPercentage,
        homeValue: homeTeam.ThreePointersPercentage,
        difference: homeTeam.ThreePointersPercentage - awayTeam.ThreePointersPercentage
      });
    }

    // Compare rebounding
    if (awayTeam.Rebounds > homeTeam.Rebounds) {
      advantages.away.push({
        category: 'Rebounding',
        stat: 'Total Rebounds',
        awayValue: awayTeam.Rebounds,
        homeValue: homeTeam.Rebounds,
        difference: awayTeam.Rebounds - homeTeam.Rebounds
      });
      disadvantages.home.push({
        category: 'Rebounding',
        stat: 'Total Rebounds',
        awayValue: awayTeam.Rebounds,
        homeValue: homeTeam.Rebounds,
        difference: awayTeam.Rebounds - homeTeam.Rebounds
      });
    } else {
      advantages.home.push({
        category: 'Rebounding',
        stat: 'Total Rebounds',
        awayValue: awayTeam.Rebounds,
        homeValue: homeTeam.Rebounds,
        difference: homeTeam.Rebounds - awayTeam.Rebounds
      });
      disadvantages.away.push({
        category: 'Rebounding',
        stat: 'Total Rebounds',
        awayValue: awayTeam.Rebounds,
        homeValue: homeTeam.Rebounds,
        difference: homeTeam.Rebounds - awayTeam.Rebounds
      });
    }

    // Compare assists
    if (awayTeam.Assists > homeTeam.Assists) {
      advantages.away.push({
        category: 'Playmaking',
        stat: 'Assists',
        awayValue: awayTeam.Assists,
        homeValue: homeTeam.Assists,
        difference: awayTeam.Assists - homeTeam.Assists
      });
      disadvantages.home.push({
        category: 'Playmaking',
        stat: 'Assists',
        awayValue: awayTeam.Assists,
        homeValue: homeTeam.Assists,
        difference: awayTeam.Assists - homeTeam.Assists
      });
    } else {
      advantages.home.push({
        category: 'Playmaking',
        stat: 'Assists',
        awayValue: awayTeam.Assists,
        homeValue: homeTeam.Assists,
        difference: homeTeam.Assists - awayTeam.Assists
      });
      disadvantages.away.push({
        category: 'Playmaking',
        stat: 'Assists',
        awayValue: awayTeam.Assists,
        homeValue: homeTeam.Assists,
        difference: homeTeam.Assists - awayTeam.Assists
      });
    }

    // Compare turnovers
    if (awayTeam.Turnovers < homeTeam.Turnovers) {
      advantages.away.push({
        category: 'Ball Control',
        stat: 'Turnovers',
        awayValue: awayTeam.Turnovers,
        homeValue: homeTeam.Turnovers,
        difference: homeTeam.Turnovers - awayTeam.Turnovers
      });
      disadvantages.home.push({
        category: 'Ball Control',
        stat: 'Turnovers',
        awayValue: awayTeam.Turnovers,
        homeValue: homeTeam.Turnovers,
        difference: homeTeam.Turnovers - awayTeam.Turnovers
      });
    } else {
      advantages.home.push({
        category: 'Ball Control',
        stat: 'Turnovers',
        awayValue: awayTeam.Turnovers,
        homeValue: homeTeam.Turnovers,
        difference: awayTeam.Turnovers - homeTeam.Turnovers
      });
      disadvantages.away.push({
        category: 'Ball Control',
        stat: 'Turnovers',
        awayValue: awayTeam.Turnovers,
        homeValue: homeTeam.Turnovers,
        difference: awayTeam.Turnovers - homeTeam.Turnovers
      });
    }

    return {
      advantages,
      disadvantages
    };
  }

  generateGamePlan(awayTeam, homeTeam) {
    const gamePlan = {
      away: {
        offensive: [],
        defensive: [],
        keys: []
      },
      home: {
        offensive: [],
        defensive: [],
        keys: []
      }
    };

    // Away team game plan
    if (awayTeam.FieldGoalsPercentage > homeTeam.FieldGoalsPercentage) {
      gamePlan.away.offensive.push('Exploit shooting advantage - focus on high-percentage shots');
    } else {
      gamePlan.away.offensive.push('Improve shot selection and ball movement');
    }

    if (awayTeam.ThreePointersPercentage > homeTeam.ThreePointersPercentage) {
      gamePlan.away.offensive.push('Utilize 3-point shooting advantage');
    } else {
      gamePlan.away.offensive.push('Limit 3-point attempts, focus on paint scoring');
    }

    if (awayTeam.Rebounds > homeTeam.Rebounds) {
      gamePlan.away.offensive.push('Crash offensive boards for second-chance points');
    } else {
      gamePlan.away.defensive.push('Box out and limit opponent offensive rebounds');
    }

    if (awayTeam.Assists > homeTeam.Assists) {
      gamePlan.away.offensive.push('Continue ball movement and team play');
    } else {
      gamePlan.away.offensive.push('Improve ball movement and create better shots');
    }

    if (awayTeam.Turnovers < homeTeam.Turnovers) {
      gamePlan.away.keys.push('Maintain ball security');
    } else {
      gamePlan.away.keys.push('Reduce turnovers and improve decision-making');
    }

    // Home team game plan
    if (homeTeam.FieldGoalsPercentage > awayTeam.FieldGoalsPercentage) {
      gamePlan.home.offensive.push('Exploit shooting advantage - focus on high-percentage shots');
    } else {
      gamePlan.home.offensive.push('Improve shot selection and ball movement');
    }

    if (homeTeam.ThreePointersPercentage > awayTeam.ThreePointersPercentage) {
      gamePlan.home.offensive.push('Utilize 3-point shooting advantage');
    } else {
      gamePlan.home.offensive.push('Limit 3-point attempts, focus on paint scoring');
    }

    if (homeTeam.Rebounds > awayTeam.Rebounds) {
      gamePlan.home.offensive.push('Crash offensive boards for second-chance points');
    } else {
      gamePlan.home.defensive.push('Box out and limit opponent offensive rebounds');
    }

    if (homeTeam.Assists > awayTeam.Assists) {
      gamePlan.home.offensive.push('Continue ball movement and team play');
    } else {
      gamePlan.home.offensive.push('Improve ball movement and create better shots');
    }

    if (homeTeam.Turnovers < awayTeam.Turnovers) {
      gamePlan.home.keys.push('Maintain ball security');
    } else {
      gamePlan.home.keys.push('Reduce turnovers and improve decision-making');
    }

    return gamePlan;
  }

  async saveGameAnalysis(gameId, analysis) {
    try {
      // Save to database for future reference
      await prisma.gameAnalysis.upsert({
        where: { gameId: gameId.toString() },
        update: {
          analysis: analysis,
          updatedAt: new Date()
        },
        create: {
          gameId: gameId.toString(),
          analysis: analysis,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`Game analysis saved for game ${gameId}`);
    } catch (error) {
      console.error('Error saving game analysis:', error);
      throw error;
    }
  }
}

module.exports = BoxScoreService; 