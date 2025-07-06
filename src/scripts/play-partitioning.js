const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class PlayPartitioningService {
  constructor(options = {}) {
    this.options = {
      archiveThreshold: options.archiveThreshold || 2, // Archive seasons older than 2 years
      partitionBySeason: options.partitionBySeason || true,
      ...options
    };
  }

  /**
   * Get play statistics by season
   */
  async getPlayStatsBySeason() {
    const stats = await prisma.$queryRaw`
      SELECT 
        season,
        COUNT(*) as play_count,
        MIN(created_at) as first_play,
        MAX(created_at) as last_play
      FROM plays 
      WHERE season IS NOT NULL
      GROUP BY season 
      ORDER BY season DESC
    `;
    
    return stats;
  }

  /**
   * Get current season
   */
  getCurrentSeason() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // NBA season typically starts in October
    if (month >= 10) {
      return year + 1; // Next year's season
    } else {
      return year; // Current year's season
    }
  }

  /**
   * Identify seasons to archive
   */
  async getSeasonsToArchive() {
    const currentSeason = this.getCurrentSeason();
    const threshold = currentSeason - this.options.archiveThreshold;
    
    const stats = await this.getPlayStatsBySeason();
    const seasonsToArchive = stats
      .filter(stat => stat.season < threshold)
      .map(stat => stat.season);
    
    return seasonsToArchive;
  }

  /**
   * Create archive table for old plays
   */
  async createArchiveTable(season) {
    const tableName = `plays_archive_${season}`;
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          LIKE plays INCLUDING ALL
        )
      `;
      
      console.log(`Created archive table: ${tableName}`);
      return tableName;
    } catch (error) {
      console.error(`Error creating archive table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Archive plays for a specific season
   */
  async archiveSeason(season) {
    console.log(`Archiving plays for season ${season}...`);
    
    const tableName = `plays_archive_${season}`;
    
    try {
      // Create archive table
      await this.createArchiveTable(season);
      
      // Move plays to archive table
      const result = await prisma.$executeRaw`
        INSERT INTO ${tableName}
        SELECT * FROM plays 
        WHERE season = ${season}
      `;
      
      // Delete plays from main table
      const deletedCount = await prisma.play.deleteMany({
        where: { season }
      });
      
      console.log(`Archived ${deletedCount.count} plays for season ${season}`);
      
      // Create index on archive table for performance
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_game_quarter 
        ON ${tableName} (game_id, quarter, sequence)
      `;
      
      return {
        season,
        archivedCount: deletedCount.count,
        tableName
      };
      
    } catch (error) {
      console.error(`Error archiving season ${season}:`, error);
      throw error;
    }
  }

  /**
   * Archive multiple seasons
   */
  async archiveOldSeasons(seasons = null) {
    const seasonsToArchive = seasons || await this.getSeasonsToArchive();
    
    if (seasonsToArchive.length === 0) {
      console.log('No seasons to archive');
      return [];
    }
    
    console.log(`Archiving ${seasonsToArchive.length} seasons: ${seasonsToArchive.join(', ')}`);
    
    const results = [];
    for (const season of seasonsToArchive) {
      try {
        const result = await this.archiveSeason(season);
        results.push(result);
      } catch (error) {
        console.error(`Failed to archive season ${season}:`, error);
        results.push({ season, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Restore plays from archive
   */
  async restoreFromArchive(season) {
    console.log(`Restoring plays for season ${season}...`);
    
    const tableName = `plays_archive_${season}`;
    
    try {
      // Check if archive table exists
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${tableName}
        )
      `;
      
      if (!tableExists[0].exists) {
        throw new Error(`Archive table ${tableName} does not exist`);
      }
      
      // Restore plays to main table
      const result = await prisma.$executeRaw`
        INSERT INTO plays
        SELECT * FROM ${tableName}
        ON CONFLICT (play_id) DO NOTHING
      `;
      
      console.log(`Restored plays for season ${season}`);
      
      return { season, restored: true };
      
    } catch (error) {
      console.error(`Error restoring season ${season}:`, error);
      throw error;
    }
  }

  /**
   * Get archive table statistics
   */
  async getArchiveStats() {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          table_name,
          EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = t.table_name
          ) as exists
        FROM (
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name LIKE 'plays_archive_%'
        ) t
      `;
      
      // For now, return basic stats since we can't dynamically query table counts
      return stats.map(stat => ({
        table_name: stat.table_name,
        exists: stat.exists,
        play_count: 0 // We'll implement this later if needed
      }));
    } catch (error) {
      console.warn('Could not get archive stats:', error.message);
      return [];
    }
  }

  /**
   * Optimize main plays table
   */
  async optimizePlaysTable() {
    console.log('Optimizing plays table...');
    
    try {
      // Analyze table for better query planning
      await prisma.$executeRaw`ANALYZE plays`;
      
      // Vacuum table to reclaim space
      await prisma.$executeRaw`VACUUM plays`;
      
      console.log('Plays table optimization complete');
      
    } catch (error) {
      console.error('Error optimizing plays table:', error);
      throw error;
    }
  }

  /**
   * Generate partitioning report
   */
  async generateReport() {
    console.log('\n=== PLAY PARTITIONING REPORT ===');
    
    // Current plays stats
    const currentStats = await this.getPlayStatsBySeason();
    console.log('\nCurrent Plays by Season:');
    currentStats.forEach(stat => {
      console.log(`  ${stat.season}: ${stat.play_count.toLocaleString()} plays`);
    });
    
    // Archive stats
    const archiveStats = await this.getArchiveStats();
    console.log('\nArchive Tables:');
    archiveStats.forEach(stat => {
      console.log(`  ${stat.table_name}: ${stat.play_count.toLocaleString()} plays`);
    });
    
    // Seasons to archive
    const seasonsToArchive = await this.getSeasonsToArchive();
    console.log(`\nSeasons to archive: ${seasonsToArchive.length > 0 ? seasonsToArchive.join(', ') : 'None'}`);
    
    // Total plays
    const totalCurrent = currentStats.reduce((sum, stat) => sum + parseInt(stat.play_count), 0);
    const totalArchived = archiveStats.reduce((sum, stat) => sum + parseInt(stat.play_count), 0);
    console.log(`\nTotal plays: ${(totalCurrent + totalArchived).toLocaleString()}`);
    console.log(`  Current: ${totalCurrent.toLocaleString()}`);
    console.log(`  Archived: ${totalArchived.toLocaleString()}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const options = {
    archiveThreshold: parseInt(args.find(arg => arg.startsWith('--threshold='))?.split('=')[1]) || 2
  };
  
  const partitioningService = new PlayPartitioningService(options);
  
  try {
    switch (command) {
      case 'report':
        await partitioningService.generateReport();
        break;
        
      case 'archive':
        const seasons = args.find(arg => arg.startsWith('--seasons='))?.split('=')[1]?.split(',').map(Number);
        const results = await partitioningService.archiveOldSeasons(seasons);
        console.log('Archive results:', results);
        break;
        
      case 'restore':
        const season = parseInt(args[1]);
        if (!season) {
          console.error('Season required for restore command');
          process.exit(1);
        }
        await partitioningService.restoreFromArchive(season);
        break;
        
      case 'optimize':
        await partitioningService.optimizePlaysTable();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node play-partitioning.js report');
        console.log('  node play-partitioning.js archive [--seasons=2020,2021]');
        console.log('  node play-partitioning.js restore <season>');
        console.log('  node play-partitioning.js optimize');
        break;
    }
  } catch (error) {
    console.error('Partitioning operation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PlayPartitioningService; 