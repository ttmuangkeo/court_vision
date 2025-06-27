const axios = require('axios');
const prisma = require('../../db/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

class PlayerSyncService {
  constructor() {
    this.apiBase = ESPN_API_BASE;
  }

  async fetchTeamsFromESPN() {
    try {
      console.log('Fetching teams from ESPN...');
      const response = await axios.get(`${this.apiBase}/teams`);
      const teams = response.data.sports[0].leagues[0].teams;
      console.log(`Found ${teams.length} teams from ESPN`);
      return teams;
    } catch (error) {
      console.error('Error fetching teams from ESPN:', error.message);
      throw error;
    }
  }

  async fetchTeamRoster(teamId) {
    try {
      const response = await axios.get(`${this.apiBase}/teams/${teamId}/roster`);
      return response.data.athletes || [];
    } catch (error) {
      console.error(`Error fetching roster for team ${teamId}:`, error.message);
      return [];
    }
  }

  async syncPlayer(espnPlayer, teamEspnId) {
    try {
      // Find existing player by ESPN ID (now the primary key)
      const existingPlayer = await prisma.player.findUnique({
        where: { espnId: espnPlayer.id }
      });

      // Convert ESPN data to match our schema
      const playerData = {
        espnUid: espnPlayer.uid,
        espnSlug: espnPlayer.slug,
        name: espnPlayer.displayName,
        firstName: espnPlayer.firstName,
        lastName: espnPlayer.lastName,
        shortName: espnPlayer.shortName,
        fullName: espnPlayer.fullName,
        position: espnPlayer.position?.abbreviation || espnPlayer.position?.name,
        teamEspnId: teamEspnId, // Use ESPN team ID
        jerseyNumber: espnPlayer.jersey,
        height: espnPlayer.height ? String(espnPlayer.height) : null, // Convert to string
        weight: espnPlayer.weight || null,
        displayHeight: espnPlayer.displayHeight,
        displayWeight: espnPlayer.displayWeight,
        age: espnPlayer.age || null,
        experience: espnPlayer.experience?.years || null,
        dateOfBirth: espnPlayer.dateOfBirth ? new Date(espnPlayer.dateOfBirth) : null,
        birthPlace: (typeof espnPlayer.birthPlace === 'string')
          ? espnPlayer.birthPlace
          : (espnPlayer.birthPlace && typeof espnPlayer.birthPlace === 'object')
            ? Object.values(espnPlayer.birthPlace).filter(Boolean).join(', ')
            : null,
        debutYear: espnPlayer.debutYear || null,
        headshot: espnPlayer.headshot?.href || null,
        status: espnPlayer.status?.name || null,
        injuries: espnPlayer.injuries || null,
        contract: espnPlayer.contract || null,
        contracts: espnPlayer.contracts || null,
        alternateIds: espnPlayer.alternateIds || null,
        espnLinks: espnPlayer.links || null,
        lastSynced: new Date()
      };

      if (existingPlayer) {
        // Update existing player
        await prisma.player.update({
          where: { espnId: espnPlayer.id },
          data: playerData
        });
        return { action: 'updated', player: espnPlayer.displayName };
      } else {
        // Create new player
        await prisma.player.create({
          data: {
            espnId: espnPlayer.id, // ESPN ID as primary key
            ...playerData
          }
        });
        return { action: 'synced', player: espnPlayer.displayName };
      }
    } catch (error) {
      console.error(`Error syncing player ${espnPlayer.displayName}:`, error.message);
      throw error;
    }
  }

  async syncTeamPlayers(team) {
    try {
      console.log(`\n🔄 Syncing players for ${team.team.displayName}...`);
      
      const roster = await this.fetchTeamRoster(team.team.id);
      console.log(`Found ${roster.length} players in roster`);
      
      let syncedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const player of roster) {
        try {
          const result = await this.syncPlayer(player, team.team.id);
          if (result.action === 'synced') {
            syncedCount++;
          } else {
            updatedCount++;
          }
          console.log(`  ${result.action}: ${result.player}`);
        } catch (error) {
          errorCount++;
          console.error(`  ❌ Failed to sync ${player.displayName}:`, error.message);
        }
      }

      return {
        team: team.team.displayName,
        synced: syncedCount,
        updated: updatedCount,
        errors: errorCount,
        total: roster.length
      };
    } catch (error) {
      console.error(`Error syncing team ${team.team.displayName}:`, error.message);
      throw error;
    }
  }

  async syncAllPlayers() {
    try {
      console.log('🔄 Starting ESPN Player Sync for All Teams...\n');
      
      const teams = await this.fetchTeamsFromESPN();
      console.log(`Found ${teams.length} teams to process\n`);
      
      let totalSynced = 0;
      let totalUpdated = 0;
      let totalErrors = 0;
      const results = [];

      for (const team of teams) {
        try {
          const result = await this.syncTeamPlayers(team);
          results.push(result);
          totalSynced += result.synced;
          totalUpdated += result.updated;
          totalErrors += result.errors;
        } catch (error) {
          console.error(`❌ Failed to sync team ${team.team.displayName}:`, error.message);
          totalErrors++;
        }
      }

      console.log('\n📈 Player Sync Summary:');
      console.log(`✅ Total Synced: ${totalSynced}`);
      console.log(`🔄 Total Updated: ${totalUpdated}`);
      console.log(`❌ Total Errors: ${totalErrors}`);
      console.log(`📊 Teams Processed: ${teams.length}`);

      return {
        totalSynced,
        totalUpdated,
        totalErrors,
        teamsProcessed: teams.length,
        results
      };
    } catch (error) {
      console.error('❌ Player sync failed:', error);
      throw error;
    }
  }

  async getSyncStatus() {
    try {
      const totalPlayers = await prisma.player.count();
      const playersSyncedToday = await prisma.player.count({
        where: {
          lastSynced: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      return {
        status: {
          total: totalPlayers,
          withEspnId: totalPlayers, // All players now have espnId as primary key
          syncedToday: playersSyncedToday,
          missingEspnId: 0 // No players can be missing espnId since it's the primary key
        }
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
}

module.exports = PlayerSyncService; 