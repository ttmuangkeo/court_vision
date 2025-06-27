const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const prisma = new PrismaClient();

// ESPN Core API endpoints
const CORE_API_TEAMS_URL = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/teams';
const SITE_API_TEAMS_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams';

async function fetchESPNTeams() {
  try {
    console.log('📡 Fetching teams from ESPN Core API...');
    const response = await fetch(CORE_API_TEAMS_URL);
    const data = await response.json();
    
    if (!data.items) {
      throw new Error('No teams found in Core API response');
    }
    
    const teams = [];
    for (const item of data.items) {
      const teamRef = item['$ref'];
      const teamResponse = await fetch(teamRef);
      const teamData = await teamResponse.json();
      teams.push(teamData);
    }
    
    console.log(`✅ Fetched ${teams.length} teams from Core API`);
    return teams;
  } catch (error) {
    console.error('❌ Error fetching from Core API:', error.message);
    return [];
  }
}

async function fetchESPNTeamsSite() {
  try {
    console.log('📡 Fetching teams from ESPN Site API...');
    const response = await fetch(SITE_API_TEAMS_URL);
    const data = await response.json();
    
    if (!data.sports || !data.sports[0] || !data.sports[0].leagues || !data.sports[0].leagues[0]) {
      throw new Error('Invalid response structure from Site API');
    }
    
    const teams = data.sports[0].leagues[0].teams.map(t => t.team);
    console.log(`✅ Fetched ${teams.length} teams from Site API`);
    return teams;
  } catch (error) {
    console.error('❌ Error fetching from Site API:', error.message);
    return [];
  }
}

async function validateTeamsParity() {
  try {
    console.log('🔍 Validating teams parity with ESPN APIs...\n');
    
    // Get teams from our database
    const dbTeams = await prisma.team.findMany({
      orderBy: { abbreviation: 'asc' }
    });
    
    console.log(`📊 Database teams: ${dbTeams.length}`);
    
    // Get teams from ESPN APIs
    const coreApiTeams = await fetchESPNTeams();
    const siteApiTeams = await fetchESPNTeamsSite();
    
    console.log(`📊 Core API teams: ${coreApiTeams.length}`);
    console.log(`📊 Site API teams: ${siteApiTeams.length}\n`);
    
    // Create maps for easy lookup
    const dbTeamsMap = new Map(dbTeams.map(t => [t.espnId, t]));
    const coreApiTeamsMap = new Map(coreApiTeams.map(t => [t.id, t]));
    const siteApiTeamsMap = new Map(siteApiTeams.map(t => [t.id, t]));
    
    // Check for missing teams in our database
    console.log('🔍 Checking for missing teams in database...');
    const missingInDb = [];
    
    for (const coreTeam of coreApiTeams) {
      if (!dbTeamsMap.has(coreTeam.id)) {
        missingInDb.push({
          espnId: coreTeam.id,
          name: coreTeam.name,
          abbreviation: coreTeam.abbreviation,
          source: 'Core API'
        });
      }
    }
    
    if (missingInDb.length > 0) {
      console.log(`❌ Missing ${missingInDb.length} teams in database:`);
      missingInDb.forEach(team => {
        console.log(`   - ${team.abbreviation}: ${team.name} (${team.espnId})`);
      });
    } else {
      console.log('✅ All Core API teams found in database');
    }
    
    // Check for extra teams in our database
    console.log('\n🔍 Checking for extra teams in database...');
    const extraInDb = [];
    
    for (const dbTeam of dbTeams) {
      if (!coreApiTeamsMap.has(dbTeam.espnId)) {
        extraInDb.push({
          espnId: dbTeam.espnId,
          name: dbTeam.name,
          abbreviation: dbTeam.abbreviation
        });
      }
    }
    
    if (extraInDb.length > 0) {
      console.log(`⚠️  Found ${extraInDb.length} teams in database not in Core API:`);
      extraInDb.forEach(team => {
        console.log(`   - ${team.abbreviation}: ${team.name} (${team.espnId})`);
      });
    } else {
      console.log('✅ No extra teams in database');
    }
    
    // Validate team data consistency
    console.log('\n🔍 Validating team data consistency...');
    let consistencyIssues = 0;
    
    for (const dbTeam of dbTeams) {
      const coreTeam = coreApiTeamsMap.get(dbTeam.espnId);
      const siteTeam = siteApiTeamsMap.get(dbTeam.espnId);
      
      if (coreTeam) {
        // Check name consistency
        if (dbTeam.name !== coreTeam.name) {
          console.log(`⚠️  ${dbTeam.abbreviation}: Name mismatch - DB: "${dbTeam.name}" vs Core: "${coreTeam.name}"`);
          consistencyIssues++;
        }
        
        // Check abbreviation consistency
        if (dbTeam.abbreviation !== coreTeam.abbreviation) {
          console.log(`⚠️  ${dbTeam.abbreviation}: Abbreviation mismatch - DB: "${dbTeam.abbreviation}" vs Core: "${coreTeam.abbreviation}"`);
          consistencyIssues++;
        }
      }
      
      if (siteTeam) {
        // Check branding data
        if (siteTeam.color && dbTeam.primaryColor !== siteTeam.color) {
          console.log(`⚠️  ${dbTeam.abbreviation}: Primary color mismatch - DB: "${dbTeam.primaryColor}" vs Site: "${siteTeam.color}"`);
          consistencyIssues++;
        }
      }
    }
    
    if (consistencyIssues === 0) {
      console.log('✅ All team data is consistent');
    } else {
      console.log(`⚠️  Found ${consistencyIssues} consistency issues`);
    }
    
    // Check for data quality issues
    console.log('\n🔍 Checking data quality...');
    let qualityIssues = 0;
    
    for (const dbTeam of dbTeams) {
      // Check for missing essential data
      if (!dbTeam.name || !dbTeam.abbreviation || !dbTeam.city) {
        console.log(`❌ ${dbTeam.abbreviation}: Missing essential data`);
        qualityIssues++;
      }
      
      // Check for missing branding data
      if (!dbTeam.primaryColor || !dbTeam.logoUrl) {
        console.log(`⚠️  ${dbTeam.abbreviation}: Missing branding data (color: ${!!dbTeam.primaryColor}, logo: ${!!dbTeam.logoUrl})`);
        qualityIssues++;
      }
      
      // Check espnLinks format
      if (dbTeam.espnLinks && typeof dbTeam.espnLinks !== 'object') {
        console.log(`❌ ${dbTeam.abbreviation}: espnLinks is not a JSON object (type: ${typeof dbTeam.espnLinks})`);
        qualityIssues++;
      }
    }
    
    if (qualityIssues === 0) {
      console.log('✅ All teams have good data quality');
    } else {
      console.log(`⚠️  Found ${qualityIssues} data quality issues`);
    }
    
    // Summary
    console.log('\n📊 PARITY VALIDATION SUMMARY:');
    console.log(`   Database teams: ${dbTeams.length}`);
    console.log(`   Core API teams: ${coreApiTeams.length}`);
    console.log(`   Site API teams: ${siteApiTeams.length}`);
    console.log(`   Missing in DB: ${missingInDb.length}`);
    console.log(`   Extra in DB: ${extraInDb.length}`);
    console.log(`   Consistency issues: ${consistencyIssues}`);
    console.log(`   Quality issues: ${qualityIssues}`);
    
    if (missingInDb.length === 0 && extraInDb.length === 0 && consistencyIssues === 0 && qualityIssues === 0) {
      console.log('\n🎉 PERFECT PARITY! Teams table is fully synchronized with ESPN APIs');
    } else {
      console.log('\n⚠️  PARITY ISSUES DETECTED - Some teams need attention');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
if (require.main === module) {
  validateTeamsParity()
    .then(() => {
      console.log('\n🎉 Teams parity validation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Teams parity validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateTeamsParity }; 