// Configuration for quick action buttons used in tagging interface
export const quickActions = [
  { name: 'Double Team', color: '#FF6B6B', icon: '👥' },
  { name: 'Isolation', color: '#4ECDC4', icon: '🏀' },
  { name: 'Pick & Roll', color: '#45B7D1', icon: '🔄' },
  { name: 'Post Up', color: '#96CEB4', icon: '📯' },
  { name: 'Transition', color: '#FFEAA7', icon: '⚡' },
  { name: '3-Pointer', color: '#DDA0DD', icon: '🎯' },
  { name: 'Block', color: '#FF8C42', icon: '🛡️' },
  { name: 'Steal', color: '#FFD93D', icon: '🤲' }
];

// You can also add categories for future organization
export const actionCategories = {
  offensive: ['Isolation', 'Pick & Roll', 'Post Up', '3-Pointer'],
  defensive: ['Double Team', 'Block', 'Steal'],
  transition: ['Transition']
}; 