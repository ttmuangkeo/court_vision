const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏀 Enhancing Court Vision tag categories for Phase 1A...');

  // Enhanced tag categories for Phase 1A
  const enhancedTags = [
    // ===== DEFENSIVE SCHEMES =====
    {
      name: 'Man-to-Man Defense',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Individual player assignments with one defender per offensive player',
      icon: '👤',
      color: '#F44336',
      triggers: { 'defensive_setup': true, 'individual_assignment': true },
      suggestions: ['Switch', 'Help Defense', 'Double Team']
    },
    {
      name: 'Zone Defense 2-3',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Zone defense with 2 players at the top, 3 in the paint',
      icon: '🛡️',
      color: '#E91E63',
      triggers: { 'zone_defense': true, 'paint_protection': true },
      suggestions: ['Perimeter Shot', 'High Post Entry', 'Corner Three']
    },
    {
      name: 'Zone Defense 3-2',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Zone defense with 3 players at the top, 2 in the paint',
      icon: '🛡️',
      color: '#9C27B0',
      triggers: { 'zone_defense': true, 'perimeter_pressure': true },
      suggestions: ['Post Entry', 'Paint Touch', 'Mid-Range Shot']
    },
    {
      name: 'Full-Court Press',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Aggressive defensive pressure across the entire court',
      icon: '⚡',
      color: '#FF5722',
      triggers: { 'full_court_pressure': true, 'aggressive_defense': true },
      suggestions: ['Steal', 'Turnover', 'Break Press']
    },
    {
      name: 'Trap Defense',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Double-teaming strategy to force turnovers or bad passes',
      icon: '🕸️',
      color: '#795548',
      triggers: { 'double_team': true, 'trap_setup': true },
      suggestions: ['Pass Out', 'Turnover', 'Split Trap']
    },
    {
      name: 'Help Defense',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Defensive rotation and support actions',
      icon: '🤝',
      color: '#607D8B',
      triggers: { 'defensive_rotation': true, 'help_situation': true },
      suggestions: ['Recover', 'Block', 'Contest Shot']
    },
    {
      name: 'Switch Defense',
      category: 'DEFENSIVE_ACTION',
      subcategory: 'DefensiveScheme',
      description: 'Defensive assignment exchanges on screens',
      icon: '🔄',
      color: '#00BCD4',
      triggers: { 'screen_set': true, 'defenders_switch': true },
      suggestions: ['Mismatch', 'Post Up', 'Isolation']
    },

    // ===== OFFENSIVE ACTIONS =====
    {
      name: 'Pick and Roll',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Ball handler uses screen and rolls to the basket',
      icon: '🏀',
      color: '#4CAF50',
      triggers: { 'screen_set': true, 'ball_handler': true },
      suggestions: ['Pass to Roller', 'Pull Up Shot', 'Drive']
    },
    {
      name: 'Pick and Pop',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Screen setter pops out for perimeter shot',
      icon: '🎯',
      color: '#8BC34A',
      triggers: { 'screen_set': true, 'pop_out': true },
      suggestions: ['Three Point Shot', 'Mid-Range Shot', 'Drive']
    },
    {
      name: 'Off-Ball Cut',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Player without ball makes cutting movement',
      icon: '✂️',
      color: '#CDDC39',
      triggers: { 'off_ball_movement': true, 'cut_action': true },
      suggestions: ['Catch and Shoot', 'Layup', 'Pass']
    },
    {
      name: 'Off-Ball Screen',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Screen set for player without the ball',
      icon: '🚧',
      color: '#FFC107',
      triggers: { 'off_ball_screen': true, 'screen_set': true },
      suggestions: ['Catch and Shoot', 'Drive', 'Pass']
    },
    {
      name: 'Post Up',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Player establishes position in the post',
      icon: '🏠',
      color: '#FF9800',
      triggers: { 'post_position': true, 'back_to_basket': true },
      suggestions: ['Post Score', 'Pass Out', 'Double Team']
    },
    {
      name: 'Transition Offense',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Fast break opportunity after defensive rebound or turnover',
      icon: '⚡',
      color: '#FF5722',
      triggers: { 'fast_break': true, 'transition_opportunity': true },
      suggestions: ['Layup', 'Three Point Shot', 'Pull Up Shot']
    },
    {
      name: 'Set Play',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'OffensiveAction',
      description: 'Designed offensive sequence from timeout or inbound',
      icon: '📋',
      color: '#9C27B0',
      triggers: { 'timeout_play': true, 'designed_sequence': true },
      suggestions: ['Screen Action', 'Pass', 'Shot']
    },

    // ===== SPECIAL SITUATIONS =====
    {
      name: 'End-of-Game Scenario',
      category: 'SPECIAL_SITUATION',
      subcategory: 'GameManagement',
      description: 'Clutch time management in final minutes',
      icon: '⏰',
      color: '#E91E63',
      triggers: { 'clutch_time': true, 'final_minutes': true },
      suggestions: ['Timeout', 'Foul', 'Three Point Shot']
    },
    {
      name: 'Strategic Foul',
      category: 'SPECIAL_SITUATION',
      subcategory: 'GameManagement',
      description: 'Intentional foul to stop clock or force free throws',
      icon: '🤝',
      color: '#795548',
      triggers: { 'intentional_foul': true, 'clock_management': true },
      suggestions: ['Free Throw', 'Rebound', 'Timeout']
    },
    {
      name: 'Timeout Usage',
      category: 'SPECIAL_SITUATION',
      subcategory: 'GameManagement',
      description: 'Strategic timeout call for play design or momentum',
      icon: '⏸️',
      color: '#607D8B',
      triggers: { 'timeout_called': true, 'strategic_break': true },
      suggestions: ['Set Play', 'Substitution', 'Defensive Adjustment']
    },
    {
      name: 'Coach Challenge',
      category: 'SPECIAL_SITUATION',
      subcategory: 'GameManagement',
      description: 'Coach challenges referee decision',
      icon: '📺',
      color: '#00BCD4',
      triggers: { 'challenge_initiated': true, 'review_process': true },
      suggestions: ['Overturned', 'Upheld', 'Timeout']
    },
    {
      name: 'Technical Foul',
      category: 'SPECIAL_SITUATION',
      subcategory: 'GameManagement',
      description: 'Behavioral or administrative foul',
      icon: '⚠️',
      color: '#FF5722',
      triggers: { 'technical_violation': true, 'behavioral_foul': true },
      suggestions: ['Free Throw', 'Ejection', 'Warning']
    },

    // ===== ENHANCED PLAYER ACTIONS =====
    {
      name: 'Pull Up Shot',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Shot',
      description: 'Player stops and shoots off the dribble',
      icon: '🎯',
      color: '#4CAF50',
      triggers: { 'dribble_stop': true, 'jump_shot': true },
      suggestions: ['Made Shot', 'Missed Shot', 'Foul']
    },
    {
      name: 'Step Back Shot',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Shot',
      description: 'Player steps back to create shooting space',
      icon: '↩️',
      color: '#8BC34A',
      triggers: { 'step_back': true, 'space_creation': true },
      suggestions: ['Made Shot', 'Missed Shot', 'Foul']
    },
    {
      name: 'Fade Away Shot',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Shot',
      description: 'Player shoots while moving backward',
      icon: '🌊',
      color: '#CDDC39',
      triggers: { 'fade_away': true, 'backward_movement': true },
      suggestions: ['Made Shot', 'Missed Shot', 'Foul']
    },
    {
      name: 'Euro Step',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Drive',
      description: 'Two-step move to avoid defender',
      icon: '🦘',
      color: '#FFC107',
      triggers: { 'euro_step': true, 'defender_avoidance': true },
      suggestions: ['Layup', 'Foul', 'Missed Shot']
    },
    {
      name: 'Spin Move',
      category: 'OFFENSIVE_ACTION',
      subcategory: 'Drive',
      description: '360-degree rotation to evade defender',
      icon: '🌀',
      color: '#FF9800',
      triggers: { 'spin_move': true, 'defender_evasion': true },
      suggestions: ['Layup', 'Pass', 'Turnover']
    }
  ];

  // Create enhanced tags and their glossary entries
  let createdCount = 0;
  let updatedCount = 0;

  for (const tagData of enhancedTags) {
    try {
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagData.name }
      });

      if (existingTag) {
        // Update existing tag with enhanced data
        await prisma.tag.update({
          where: { id: existingTag.id },
          data: {
            category: tagData.category,
            subcategory: tagData.subcategory,
            description: tagData.description,
            icon: tagData.icon,
            color: tagData.color,
            triggers: tagData.triggers,
            suggestions: tagData.suggestions
          }
        });
        updatedCount++;
        console.log(`✅ Updated tag: ${tagData.name}`);
      } else {
        // Create new tag
        const tag = await prisma.tag.create({
          data: tagData
        });
        createdCount++;
        console.log(`✅ Created tag: ${tagData.name}`);

        // Create glossary entry for new tags
        const glossaryData = getGlossaryEntry(tagData.name);
        if (glossaryData) {
          await prisma.glossaryEntry.create({
            data: {
              ...glossaryData,
              tagId: tag.id
            }
          });
          console.log(`📚 Created glossary entry for: ${tagData.name}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing tag "${tagData.name}":`, error.message);
    }
  }

  console.log(`\n🎉 Phase 1A Tag Enhancement Complete!`);
  console.log(`📊 Created: ${createdCount} new tags`);
  console.log(`🔄 Updated: ${updatedCount} existing tags`);
  console.log(`📚 Added glossary entries for new tags`);
}

function getGlossaryEntry(tagName) {
  const entries = {
    'Man-to-Man Defense': {
      title: 'Man-to-Man Defense',
      definition: 'A defensive strategy where each defender is assigned to guard one specific offensive player.',
      explanation: 'Man-to-man defense is the most common defensive scheme in basketball. Each defender follows their assigned offensive player, providing individual accountability and allowing for clear defensive responsibilities.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Switch', 'Help Defense', 'Double Team', 'Zone Defense'],
      examples: {
        scenarios: [
          'Point guard defends opposing point guard',
          'Center guards opposing center',
          'Each player has clear defensive assignment'
        ]
      }
    },
    'Zone Defense 2-3': {
      title: 'Zone Defense 2-3',
      definition: 'A zone defensive scheme with 2 players at the top of the key and 3 players in the paint area.',
      explanation: 'The 2-3 zone is effective at protecting the paint and forcing outside shots. The two top defenders pressure the perimeter while the three back defenders protect the basket and rebound.',
      difficulty: 'INTERMEDIATE',
      relatedTerms: ['Zone Defense 3-2', 'Paint Protection', 'Perimeter Defense'],
      examples: {
        scenarios: [
          'Two guards at the top of the key',
          'Three big men in the paint',
          'Forces outside shots and protects rim'
        ]
      }
    },
    'Pick and Roll': {
      title: 'Pick and Roll',
      definition: 'An offensive play where a player sets a screen for the ball handler, then rolls toward the basket.',
      explanation: 'The pick and roll is one of basketball\'s most effective offensive plays. The screener creates space for the ball handler, then becomes a scoring threat by rolling to the basket.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Screen', 'Roll', 'Switch', 'Drop Coverage'],
      examples: {
        scenarios: [
          'Big man sets screen for guard',
          'Guard uses screen to get open',
          'Big man rolls to basket for pass'
        ]
      }
    },
    'Transition Offense': {
      title: 'Transition Offense',
      definition: 'Fast break offense that occurs immediately after gaining possession of the ball.',
      explanation: 'Transition offense capitalizes on defensive disorganization. Teams push the ball quickly before the defense can set up, creating easy scoring opportunities.',
      difficulty: 'BEGINNER',
      relatedTerms: ['Fast Break', 'Early Offense', 'Secondary Break'],
      examples: {
        scenarios: [
          'Defensive rebound leads to fast break',
          'Steal creates transition opportunity',
          'Quick ball movement before defense sets'
        ]
      }
    },
    'End-of-Game Scenario': {
      title: 'End-of-Game Scenario',
      definition: 'Critical game situations in the final minutes that require strategic decision-making.',
      explanation: 'End-of-game scenarios test a team\'s execution under pressure. Coaches must manage timeouts, fouls, and play calls to maximize scoring opportunities.',
      difficulty: 'ADVANCED',
      relatedTerms: ['Clutch Time', 'Timeout Management', 'Foul Strategy'],
      examples: {
        scenarios: [
          'Down by 3 with 30 seconds left',
          'Managing fouls to extend game',
          'Strategic timeout usage'
        ]
      }
    }
  };

  return entries[tagName];
}

main()
  .catch((e) => {
    console.error('❌ Error enhancing tag categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 