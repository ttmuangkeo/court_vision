import React, { useState, useEffect } from 'react';
import { quickActions, actionCategories, tagTransitionMap, starterActions } from './quickActionsConfig';
import TagDetailsModal from './TagDetailsModal';
import './QuickActions.css';

const API_BASE = 'http://localhost:3000/api';

function QuickActions({ onQuickTag, selectedPlayer, gameTime, compact, currentSequence = [] }) {
  const isDisabled = !selectedPlayer || !gameTime;
  const [modalTag, setModalTag] = useState(null);
  const [historicSuggestions, setHistoricSuggestions] = useState([]);

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

  // Determine which actions are available based on the current sequence
  let allowedActionNames = [];
  let suggestedNames = [];
  if (!currentSequence || currentSequence.length === 0) {
    allowedActionNames = starterActions;
  } else {
    const lastAction = currentSequence[currentSequence.length - 1]?.actionName || currentSequence[currentSequence.length - 1];
    allowedActionNames = tagTransitionMap[lastAction] || [];
    // Smart suggestions: prefer historic suggestions, fallback to static
    if (historicSuggestions.length > 0) {
      suggestedNames = historicSuggestions;
    } else {
      const lastTagObj = quickActions.find(a => a.name === lastAction);
      if (lastTagObj && Array.isArray(lastTagObj.suggestions)) {
        suggestedNames = lastTagObj.suggestions;
      }
    }
  }
  // Only show actions that are in allowedActionNames
  const filteredActions = quickActions.filter(action => allowedActionNames.includes(action.name));

  // Group filtered actions by category
  const groupedActions = {
    offensive: filteredActions.filter(action => action.category === 'offensive'),
    defensive: filteredActions.filter(action => action.category === 'defensive'),
    pressure: filteredActions.filter(action => action.category === 'pressure'),
    responses: filteredActions.filter(action => action.category === 'response')
  };

  const categoryLabels = {
    offensive: '🏀 Offensive Actions',
    defensive: '🛡️ Defensive Actions',
    pressure: '👥 Defensive Pressure',
    responses: '📤 Player Responses'
  };

  if (compact) {
    // Compact, vertically stacked, icon+label bar, grouped by category
    return (
      <>
        <div className="quick-actions-container">
          <div className="quick-actions-instruction">
            Select the next action performed by the player:
          </div>
          {Object.entries(groupedActions).map(([category, actions]) =>
            actions.length > 0 && (
              <div key={category} style={{ marginBottom: '18px' }}>
                <div className="quick-actions-category-label">
                  {categoryLabels[category]}
                </div>
                <div className="quick-actions-row">
                  {actions.map(action => (
                    <div key={action.name} style={{ position: 'relative', width: '100%' }}>
                      <button
                        onClick={() => onQuickTag(action.name)}
                        disabled={isDisabled}
                        title={action.name}
                        className={`quick-actions-btn${suggestedNames.includes(action.name) ? ' suggested' : ''}`}
                        style={{
                          backgroundColor: action.color,
                          border: suggestedNames.includes(action.name) ? '2px solid #f59e0b' : 'none',
                          boxShadow: suggestedNames.includes(action.name) ? '0 0 0 2px #fde68a' : 'none',
                          width: '100%'
                        }}
                        onMouseEnter={e => {
                          if (!isDisabled) {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isDisabled) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = suggestedNames.includes(action.name) ? '0 0 0 2px #fde68a' : 'none';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
                        <span style={{ fontSize: '1.02rem', fontWeight: 500 }}>{action.name}</span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 18,
                            color: '#64748b',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            outline: 'none'
                          }}
                          title="Show tag details"
                          onClick={e => {
                            e.stopPropagation();
                            setModalTag(action);
                          }}
                        >
                          ℹ️
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        <TagDetailsModal tag={modalTag} onClose={() => setModalTag(null)} />
      </>
    );
  }

  // Full version (for non-compact mode, e.g. analytics page)
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '16px'
      }}>
        Quick Actions
      </h3>
      {Object.entries(groupedActions).map(([category, actions]) =>
        actions.length > 0 && (
          <div key={category} style={{ marginBottom: '20px' }}>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              padding: '4px 8px',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              {categoryLabels[category]}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {actions.map(action => (
                <button
                  key={action.name}
                  onClick={() => onQuickTag(action.name)}
                  disabled={isDisabled}
                  className={`quick-actions-btn${suggestedNames.includes(action.name) ? ' suggested' : ''}`}
                  style={{
                    padding: '12px 8px',
                    border: suggestedNames.includes(action.name) ? '2px solid #f59e0b' : 'none',
                    borderRadius: '8px',
                    backgroundColor: action.color,
                    color: 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    opacity: isDisabled ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minHeight: '60px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
                  <span>{action.name}</span>
                  <span
                    style={{
                      marginLeft: 4,
                      fontSize: 16,
                      color: '#64748b',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      outline: 'none'
                    }}
                    title="Show tag details"
                    onClick={e => {
                      e.stopPropagation();
                      setModalTag(action);
                    }}
                  >
                    ℹ️
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      )}
      <TagDetailsModal tag={modalTag} onClose={() => setModalTag(null)} />
      {isDisabled && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          fontSize: '0.9rem',
          color: '#92400e',
          textAlign: 'center'
        }}>
          {!selectedPlayer ? 'Select a player first' : 'Enter game time first'}
        </div>
      )}
    </div>
  );
}

export default QuickActions; 