const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba';

class TeamSyncService {
  constructor() {
    this.apiBase = CORE_API_BASE;
    this.prisma = new PrismaClient();
  }

  async fetchTeams() {
    try {
      const url = `${this.apiBase}/teams`;
      const response = await axios.get(url);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching teams from Core API:', error.message);
      return [];
    }
  }

  async fetchTeamDetails(teamRef) {
    try {
      const response = await axios.get(teamRef);
      return response.data;
    } catch (error) {
      console.error('Error fetching team details:', error.message);
      return null;
    }
  }

  transformTeamData(teamData) {
    return {
      espnId: teamData.id,
      abbreviation: teamData.abbreviation,
      name: teamData.displayName || teamData.name,
      city: teamData.location || '',
      conference: teamData.conference?.name || '',
      division: teamData.division?.name || '',
      primaryColor: teamData.color || null,
      alternateColor: teamData.alternateColor || null,
      logoUrl: teamData.logos?.[0]?.href || null,
      logoDarkUrl: teamData.logos?.[1]?.href || null,
      logoScoreboardUrl: teamData.logos?.[2]?.href || null,
      espnUid: teamData.uid || null,
      espnSlug: teamData.slug || null,
      displayName: teamData.displayName || null,
      shortDisplayName: teamData.shortDisplayName || null,
      nickname: teamData.nickname || null,
      isActive: teamData.active !== false,
      isAllStar: teamData.isAllStarTeam || false,
      espnLinks: teamData.links ? JSON.stringify(teamData.links) : null,
      lastSynced: new Date()
    };
  }

  async syncAllTeams() {
    console.log('🏀 Starting NBA Teams Sync from Core API...');
    const teamRefs = await this.fetchTeams();
    let synced = 0;
    let failed = 0;
    for (const ref of teamRefs) {
      const teamData = await this.fetchTeamDetails(ref.$ref);
      if (!teamData) {
        failed++;
        continue;
      }
      const transformed = this.transformTeamData(teamData);
      try {
        await this.prisma.team.upsert({
          where: { espnId: transformed.espnId },
          update: transformed,
          create: transformed
        });
        synced++;
        console.log(`  ✅ Synced: ${transformed.name} (${transformed.abbreviation})`);
      } catch (error) {
        failed++;
        console.error(`  ❌ Failed to sync team ${transformed.name}:`, error.message);
      }
    }
    console.log(`\n🎉 Teams Sync Complete! Synced: ${synced}, Failed: ${failed}`);
    await this.prisma.$disconnect();
    return { synced, failed };
  }
}

module.exports = TeamSyncService; 