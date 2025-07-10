import React, { useState, useEffect } from 'react';
import './QuickActionsCompact.css';
import TagDetailsModal from '../TagDetailsModal';
import { playFlows } from './quickActionsConfig';

const API_BASE = 'http://localhost:3000/api';

function QuickActionsSimple({ onQuickTag, onAutoSave, selectedPlayer, gameTime, compact, currentSequence = [] }) {
  const isDisabled = !selectedPlayer || !gameTime;
  const [modalTag, setModalTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tags from the database
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch(`${API_BASE}/tags`);
        const data = await response.json();
        if (data.success) {
          setTags(data.data);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  // Outcome-based actions for quick tagging
  const outcomeActions = [
    { name: 'Assist', icon: '✅', color: '#4CAF50' },
    { name: 'Made Shot', icon: '🎯', color: '#2196F3' },
    { name: 'Missed Shot', icon: '❌', color: '#FF9800' },
    { name: 'Turnover', icon: '❌', color: '#F44336' },
    { name: 'Foul Drawn', icon: '🚨', color: '#9C27B0' },
    { name: 'Good Defense', icon: '🛡️', color: '#607D8B' }
  ];

  // Dynamic action categories for step-by-step tagging
  const dynamicActionCategories = {
    'Ball Movement': [
      { name: 'Dribble Handoff', icon: '🤝', color: '#4CAF50' },
      { name: 'Pass Out', icon: '📤', color: '#2196F3' },
      { name: 'Pass to Roller', icon: '🔄', color: '#FF9800' },
      { name: 'Pass to Corner', icon: '📐', color: '#9C27B0' }
    ],
    'Screens': [
      { name: 'Off-Ball Screen Set', icon: '📞', color: '#4CAF50' },
      { name: 'Pick and Roll', icon: '🔄', color: '#2196F3' },
      { name: 'Pick and Pop', icon: '📤', color: '#FF9800' },
      { name: 'Screen Mismatch', icon: '⚖️', color: '#9C27B0' }
    ],
    'Player Actions': [
      { name: 'Post Up', icon: '📯', color: '#4CAF50' },
      { name: 'Drive to Basket', icon: '🏃', color: '#2196F3' },
      { name: 'Pull Up Shot', icon: '🎯', color: '#FF9800' },
      { name: 'Step Back', icon: '↩️', color: '#9C27B0' },
      { name: 'Fade Away', icon: '🌊', color: '#E91E63' }
    ],
    'Defense': [
      { name: 'Double Teamed', icon: '👥', color: '#F44336' },
      { name: 'Split Defense', icon: '✂️', color: '#FF9800' },
      { name: 'Good Defense', icon: '🛡️', color: '#607D8B' }
    ],
    'Play Starters': [
      { name: 'Bringing Ball Up', icon: '🏀', color: '#4CAF50' },
      { name: 'Off-Ball Movement', icon: '🏃', color: '#2196F3' },
      { name: 'Isolation', icon: '👤', color: '#E91E63' },
      { name: 'Transition', icon: '⚡', color: '#607D8B' }
    ]
  };

  // Complex playmaker multi-step quick actions for rich context
  const complexPlaymakerActions = [
    { 
      name: '🎯 Screen Assist', 
      sequence: ['Off-Ball Screen Set', 'Dribble Handoff', 'Assist'],
      color: '#4CAF50',
      description: 'Screen set → Handoff → Assist'
    },
    { 
      name: '📯 Post Assist', 
      sequence: ['Post Up', 'Double Teamed', 'Pass Out', 'Assist'],
      color: '#2196F3',
      description: 'Post up → Double team → Pass → Assist'
    },
    { 
      name: '⚡ Transition Assist', 
      sequence: ['Transition', 'Drive to Basket', 'Pass Out', 'Assist'],
      color: '#FF9800',
      description: 'Transition → Drive → Pass → Assist'
    },
    { 
      name: '🔄 Pick & Roll Assist', 
      sequence: ['Pick and Roll', 'Drive to Basket', 'Pass to Roller', 'Assist'],
      color: '#9C27B0',
      description: 'Pick & roll → Drive → Pass → Assist'
    },
    { 
      name: '👤 Isolation Score', 
      sequence: ['Isolation', 'Double Teamed', 'Split Defense', 'Made Shot'],
      color: '#E91E63',
      description: 'Isolation → Double team → Split → Score'
    },
    { 
      name: '📐 Elbow Play', 
      sequence: ['High Post Play', 'Pull Up Shot', 'Made Shot'],
      color: '#607D8B',
      description: 'High post → Pull up → Score'
    }
  ];

  const handleOutcomeAction = (action) => {
    // Find the actual tag in the database
    const tag = tags.find(t => t.name === action.name);
    if (tag) {
      // Add the actual tag from database - let the user save manually
      onQuickTag(action.name);
      // Don't auto-save - let the user control when to save
    } else {
      console.warn(`Tag "${action.name}" not found in database`);
    }
  };

  const handleComplexPlaymakerAction = (quickAction) => {
    // Add each step in the sequence
    quickAction.sequence.forEach(step => {
      onQuickTag(step);
    });
    // Don't auto-save - let the user control when to save
  };

  const handleDynamicAction = (action) => {
    // Add to the main sequence via onQuickTag
    onQuickTag(action.name);
  };

  const removeAction = (index) => {
    // This would need to be implemented in the parent component
    // For now, we'll just call onQuickTag with a special "remove" action
    // The parent should handle this by removing the action at the specified index
    if (typeof onQuickTag === 'function') {
      // We'll use a special format to indicate removal
      onQuickTag(`REMOVE_AT_INDEX_${index}`);
    }
  };

  // Convert currentSequence to action names for display
  const currentActions = currentSequence.map(item => 
    typeof item === 'string' ? item : item.actionName || item.name || item
  );

  // Intelligent filtering based on sequence context
  const getFilteredActionCategories = () => {
    const filtered = { ...dynamicActionCategories };
    
    // If no actions yet, show all Play Starters
    if (currentActions.length === 0) {
      return {
        'Play Starters': dynamicActionCategories['Play Starters']
      };
    }

    const lastAction = currentActions[currentActions.length - 1];
    
    // After "Bringing Ball Up" - show Ball Movement and Screens
    if (lastAction === 'Bringing Ball Up') {
      return {
        'Ball Movement': dynamicActionCategories['Ball Movement'],
        'Screens': dynamicActionCategories['Screens']
      };
    }

    // After "Off-Ball Movement" - show Screens and Player Actions
    if (lastAction === 'Off-Ball Movement') {
      return {
        'Screens': dynamicActionCategories['Screens'],
        'Player Actions': dynamicActionCategories['Player Actions']
      };
    }

    // After "Isolation" - show Player Actions and Defense
    if (lastAction === 'Isolation') {
      return {
        'Player Actions': dynamicActionCategories['Player Actions'],
        'Defense': dynamicActionCategories['Defense']
      };
    }

    // After "Transition" - show Player Actions
    if (lastAction === 'Transition') {
      return {
        'Player Actions': dynamicActionCategories['Player Actions']
      };
    }

    // After screen actions - show Player Actions
    if (['Off-Ball Screen Set', 'Pick and Roll', 'Pick and Pop', 'Screen Mismatch'].includes(lastAction)) {
      return {
        'Player Actions': dynamicActionCategories['Player Actions']
      };
    }

    // After ball movement actions - show Player Actions or Screens
    if (['Dribble Handoff', 'Pass Out', 'Pass to Roller', 'Pass to Corner'].includes(lastAction)) {
      return {
        'Player Actions': dynamicActionCategories['Player Actions'],
        'Screens': dynamicActionCategories['Screens']
      };
    }

    // After player actions - show Defense or Ball Movement
    if (['Post Up', 'Drive to Basket', 'Pull Up Shot', 'Step Back', 'Fade Away'].includes(lastAction)) {
      return {
        'Defense': dynamicActionCategories['Defense'],
        'Ball Movement': dynamicActionCategories['Ball Movement']
      };
    }

    // After defense actions - show Player Actions or Ball Movement
    if (['Double Teamed', 'Split Defense', 'Good Defense'].includes(lastAction)) {
      return {
        'Player Actions': dynamicActionCategories['Player Actions'],
        'Ball Movement': dynamicActionCategories['Ball Movement']
      };
    }

    // Default: show all categories
    return filtered;
  };

  const filteredCategories = getFilteredActionCategories();

  if (loading) {
    return (
      <div className="quick-actions-container">
        <div className="quick-actions-instruction">Loading tags...</div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions-container">
        {/* Dynamic Step-by-Step Tagging */}
        <div className="dynamic-sequence-section compact">
          <div className="dynamic-sequence-title">🎬 Build Play Step-by-Step</div>
          <div className="dynamic-sequence-description">
            {currentActions.length === 0 
              ? "Start by selecting how the play begins..."
              : `Next logical actions after "${currentActions[currentActions.length - 1]}"`
            }
          </div>
          
          {/* Current Sequence Display */}
          {currentActions.length > 0 && (
            <div className="current-sequence-display compact">
              <div className="sequence-header">
                <span className="sequence-label">Current:</span>
                <div className="sequence-actions">
                  <button onClick={() => onAutoSave && onAutoSave()} className="save-sequence-btn compact">✅</button>
                  <button onClick={() => onQuickTag('CLEAR_ALL')} className="clear-sequence-btn compact">🗑️</button>
                </div>
              </div>
              <div className="sequence-items compact">
                {currentActions.map((action, index) => (
                  <span key={index} className="sequence-item compact">
                    <span className="sequence-item-text">{action}</span>
                    <button 
                      onClick={() => removeAction(index)}
                      className="sequence-item-remove"
                      title="Remove this action"
                    >
                      ×
                    </button>
                    {index < currentActions.length - 1 && <span className="sequence-arrow">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Intelligent Dynamic Action Categories */}
          <div className="dynamic-categories-grid">
            {Object.entries(filteredCategories).map(([category, actions]) => (
              <div key={category} className="dynamic-category">
                <div className="category-title">{category}</div>
                <div className="category-actions">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleDynamicAction(action)}
                      disabled={isDisabled}
                      className="dynamic-action-btn compact"
                      style={{ backgroundColor: action.color }}
                      title={action.name}
                    >
                      <span className="dynamic-action-icon">{action.icon}</span>
                      <span className="dynamic-action-name">{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tag Details Modal */}
      {modalTag && (
        <TagDetailsModal
          tag={modalTag}
          onClose={() => setModalTag(null)}
        />
      )}
    </>
  );
}

export default QuickActionsSimple; 