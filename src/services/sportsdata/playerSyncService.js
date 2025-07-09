const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = 'https://api.sportsdata.io/v3/nba/scores/json/PlayersBasic';
const API_KEY = process.env.SPORTSDATA_API_KEY;

class SportsdataPlayerSyncService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchPlayers(teamAbbr) {
    const url = `${API_URL}/${teamAbbr}?key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data;
  }

  transformPlayerData(player) {
    return {
      id: player.PlayerID,
      status: player.Status,
      teamId: player.TeamID,
      jersey: player.Jersey,
      position: player.Position,
      positionCategory: player.PositionCategory,
      firstName: player.FirstName,
      lastName: player.LastName,
      birthDate: player.BirthDate ? new Date(player.BirthDate) : null,
      birthCity: player.BirthCity,
      birthState: player.BirthState,
      birthCountry: player.BirthCountry,
      globalTeamId: player.GlobalTeamID,
      height: player.Height,
      weight: player.Weight,
      highSchool: player.HighSchool,
      college: player.College,
      salary: player.Salary,
      photoUrl: player.PhotoUrl,
      experience: player.Experience,
      sportRadarPlayerId: player.SportRadarPlayerID,
      rotoworldPlayerId: player.RotoworldPlayerID,
      rotoWirePlayerId: player.RotoWirePlayerID,
      fantasyAlarmPlayerId: player.FantasyAlarmPlayerID,
      statsPlayerId: player.StatsPlayerID,
      sportsDirectPlayerId: player.SportsDirectPlayerID,
      xmlTeamPlayerId: player.XmlTeamPlayerID,
      injuryStatus: player.InjuryStatus,
      injuryBodyPart: player.InjuryBodyPart,
      injuryStartDate: player.InjuryStartDate ? new Date(player.InjuryStartDate) : null,
      injuryNotes: player.InjuryNotes,
      fanDuelPlayerId: player.FanDuelPlayerID,
      draftKingsPlayerId: player.DraftKingsPlayerID,
      yahooPlayerId: player.YahooPlayerID,
      fanDuelName: player.FanDuelName,
      draftKingsName: player.DraftKingsName,
      yahooName: player.YahooName,
      depthChartPosition: player.DepthChartPosition,
      depthChartOrder: player.DepthChartOrder,
      fantasyDraftName: player.FantasyDraftName,
      fantasyDraftPlayerId: player.FantasyDraftPlayerID,
      usaTodayPlayerId: player.UsaTodayPlayerID,
      usaTodayHeadshotUrl: player.UsaTodayHeadshotUrl,
      usaTodayHeadshotNoBackgroundUrl: player.UsaTodayHeadshotNoBackgroundUrl,
      usaTodayHeadshotUpdated: player.UsaTodayHeadshotUpdated ? new Date(player.UsaTodayHeadshotUpdated) : null,
      usaTodayHeadshotNoBackgroundUpdated: player.UsaTodayHeadshotNoBackgroundUpdated ? new Date(player.UsaTodayHeadshotNoBackgroundUpdated) : null,
      nbaDotComPlayerId: player.NbaDotComPlayerID,
      updatedAt: new Date(),
    };
  }

  async syncPlayersForTeam(teamAbbr) {
    const players = await this.fetchPlayers(teamAbbr);
    let synced = 0, failed = 0;
    for (const player of players) {
      const data = this.transformPlayerData(player);
      try {
        await this.prisma.player.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        });
        synced++;
        console.log(`✅ Synced: ${data.firstName} ${data.lastName} (${data.id})`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed to sync player ${data.firstName} ${data.lastName}:`, err.message);
      }
    }
    await this.prisma.$disconnect();
    return { synced, failed };
  }
}

module.exports = SportsdataPlayerSyncService; 