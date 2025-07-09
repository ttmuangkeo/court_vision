const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = `https://api.sportsdata.io/v3/nba/scores/json/AllTeams?key=${process.env.SPORTSDATA_API_KEY}`;

class SportsdataTeamSyncService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchTeams() {
    const response = await axios.get(API_URL);
    return response.data;
  }

  transformTeamData(team) {
    return {
      id: team.TeamID,
      key: team.Key,
      active: team.Active,
      city: team.City,
      name: team.Name,
      leagueId: team.LeagueID,
      stadiumId: team.StadiumID,
      conference: team.Conference,
      division: team.Division,
      primaryColor: team.PrimaryColor,
      secondaryColor: team.SecondaryColor,
      tertiaryColor: team.TertiaryColor,
      quaternaryColor: team.QuaternaryColor,
      wikipediaLogoUrl: team.WikipediaLogoUrl,
      wikipediaWordMarkUrl: team.WikipediaWordMarkUrl,
      globalTeamId: team.GlobalTeamID,
      nbaDotComTeamId: team.NbaDotComTeamID,
      headCoach: team.HeadCoach,
      updatedAt: new Date(),
    };
  }

  async syncAllTeams() {
    const teams = await this.fetchTeams();
    let synced = 0, failed = 0;
    for (const team of teams) {
      const data = this.transformTeamData(team);
      try {
        await this.prisma.team.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        });
        synced++;
        console.log(`✅ Synced: ${data.name} (${data.key})`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed to sync team ${data.name}:`, err.message);
      }
    }
    await this.prisma.$disconnect();
    return { synced, failed };
  }
}

module.exports = SportsdataTeamSyncService; 