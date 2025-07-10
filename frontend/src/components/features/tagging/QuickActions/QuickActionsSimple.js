import React, { useState, useEffect } from 'react';
import './QuickActions.css';
import './QuickActionsCompact.css';
import TagDetailsModal from '../TagDetailsModal';
import { playFlows, quickSequences } from './quickActionsConfig';

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

  const handleOutcomeAction = (action) => {
    // Create a simple sequence for the outcome
    onQuickTag('Quick Action');
    onQuickTag(action.name);
    
    // Auto-save immediately
    if (typeof onAutoSave === 'function') {
      setTimeout(() => onAutoSave(), 0);
    }
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
          <div className="outcome-based-title">⚡ Quick Outcome</div>
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

        {/* Quick Sequences - Compact */}
        <div className="quick-sequences-section compact">
          <div className="quick-sequences-title">Quick Sequences</div>
          <div className="quick-sequences-grid compact">
            {Object.entries(quickSequences).slice(0, 4).map(([name, actions]) => (
              <button
                key={name}
                onClick={() => {
                  actions.forEach(action => onQuickTag(action));
                  if (typeof onAutoSave === 'function') {
                    setTimeout(() => onAutoSave(), 0);
                  }
                }}
                disabled={isDisabled}
                className="quick-sequence-btn compact"
                title={`${name}: ${actions.join(' → ')}`}
              >
                <div className="quick-sequence-name">{name}</div>
                <div className="quick-sequence-preview">
                  {actions.slice(0, 2).join(' → ')}
                  {actions.length > 2 && '...'}
                </div>
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