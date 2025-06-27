const axios = require('axios');
const prisma = require('../db/client');

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

// Mapping for abbreviation mismatches between ESPN and our database
const ABBREVIATION_MAPPING = {
  'SA': 'SAS',    // San Antonio Spurs
  'UTAH': 'UTA',  // Utah Jazz
  'WSH': 'WAS',   // Washington Wizards
  'GS': 'GSW',    // Golden State Warriors
  'NO': 'NOP',    // New Orleans Pelicans
  'NY': 'NYK'     // New York Knicks
};

async function fetchTeamBranding() {
  try {
    console.log('Fetching team branding data from ESPN...');
    
    const response = await axios.get(`${ESPN_API_BASE}/teams`);
    const teams = response.data.sports[0].leagues[0].teams;
    
    console.log(`Found ${teams.length} teams`);
    
    for (const teamData of teams) {
      const team = teamData.team;
      
      // Extract logo URLs
      const logos = team.logos || [];
      const defaultLogo = logos.find(logo => logo.rel.includes('default'))?.href;
      const darkLogo = logos.find(logo => logo.rel.includes('dark'))?.href;
      const scoreboardLogo = logos.find(logo => logo.rel.includes('scoreboard'))?.href;
      
      // Use mapping to find the correct abbreviation
      const dbAbbreviation = ABBREVIATION_MAPPING[team.abbreviation] || team.abbreviation;
      
      // Find existing team by abbreviation
      const existingTeam = await prisma.team.findFirst({
        where: { abbreviation: dbAbbreviation }
      });
      
      if (existingTeam) {
        console.log(`Updating branding for ${team.displayName} (${team.abbreviation} → ${dbAbbreviation})...`);
        
        await prisma.team.update({
          where: { id: existingTeam.id },
          data: {
            primaryColor: team.color,
            alternateColor: team.alternateColor,
            logoUrl: defaultLogo,
            logoDarkUrl: darkLogo,
            logoScoreboardUrl: scoreboardLogo,
            espnId: team.id,
            espnSlug: team.slug,
            displayName: team.displayName,
            shortDisplayName: team.shortDisplayName,
            nickname: team.nickname
          }
        });
        
        console.log(`✅ Updated ${team.displayName}`);
      } else {
        console.log(`⚠️  Team not found in database: ${team.displayName} (${team.abbreviation} → ${dbAbbreviation})`);
      }
    }
    
    console.log('Team branding sync completed!');
    
  } catch (error) {
    console.error('Error fetching team branding:', error);
    throw error;
  }
}

async function main() {
  try {
    await fetchTeamBranding();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { fetchTeamBranding }; 