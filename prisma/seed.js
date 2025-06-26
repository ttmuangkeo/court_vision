const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Court Vision database...');

  // Create basketball tags for MVP
  const tags = [
    // Core Defensive Actions (what you see happening to the player)
    {
      name: 'Double Team',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'Help',
      description: 'Two defenders guard one offensive player',
      icon: '👥',
      color: '#F44336',
      triggers: { 'star_player': true, 'isolation': true },
      suggestions: ['Pass to Open Player', 'Shoot Contested', 'Drive to Basket']
    },
    {
      name: 'Screen',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'PnR',
      description: 'Offensive player sets a screen',
      icon: '🚧',
      color: '#2196F3',
      triggers: { 'pick_set': true },
      suggestions: ['Switch', 'Fight Through', 'Go Under']
    },
    {
      name: 'Switch',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'PnR Defense',
      description: 'Defenders switch assignments on screen',
      icon: '🔄',
      color: '#E91E63',
      triggers: { 'screen_set': true, 'defenders_switch': true },
      suggestions: ['Mismatch', 'Help Defense', 'Recover']
    },

    // Core Offensive Actions (what the player does)
    {
      name: 'Isolation',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'ISO',
      description: 'One-on-one offensive play',
      icon: '👤',
      color: '#4CAF50',
      triggers: { 'one_on_one': true, 'clear_out': true },
      suggestions: ['Score', 'Pass', 'Drive', 'Pull Up Shot']
    },
    {
      name: 'Pick and Roll',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'PnR',
      description: 'Ball handler uses screen and rolls',
      icon: '🏀',
      color: '#FF9800',
      triggers: { 'screen_set': true, 'ball_handler': true },
      suggestions: ['Pass to Roller', 'Pull Up Shot', 'Drive']
    },
    {
      name: 'Post Up',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Post',
      description: 'Player establishes position in the post',
      icon: '🏠',
      color: '#9C27B0',
      triggers: { 'post_position': true, 'back_to_basket': true },
      suggestions: ['Score', 'Pass Out', 'Double Team']
    },

    // Player Responses (what happens next)
    {
      name: 'Pass to Open Player',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Pass',
      description: 'Player passes to open teammate',
      icon: '📤',
      color: '#00BCD4',
      triggers: { 'double_team': true, 'help_defense': true },
      suggestions: ['Assist', 'Open Shot', 'Drive']
    },
    {
      name: 'Shoot Contested',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Shot',
      description: 'Player shoots with defender contesting',
      icon: '🎯',
      color: '#FF5722',
      triggers: { 'double_team': true, 'isolation': true },
      suggestions: ['Made', 'Missed', 'Foul']
    },
    {
      name: 'Drive to Basket',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Drive',
      description: 'Player drives toward the basket',
      icon: '🏃',
      color: '#795548',
      triggers: { 'isolation': true, 'pick_and_roll': true },
      suggestions: ['Score', 'Pass', 'Foul', 'Turnover']
    }
  ];

  // Create tags and their glossary entries
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

  console.log(`✅ Created ${tags.length} basketball tags for MVP`);
}

function getGlossaryEntry(tagName) {
  const entries = {
    'Double Team': {
      title: 'Double Team',
      definition: 'A defensive strategy where two defenders guard one offensive player.',
      explanation: 'Double teams are used against star players to force them to pass. The offensive player should look for the open teammate created by the double team.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Help Defense', 'Pass to Open Player', 'Isolation'],
      examples: {
        'scenarios': [
          'LeBron gets the ball in isolation',
          'Two defenders converge on him',
          'LeBron should pass to the open shooter'
        ]
      }
    },
    'Screen': {
      title: 'Screen',
      definition: 'An offensive play where one player blocks a defender to free a teammate.',
      explanation: 'Screens create space for ball handlers. Defenses must choose between switching, fighting through, or going under the screen.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Pick and Roll', 'Switch', 'Fight Through'],
      examples: {
        'scenarios': [
          'Big man sets screen for guard',
          'Guard uses screen to get open',
          'Defense must react quickly'
        ]
      }
    },
    'Isolation': {
      title: 'Isolation',
      definition: 'A one-on-one offensive play where teammates clear out.',
      explanation: 'Isolation plays give star players space to work. They can score, drive, or pass depending on the defensive coverage.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Double Team', 'Drive to Basket', 'Pull Up Shot'],
      examples: {
        'scenarios': [
          'Teammates spread to corners',
          'Star player gets ball at top',
          'One-on-one with defender'
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