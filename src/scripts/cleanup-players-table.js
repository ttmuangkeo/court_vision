const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseHeight(displayHeight) {
  // e.g., "6'7\"" => 79
  if (!displayHeight) return null;
  const match = displayHeight.match(/(\d+)'(\d+)?/);
  if (match) {
    const feet = parseInt(match[1], 10);
    const inches = match[2] ? parseInt(match[2], 10) : 0;
    return feet * 12 + inches;
  }
  return null;
}

function parseWeight(displayWeight) {
  // e.g., "230 lbs" => 230
  if (!displayWeight) return null;
  const match = displayWeight.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return null;
}

async function cleanupPlayersTable() {
  const players = await prisma.player.findMany();
  let updatedCollege = 0;
  let updatedHeight = 0;
  let updatedWeight = 0;
  let updatedBirthDate = 0;
  let cleanedDisplayFields = 0;
  let fixedContracts = 0;
  let fixedAlternateIds = 0;

  for (const player of players) {
    let needsUpdate = false;
    const updateData = {};

    // 1. Set college to null if not already null
    if (player.college !== null) {
      updateData.college = null;
      updatedCollege++;
      needsUpdate = true;
    }

    // 2. Height: if height is null but displayHeight is present, parse and set
    if ((!player.height || isNaN(player.height)) && player.displayHeight) {
      const parsed = parseHeight(player.displayHeight);
      if (parsed) {
        updateData.height = parsed;
        updatedHeight++;
        needsUpdate = true;
      }
    }

    // 3. Weight: if weight is null but displayWeight is present, parse and set
    if ((!player.weight || isNaN(player.weight)) && player.displayWeight) {
      const parsed = parseWeight(player.displayWeight);
      if (parsed) {
        updateData.weight = parsed;
        updatedWeight++;
        needsUpdate = true;
      }
    }

    // 4. birthDate: if null but dateOfBirth is present, set
    if (!player.birthDate && player.dateOfBirth) {
      updateData.birthDate = player.dateOfBirth;
      updatedBirthDate++;
      needsUpdate = true;
    }

    // 5. Remove displayHeight, displayWeight, dateOfBirth (set to null)
    if (player.displayHeight || player.displayWeight || player.dateOfBirth) {
      updateData.displayHeight = null;
      updateData.displayWeight = null;
      updateData.dateOfBirth = null;
      cleanedDisplayFields++;
      needsUpdate = true;
    }

    // 6. contracts: if string, try to parse as JSON, else set to null
    if (player.contracts && typeof player.contracts === 'string') {
      try {
        updateData.contracts = JSON.parse(player.contracts);
      } catch {
        updateData.contracts = null;
      }
      fixedContracts++;
      needsUpdate = true;
    }

    // 7. alternateIds: if string, try to parse as JSON, else set to null
    if (player.alternateIds && typeof player.alternateIds === 'string') {
      try {
        updateData.alternateIds = JSON.parse(player.alternateIds);
      } catch {
        updateData.alternateIds = null;
      }
      fixedAlternateIds++;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.player.update({
        where: { espnId: player.espnId },
        data: updateData
      });
    }
  }

  console.log('--- Players Table Cleanup Summary ---');
  console.log('Players with college set to null:', updatedCollege);
  console.log('Players with height parsed from displayHeight:', updatedHeight);
  console.log('Players with weight parsed from displayWeight:', updatedWeight);
  console.log('Players with birthDate set from dateOfBirth:', updatedBirthDate);
  console.log('Players with displayHeight/displayWeight/dateOfBirth cleaned:', cleanedDisplayFields);
  console.log('Players with contracts fixed:', fixedContracts);
  console.log('Players with alternateIds fixed:', fixedAlternateIds);
}

if (require.main === module) {
  cleanupPlayersTable()
    .then(() => {
      console.log('\n✅ Players table cleanup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
} 