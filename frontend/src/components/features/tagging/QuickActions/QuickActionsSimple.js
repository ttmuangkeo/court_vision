import React, { useState, useEffect } from 'react';
import './QuickActions.css';
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
        {/* Outcome-Based Quick Tagging - Compact */}
        <div className="outcome-based-section compact">
          <div className="outcome-based-title">⚡ Quick Tags</div>
          <div className="outcome-based-description">Click to add, then save manually</div>
          <div className="outcome-based-grid compact">
            {outcomeActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleOutcomeAction(action)}
                disabled={isDisabled}
                className="outcome-action-btn compact"
                style={{ backgroundColor: action.color }}
                title={`Quick tag: ${action.name}`}
              >
                <span className="outcome-action-icon">{action.icon}</span>
                <span className="outcome-action-name">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Complex Playmaker Multi-Step Actions */}
        <div className="complex-playmaker-section compact">
          <div className="complex-playmaker-title">🧠 Complex Plays</div>
          <div className="complex-playmaker-description">Rich context for any playmaker</div>
          <div className="complex-playmaker-grid compact">
            {complexPlaymakerActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleComplexPlaymakerAction(action)}
                disabled={isDisabled}
                className="complex-playmaker-btn compact"
                style={{ backgroundColor: action.color }}
                title={action.description}
              >
                <span className="complex-playmaker-name">{action.name}</span>
                <span className="complex-playmaker-desc">{action.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Simple Flow Options - Compact */}
        <div className="flow-section compact">
          <div className="flow-title">🎯 Main Action</div>
          
          <div className="flow-options-grid compact">
            {[
              { name: 'Bringing Ball Up', icon: '🏀', color: '#4CAF50' },
              { name: 'Off-Ball Movement', icon: '🏃', color: '#2196F3' },
              { name: 'Post Up', icon: '📯', color: '#FF9800' },
              { name: 'Pick and Roll', icon: '🔄', color: '#9C27B0' },
              { name: 'Isolation', icon: '👤', color: '#E91E63' },
              { name: 'Transition', icon: '⚡', color: '#607D8B' }
            ].map((option, index) => (
              <button
                key={index}
                onClick={() => onQuickTag(option.name)}
                disabled={isDisabled}
                className="flow-option-btn compact"
                style={{ backgroundColor: option.color }}
                title={option.name}
              >
                <span className="flow-option-icon">{option.icon}</span>
                <span className="flow-option-name">{option.name}</span>
              </button>
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