// Flow-based tagging configuration for intuitive basketball analysis
export const playFlows = {
  // INITIAL SITUATION - What's happening when the player gets the ball?
  'initial': {
    label: '🎯 What is the player doing?',
    description: 'Select the initial situation or action',
    options: [
      { name: 'Bringing Ball Up', icon: '🏀', color: '#4CAF50', nextFlow: 'ball_handler' },
      { name: 'Off-Ball Movement', icon: '🏃', color: '#2196F3', nextFlow: 'off_ball' },
      { name: 'Defensive Play', icon: '🛡️', color: '#F44336', nextFlow: 'defensive' },
      { name: 'Transition', icon: '⚡', color: '#FF9800', nextFlow: 'transition' },
      { name: 'Set Play', icon: '📋', color: '#9C27B0', nextFlow: 'set_play' },
      { name: 'Complex Playmaker', icon: '🧠', color: '#E91E63', nextFlow: 'complex_playmaker' }
    ]
  },

  // BALL HANDLER FLOW - Player has the ball, what's the setup?
  'ball_handler': {
    label: '🏀 Ball Handler Setup',
    description: 'How is the player setting up their attack?',
    options: [
      { name: 'Calling for Screen', icon: '📞', color: '#4CAF50', nextFlow: 'screen_action' },
      { name: 'Isolation', icon: '👤', color: '#2196F3', nextFlow: 'isolation' },
      { name: 'Post Up', icon: '📯', color: '#FF9800', nextFlow: 'post_up' },
      { name: 'Quick Shot', icon: '🎯', color: '#9C27B0', nextFlow: 'shot_result' }
    ]
  },

  // SCREEN ACTION FLOW - What happens with the screen?
  'screen_action': {
    label: '🔄 Screen Action',
    description: 'What type of screen and how is it used?',
    options: [
      { name: 'Pick and Roll', icon: '🔄', color: '#4CAF50', nextFlow: 'pick_roll_result' },
      { name: 'Pick and Pop', icon: '📤', color: '#2196F3', nextFlow: 'pick_pop_result' },
      { name: 'Screen Mismatch', icon: '⚖️', color: '#FF9800', nextFlow: 'mismatch_action' },
      { name: 'Screen Rejection', icon: '❌', color: '#F44336', nextFlow: 'isolation' }
    ]
  },

  // PICK AND ROLL RESULT FLOW
  'pick_roll_result': {
    label: '🔄 Pick and Roll Result',
    description: 'What happens after the pick and roll?',
    options: [
      { name: 'Drive to Basket', icon: '🏃', color: '#4CAF50', nextFlow: 'drive_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' },
      { name: 'Pass to Roller', icon: '📤', color: '#FF9800', nextFlow: 'pass_result' },
      { name: 'Pass to Corner', icon: '📤', color: '#9C27B0', nextFlow: 'pass_result' },
      { name: 'Double Teamed', icon: '👥', color: '#F44336', nextFlow: 'double_team_response' }
    ]
  },

  // PICK AND POP RESULT FLOW
  'pick_pop_result': {
    label: '📤 Pick and Pop Result',
    description: 'What happens after the pick and pop?',
    options: [
      { name: 'Pull Up Shot', icon: '🎯', color: '#4CAF50', nextFlow: 'shot_result' },
      { name: 'Drive to Basket', icon: '🏃', color: '#2196F3', nextFlow: 'drive_result' },
      { name: 'Pass to Popper', icon: '📤', color: '#FF9800', nextFlow: 'pass_result' },
      { name: 'Double Teamed', icon: '👥', color: '#F44336', nextFlow: 'double_team_response' }
    ]
  },

  // MISMATCH ACTION FLOW - Player has a mismatch, what do they do?
  'mismatch_action': {
    label: '⚖️ Mismatch Action',
    description: 'How does the player exploit the mismatch?',
    options: [
      { name: 'Drive to Basket', icon: '🏃', color: '#4CAF50', nextFlow: 'drive_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' },
      { name: 'Post Up', icon: '📯', color: '#FF9800', nextFlow: 'post_up' },
      { name: 'Step Back', icon: '↩️', color: '#9C27B0', nextFlow: 'shot_result' },
      { name: 'Pass Out', icon: '📤', color: '#607D8B', nextFlow: 'pass_result' }
    ]
  },

  // ISOLATION FLOW - Player is isolated, what happens?
  'isolation': {
    label: '👤 Isolation Action',
    description: 'What does the player do in isolation?',
    options: [
      { name: 'Drive to Basket', icon: '🏃', color: '#4CAF50', nextFlow: 'drive_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' },
      { name: 'Step Back', icon: '↩️', color: '#FF9800', nextFlow: 'shot_result' },
      { name: 'Fade Away', icon: '🌊', color: '#9C27B0', nextFlow: 'shot_result' },
      { name: 'Double Teamed', icon: '👥', color: '#F44336', nextFlow: 'double_team_response' }
    ]
  },

  // POST UP FLOW
  'post_up': {
    label: '📯 Post Up Action',
    description: 'What happens in the post?',
    options: [
      { name: 'Drive to Basket', icon: '🏃', color: '#4CAF50', nextFlow: 'drive_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' },
      { name: 'Fade Away', icon: '🌊', color: '#FF9800', nextFlow: 'shot_result' },
      { name: 'Pass Out', icon: '📤', color: '#9C27B0', nextFlow: 'pass_result' },
      { name: 'Double Teamed', icon: '👥', color: '#F44336', nextFlow: 'double_team_response' }
    ]
  },

  // DOUBLE TEAM RESPONSE FLOW
  'double_team_response': {
    label: '👥 Double Team Response',
    description: 'How does the player respond to double team?',
    options: [
      { name: 'Pass Out', icon: '📤', color: '#4CAF50', nextFlow: 'pass_result' },
      { name: 'Split Defense', icon: '✂️', color: '#2196F3', nextFlow: 'drive_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#FF9800', nextFlow: 'shot_result' },
      { name: 'Step Back', icon: '↩️', color: '#9C27B0', nextFlow: 'shot_result' }
    ]
  },

  // DRIVE RESULT FLOW
  'drive_result': {
    label: '🏃 Drive Result',
    description: 'What happens on the drive?',
    options: [
      { name: 'Layup/Dunk', icon: '🏀', color: '#4CAF50', nextFlow: 'shot_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' },
      { name: 'Pass Out', icon: '📤', color: '#FF9800', nextFlow: 'pass_result' },
      { name: 'Foul Drawn', icon: '🚨', color: '#F44336', nextFlow: 'foul_result' },
      { name: 'Turnover', icon: '❌', color: '#9C27B0', nextFlow: 'turnover_result' }
    ]
  },

  // SHOT RESULT FLOW
  'shot_result': {
    label: '🎯 Shot Result',
    description: 'What was the result of the shot?',
    options: [
      { name: 'Made Shot', icon: '✅', color: '#4CAF50', nextFlow: 'end' },
      { name: 'Missed Shot', icon: '❌', color: '#F44336', nextFlow: 'rebound_result' },
      { name: 'Blocked', icon: '🛡️', color: '#FF9800', nextFlow: 'rebound_result' },
      { name: 'Foul Drawn', icon: '🚨', color: '#9C27B0', nextFlow: 'foul_result' }
    ]
  },

  // PASS RESULT FLOW
  'pass_result': {
    label: '📤 Pass Result',
    description: 'What happens after the pass?',
    options: [
      { name: 'Assist', icon: '✅', color: '#4CAF50', nextFlow: 'end' },
      { name: 'Turnover', icon: '❌', color: '#F44336', nextFlow: 'turnover_result' },
      { name: 'Shot Attempt', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' }
    ]
  },

  // REBOUND RESULT FLOW
  'rebound_result': {
    label: '🏀 Rebound Result',
    description: 'What happens with the rebound?',
    options: [
      { name: 'Offensive Rebound', icon: '🔄', color: '#4CAF50', nextFlow: 'end' },
      { name: 'Defensive Rebound', icon: '🛡️', color: '#2196F3', nextFlow: 'end' },
      { name: 'Out of Bounds', icon: '📤', color: '#FF9800', nextFlow: 'end' }
    ]
  },

  // FOUL RESULT FLOW
  'foul_result': {
    label: '🚨 Foul Result',
    description: 'What happens with the foul?',
    options: [
      { name: 'Free Throws', icon: '🎯', color: '#4CAF50', nextFlow: 'end' },
      { name: 'And One', icon: '➕', color: '#2196F3', nextFlow: 'end' },
      { name: 'Offensive Foul', icon: '❌', color: '#F44336', nextFlow: 'turnover_result' }
    ]
  },

  // TURNOVER RESULT FLOW
  'turnover_result': {
    label: '❌ Turnover Result',
    description: 'What type of turnover?',
    options: [
      { name: 'Bad Pass', icon: '📤', color: '#F44336', nextFlow: 'end' },
      { name: 'Traveling', icon: '🚶', color: '#FF9800', nextFlow: 'end' },
      { name: 'Offensive Foul', icon: '🚨', color: '#9C27B0', nextFlow: 'end' },
      { name: 'Shot Clock Violation', icon: '⏰', color: '#607D8B', nextFlow: 'end' }
    ]
  },

  // TRANSITION FLOW
  'transition': {
    label: '⚡ Transition Action',
    description: 'What happens in transition?',
    options: [
      { name: 'Drive to Basket', icon: '🏃', color: '#4CAF50', nextFlow: 'drive_result' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#2196F3', nextFlow: 'shot_result' },
      { name: 'Pass Out', icon: '📤', color: '#FF9800', nextFlow: 'pass_result' },
      { name: 'Layup/Dunk', icon: '🏀', color: '#9C27B0', nextFlow: 'shot_result' }
    ]
  },

  // DEFENSIVE FLOW
  'defensive': {
    label: '🛡️ Defensive Action',
    description: 'What defensive play was made?',
    options: [
      { name: 'Block', icon: '🛡️', color: '#4CAF50', nextFlow: 'end' },
      { name: 'Steal', icon: '🤲', color: '#2196F3', nextFlow: 'end' },
      { name: 'Defensive Rebound', icon: '🏀', color: '#FF9800', nextFlow: 'end' },
      { name: 'Charge Taken', icon: '🚨', color: '#9C27B0', nextFlow: 'end' },
      { name: 'Good Defense', icon: '✅', color: '#607D8B', nextFlow: 'end' }
    ]
  },

  // OFF BALL FLOW
  'off_ball': {
    label: '🏃 Off-Ball Action',
    description: 'What off-ball movement or action?',
    options: [
      { name: 'Off-Ball Cut', icon: '🏃', color: '#4CAF50', nextFlow: 'end' },
      { name: 'Screen Set', icon: '📞', color: '#2196F3', nextFlow: 'end' },
      { name: 'Spacing', icon: '📏', color: '#FF9800', nextFlow: 'end' },
      { name: 'Backdoor Cut', icon: '🚪', color: '#9C27B0', nextFlow: 'end' }
    ]
  },

  // SET PLAY FLOW
  'set_play': {
    label: '📋 Set Play Action',
    description: 'What type of set play?',
    options: [
      { name: 'Set Play', icon: '📋', color: '#9C27B0', nextFlow: 'set_play_type' },
      { name: 'Pick and Roll', icon: '🔄', color: '#4CAF50', nextFlow: 'pick_roll_result' },
      { name: 'Pick and Pop', icon: '📤', color: '#2196F3', nextFlow: 'pick_pop_result' },
      { name: 'Post Up', icon: '📯', color: '#FF9800', nextFlow: 'post_up' },
      { name: 'Isolation', icon: '👤', color: '#607D8B', nextFlow: 'isolation' }
    ]
  },

  // SET PLAY TYPE FLOW
  'set_play_type': {
    label: '📋 Set Play Type',
    description: 'What type of set play was called?',
    options: [
      { name: 'Pick and Roll', icon: '🔄', color: '#4CAF50', nextFlow: 'pick_roll_result' },
      { name: 'Pick and Pop', icon: '📤', color: '#2196F3', nextFlow: 'pick_pop_result' },
      { name: 'Post Up', icon: '📯', color: '#FF9800', nextFlow: 'post_up' },
      { name: 'Isolation', icon: '👤', color: '#9C27B0', nextFlow: 'isolation' }
    ]
  },

  // COMPLEX PLAYMAKER FLOW - For players like Jokic
  'complex_playmaker': {
    label: '🧠 Complex Playmaker',
    description: 'Tag multi-step actions for unique playmakers (e.g. Jokic)',
    options: [
      { name: 'Off-Ball Screen Set', icon: '📞', color: '#4CAF50', nextFlow: 'screen_set_result' },
      { name: 'Dribble Handoff', icon: '🤝', color: '#2196F3', nextFlow: 'handoff_result' },
      { name: 'Post Up', icon: '📯', color: '#FF9800', nextFlow: 'post_up' },
      { name: 'High Post Play', icon: '🎯', color: '#9C27B0', nextFlow: 'high_post' },
      { name: 'Elbow Play', icon: '📐', color: '#E91E63', nextFlow: 'elbow_play' },
      { name: 'Back to Basket', icon: '🔄', color: '#607D8B', nextFlow: 'back_to_basket' },
      { name: 'Pass Out', icon: '📤', color: '#00BCD4', nextFlow: 'pass_result' },
      { name: 'Double Teamed', icon: '👥', color: '#F44336', nextFlow: 'double_team_response' }
    ]
  },

  // END FLOW - Play is complete
  'end': {
    label: '✅ Play Complete',
    description: 'The play sequence is complete',
    options: []
  }
};

// Quick shortcuts for common sequences
export const quickSequences = {
  'Screen Mismatch Drive': ['Bringing Ball Up', 'Calling for Screen', 'Screen Mismatch', 'Drive to Basket', 'Layup/Dunk'],
  'Screen Mismatch Shot': ['Bringing Ball Up', 'Calling for Screen', 'Screen Mismatch', 'Pull Up Shot', 'Made Shot'],
  'Pick and Roll Drive': ['Bringing Ball Up', 'Calling for Screen', 'Pick and Roll', 'Drive to Basket', 'Layup/Dunk'],
  'Pick and Roll Pass': ['Bringing Ball Up', 'Calling for Screen', 'Pick and Roll', 'Pass to Roller', 'Assist'],
  'Isolation Step Back': ['Bringing Ball Up', 'Isolation', 'Step Back', 'Made Shot'],
  'Double Team Pass': ['Bringing Ball Up', 'Isolation', 'Double Teamed', 'Pass Out', 'Assist'],
  'Jokic Sequence': ['Complex Playmaker', 'Off-Ball Screen Set', 'Dribble Handoff', 'Post Up', 'Double Teamed', 'Pass Out', 'Assist']
};

// Legacy support for existing tag system
export const quickActions = [
  // Offensive Actions (when player has the ball or is on offense)
  { name: 'Isolation', color: '#4ECDC4', icon: '🏀', category: 'offensive' },
  { name: 'Pick and Roll', color: '#45B7D1', icon: '🔄', category: 'offensive' },
  { name: 'Post Up', color: '#96CEB4', icon: '📯', category: 'offensive' },
  { name: 'Transition', color: '#FFEAA7', icon: '⚡', category: 'offensive' },
  { name: '3-Pointer', color: '#DDA0DD', icon: '🎯', category: 'offensive' },
  
  // Defensive Actions (when player is on defense)
  { name: 'Double Team Defense', color: '#FF8C42', icon: '🛡️', category: 'defensive' },
  { name: 'Block', color: '#FF8C42', icon: '🛡️', category: 'defensive' },
  { name: 'Steal', color: '#FFD93D', icon: '🤲', category: 'defensive' },
  
  // Defensive Pressure (what happens TO the player)
  { name: 'Double Teamed', color: '#FF6B6B', icon: '👥', category: 'pressure' },
  
  // Player Responses (what the player does after pressure)
  { name: 'Pass Out', color: '#4CAF50', icon: '📤', category: 'response' },
  { name: 'Split Defense', color: '#FF9800', icon: '✂️', category: 'response' },
  { name: 'Pull Up Shot', color: '#9C27B0', icon: '🎯', category: 'response' },
  { name: 'Drive to Basket', color: '#2196F3', icon: '🏃', category: 'response' },
  { name: 'Step Back', color: '#E91E63', icon: '↩️', category: 'response' },
  { name: 'Fade Away', color: '#607D8B', icon: '🌊', category: 'response' }
];

// Organized categories for better UX
export const actionCategories = {
  offensive: ['Isolation', 'Pick and Roll', 'Post Up', '3-Pointer', 'Transition'],
  defensive: ['Double Team Defense', 'Block', 'Steal'],
  pressure: ['Double Teamed'],
  responses: ['Pass Out', 'Split Defense', 'Pull Up Shot', 'Drive to Basket', 'Step Back', 'Fade Away']
};

// Tag transition map: defines allowed next actions for each action
export const tagTransitionMap = {
  // Offensive starters
  'Isolation': ['Double Teamed', 'Pull Up Shot', 'Drive to Basket', 'Step Back', 'Fade Away'],
  'Pick and Roll': ['Double Teamed', 'Pass Out', 'Pull Up Shot', 'Drive to Basket'],
  'Post Up': ['Double Teamed', 'Pass Out', 'Fade Away', 'Pull Up Shot'],
  'Transition': ['Pull Up Shot', 'Drive to Basket', 'Pass Out'],
  '3-Pointer': [], // Terminal action

  // Defensive
  'Double Team Defense': [],
  'Block': [],
  'Steal': [],

  // Pressure
  'Double Teamed': ['Pass Out', 'Split Defense', 'Pull Up Shot', 'Drive to Basket'],

  // Responses
  'Pass Out': [],
  'Split Defense': ['Pull Up Shot', 'Drive to Basket'],
  'Pull Up Shot': [],
  'Drive to Basket': [],
  'Step Back': ['Pull Up Shot'],
  'Fade Away': [],
};

// Actions that can start a sequence
export const starterActions = [
  'Isolation', 'Pick and Roll', 'Post Up', 'Transition', '3-Pointer',
  'Double Team Defense', 'Block', 'Steal'
]; 