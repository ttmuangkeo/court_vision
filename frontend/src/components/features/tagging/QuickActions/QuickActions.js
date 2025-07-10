import React, { useState, useEffect } from 'react';
import './QuickActions.css';
import TagDetailsModal from '../TagDetailsModal';
import { playFlows, quickSequences } from './quickActionsConfig';

const API_BASE = 'http://localhost:3000/api';

// List of actions that should auto-save the sequence (handoff actions)
const HANDOFF_ACTIONS = [
  'Set Play', 'Pass to Roller', 'Pass to Corner', 'Pass to Popper', 'Pass Out', 'Assist',
  'Quick Shot', 'Pull Up Shot', 'Step Back', 'Fade Away', 'Layup/Dunk',
  'Made Shot', 'Missed Shot', 'Blocked', 'Shot Attempt',
  'Foul Drawn', 'Free Throws', 'And One', 'Offensive Foul',
  'Turnover', 'Bad Pass', 'Traveling', 'Shot Clock Violation',
  'Offensive Rebound', 'Defensive Rebound', 'Out of Bounds'
];

function QuickActions({ onQuickTag, onAutoSave, selectedPlayer, gameTime, compact, currentSequence = [] }) {
  const isDisabled = !selectedPlayer || !gameTime;
  const [modalTag, setModalTag] = useState(null);
  const [historicSuggestions, setHistoricSuggestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Flow-based state
  const [currentFlow, setCurrentFlow] = useState('initial');
  const [flowHistory, setFlowHistory] = useState([]);
  const [showQuickSequences, setShowQuickSequences] = useState(false);

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

  // Fetch historic next-tag suggestions when the last tag changes
  useEffect(() => {
    async function fetchSuggestions() {
      if (!currentSequence || currentSequence.length === 0) {
        setHistoricSuggestions([]);
        return;
      }
      const lastAction = currentSequence[currentSequence.length - 1]?.actionName || currentSequence[currentSequence.length - 1];
      try {
        const res = await fetch(`${API_BASE}/analytics/next-tag-suggestions?tag=${encodeURIComponent(lastAction)}`);
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.suggestions)) {
          setHistoricSuggestions(data.data.suggestions.map(s => s.name));
        } else {
          setHistoricSuggestions([]);
        }
      } catch (err) {
        setHistoricSuggestions([]);
      }
    }
    fetchSuggestions();
  }, [currentSequence]);

  const handleFlowOption = (option) => {
    // Add the action to the sequence
    onQuickTag(option.name);
    // Auto-save if this is a handoff action
    if (HANDOFF_ACTIONS.includes(option.name) && typeof onAutoSave === 'function') {
      setTimeout(() => {
        onAutoSave();
        // After auto-save, reset the flow and flow history
        setCurrentFlow('initial');
        setFlowHistory([]);
      }, 0);
      return; // Prevent further flow logic after auto-save
    }
    // Update flow history
    setFlowHistory(prev => [...prev, { flow: currentFlow, option }]);
    // Move to next flow if it exists
    if (option.nextFlow && option.nextFlow !== 'end') {
      setCurrentFlow(option.nextFlow);
    } else {
      // Play is complete, reset to initial flow
      setCurrentFlow('initial');
      setFlowHistory([]);
    }
  };

  const handleQuickSequence = (sequenceName, actions) => {
    // Apply all actions in the sequence
    actions.forEach(action => {
      onQuickTag(action);
    });
    // Reset flow
    setCurrentFlow('initial');
    setFlowHistory([]);
    setShowQuickSequences(false);
  };

  const handleBackInFlow = () => {
    if (flowHistory.length > 0) {
      const newHistory = flowHistory.slice(0, -1);
      setFlowHistory(newHistory);
      if (newHistory.length > 0) {
        setCurrentFlow(newHistory[newHistory.length - 1].flow);
      } else {
        setCurrentFlow('initial');
      }
    }
  };

  const resetFlow = () => {
    setCurrentFlow('initial');
    setFlowHistory([]);
  };

  const getCurrentFlowData = () => {
    return playFlows[currentFlow] || playFlows.initial;
  };

  // Only enable flow options if not at initial state or if sequence is not empty
  const canSelectOption = currentFlow !== 'initial' || (currentFlow === 'initial' && currentSequence.length === 0);

  if (loading) {
    return (
      <div className="quick-actions-container">
        <div className="quick-actions-instruction">Loading tags...</div>
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <div className="quick-actions-container">
          {/* Flow Header */}
          <div className="flow-header">
            <div className="flow-title">{getCurrentFlowData().label}</div>
            <div className="flow-description">{getCurrentFlowData().description}</div>
            
            {/* Flow Navigation */}
            <div className="flow-navigation">
              {flowHistory.length > 0 && (
                <button 
                  onClick={handleBackInFlow}
                  className="flow-back-btn"
                  title="Go back one step"
                >
                  ← Back
                </button>
              )}
              <button 
                onClick={resetFlow}
                className="flow-reset-btn"
                title="Start over"
              >
                🔄 Reset
              </button>
              <button 
                onClick={() => setShowQuickSequences(!showQuickSequences)}
                className="flow-quick-btn"
                title="Quick sequences"
              >
                ⚡ Quick
              </button>
            </div>
          </div>

          {/* Quick Sequences Panel */}
          {showQuickSequences && (
            <div className="quick-sequences-panel">
              <div className="quick-sequences-title">Quick Sequences</div>
              <div className="quick-sequences-grid">
                {Object.entries(quickSequences).map(([name, actions]) => (
                  <button
                    key={name}
                    onClick={() => handleQuickSequence(name, actions)}
                    disabled={isDisabled}
                    className="quick-sequence-btn"
                    title={`${name}: ${actions.join(' → ')}`}
                  >
                    <div className="quick-sequence-name">{name}</div>
                    <div className="quick-sequence-preview">
                      {actions.slice(0, 3).join(' → ')}
                      {actions.length > 3 && '...'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flow Options */}
          <div className="flow-options">
            {getCurrentFlowData().options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleFlowOption(option)}
                disabled={isDisabled || (currentFlow === 'initial' && currentSequence.length !== 0)}
                className="flow-option-btn"
                style={{
                  backgroundColor: option.color,
                  border: historicSuggestions.includes(option.name) ? '2px solid #f59e0b' : 'none',
                  boxShadow: historicSuggestions.includes(option.name) ? '0 0 0 2px #fde68a' : 'none'
                }}
                title={option.name}
              >
                <span className="flow-option-icon">{option.icon}</span>
                <span className="flow-option-name">{option.name}</span>
                {option.nextFlow && option.nextFlow !== 'end' && (
                  <span className="flow-option-arrow">→</span>
                )}
              </button>
            ))}
          </div>

          {/* Flow Progress */}
          {flowHistory.length > 0 && (
            <div className="flow-progress">
              <div className="flow-progress-title">Play Sequence:</div>
              <div className="flow-progress-steps">
                {flowHistory.map((step, index) => (
                  <div key={index} className="flow-progress-step">
                    <span className="flow-progress-icon">{step.option.icon}</span>
                    <span className="flow-progress-name">{step.option.name}</span>
                    {index < flowHistory.length - 1 && <span className="flow-progress-arrow">→</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Tag System (fallback) */}
          <div className="legacy-tags-section">
            <div className="legacy-tags-title">All Tags (Advanced)</div>
            <div className="legacy-tags-grid">
              {tags.slice(0, 12).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => onQuickTag(tag.name)}
                  disabled={isDisabled}
                  className="legacy-tag-btn"
                  title={tag.description || tag.name}
                >
                  <span className="legacy-tag-icon">{tag.icon || '🏀'}</span>
                  <span className="legacy-tag-name">{tag.name}</span>
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

  // Non-compact version (original layout)
  return (
    <>
      <div className="quick-actions-container">
        <div className="quick-actions-instruction">
          Select the next action performed by the player:
        </div>
        
        {/* Flow-based options */}
        <div className="flow-section">
          <div className="flow-title">{getCurrentFlowData().label}</div>
          <div className="flow-description">{getCurrentFlowData().description}</div>
          
          <div className="flow-options-grid">
            {getCurrentFlowData().options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleFlowOption(option)}
                disabled={isDisabled}
                className="flow-option-btn-large"
                style={{ backgroundColor: option.color }}
                title={option.name}
              >
                <span className="flow-option-icon-large">{option.icon}</span>
                <span className="flow-option-name-large">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Sequences */}
        <div className="quick-sequences-section">
          <div className="quick-sequences-title">Quick Sequences</div>
          <div className="quick-sequences-grid">
            {Object.entries(quickSequences).map(([name, actions]) => (
              <button
                key={name}
                onClick={() => handleQuickSequence(name, actions)}
                disabled={isDisabled}
                className="quick-sequence-btn-large"
                title={`${name}: ${actions.join(' → ')}`}
              >
                <div className="quick-sequence-name-large">{name}</div>
                <div className="quick-sequence-preview-large">
                  {actions.join(' → ')}
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

export default QuickActions; 