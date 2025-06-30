const prisma = require('../src/db/client');

const tags = [
  { name: 'Bringing Ball Up', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Player brings the ball up the court', icon: '🏀', color: '#4CAF50' },
  { name: 'Off-Ball Movement', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Player movement without the ball', icon: '🏃', color: '#2196F3' },
  { name: 'Defensive Play', category: 'DEFENSIVE_ACTION', subcategory: 'DefensiveScheme', description: 'Defensive action or scheme', icon: '🛡️', color: '#F44336' },
  { name: 'Transition', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Transition play or fast break', icon: '⚡', color: '#FF9800' },
  { name: 'Calling for Screen', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Player calls for a screen', icon: '📞', color: '#4CAF50' },
  { name: 'Isolation', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Isolation play for the ball handler', icon: '👤', color: '#2196F3' },
  { name: 'Quick Shot', category: 'OFFENSIVE_ACTION', subcategory: 'Shot', description: 'Quick shot attempt', icon: '🎯', color: '#9C27B0' },
  { name: 'Screen Mismatch', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Screen creates a mismatch', icon: '⚖️', color: '#FF9800' },
  { name: 'Screen Rejection', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Screen is rejected or not used', icon: '❌', color: '#F44336' },
  { name: 'Drive to Basket', category: 'OFFENSIVE_ACTION', subcategory: 'Drive', description: 'Player drives to the basket', icon: '🏃', color: '#4CAF50' },
  { name: 'Layup/Dunk', category: 'OFFENSIVE_ACTION', subcategory: 'Shot', description: 'Layup or dunk attempt', icon: '🏀', color: '#4CAF50' },
  { name: 'Pass to Roller', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Pass to the rolling screener', icon: '📤', color: '#FF9800' },
  { name: 'Pass to Corner', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Pass to corner shooter', icon: '📤', color: '#9C27B0' },
  { name: 'Pass to Popper', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Pass to popping screener', icon: '📤', color: '#FF9800' },
  { name: 'Pass Out', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Pass out of pressure', icon: '📤', color: '#607D8B' },
  { name: 'Double Teamed', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Player is double teamed', icon: '👥', color: '#F44336' },
  { name: 'Split Defense', category: 'OFFENSIVE_ACTION', subcategory: 'Drive', description: 'Player splits the double team', icon: '✂️', color: '#2196F3' },
  { name: 'Made Shot', category: 'OFFENSIVE_ACTION', subcategory: 'Shot', description: 'Shot was made', icon: '✅', color: '#4CAF50' },
  { name: 'Missed Shot', category: 'OFFENSIVE_ACTION', subcategory: 'Shot', description: 'Shot was missed', icon: '❌', color: '#F44336' },
  { name: 'Blocked', category: 'DEFENSIVE_ACTION', subcategory: 'DefensiveScheme', description: 'Shot was blocked', icon: '🛡️', color: '#FF9800' },
  { name: 'Shot Attempt', category: 'OFFENSIVE_ACTION', subcategory: 'Shot', description: 'Shot attempt by recipient', icon: '🎯', color: '#2196F3' },
  { name: 'Foul Drawn', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Player draws a foul', icon: '🚨', color: '#F44336' },
  { name: 'Free Throws', category: 'SPECIAL_SITUATION', subcategory: 'GameManagement', description: 'Free throw attempt', icon: '🎯', color: '#4CAF50' },
  { name: 'And One', category: 'OFFENSIVE_ACTION', subcategory: 'Shot', description: 'Made shot with foul', icon: '➕', color: '#2196F3' },
  { name: 'Turnover', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Turnover by player', icon: '❌', color: '#9C27B0' },
  { name: 'Bad Pass', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Bad pass turnover', icon: '📤', color: '#F44336' },
  { name: 'Traveling', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Traveling violation', icon: '🚶', color: '#FF9800' },
  { name: 'Shot Clock Violation', category: 'SPECIAL_SITUATION', subcategory: 'GameManagement', description: 'Shot clock violation', icon: '⏰', color: '#607D8B' },
  { name: 'Offensive Rebound', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Offensive rebound', icon: '🔄', color: '#4CAF50' },
  { name: 'Defensive Rebound', category: 'DEFENSIVE_ACTION', subcategory: 'DefensiveScheme', description: 'Defensive rebound', icon: '🛡️', color: '#2196F3' },
  { name: 'Out of Bounds', category: 'SPECIAL_SITUATION', subcategory: 'GameManagement', description: 'Ball goes out of bounds', icon: '📤', color: '#FF9800' },
  { name: 'Assist', category: 'OFFENSIVE_ACTION', subcategory: 'OffensiveAction', description: 'Assist on made shot', icon: '✅', color: '#4CAF50' }
];

async function main() {
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        category: tag.category,
        subcategory: tag.subcategory,
        description: tag.description,
        icon: tag.icon,
        color: tag.color,
        triggers: {},
        suggestions: [],
        isActive: true
      }
    });
    console.log(`Upserted tag: ${tag.name}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 