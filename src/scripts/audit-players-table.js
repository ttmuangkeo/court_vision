const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditPlayersTable() {
  const players = await prisma.player.findMany();
  let nullTeamActive = 0;
  let nullBirthDateActive = 0;
  let collegeFieldCount = 0;
  let collegeFieldExamples = [];
  let bothHeights = 0;
  let bothWeights = 0;
  let bothBirthDates = 0;
  let contractsString = 0;
  let contractsJson = 0;
  let alternateIdsString = 0;
  let alternateIdsJson = 0;
  let nullCollege = 0;
  let nullDisplayHeight = 0;
  let nullDisplayWeight = 0;
  let nullHeight = 0;
  let nullWeight = 0;
  let nullDateOfBirth = 0;
  let nullBirthDate = 0;

  for (const player of players) {
    // 1. teamEspnId is null for active players
    if (!player.teamEspnId && player.active) nullTeamActive++;
    // 2. birthDate is null for active players
    if (!player.birthDate && player.active) nullBirthDateActive++;
    // 3. college field
    if (player.college) {
      collegeFieldCount++;
      if (collegeFieldExamples.length < 10) collegeFieldExamples.push(player.college);
    } else {
      nullCollege++;
    }
    // 4. displayHeight vs height
    if (player.displayHeight && player.height) bothHeights++;
    if (!player.displayHeight) nullDisplayHeight++;
    if (!player.height) nullHeight++;
    // 5. displayWeight vs weight
    if (player.displayWeight && player.weight) bothWeights++;
    if (!player.displayWeight) nullDisplayWeight++;
    if (!player.weight) nullWeight++;
    // 6. dateOfBirth vs birthDate
    if (player.dateOfBirth && player.birthDate) bothBirthDates++;
    if (!player.dateOfBirth) nullDateOfBirth++;
    if (!player.birthDate) nullBirthDate++;
    // 7. contracts
    if (player.contracts) {
      if (typeof player.contracts === 'string') contractsString++;
      else contractsJson++;
    }
    // 8. alternateIds
    if (player.alternateIds) {
      if (typeof player.alternateIds === 'string') alternateIdsString++;
      else alternateIdsJson++;
    }
  }

  console.log('--- Players Table Audit ---');
  console.log('Total players:', players.length);
  console.log('Active players with null teamEspnId:', nullTeamActive);
  console.log('Active players with null birthDate:', nullBirthDateActive);
  console.log('Players with college field:', collegeFieldCount);
  console.log('Players with null college:', nullCollege);
  console.log('Sample college field values:', collegeFieldExamples);
  console.log('Players with both displayHeight and height:', bothHeights);
  console.log('Players with null displayHeight:', nullDisplayHeight);
  console.log('Players with null height:', nullHeight);
  console.log('Players with both displayWeight and weight:', bothWeights);
  console.log('Players with null displayWeight:', nullDisplayWeight);
  console.log('Players with null weight:', nullWeight);
  console.log('Players with both dateOfBirth and birthDate:', bothBirthDates);
  console.log('Players with null dateOfBirth:', nullDateOfBirth);
  console.log('Players with null birthDate:', nullBirthDate);
  console.log('Players with contracts as string:', contractsString);
  console.log('Players with contracts as JSON:', contractsJson);
  console.log('Players with alternateIds as string:', alternateIdsString);
  console.log('Players with alternateIds as JSON:', alternateIdsJson);
}

if (require.main === module) {
  auditPlayersTable()
    .then(() => {
      console.log('\n✅ Players table audit complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
} 