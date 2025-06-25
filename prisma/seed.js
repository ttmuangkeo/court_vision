const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Teams
  console.log('Creating teams...');
  const lakers = await prisma.team.upsert({
    where: { nbaId: '1610612747' },
    update: {},
    create: {
      nbaId: '1610612747',
      name: 'Los Angeles Lakers',
      abbreviation: 'LAL',
      city: 'Los Angeles',
      conference: 'Western',
      division: 'Pacific'
    }
  });

  const warriors = await prisma.team.upsert({
    where: { nbaId: '1610612744' },
    update: {},
    create: {
      nbaId: '1610612744',
      name: 'Golden State Warriors',
      abbreviation: 'GSW',
      city: 'Golden State',
      conference: 'Western',
      division: 'Pacific'
    }
  });

  const celtics = await prisma.team.upsert({
    where: { nbaId: '1610612738' },
    update: {},
    create: {
      nbaId: '1610612738',
      name: 'Boston Celtics',
      abbreviation: 'BOS',
      city: 'Boston',
      conference: 'Eastern',
      division: 'Atlantic'
    }
  });

  console.log('✅ Teams created successfully');

  // 2. Create Players
  console.log('Creating players...');
  const lebron = await prisma.player.upsert({
    where: { nbaId: '2544' },
    update: {},
    create: {
      nbaId: '2544',
      name: 'LeBron James',
      position: 'SF',
      teamId: lakers.id,
      height: '6-9',
      weight: 250,
      birthDate: new Date('1984-12-30'),
      college: 'St. Vincent-St. Mary HS (OH)',
      draftYear: 2003,
      draftRound: 1,
      draftNumber: 1
    }
  });

  const curry = await prisma.player.upsert({
    where: { nbaId: '201939' },
    update: {},
    create: {
      nbaId: '201939',
      name: 'Stephen Curry',
      position: 'PG',
      teamId: warriors.id,
      height: '6-3',
      weight: 185,
      birthDate: new Date('1988-03-14'),
      college: 'Davidson',
      draftYear: 2009,
      draftRound: 1,
      draftNumber: 7
    }
  });

  const tatum = await prisma.player.upsert({
    where: { nbaId: '1628369' },
    update: {},
    create: {
      nbaId: '1628369',
      name: 'Jayson Tatum',
      position: 'SF',
      teamId: celtics.id,
      height: '6-8',
      weight: 210,
      birthDate: new Date('1998-03-03'),
      college: 'Duke',
      draftYear: 2017,
      draftRound: 1,
      draftNumber: 3
    }
  });

  console.log('✅ Players created successfully');

  // 3. Create Basketball Tags
  console.log('Creating basketball tags...');
  const tags = [
    // Offensive Actions
    {
      name: 'Pick and Roll',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'PnR',
      description: 'Ball handler uses a screen to create space',
      icon: '🔄',
      color: '#FF6B6B'
    },
    {
      name: 'Isolation',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'ISO',
      description: 'One-on-one offensive play',
      icon: '��',
      color: '#4ECDC4'
    },
    {
      name: 'Post Up',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Post',
      description: 'Player backs down defender in the post',
      icon: '🏀',
      color: '#45B7D1'
    },
    {
      name: 'Drive',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Drive',
      description: 'Player drives to the basket',
      icon: '🏃',
      color: '#96CEB4'
    },
    {
      name: 'Pull Up Jump Shot',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Shot',
      description: 'Jump shot off the dribble',
      icon: '🏀',
      color: '#FFEAA7'
    },

    // Defensive Actions
    {
      name: 'Drop Coverage',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Coverage',
      description: 'Defender drops back to protect the rim',
      icon: '⬇️',
      color: '#DDA0DD'
    },
    {
      name: 'Switch',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Coverage',
      description: 'Defenders switch assignments',
      icon: '🔄',
      color: '#98D8C8'
    },
    {
      name: 'Double Team',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Coverage',
      description: 'Two defenders guard one player',
      icon: '��',
      color: '#F7DC6F'
    },
    {
      name: 'Trap',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Coverage',
      description: 'Defenders trap the ball handler',
      icon: '🔄',
      color: '#BB8FCE'
    }
  ];

  for (const tagData of tags) {
    await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: tagData
    });
  }

  console.log('✅ Basketball tags created successfully');

  // 4. Create Sample Game
  console.log('Creating sample game...');
  const sampleGame = await prisma.game.upsert({
    where: { nbaId: 'sample_game_1' },
    update: {},
    create: {
      nbaId: 'sample_game_1',
      date: new Date('2024-01-15T20:00:00Z'),
      homeTeamId: lakers.id,
      awayTeamId: warriors.id,
      homeScore: 108,
      awayScore: 102,
      status: 'FINISHED',
      quarter: 4,
      timeRemaining: '00:00',
      attendance: 19000,
      arena: 'Crypto.com Arena',
      season: '2023-24'
    }
  });

  console.log('✅ Sample game created successfully');

  // 5. Create Sample User
  console.log('Creating sample user...');
  const sampleUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      password: '$2a$10$hashedpassword', // You'll hash this properly later
      firstName: 'Test',
      lastName: 'User',
      role: 'USER'
    }
  });

  console.log('✅ Sample user created successfully');

  console.log('🎉 Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`- Teams: 3`);
  console.log(`- Players: 3`);
  console.log(`- Tags: ${tags.length}`);
  console.log(`- Sample Game: 1`);
  console.log(`- Sample User: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 