const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const CORE_API_ATHLETES_URL = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes?limit=1000';

function extractIdFromRef(ref) {
  // Extracts the last number from the $ref URL
  const match = ref.match(/athletes\/(\d+)/);
  return match ? match[1] : undefined;
}

async function fetchAllCoreApiAthleteIds() {
  let url = CORE_API_ATHLETES_URL;
  let ids = [];
  let page = 1;
  while (url) {
    console.log(`Fetching Core API athletes page ${page}...`);
    const res = await fetch(url);
    const data = await res.json();
    if (data.items) {
      ids.push(...data.items.map(item => extractIdFromRef(item['$ref'])));
    }
    url = data.next || null;
    page++;
  }
  // Remove any undefineds
  return ids.filter(Boolean);
}

async function fetchAllDbPlayerIds(prisma) {
  const players = await prisma.player.findMany({ select: { espnId: true } });
  return players.map(p => String(p.espnId));
}

async function main() {
  const prisma = new PrismaClient();
  try {
    // 1. Get all Core API athlete IDs
    const coreApiIds = await fetchAllCoreApiAthleteIds();
    console.log(`\nCore API athlete count: ${coreApiIds.length}`);

    // 2. Get all DB player IDs
    const dbIds = await fetchAllDbPlayerIds(prisma);
    console.log(`DB player count: ${dbIds.length}`);

    // 3. Find missing in DB
    const missingInDb = coreApiIds.filter(id => !dbIds.includes(id));
    // 4. Find extra in DB
    const extraInDb = dbIds.filter(id => !coreApiIds.includes(id));

    console.log(`\nAthletes in Core API but missing in DB: ${missingInDb.length}`);
    if (missingInDb.length > 0) {
      console.log(missingInDb.slice(0, 20).map(id => `  - ${id}`).join('\n'));
      if (missingInDb.length > 20) console.log(`  ...and ${missingInDb.length - 20} more`);
    }

    console.log(`\nPlayers in DB but not in Core API: ${extraInDb.length}`);
    if (extraInDb.length > 0) {
      console.log(extraInDb.slice(0, 20).map(id => `  - ${id}`).join('\n'));
      if (extraInDb.length > 20) console.log(`  ...and ${extraInDb.length - 20} more`);
    }

    // Optionally, write to files for further processing
    // require('fs').writeFileSync('missing_in_db.json', JSON.stringify(missingInDb, null, 2));
    // require('fs').writeFileSync('extra_in_db.json', JSON.stringify(extraInDb, null, 2));

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 