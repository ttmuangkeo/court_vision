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
      description: 'Offensive play where a player sets a screen and rolls to the basket',
      icon: '🏀',
      color: '#4CAF50',
      triggers: { 'screen_set': true, 'ball_handler': true },
      suggestions: ['Drop Coverage', 'Switch', 'Hedge']
    },
    {
      name: 'Isolation',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'ISO',
      description: 'One-on-one offensive play',
      icon: '👤',
      color: '#2196F3',
      triggers: { 'one_on_one': true, 'clear_out': true },
      suggestions: ['Double Team', 'Help Defense', 'Contest']
    },
    {
      name: 'Post Up',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Post',
      description: 'Offensive player establishes position in the post',
      icon: '🏠',
      color: '#FF9800',
      triggers: { 'post_position': true, 'back_to_basket': true },
      suggestions: ['Double Team', 'Deny Entry', 'Front Post']
    },
    {
      name: 'Off-Ball Screen',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Screen',
      description: 'Screen set for a player without the ball',
      icon: '🚧',
      color: '#9C27B0',
      triggers: { 'screen_set': true, 'off_ball': true },
      suggestions: ['Switch', 'Fight Through', 'Go Under']
    },

    // Defensive Actions
    {
      name: 'Drop Coverage',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'PnR Defense',
      description: 'Defensive strategy where big man drops back on pick and roll',
      icon: '⬇️',
      color: '#F44336',
      triggers: { 'pick_and_roll': true, 'big_drops': true },
      suggestions: ['Contest', 'Rebound', 'Help']
    },
    {
      name: 'Switch',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'PnR Defense',
      description: 'Defenders switch assignments on pick and roll',
      icon: '🔄',
      color: '#E91E63',
      triggers: { 'pick_and_roll': true, 'defenders_switch': true },
      suggestions: ['Mismatch', 'Help Defense', 'Recover']
    },
    {
      name: 'Double Team',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Help',
      description: 'Two defenders guard one offensive player',
      icon: '👥',
      color: '#795548',
      triggers: { 'star_player': true, 'isolation': true },
      suggestions: ['Kick Out', 'Pass', 'Turnover']
    },
    {
      name: 'Help Defense',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Help',
      description: 'Defender leaves assignment to help on ball',
      icon: '🆘',
      color: '#607D8B',
      triggers: { 'penetration': true, 'help_needed': true },
      suggestions: ['Recover', 'Rotate', 'Close Out']
    },

    // Transition
    {
      name: 'Fast Break',
      category: 'TRANSITION',
      subcategory: 'Offense',
      description: 'Quick offensive transition after defensive rebound/steal',
      icon: '⚡',
      color: '#FF5722',
      triggers: { 'defensive_rebound': true, 'quick_transition': true },
      suggestions: ['Layup', 'Dunk', 'Pull Up Three']
    },
    {
      name: 'Transition Defense',
      category: 'TRANSITION',
      subcategory: 'Defense',
      description: 'Defensive setup after offensive turnover/miss',
      icon: '🛡️',
      color: '#3F51B5',
      triggers: { 'offensive_turnover': true, 'defensive_setup': true },
      suggestions: ['Match Up', 'Protect Rim', 'Contest']
    },

    // Set Plays
    {
      name: 'Horns',
      category: 'SET_PLAY',
      subcategory: 'Formation',
      description: 'Offensive formation with two bigs at elbows',
      icon: '🐂',
      color: '#8BC34A',
      triggers: { 'formation': 'horns', 'two_bigs': true },
      suggestions: ['Pick and Roll', 'Post Up', 'Flare Screen']
    },
    {
      name: 'Flare Screen',
      category: 'SET_PLAY',
      subcategory: 'Screen',
      description: 'Screen set away from the ball to free shooter',
      icon: '🌟',
      color: '#FFC107',
      triggers: { 'screen_away': true, 'shooter': true },
      suggestions: ['Catch and Shoot', 'Relocate', 'Drive']
    }
  ];

  for (const tagData of tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: tagData,
      create: tagData
    });

    // Create glossary entry for each tag
    const glossaryData = getGlossaryEntry(tagData.name);
    if (glossaryData) {
      await prisma.glossaryEntry.upsert({
        where: { tagId: tag.id },
        update: glossaryData,
        create: {
          ...glossaryData,
          tagId: tag.id
        }
      });
    }
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

function getGlossaryEntry(tagName) {
  const entries = {
    'Pick and Roll': {
      title: 'Pick and Roll',
      definition: 'A fundamental basketball play where one player sets a screen (pick) for the ball handler, then rolls toward the basket.',
      explanation: 'The pick and roll is one of basketball\'s most effective offensive plays. The screener creates space for the ball handler, who can either drive to the basket or pass to the rolling screener. Defenses must choose between switching, dropping, or hedging to defend this play.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Screen', 'Roll', 'Pop', 'Hedge', 'Switch', 'Drop Coverage'],
      examples: {
        'scenarios': [
          'Point guard calls for screen from center',
          'Center sets screen, then rolls to basket',
          'Ball handler drives or passes to rolling big'
        ]
      }
    },
    'Drop Coverage': {
      title: 'Drop Coverage',
      definition: 'A defensive strategy where the big man defending the screener drops back toward the basket instead of switching or hedging.',
      explanation: 'In drop coverage, the defending big man retreats toward the basket to protect the rim while the ball handler\'s defender fights over the screen. This strategy prioritizes rim protection but can leave the ball handler open for mid-range shots.',
      difficulty: 'INTERMEDIATE',
      relatedTerms: ['Pick and Roll', 'Hedge', 'Switch', 'Rim Protection', 'Mid-Range'],
      examples: {
        'scenarios': [
          'Big man drops back on screen',
          'Ball handler gets mid-range opportunity',
          'Defense prioritizes rim protection'
        ]
      }
    },
    'Switch': {
      title: 'Switch',
      definition: 'A defensive tactic where two defenders exchange their assignments, typically in response to a screen.',
      explanation: 'When a switch occurs, defenders trade offensive players. This prevents the ball handler from getting open but can create mismatches. Teams often switch to avoid giving up open shots but must be prepared to handle size mismatches.',
      difficulty: 'INTERMEDIATE',
      relatedTerms: ['Pick and Roll', 'Mismatch', 'Communication', 'Help Defense'],
      examples: {
        'scenarios': [
          'Screen is set',
          'Defenders call out switch',
          'Big man guards guard, guard guards big'
        ]
      }
    }
  };

  return entries[tagName];
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 