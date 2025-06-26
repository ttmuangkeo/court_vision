const prisma = require('../db/client');

const commonTags = [
  {
    name: 'Double Team',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Pressure',
    description: 'Two defenders actively guarding one offensive player',
    icon: '👥',
    color: '#FF6B6B'
  },
  {
    name: 'Isolation',
    category: 'OFFENSIVE_ACTION',
    subcategory: 'ISO',
    description: 'One-on-one offensive play, clearing out for a single player',
    icon: '🏀',
    color: '#4ECDC4'
  },
  {
    name: 'Pick & Roll',
    category: 'OFFENSIVE_ACTION',
    subcategory: 'PnR',
    description: 'Screener sets pick then rolls to basket',
    icon: '🔄',
    color: '#45B7D1'
  },
  {
    name: 'Post Up',
    category: 'OFFENSIVE_ACTION',
    subcategory: 'Post',
    description: 'Offensive player establishes position in the post',
    icon: '📯',
    color: '#96CEB4'
  },
  {
    name: 'Transition',
    category: 'TRANSITION',
    subcategory: 'Fast Break',
    description: 'Quick offensive play after defensive rebound or turnover',
    icon: '⚡',
    color: '#FFEAA7'
  },
  {
    name: '3-Pointer',
    category: 'OFFENSIVE_ACTION',
    subcategory: 'Shooting',
    description: 'Three-point field goal attempt or make',
    icon: '🎯',
    color: '#DDA0DD'
  },
  {
    name: 'Block',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Rim Protection',
    description: 'Defender blocks an opponent\'s shot',
    icon: '🛡️',
    color: '#FF8C42'
  },
  {
    name: 'Steal',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Ball Pressure',
    description: 'Defender takes the ball from an opponent',
    icon: '🤲',
    color: '#FFD93D'
  },
  {
    name: 'Drop Coverage',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Pick & Roll Defense',
    description: 'Big man drops back instead of switching on pick & roll',
    icon: '⬇️',
    color: '#A8E6CF'
  },
  {
    name: 'Switch',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Pick & Roll Defense',
    description: 'Defenders switch assignments on pick & roll',
    icon: '🔄',
    color: '#FFB6C1'
  },
  {
    name: 'Hedge',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Pick & Roll Defense',
    description: 'Big man steps out to slow ball handler then recovers',
    icon: '🛡️',
    color: '#87CEEB'
  },
  {
    name: 'Trap',
    category: 'DEFENSIVE_ACTION',
    subcategory: 'Pressure',
    description: 'Two defenders trap the ball handler',
    icon: '🕳️',
    color: '#DDA0DD'
  }
];

async function seedTags() {
  try {
    console.log('🏀 Seeding common basketball tags...');
    
    for (const tagData of commonTags) {
      await prisma.tag.upsert({
        where: { name: tagData.name },
        update: {
          category: tagData.category,
          subcategory: tagData.subcategory,
          description: tagData.description,
          icon: tagData.icon,
          color: tagData.color
        },
        create: {
          name: tagData.name,
          category: tagData.category,
          subcategory: tagData.subcategory,
          description: tagData.description,
          icon: tagData.icon,
          color: tagData.color
        }
      });
      console.log(`✅ Created/updated tag: ${tagData.name}`);
    }
    
    console.log('\n🎉 Tags seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Tags seeding failed:', error.message);
    process.exit(1);
  }
}

seedTags(); 