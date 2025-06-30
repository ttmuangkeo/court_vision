const prisma = require('../src/db/client');

const enhancedTags = [
  // Initial actions
  { 
    name: 'Bringing Ball Up', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Player brings the ball up the court', 
    icon: '🏀', 
    color: '#4CAF50',
    triggers: { ball_handler: true, transition_opportunity: true, primary_ball_handler: true },
    suggestions: ['Calling for Screen', 'Isolation', 'Quick Shot', 'Pass Out']
  },
  { 
    name: 'Off-Ball Movement', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Player movement without the ball', 
    icon: '🏃', 
    color: '#2196F3',
    triggers: { off_ball_movement: true, cutting_action: true, spacing: true },
    suggestions: ['Off-Ball Cut', 'Off-Ball Screen', 'Catch and Shoot', 'Drive']
  },
  { 
    name: 'Defensive Play', 
    category: 'DEFENSIVE_ACTION', 
    subcategory: 'DefensiveScheme', 
    description: 'Defensive action or scheme', 
    icon: '🛡️', 
    color: '#F44336',
    triggers: { defensive_setup: true, defensive_rotation: true },
    suggestions: ['Man-to-Man Defense', 'Zone Defense 2-3', 'Help Defense', 'Switch Defense']
  },
  { 
    name: 'Transition', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Transition play or fast break', 
    icon: '⚡', 
    color: '#FF9800',
    triggers: { fast_break: true, transition_opportunity: true, speed_advantage: true },
    suggestions: ['Drive to Basket', 'Layup/Dunk', 'Pull Up Shot', 'Pass Out']
  },
  
  // Ball handler actions
  { 
    name: 'Calling for Screen', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Player calls for a screen', 
    icon: '📞', 
    color: '#4CAF50',
    triggers: { screen_set: true, ball_handler: true, pick_action: true },
    suggestions: ['Pick and Roll', 'Pick and Pop', 'Screen Mismatch', 'Screen Rejection']
  },
  { 
    name: 'Isolation', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Isolation play for the ball handler', 
    icon: '👤', 
    color: '#2196F3',
    triggers: { one_on_one: true, ball_handler: true, mismatch_opportunity: true },
    suggestions: ['Drive to Basket', 'Pull Up Shot', 'Step Back', 'Fade Away']
  },
  { 
    name: 'Quick Shot', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Shot', 
    description: 'Quick shot attempt', 
    icon: '🎯', 
    color: '#9C27B0',
    triggers: { quick_release: true, catch_and_shoot: true, rhythm_shot: true },
    suggestions: ['Made Shot', 'Missed Shot', 'Blocked', 'Foul Drawn']
  },
  
  // Screen actions
  { 
    name: 'Screen Mismatch', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Screen creates a mismatch', 
    icon: '⚖️', 
    color: '#FF9800',
    triggers: { mismatch_created: true, screen_set: true, size_advantage: true },
    suggestions: ['Drive to Basket', 'Post Up', 'Pull Up Shot', 'Step Back']
  },
  { 
    name: 'Screen Rejection', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Screen is rejected or not used', 
    icon: '❌', 
    color: '#F44336',
    triggers: { screen_ignored: true, ball_handler: true, isolation_forced: true },
    suggestions: ['Isolation', 'Drive to Basket', 'Pull Up Shot', 'Pass Out']
  },
  
  // Drive actions
  { 
    name: 'Drive to Basket', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Drive', 
    description: 'Player drives to the basket', 
    icon: '🏃', 
    color: '#4CAF50',
    triggers: { penetration: true, rim_attack: true, ball_handler: true },
    suggestions: ['Layup/Dunk', 'Pull Up Shot', 'Pass Out', 'Foul Drawn']
  },
  { 
    name: 'Layup/Dunk', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Shot', 
    description: 'Layup or dunk attempt', 
    icon: '🏀', 
    color: '#4CAF50',
    triggers: { rim_shot: true, close_range: true, high_percentage: true },
    suggestions: ['Made Shot', 'Missed Shot', 'Blocked', 'Foul Drawn']
  },
  
  // Pass actions
  { 
    name: 'Pass to Roller', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Pass to the rolling screener', 
    icon: '📤', 
    color: '#FF9800',
    triggers: { pick_and_roll: true, screen_action: true, interior_pass: true },
    suggestions: ['Layup/Dunk', 'Made Shot', 'Missed Shot', 'Foul Drawn']
  },
  { 
    name: 'Pass to Corner', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Pass to corner shooter', 
    icon: '📤', 
    color: '#9C27B0',
    triggers: { kick_out: true, perimeter_pass: true, three_point_opportunity: true },
    suggestions: ['Quick Shot', 'Made Shot', 'Missed Shot', 'Shot Attempt']
  },
  { 
    name: 'Pass to Popper', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Pass to popping screener', 
    icon: '📤', 
    color: '#FF9800',
    triggers: { pick_and_pop: true, screen_action: true, perimeter_pass: true },
    suggestions: ['Pull Up Shot', 'Made Shot', 'Missed Shot', 'Shot Attempt']
  },
  { 
    name: 'Pass Out', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Pass out of pressure', 
    icon: '📤', 
    color: '#607D8B',
    triggers: { pressure_situation: true, kick_out: true, ball_movement: true },
    suggestions: ['Quick Shot', 'Shot Attempt', 'Made Shot', 'Missed Shot']
  },
  
  // Double team actions
  { 
    name: 'Double Teamed', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Player is double teamed', 
    icon: '👥', 
    color: '#F44336',
    triggers: { double_team: true, pressure_situation: true, ball_handler: true },
    suggestions: ['Pass Out', 'Split Defense', 'Pull Up Shot', 'Turnover']
  },
  { 
    name: 'Split Defense', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Drive', 
    description: 'Player splits the double team', 
    icon: '✂️', 
    color: '#2196F3',
    triggers: { double_team: true, penetration: true, ball_handler: true },
    suggestions: ['Layup/Dunk', 'Pull Up Shot', 'Foul Drawn', 'Made Shot']
  },
  
  // Shot results
  { 
    name: 'Made Shot', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Shot', 
    description: 'Shot was made', 
    icon: '✅', 
    color: '#4CAF50',
    triggers: { successful_shot: true, points_scored: true, offensive_success: true },
    suggestions: ['Assist', 'And One', 'Offensive Rebound', 'Defensive Rebound']
  },
  { 
    name: 'Missed Shot', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Shot', 
    description: 'Shot was missed', 
    icon: '❌', 
    color: '#F44336',
    triggers: { missed_shot: true, rebound_opportunity: true, offensive_failure: true },
    suggestions: ['Offensive Rebound', 'Defensive Rebound', 'Out of Bounds']
  },
  { 
    name: 'Blocked', 
    category: 'DEFENSIVE_ACTION', 
    subcategory: 'DefensiveScheme', 
    description: 'Shot was blocked', 
    icon: '🛡️', 
    color: '#FF9800',
    triggers: { defensive_success: true, shot_denied: true, rim_protection: true },
    suggestions: ['Defensive Rebound', 'Offensive Rebound', 'Out of Bounds']
  },
  { 
    name: 'Shot Attempt', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Shot', 
    description: 'Shot attempt by recipient', 
    icon: '🎯', 
    color: '#2196F3',
    triggers: { catch_and_shoot: true, pass_recipient: true, shot_opportunity: true },
    suggestions: ['Made Shot', 'Missed Shot', 'Blocked', 'Foul Drawn']
  },
  
  // Foul actions
  { 
    name: 'Foul Drawn', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Player draws a foul', 
    icon: '🚨', 
    color: '#F44336',
    triggers: { foul_drawn: true, free_throw_opportunity: true, contact_made: true },
    suggestions: ['Free Throws', 'And One', 'Made Shot', 'Missed Shot']
  },
  { 
    name: 'Free Throws', 
    category: 'SPECIAL_SITUATION', 
    subcategory: 'GameManagement', 
    description: 'Free throw attempt', 
    icon: '🎯', 
    color: '#4CAF50',
    triggers: { free_throw: true, foul_situation: true, scoring_opportunity: true },
    suggestions: ['Made Shot', 'Missed Shot', 'Offensive Rebound', 'Defensive Rebound']
  },
  { 
    name: 'And One', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'Shot', 
    description: 'Made shot with foul', 
    icon: '➕', 
    color: '#2196F3',
    triggers: { and_one: true, made_shot: true, foul_drawn: true },
    suggestions: ['Free Throws', 'Made Shot', 'Offensive Rebound', 'Defensive Rebound']
  },
  
  // Turnover actions
  { 
    name: 'Turnover', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Turnover by player', 
    icon: '❌', 
    color: '#9C27B0',
    triggers: { turnover: true, offensive_mistake: true, possession_lost: true },
    suggestions: ['Bad Pass', 'Traveling', 'Offensive Foul', 'Shot Clock Violation']
  },
  { 
    name: 'Bad Pass', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Bad pass turnover', 
    icon: '📤', 
    color: '#F44336',
    triggers: { bad_pass: true, turnover: true, passing_mistake: true },
    suggestions: ['Defensive Rebound', 'Out of Bounds', 'Steal']
  },
  { 
    name: 'Traveling', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Traveling violation', 
    icon: '🚶', 
    color: '#FF9800',
    triggers: { traveling: true, turnover: true, footwork_violation: true },
    suggestions: ['Defensive Rebound', 'Out of Bounds']
  },
  { 
    name: 'Shot Clock Violation', 
    category: 'SPECIAL_SITUATION', 
    subcategory: 'GameManagement', 
    description: 'Shot clock violation', 
    icon: '⏰', 
    color: '#607D8B',
    triggers: { shot_clock: true, turnover: true, time_management: true },
    suggestions: ['Defensive Rebound', 'Out of Bounds']
  },
  
  // Rebound actions
  { 
    name: 'Offensive Rebound', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Offensive rebound', 
    icon: '🔄', 
    color: '#4CAF50',
    triggers: { offensive_rebound: true, second_chance: true, possession_retained: true },
    suggestions: ['Quick Shot', 'Layup/Dunk', 'Pull Up Shot', 'Pass Out']
  },
  { 
    name: 'Defensive Rebound', 
    category: 'DEFENSIVE_ACTION', 
    subcategory: 'DefensiveScheme', 
    description: 'Defensive rebound', 
    icon: '🛡️', 
    color: '#2196F3',
    triggers: { defensive_rebound: true, possession_gained: true, defensive_success: true },
    suggestions: ['Bringing Ball Up', 'Transition', 'Pass Out']
  },
  { 
    name: 'Out of Bounds', 
    category: 'SPECIAL_SITUATION', 
    subcategory: 'GameManagement', 
    description: 'Ball goes out of bounds', 
    icon: '📤', 
    color: '#FF9800',
    triggers: { out_of_bounds: true, possession_change: true, boundary_violation: true },
    suggestions: ['Bringing Ball Up', 'Set Play', 'Off-Ball Movement']
  },
  
  // Assist
  { 
    name: 'Assist', 
    category: 'OFFENSIVE_ACTION', 
    subcategory: 'OffensiveAction', 
    description: 'Assist on made shot', 
    icon: '✅', 
    color: '#4CAF50',
    triggers: { assist: true, made_shot: true, playmaking: true },
    suggestions: ['Made Shot', 'Offensive Rebound', 'Defensive Rebound']
  }
];

async function main() {
  console.log('Updating tags with enhanced triggers and suggestions...');
  
  for (const tag of enhancedTags) {
    try {
      await prisma.tag.update({
        where: { name: tag.name },
        data: {
          triggers: tag.triggers,
          suggestions: tag.suggestions
        }
      });
      console.log(`✅ Enhanced: ${tag.name}`);
    } catch (error) {
      console.log(`❌ Error updating ${tag.name}:`, error.message);
    }
  }
  
  console.log('Finished enhancing tags with triggers and suggestions!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 