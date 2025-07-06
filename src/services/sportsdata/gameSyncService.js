const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = 'https://api.sportsdata.io/v3/nba/scores/json/Games';
const API_KEY = '05d3364a5d5f40e59de209a8100ea36f';

class SportsdataGameSyncService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchGames(season) {
    const url = `${API_URL}/${season}?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  }

  transformGameData(game) {
    return {
      id: game.GameID,
      season: game.Season,
      seasonType: game.SeasonType,
      status: game.Status,
      day: game.Day ? new Date(game.Day) : null,
      dateTime: game.DateTime ? new Date(game.DateTime) : null,
      dateTimeUTC: game.DateTimeUTC ? new Date(game.DateTimeUTC) : null,
      homeTeamId: game.HomeTeamID,
      awayTeamId: game.AwayTeamID,
      stadiumId: game.StadiumID,
      channel: game.Channel,
      attendance: game.Attendance,
      homeTeamScore: game.HomeTeamScore,
      awayTeamScore: game.AwayTeamScore,
      isClosed: game.IsClosed,
      gameEndDateTime: game.GameEndDateTime ? new Date(game.GameEndDateTime) : null,
      updated: game.Updated ? new Date(game.Updated) : null,
      quarter: game.Quarter,
      timeRemainingMinutes: game.TimeRemainingMinutes,
      timeRemainingSeconds: game.TimeRemainingSeconds,
      pointSpread: game.PointSpread,
      overUnder: game.OverUnder,
      awayTeamMoneyLine: game.AwayTeamMoneyLine,
      homeTeamMoneyLine: game.HomeTeamMoneyLine,
      lastPlay: game.LastPlay,
      globalGameId: game.GlobalGameID,
      globalAwayTeamId: game.GlobalAwayTeamID,
      globalHomeTeamId: game.GlobalHomeTeamID,
      homeRotationNumber: game.HomeRotationNumber,
      awayRotationNumber: game.AwayRotationNumber,
      neutralVenue: game.NeutralVenue,
      crewChiefId: game.CrewChiefID,
      umpireId: game.UmpireID,
      refereeId: game.RefereeID,
      inseasonTournament: game.InSeasonTournament,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async syncGamesForSeason(season) {
    const games = await this.fetchGames(season);
    let synced = 0, failed = 0;
    for (const game of games) {
      const data = this.transformGameData(game);
      try {
        await this.prisma.game.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        });
        synced++;
        console.log(`✅ Synced: Game ${data.id} (${data.homeTeamId} vs ${data.awayTeamId})`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed to sync game ${data.id}:`, err.message);
      }
    }
    await this.prisma.$disconnect();
    return { synced, failed };
  }
}

module.exports = SportsdataGameSyncService; 