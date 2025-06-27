const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const CORE_API_BASE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes';

async function fetchContractsForPlayer(espnId) {
  try {
    // Step 1: Get the contracts $ref
    const playerUrl = `${CORE_API_BASE}/${espnId}`;
    const playerRes = await axios.get(playerUrl);
    const contractsRef = playerRes.data.contracts?.['$ref'];
    if (!contractsRef) return [];

    // Step 2: Get the contracts items array
    const contractsListRes = await axios.get(contractsRef);
    const items = contractsListRes.data.items || [];
    if (!Array.isArray(items) || items.length === 0) return [];

    // Step 3: Dereference each contract
    const contracts = [];
    for (const item of items) {
      if (item['$ref']) {
        try {
          const contractRes = await axios.get(item['$ref']);
          contracts.push(contractRes.data);
        } catch (err) {
          console.warn(`  Could not fetch contract for player ${espnId}:`, err.message);
        }
      }
    }
    return contracts;
  } catch (err) {
    console.warn(`  Could not fetch contracts for player ${espnId}:`, err.message);
    return [];
  }
}

function isFullContractArray(contracts) {
  // Heuristic: must be an array, and at least one item has 'salary' and 'season' fields
  if (!Array.isArray(contracts)) return false;
  return contracts.some(c => c && typeof c === 'object' && 'salary' in c && 'season' in c);
}

async function fixPlayerContractsParity() {
  const players = await prisma.player.findMany({ select: { espnId: true, contracts: true } });
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const player of players) {
    if (isFullContractArray(player.contracts)) {
      skipped++;
      continue;
    }
    const contracts = await fetchContractsForPlayer(player.espnId);
    if (contracts.length > 0) {
      try {
        await prisma.player.update({
          where: { espnId: player.espnId },
          data: { contracts }
        });
        updated++;
        console.log(`Updated contracts for player ${player.espnId}`);
      } catch (err) {
        failed++;
        console.warn(`  Failed to update player ${player.espnId}:`, err.message);
      }
    } else {
      failed++;
      console.warn(`  No contracts found for player ${player.espnId}`);
    }
  }

  console.log('--- Player Contracts Parity Fix Summary ---');
  console.log('Players updated:', updated);
  console.log('Players skipped (already full objects):', skipped);
  console.log('Players failed:', failed);
}

fixPlayerContractsParity().then(() => prisma.$disconnect()); 