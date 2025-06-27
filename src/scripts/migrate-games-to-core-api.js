const { PrismaClient } = require('@prisma/client');

async function migrateGamesToCoreAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Migrating Games to Core API Team IDs...');
    console.log('='.repeat(60));
    
    // Get all teams with their old and new IDs
    const teams = await prisma.team.findMany({
      select: {
        espnId: true,
        abbreviation: true,
        name: true
      }
    });
    
    // Create mapping from old ID to new Core API ID
    const teamMapping = {};
    teams.forEach(team => {
      teamMapping[team.espnId] = team.espnId; // Map to itself for Core API teams
    });
    
    console.log(`📊 Found ${teams.length} teams in database`);
    console.log('🏀 Team mapping:');
    teams.forEach(team => {
      console.log(`  ${team.abbreviation}: ${team.espnId} (${team.name})`);
    });
    
    // Get all games that need migration
    const games = await prisma.game.findMany({
      select: {
        espnId: true,
        homeTeamId: true,
        awayTeamId: true,
        date: true,
        homeScore: true,
        awayScore: true
      }
    });
    
    console.log(`\n📈 Found ${games.length} games to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const game of games) {
      try {
        const newHomeTeamId = teamMapping[game.homeTeamId];
        const newAwayTeamId = teamMapping[game.awayTeamId];
        
        if (!newHomeTeamId || !newAwayTeamId) {
          console.log(`  ⚠️  Skipping game ${game.espnId}: Cannot map team IDs`);
          console.log(`     Home: ${game.homeTeamId}, Away: ${game.awayTeamId}`);
          skipped++;
          continue;
        }
        
        // Update the game with new team IDs
        await prisma.game.update({
          where: { espnId: game.espnId },
          data: {
            homeTeamId: newHomeTeamId,
            awayTeamId: newAwayTeamId
          }
        });
        
        migrated++;
        console.log(`  ✅ Migrated game ${game.espnId}: ${game.date.toDateString()}`);
        
      } catch (error) {
        console.error(`  ❌ Error migrating game ${game.espnId}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Games Migration Complete!');
    console.log(`📊 Summary:`);
    console.log(`  - Total games: ${games.length}`);
    console.log(`  - Successfully migrated: ${migrated}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`  - Errors: ${errors}`);
    
    // Verify migration
    console.log('\n🔍 Verification:');
    const sampleGames = await prisma.game.findMany({
      take: 5,
      select: {
        espnId: true,
        homeTeamId: true,
        awayTeamId: true,
        date: true
      },
      orderBy: { date: 'desc' }
    });
    
    console.log('📊 Sample migrated games:');
    for (const game of sampleGames) {
      const homeTeam = teams.find(t => t.espnId === game.homeTeamId);
      const awayTeam = teams.find(t => t.espnId === game.awayTeamId);
      console.log(`  Game ${game.espnId}: ${awayTeam?.abbreviation} @ ${homeTeam?.abbreviation} (${game.date.toDateString()})`);
    }
    
    return { migrated, skipped, errors, total: games.length };
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateGamesToCoreAPI()
    .then((result) => {
      console.log('\n✅ Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateGamesToCoreAPI; 