const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const prisma = new PrismaClient();

// ESPN API endpoints
const CORE_API_TEAMS_URL = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/teams';
const SITE_API_TEAMS_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams';

// Static mapping of team abbreviations to division and conference
const TEAM_DIVISION_CONFERENCE = {
  ATL: { division: 'Southeast Division', conference: 'Eastern' },
  BOS: { division: 'Atlantic Division', conference: 'Eastern' },
  BKN: { division: 'Atlantic Division', conference: 'Eastern' },
  CHA: { division: 'Southeast Division', conference: 'Eastern' },
  CHI: { division: 'Central Division', conference: 'Eastern' },
  CLE: { division: 'Central Division', conference: 'Eastern' },
  DAL: { division: 'Southwest Division', conference: 'Western' },
  DEN: { division: 'Northwest Division', conference: 'Western' },
  DET: { division: 'Central Division', conference: 'Eastern' },
  GS:  { division: 'Pacific Division', conference: 'Western' },
  HOU: { division: 'Southwest Division', conference: 'Western' },
  IND: { division: 'Central Division', conference: 'Eastern' },
  LAC: { division: 'Pacific Division', conference: 'Western' },
  LAL: { division: 'Pacific Division', conference: 'Western' },
  MEM: { division: 'Southwest Division', conference: 'Western' },
  MIA: { division: 'Southeast Division', conference: 'Eastern' },
  MIL: { division: 'Central Division', conference: 'Eastern' },
  MIN: { division: 'Northwest Division', conference: 'Western' },
  NO:  { division: 'Southwest Division', conference: 'Western' },
  NY:  { division: 'Atlantic Division', conference: 'Eastern' },
  OKC: { division: 'Northwest Division', conference: 'Western' },
  ORL: { division: 'Southeast Division', conference: 'Eastern' },
  PHI: { division: 'Atlantic Division', conference: 'Eastern' },
  PHX: { division: 'Pacific Division', conference: 'Western' },
  POR: { division: 'Northwest Division', conference: 'Western' },
  SAC: { division: 'Pacific Division', conference: 'Western' },
  SA:  { division: 'Southwest Division', conference: 'Western' },
  TOR: { division: 'Atlantic Division', conference: 'Eastern' },
  UTAH: { division: 'Northwest Division', conference: 'Western' },
  WSH: { division: 'Southeast Division', conference: 'Eastern' },
};

async function fetchCoreAPITeams() {
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

async function fetchSiteAPITeams() {
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

async function fetchTeamDetailUrl(links) {
  if (!Array.isArray(links)) return null;
  // Prefer 'team' link, fallback to 'clubhouse'
  const teamLink = links.find(l => l.rel && l.rel.includes('team'));
  if (teamLink) return teamLink.href;
  const clubhouseLink = links.find(l => l.rel && l.rel.includes('clubhouse'));
  if (clubhouseLink) return clubhouseLink.href;
  return null;
}

async function fetchDivisionFromDetail(url) {
  if (!url) return { division: null, conference: null };
  // Convert www.espn.com to site.api.espn.com endpoint
  const match = url.match(/\/name\/([a-z]+)\//);
  if (!match) return { division: null, conference: null };
  const abbr = match[1];
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${abbr}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    // Debug: print standingSummary
    console.log(`[${abbr.toUpperCase()}] standingSummary:`, data.standingSummary);
    if (typeof data.standingSummary === 'string') {
      // Example: "2nd in Southeast Division"
      const divMatch = data.standingSummary.match(/in ([A-Za-z ]+ Division)/);
      if (divMatch) {
        const division = divMatch[1];
        const conference = TEAM_DIVISION_CONFERENCE[abbr]?.conference || null;
        return { division, conference };
      }
    }
    return { division: null, conference: null };
  } catch (e) {
    return { division: null, conference: null };
  }
}

async function syncTeamsComprehensive() {
  try {
    console.log('🔄 Starting comprehensive teams sync...\n');
    
    // Fetch teams from both APIs
    const coreApiTeams = await fetchCoreAPITeams();
    const siteApiTeams = await fetchSiteAPITeams();
    
    // Create maps for easy lookup
    const coreApiTeamsMap = new Map(coreApiTeams.map(t => [t.id, t]));
    const siteApiTeamsMap = new Map(siteApiTeams.map(t => [t.id, t]));
    
    // Get existing teams from database
    const existingTeams = await prisma.team.findMany();
    const existingTeamsMap = new Map(existingTeams.map(t => [t.espnId, t]));
    
    console.log(`📊 Processing ${siteApiTeams.length} teams from Site API...`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const siteTeam of siteApiTeams) {
      try {
        const coreTeam = coreApiTeamsMap.get(siteTeam.id);
        const existingTeam = existingTeamsMap.get(siteTeam.id);
        
        // Use static mapping for division/conference
        const abbr = siteTeam.abbreviation;
        let conference = 'Unknown';
        let division = 'Unknown';
        if (TEAM_DIVISION_CONFERENCE[abbr]) {
          conference = TEAM_DIVISION_CONFERENCE[abbr].conference;
          division = TEAM_DIVISION_CONFERENCE[abbr].division;
        }
        
        // Prepare team data combining both APIs
        const teamData = {
          espnId: siteTeam.id,
          abbreviation: siteTeam.abbreviation,
          name: siteTeam.name, // Use Site API full name
          city: siteTeam.location || siteTeam.name.split(' ')[0],
          conference,
          division,
          
          // Branding from Site API
          primaryColor: siteTeam.color,
          alternateColor: siteTeam.alternateColor,
          logoUrl: siteTeam.logos?.find(logo => logo.rel.includes('default'))?.href,
          logoDarkUrl: siteTeam.logos?.find(logo => logo.rel.includes('dark'))?.href,
          logoScoreboardUrl: siteTeam.logos?.find(logo => logo.rel.includes('scoreboard'))?.href,
          
          // ESPN metadata from Site API
          espnUid: siteTeam.uid,
          espnSlug: siteTeam.slug,
          displayName: siteTeam.displayName,
          shortDisplayName: siteTeam.shortDisplayName,
          nickname: siteTeam.nickname,
          
          // Status
          isActive: siteTeam.isActive !== false,
          isAllStar: siteTeam.isAllStar === true,
          
          // Links from Site API
          espnLinks: siteTeam.links || [],
          
          // Core API data if available
          ...(coreTeam && {
            // Add any additional Core API specific fields here
          })
        };
        
        if (existingTeam) {
          // Update existing team
          await prisma.team.update({
            where: { espnId: siteTeam.id },
            data: teamData
          });
          
          console.log(`🔄 Updated ${siteTeam.abbreviation}: ${siteTeam.name} (Conf: ${conference}, Div: ${division})`);
          updatedCount++;
        } else {
          // Create new team
          await prisma.team.create({
            data: teamData
          });
          
          console.log(`➕ Created ${siteTeam.abbreviation}: ${siteTeam.name} (Conf: ${conference}, Div: ${division})`);
          createdCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${siteTeam.abbreviation}:`, error.message);
        errorCount++;
      }
    }
    
    // Check for teams that might need cleanup
    console.log('\n🔍 Checking for orphaned teams...');
    const finalTeams = await prisma.team.findMany();
    const finalTeamIds = new Set(finalTeams.map(t => t.espnId));
    const siteTeamIds = new Set(siteApiTeams.map(t => t.id));
    
    const orphanedTeams = finalTeams.filter(team => !siteTeamIds.has(team.espnId));
    
    if (orphanedTeams.length > 0) {
      console.log(`⚠️  Found ${orphanedTeams.length} teams not in current Site API:`);
      orphanedTeams.forEach(team => {
        console.log(`   - ${team.abbreviation}: ${team.name} (${team.espnId})`);
      });
    } else {
      console.log('✅ No orphaned teams found');
    }
    
    // Summary
    console.log('\n📊 COMPREHENSIVE TEAMS SYNC SUMMARY:');
    console.log(`   Site API teams: ${siteApiTeams.length}`);
    console.log(`   Core API teams: ${coreApiTeams.length}`);
    console.log(`   Teams created: ${createdCount}`);
    console.log(`   Teams updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total teams in DB: ${finalTeams.length}`);
    console.log(`   Orphaned teams: ${orphanedTeams.length}`);
    
    if (errorCount === 0 && orphanedTeams.length === 0) {
      console.log('\n🎉 PERFECT SYNC! All teams are now synchronized with ESPN APIs');
    } else {
      console.log('\n⚠️  SYNC COMPLETED WITH ISSUES - Some teams need attention');
    }
    
  } catch (error) {
    console.error('❌ Comprehensive sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the comprehensive sync
if (require.main === module) {
  syncTeamsComprehensive()
    .then(() => {
      console.log('\n🎉 Comprehensive teams sync completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Comprehensive teams sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncTeamsComprehensive }; 