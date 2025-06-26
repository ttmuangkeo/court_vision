// Configuration for quick action buttons used in tagging interface
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