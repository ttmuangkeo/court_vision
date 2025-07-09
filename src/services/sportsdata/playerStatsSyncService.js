const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = 'https://api.sportsdata.io/v3/nba/stats/json/PlayerSeasonStats';
const API_KEY = process.env.SPORTSDATA_API_KEY;

class SportsdataPlayerStatsSyncService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchPlayerSeasonStats(season) {
    const url = `${API_URL}/${season}?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  }

  transformStatData(stat) {
    return {
      id: stat.StatID,
      playerId: stat.PlayerID,
      teamId: stat.TeamID,
      season: stat.Season,
      seasonType: stat.SeasonType,
      name: stat.Name,
      position: stat.Position,
      started: stat.Started,
      games: stat.Games,
      minutes: stat.Minutes,
      seconds: stat.Seconds,
      fieldGoalsMade: stat.FieldGoalsMade,
      fieldGoalsAttempted: stat.FieldGoalsAttempted,
      fieldGoalsPercentage: stat.FieldGoalsPercentage,
      effectiveFieldGoalsPercentage: stat.EffectiveFieldGoalsPercentage,
      twoPointersMade: stat.TwoPointersMade,
      twoPointersAttempted: stat.TwoPointersAttempted,
      twoPointersPercentage: stat.TwoPointersPercentage,
      threePointersMade: stat.ThreePointersMade,
      threePointersAttempted: stat.ThreePointersAttempted,
      threePointersPercentage: stat.ThreePointersPercentage,
      freeThrowsMade: stat.FreeThrowsMade,
      freeThrowsAttempted: stat.FreeThrowsAttempted,
      freeThrowsPercentage: stat.FreeThrowsPercentage,
      offensiveRebounds: stat.OffensiveRebounds,
      defensiveRebounds: stat.DefensiveRebounds,
      rebounds: stat.Rebounds,
      offensiveReboundsPercentage: stat.OffensiveReboundsPercentage,
      defensiveReboundsPercentage: stat.DefensiveReboundsPercentage,
      totalReboundsPercentage: stat.TotalReboundsPercentage,
      assists: stat.Assists,
      steals: stat.Steals,
      blockedShots: stat.BlockedShots,
      turnovers: stat.Turnovers,
      personalFouls: stat.PersonalFouls,
      points: stat.Points,
      trueShootingAttempts: stat.TrueShootingAttempts,
      trueShootingPercentage: stat.TrueShootingPercentage,
      playerEfficiencyRating: stat.PlayerEfficiencyRating,
      assistsPercentage: stat.AssistsPercentage,
      stealsPercentage: stat.StealsPercentage,
      blocksPercentage: stat.BlocksPercentage,
      turnOversPercentage: stat.TurnOversPercentage,
      usageRatePercentage: stat.UsageRatePercentage,
      fantasyPoints: stat.FantasyPoints,
      fantasyPointsFanDuel: stat.FantasyPointsFanDuel,
      fantasyPointsDraftKings: stat.FantasyPointsDraftKings,
      fantasyPointsYahoo: stat.FantasyPointsYahoo,
      plusMinus: stat.PlusMinus,
      doubleDoubles: stat.DoubleDoubles,
      tripleDoubles: stat.TripleDoubles,
      fantasyPointsFantasyDraft: stat.FantasyPointsFantasyDraft,
      isClosed: stat.IsClosed,
      lineupStatus: stat.LineupStatus,
      updated: stat.Updated ? new Date(stat.Updated) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async syncPlayerSeasonStats(season) {
    const stats = await this.fetchPlayerSeasonStats(season);
    let synced = 0, failed = 0;
    for (const stat of stats) {
      const data = this.transformStatData(stat);
      // Check if player exists
      const playerExists = await this.prisma.player.findUnique({ where: { id: data.playerId } });
      if (!playerExists) {
        failed++;
        console.warn(`⚠️  Skipping stat for missing player ${data.playerId}`);
        continue;
      }
      try {
        await this.prisma.playerSeasonStat.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        });
        synced++;
        console.log(`✅ Synced: PlayerStat ${data.id} (Player ${data.playerId}, Team ${data.teamId})`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed to sync player stat ${data.id}:`, err.message);
      }
    }
    await this.prisma.$disconnect();
    return { synced, failed };
  }
}

module.exports = SportsdataPlayerStatsSyncService; 