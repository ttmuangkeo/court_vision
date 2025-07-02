const prisma = require('../db/client');

async function main() {
  // Create sample tags
  const tags = [
    { name: 'Pick and Roll', category: 'DEFENSIVE_ACTION' },
    { name: 'Drive', category: 'OFFENSIVE_ACTION' },
    { name: 'Pass to Shooter', category: 'OFFENSIVE_ACTION' },
    { name: 'Contest', category: 'DEFENSIVE_ACTION' },
    { name: 'Transition', category: 'OFFENSIVE_ACTION' },
  ];
  const tagRecords = [];
  for (const tag of tags) {
    const record = await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        category: tag.category,
        isActive: true,
      },
    });
    tagRecords.push(record);
  }

  // Create sample teams FIRST
  await prisma.team.upsert({
    where: { espnId: 'teama' },
    update: {},
    create: {
      espnId: 'teama',
      abbreviation: 'TMA',
      displayName: 'Team A',
      name: 'Team A',
      city: 'Sample City A',
      conference: 'West',
      division: 'Alpha',
    },
  });
  await prisma.team.upsert({
    where: { espnId: 'teamb' },
    update: {},
    create: {
      espnId: 'teamb',
      abbreviation: 'TMB',
      displayName: 'Team B',
      name: 'Team B',
      city: 'Sample City B',
      conference: 'East',
      division: 'Beta',
    },
  });

  // Now create sample players
  const player1 = await prisma.player.upsert({
    where: { espnId: 'player1' },
    update: {},
    create: {
      espnId: 'player1',
      fullName: 'Player One',
      teamEspnId: 'teama',
      position: 'G',
    },
  });
  const player2 = await prisma.player.upsert({
    where: { espnId: 'player2' },
    update: {},
    create: {
      espnId: 'player2',
      fullName: 'Player Two',
      teamEspnId: 'teamb',
      position: 'F',
    },
  });

  // Create a sample game
  const game = await prisma.game.upsert({
    where: { espnId: 'game1' },
    update: {},
    create: {
      espnId: 'game1',
      date: new Date(),
      homeTeamId: 'teama',
      awayTeamId: 'teamb',
      status: 'FINISHED',
      season: '2024-25',
    },
  });

  // Get a test user for createdById
  const testUserId = 'cmcjq8ctl00003md04uikbzlu';

  // Helper for context inference
  function inferContextFields(tagSequence) {
    let coverageType, possessionType;
    for (const tagData of tagSequence) {
      if (tagData.action === 'Pick and Roll') {
        coverageType = 'switch';
        possessionType = 'half-court';
      }
      if (tagData.action === 'Transition') {
        possessionType = 'transition';
      }
    }
    return { coverageType, possessionType };
  }

  // Create sample plays with tag sequences
  const sampleSequences = [
    [
      { action: 'Pick and Roll', playerId: player1.espnId, teamId: 'teama' },
      { action: 'Drive', playerId: player1.espnId, teamId: 'teama' },
      { action: 'Pass to Shooter', playerId: player1.espnId, teamId: 'teama' },
      { action: 'Contest', playerId: player2.espnId, teamId: 'teamb' },
    ],
    [
      { action: 'Transition', playerId: player2.espnId, teamId: 'teamb' },
      { action: 'Drive', playerId: player2.espnId, teamId: 'teamb' },
      { action: 'Pass to Shooter', playerId: player2.espnId, teamId: 'teamb' },
    ],
  ];

  for (let i = 0; i < sampleSequences.length; i++) {
    const tagSequence = sampleSequences[i];
    const inferred = inferContextFields(tagSequence);
    const play = await prisma.play.create({
      data: {
        gameId: game.espnId,
        gameTime: `0${i + 1}:00`,
        quarter: 1,
        description: tagSequence.map(t => t.action).join(' → '),
        createdById: testUserId, // Use test user as creator
        tags: {
          create: tagSequence.map((tagData, idx) => ({
            tagId: tagRecords.find(t => t.name === tagData.action).id,
            playerId: tagData.playerId,
            teamId: tagData.teamId,
            context: {
              action: tagData.action,
              sequence: idx + 1,
              totalActions: tagSequence.length,
              ...inferred,
            },
            confidence: 1.0,
            createdById: testUserId,
          })),
        },
      },
    });
    console.log(`Created play: ${play.description}`);
  }

  console.log('Sample plays and tags populated!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 