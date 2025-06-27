const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba';

class AthleteSyncService {
  constructor() {
    this.apiBase = CORE_API_BASE;
    this.prisma = new PrismaClient();
  }

  async fetchAthletesPage(pageIndex = 0, pageSize = 25) {
    try {
      const url = `${this.apiBase}/athletes?pageIndex=${pageIndex}&pageSize=${pageSize}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching athletes page ${pageIndex}:`, error.message);
      return null;
    }
  }

  async fetchAthleteDetails(athleteRef) {
    try {
      const response = await axios.get(athleteRef);
      return response.data;
    } catch (error) {
      console.error(`Error fetching athlete details:`, error.message);
      return null;
    }
  }

  async fetchAthleteStatistics(athleteId) {
    try {
      const response = await axios.get(`${this.apiBase}/athletes/${athleteId}/statistics`);
      return response.data;
    } catch (error) {
      // Statistics might not be available for all athletes
      return null;
    }
  }

  transformAthleteData(athleteData, statsData = null) {
    // Handle college field - it can be a string, object with name, or object with $ref
    let collegeName = null;
    if (athleteData.college) {
      if (typeof athleteData.college === 'string') {
        collegeName = athleteData.college;
      } else if (athleteData.college.name) {
        collegeName = athleteData.college.name;
      } else if (athleteData.college.$ref) {
        // Extract college name from the reference URL
        const collegeId = athleteData.college.$ref.split('/').pop().split('?')[0];
        collegeName = `College ID: ${collegeId}`;
      }
    }

    // Handle experience field - can be an object with years, a number, or null
    let experienceValue = null;
    if (athleteData.experience) {
      if (typeof athleteData.experience === 'object' && athleteData.experience !== null && 'years' in athleteData.experience) {
        experienceValue = typeof athleteData.experience.years === 'number' ? athleteData.experience.years : null;
      } else if (typeof athleteData.experience === 'number') {
        experienceValue = athleteData.experience;
      }
    }

    return {
      espnId: athleteData.id,
      name: athleteData.displayName,
      firstName: athleteData.firstName,
      lastName: athleteData.lastName,
      fullName: athleteData.fullName,
      shortName: athleteData.shortName,
      position: athleteData.position?.abbreviation || null,
      teamEspnId: athleteData.team?.id || null,
      height: athleteData.displayHeight || null,
      weight: athleteData.weight || null,
      displayWeight: athleteData.displayWeight || null,
      birthDate: athleteData.dateOfBirth ? new Date(athleteData.dateOfBirth) : null,
      college: collegeName,
      jerseyNumber: athleteData.jersey || null,
      age: athleteData.age || null,
      experience: experienceValue,
      active: athleteData.active || false,
      status: athleteData.status?.name || athleteData.status || null,
      slug: athleteData.slug || null,
      birthPlace: athleteData.birthPlace ? JSON.stringify(athleteData.birthPlace) : null,
      headshot: athleteData.headshot?.href || athleteData.headshot || null,
      // Additional fields from Core API
      espnUid: athleteData.uid || null,
      espnGuid: athleteData.guid || null,
      alternateIds: athleteData.alternateIds ? JSON.stringify(athleteData.alternateIds) : null,
      collegeAthlete: athleteData.collegeAthlete ? true : false,
      contracts: athleteData.contracts ? JSON.stringify(athleteData.contracts) : null,
      // Statistics flag
      hasStatistics: !!statsData,
      lastSynced: new Date()
    };
  }

  async syncAthlete(athleteRef, statsData = null) {
    try {
      const athleteDetails = await this.fetchAthleteDetails(athleteRef);
      if (!athleteDetails) {
        return { success: false, error: 'Could not fetch athlete details' };
      }

      const transformedData = this.transformAthleteData(athleteDetails, statsData);

      // Upsert the athlete
      const athlete = await this.prisma.player.upsert({
        where: { espnId: transformedData.espnId },
        update: transformedData,
        create: transformedData
      });

      return { success: true, athlete };
    } catch (error) {
      console.error(`Error syncing athlete:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async syncAllAthletes() {
    console.log('🏀 Starting NBA Athletes Sync from Core API...');
    console.log('='.repeat(60));

    let totalAthletes = 0;
    let syncedAthletes = 0;
    let failedAthletes = 0;
    let activeAthletes = 0;
    let inactiveAthletes = 0;

    try {
      // Get first page to determine total count
      const firstPage = await this.fetchAthletesPage(0, 25);
      if (!firstPage) {
        throw new Error('Could not fetch first page of athletes');
      }

      totalAthletes = firstPage.count;
      const totalPages = firstPage.pageCount;

      console.log(`📊 Found ${totalAthletes} athletes across ${totalPages} pages`);
      console.log(`📄 Syncing ${totalPages} pages...`);

      // Process all pages
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        console.log(`\n📄 Processing page ${pageIndex + 1}/${totalPages}...`);
        
        const pageData = await this.fetchAthletesPage(pageIndex, 25);
        if (!pageData || !pageData.items) {
          console.log(`  ⚠️  Skipping page ${pageIndex + 1} - no data`);
          continue;
        }

        console.log(`  👥 Found ${pageData.items.length} athletes on this page`);

        // Process each athlete on this page
        for (let i = 0; i < pageData.items.length; i++) {
          const athleteRef = pageData.items[i];
          const athleteNumber = pageIndex * 25 + i + 1;
          
          console.log(`    👤 [${athleteNumber}/${totalAthletes}] Processing athlete...`);
          
          // Fetch statistics for this athlete
          let statsData = null;
          try {
            const athleteId = athleteRef.$ref.split('/').pop().split('?')[0];
            statsData = await this.fetchAthleteStatistics(athleteId);
          } catch (error) {
            // Statistics not available, continue without them
          }

          // Sync the athlete
          const result = await this.syncAthlete(athleteRef.$ref, statsData);
          
          if (result.success) {
            syncedAthletes++;
            if (result.athlete.active) {
              activeAthletes++;
            } else {
              inactiveAthletes++;
            }
            console.log(`      ✅ Synced: ${result.athlete.name} (${result.athlete.active ? 'Active' : 'Inactive'})`);
          } else {
            failedAthletes++;
            console.log(`      ❌ Failed: ${result.error}`);
          }

          // Small delay to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Progress update
        const progress = ((pageIndex + 1) / totalPages * 100).toFixed(1);
        console.log(`  📈 Progress: ${progress}% (${syncedAthletes} synced, ${failedAthletes} failed)`);
      }

      // Final summary
      console.log('\n' + '='.repeat(60));
      console.log('🎉 Athletes Sync Complete!');
      console.log(`📊 Summary:`);
      console.log(`  - Total athletes found: ${totalAthletes}`);
      console.log(`  - Successfully synced: ${syncedAthletes}`);
      console.log(`  - Failed to sync: ${failedAthletes}`);
      console.log(`  - Active athletes: ${activeAthletes}`);
      console.log(`  - Inactive athletes: ${inactiveAthletes}`);

      return {
        totalAthletes,
        syncedAthletes,
        failedAthletes,
        activeAthletes,
        inactiveAthletes
      };

    } catch (error) {
      console.error('❌ Athletes sync failed:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getSyncSummary() {
    try {
      const totalPlayers = await this.prisma.player.count();
      const activePlayers = await this.prisma.player.count({
        where: { active: true }
      });
      const inactivePlayers = await this.prisma.player.count({
        where: { active: false }
      });

      const recentPlayers = await this.prisma.player.findMany({
        take: 5,
        orderBy: { lastSynced: 'desc' },
        select: {
          name: true,
          position: true,
          active: true,
          lastSynced: true
        }
      });

      return {
        totalPlayers,
        activePlayers,
        inactivePlayers,
        recentPlayers
      };
    } catch (error) {
      console.error('Error getting sync summary:', error.message);
      return null;
    }
  }
}

module.exports = AthleteSyncService; 