const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TeamAnalytics {
  constructor() {
    this.season = '2024-25';
    this.seasonType = 'regular';
  }

  // Get all teams' statistics for comparison
  async getAllTeamsStats() {
    try {
      const allStats = await prisma.teamStatistics.findMany({
        where: {
          season: this.season,
          seasonType: this.seasonType
        },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              key: true,
              conference: true,
              division: true
            }
          }
        }
      });

      // Group by team
      const teamStats = {};
      allStats.forEach(stat => {
        if (!teamStats[stat.teamId]) {
          teamStats[stat.teamId] = {
            team: stat.team,
            stats: {}
          };
        }
        if (!teamStats[stat.teamId].stats[stat.category]) {
          teamStats[stat.teamId].stats[stat.category] = [];
        }
        teamStats[stat.teamId].stats[stat.category].push(stat);
      });

      return teamStats;
    } catch (error) {
      console.error('Error fetching all teams stats:', error);
      throw error;
    }
  }

  // Calculate league averages for each stat
  calculateLeagueAverages(teamStats) {
    const leagueAverages = {};
    
    // Get all unique stat names across all teams
    const allStatNames = new Set();
    Object.values(teamStats).forEach(teamData => {
      Object.values(teamData.stats).forEach(categoryStats => {
        categoryStats.forEach(stat => {
          allStatNames.add(`${stat.category}_${stat.statName}`);
        });
      });
    });

    // Calculate averages for each stat
    allStatNames.forEach(statKey => {
      const [category, statName] = statKey.split('_');
      const values = [];
      
      Object.values(teamStats).forEach(teamData => {
        const categoryStats = teamData.stats[category] || [];
        const stat = categoryStats.find(s => s.statName === statName);
        if (stat && stat.value !== null && !isNaN(stat.value)) {
          values.push(stat.value);
        }
      });

      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        leagueAverages[statKey] = average;
      }
    });

    return leagueAverages;
  }

  // Analyze team strengths and weaknesses
  analyzeTeamPerformance(teamId, teamStats, leagueAverages) {
    const teamData = teamStats[teamId];
    if (!teamData) return null;

    const analysis = {
      team: teamData.team,
      strengths: [],
      weaknesses: [],
      keyMetrics: {},
      overallGrade: 'C',
      sleeperPotential: 'Low'
    };

    const strengths = [];
    const weaknesses = [];
    const keyMetrics = {};

    // Analyze each category
    Object.entries(teamData.stats).forEach(([category, stats]) => {
      stats.forEach(stat => {
        const statKey = `${category}_${stat.statName}`;
        const leagueAvg = leagueAverages[statKey];
        
        if (leagueAvg !== undefined && stat.value !== null) {
          const percentageDiff = ((stat.value - leagueAvg) / leagueAvg) * 100;
          
          // Store key metrics
          keyMetrics[stat.statName] = {
            value: stat.value,
            displayValue: stat.displayValue,
            leagueAverage: leagueAvg,
            percentageDiff: percentageDiff,
            category: category,
            description: stat.description
          };

          // Determine if it's a strength or weakness
          if (percentageDiff > 10) {
            strengths.push({
              stat: stat.displayName,
              value: stat.displayValue,
              percentageDiff: percentageDiff,
              category: category
            });
          } else if (percentageDiff < -10) {
            weaknesses.push({
              stat: stat.displayName,
              value: stat.displayValue,
              percentageDiff: percentageDiff,
              category: category
            });
          }
        }
      });
    });

    analysis.strengths = strengths.slice(0, 5); // Top 5 strengths
    analysis.weaknesses = weaknesses.slice(0, 5); // Top 5 weaknesses
    analysis.keyMetrics = keyMetrics;

    // Calculate overall grade
    const strengthScore = strengths.length * 2;
    const weaknessScore = weaknesses.length * 1;
    const totalScore = strengthScore - weaknessScore;
    
    if (totalScore >= 6) analysis.overallGrade = 'A';
    else if (totalScore >= 3) analysis.overallGrade = 'B';
    else if (totalScore >= 0) analysis.overallGrade = 'C';
    else if (totalScore >= -3) analysis.overallGrade = 'D';
    else analysis.overallGrade = 'F';

    // Determine sleeper potential
    const offensiveStats = teamData.stats.offensive || [];
    const defensiveStats = teamData.stats.defensive || [];
    
    const scoringEfficiency = offensiveStats.find(s => s.statName === 'scoringEfficiency')?.value || 0;
    const shootingEfficiency = offensiveStats.find(s => s.statName === 'shootingEfficiency')?.value || 0;
    
    // Use scoring efficiency as the primary metric for sleeper detection
    if (scoringEfficiency > 1.25 && shootingEfficiency > 0.52) {
      analysis.sleeperPotential = 'High';
    } else if (scoringEfficiency > 1.20 || shootingEfficiency > 0.50) {
      analysis.sleeperPotential = 'Medium';
    } else {
      analysis.sleeperPotential = 'Low';
    }

    return analysis;
  }

  // Compare two teams
  compareTeams(team1Id, team2Id, teamStats, leagueAverages) {
    const team1Analysis = this.analyzeTeamPerformance(team1Id, teamStats, leagueAverages);
    const team2Analysis = this.analyzeTeamPerformance(team2Id, teamStats, leagueAverages);
    
    if (!team1Analysis || !team2Analysis) return null;

    const comparison = {
      team1: team1Analysis,
      team2: team2Analysis,
      headToHead: {},
      advantages: {
        team1: [],
        team2: []
      }
    };

    // Compare key metrics
    const keyMetrics = ['points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'efficiency'];
    
    keyMetrics.forEach(metric => {
      const team1Metric = team1Analysis.keyMetrics[metric];
      const team2Metric = team2Analysis.keyMetrics[metric];
      
      if (team1Metric && team2Metric) {
        const diff = team1Metric.value - team2Metric.value;
        const percentageDiff = ((diff) / team2Metric.value) * 100;
        
        comparison.headToHead[metric] = {
          team1Value: team1Metric.displayValue,
          team2Value: team2Metric.displayValue,
          difference: diff,
          percentageDiff: percentageDiff,
          advantage: diff > 0 ? 'team1' : 'team2'
        };

        if (Math.abs(percentageDiff) > 5) {
          if (percentageDiff > 0) {
            comparison.advantages.team1.push({
              metric: metric,
              advantage: `${percentageDiff.toFixed(1)}% better ${metric}`
            });
          } else {
            comparison.advantages.team2.push({
              metric: metric,
              advantage: `${Math.abs(percentageDiff).toFixed(1)}% better ${metric}`
            });
          }
        }
      }
    });

    return comparison;
  }

  // Get conference rivals for a team
  async getConferenceRivals(teamId) {
    try {
      const team = await prisma.team.findUnique({
        where: { id: parseInt(teamId) },
        select: { conference: true, division: true }
      });

      if (!team) return [];

      const rivals = await prisma.team.findMany({
        where: {
          conference: team.conference,
          id: { not: parseInt(teamId) }
        },
        select: {
          id: true,
          name: true,
          key: true,
          division: true
        },
        orderBy: { name: 'asc' }
      });

      return rivals;
    } catch (error) {
      console.error('Error fetching conference rivals:', error);
      return [];
    }
  }

  // Get sleeper teams (teams with high potential but underrated)
  async getSleeperTeams(teamStats, leagueAverages) {
    const sleeperAnalysis = [];

    Object.entries(teamStats).forEach(([teamId, teamData]) => {
      const analysis = this.analyzeTeamPerformance(teamId, teamStats, leagueAverages);
      
      if (analysis && (analysis.sleeperPotential === 'High' || analysis.sleeperPotential === 'Medium')) {
        sleeperAnalysis.push({
          team: analysis.team,
          grade: analysis.overallGrade,
          sleeperPotential: analysis.sleeperPotential,
          strengths: analysis.strengths.slice(0, 3),
          keyInsight: this.generateSleeperInsight(analysis)
        });
      }
    });

    return sleeperAnalysis.sort((a, b) => {
      // Sort by sleeper potential first (High > Medium), then by grade
      const potentialOrder = { 'High': 2, 'Medium': 1, 'Low': 0 };
      const gradeOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
      
      if (potentialOrder[a.sleeperPotential] !== potentialOrder[b.sleeperPotential]) {
        return potentialOrder[b.sleeperPotential] - potentialOrder[a.sleeperPotential];
      }
      return gradeOrder[b.grade] - gradeOrder[a.grade];
    });
  }

  // Generate insight for sleeper teams
  generateSleeperInsight(analysis) {
    const keyMetrics = analysis.keyMetrics;
    
    const highScoringEfficiency = keyMetrics.scoringEfficiency?.value > 1.25;
    const highShootingEfficiency = keyMetrics.shootingEfficiency?.value > 0.52;
    const lowTurnovers = keyMetrics.avgTurnovers?.value < 13;
    const goodRebounding = keyMetrics.avgRebounds?.percentageDiff > 0;
    
    if (highScoringEfficiency && highShootingEfficiency) {
      return "Excellent scoring and shooting efficiency - this team converts opportunities at a high rate";
    } else if (highScoringEfficiency && lowTurnovers) {
      return "High scoring efficiency with low turnovers - this team executes well and takes care of the ball";
    } else if (goodRebounding && highScoringEfficiency) {
      return "Strong rebounding combined with efficient scoring - controls possessions and converts them";
    } else if (lowTurnovers && goodRebounding) {
      return "Low turnovers and strong rebounding - minimizes opponent opportunities and maximizes possessions";
    } else {
      return "Balanced performance with room for improvement";
    }
  }

  // Get team trend analysis (improving/declining)
  async getTeamTrends(teamId) {
    try {
      // This would require historical data, but for now we'll provide a basic analysis
      const currentStats = await prisma.teamStatistics.findMany({
        where: {
          teamId: teamId,
          season: this.season,
          seasonType: this.seasonType
        }
      });

      // For now, return a basic trend analysis
      return {
        trend: 'Stable',
        insight: 'Team performance is consistent with league averages',
        keyAreas: ['Offensive efficiency', 'Defensive rebounding', 'Turnover management']
      };
    } catch (error) {
      console.error('Error analyzing team trends:', error);
      return null;
    }
  }
}

module.exports = TeamAnalytics; 