import React, { useState, useEffect } from 'react';
import './QuickActions.css';
import TagDetailsModal from '../TagDetailsModal';

const API_BASE = 'http://localhost:3000/api';

function QuickActions({ onQuickTag, selectedPlayer, gameTime, compact, currentSequence = [] }) {
  const isDisabled = !selectedPlayer || !gameTime;
  const [modalTag, setModalTag] = useState(null);
  const [historicSuggestions, setHistoricSuggestions] = useState([]);
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

  // Group tags by category and subcategory
  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category || 'OTHER';
    const subcategory = tag.subcategory || 'General';
    
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }
    acc[category][subcategory].push(tag);
    return acc;
  }, {});

  // Category labels and colors
  const categoryConfig = {
    'OFFENSIVE_ACTION': {
      label: '🏀 Offensive Actions',
      color: '#4CAF50',
      icon: '🏀'
    },
    'DEFENSIVE_ACTION': {
      label: '🛡️ Defensive Actions',
      color: '#F44336',
      icon: '🛡️'
    },
    'TRANSITION': {
      label: '⚡ Transition',
      color: '#FF9800',
      icon: '⚡'
    },
    'SET_PLAY': {
      label: '📋 Set Plays',
      color: '#9C27B0',
      icon: '📋'
    },
    'SPECIAL_SITUATION': {
      label: '⏰ Special Situations',
      color: '#607D8B',
      icon: '⏰'
    },
    'PLAYER_ACTION': {
      label: '👤 Player Actions',
      color: '#2196F3',
      icon: '👤'
    },
    'TEAM_ACTION': {
      label: '🏆 Team Actions',
      color: '#795548',
      icon: '🏆'
    },
    'OTHER': {
      label: '📝 Other',
      color: '#9E9E9E',
      icon: '📝'
    }
  };

  // Subcategory labels
  const subcategoryLabels = {
    'DefensiveScheme': 'Defensive Schemes',
    'OffensiveAction': 'Offensive Actions',
    'Shot': 'Shots',
    'Drive': 'Drives',
    'Pass': 'Passes',
    'GameManagement': 'Game Management',
    'General': 'General'
  };

  if (loading) {
    return (
      <div className="quick-actions-container">
        <div className="quick-actions-instruction">Loading tags...</div>
      </div>
    );
  }

  if (compact) {
    // Compact, vertically stacked, icon+label bar, grouped by category
    return (
      <>
        <div className="quick-actions-container">
          <div className="quick-actions-instruction">
            Select the next action performed by the player:
          </div>
          {Object.entries(groupedTags).map(([category, subcategories]) => (
            <div key={category} style={{ marginBottom: '18px' }}>
              <div className="quick-actions-category-label">
                {categoryConfig[category]?.label || `${categoryConfig[category]?.icon || '📝'} ${category}`}
              </div>
              {Object.entries(subcategories).map(([subcategory, categoryTags]) => (
                <div key={subcategory} style={{ marginBottom: '12px' }}>
                  <div className="quick-actions-subcategory-label">
                    {subcategoryLabels[subcategory] || subcategory}
                  </div>
                  <div className="quick-actions-row">
                    {categoryTags.map(tag => (
                      <div key={tag.id} style={{ position: 'relative', width: '100%' }}>
                        <button
                          onClick={() => onQuickTag(tag.name)}
                          disabled={isDisabled}
                          title={tag.description || tag.name}
                          className={`quick-actions-btn${historicSuggestions.includes(tag.name) ? ' suggested' : ''}`}
                          style={{
                            backgroundColor: tag.color || categoryConfig[category]?.color || '#9E9E9E',
                            border: historicSuggestions.includes(tag.name) ? '2px solid #f59e0b' : 'none',
                            boxShadow: historicSuggestions.includes(tag.name) ? '0 0 0 2px #fde68a' : 'none',
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
                              e.target.style.boxShadow = historicSuggestions.includes(tag.name) ? '0 0 0 2px #fde68a' : 'none';
                            }
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{tag.icon || categoryConfig[category]?.icon || '🏀'}</span>
                          <span style={{ fontSize: '1.02rem', fontWeight: 500 }}>{tag.name}</span>
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
                              setModalTag(tag);
                            }}
                          >
                            ℹ️
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
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
        Enhanced Tag Categories
      </h3>
      {Object.entries(groupedTags).map(([category, subcategories]) => (
        <div key={category} style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '12px',
            padding: '6px 12px',
            backgroundColor: categoryConfig[category]?.color || '#9E9E9E',
            color: 'white',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            {categoryConfig[category]?.label || `${categoryConfig[category]?.icon || '📝'} ${category}`}
          </h4>
          {Object.entries(subcategories).map(([subcategory, categoryTags]) => (
            <div key={subcategory} style={{ marginBottom: '16px' }}>
              <h5 style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#64748b',
                marginBottom: '8px',
                padding: '4px 8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                {subcategoryLabels[subcategory] || subcategory}
              </h5>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '8px'
              }}>
                {categoryTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => onQuickTag(tag.name)}
                    disabled={isDisabled}
                    className={`quick-actions-btn${historicSuggestions.includes(tag.name) ? ' suggested' : ''}`}
                    style={{
                      padding: '12px 8px',
                      border: historicSuggestions.includes(tag.name) ? '2px solid #f59e0b' : 'none',
                      borderRadius: '8px',
                      backgroundColor: tag.color || categoryConfig[category]?.color || '#9E9E9E',
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
                    onMouseEnter={e => {
                      if (!isDisabled) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isDisabled) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = historicSuggestions.includes(tag.name) ? '0 0 0 2px #fde68a' : 'none';
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{tag.icon || categoryConfig[category]?.icon || '🏀'}</span>
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      <TagDetailsModal tag={modalTag} onClose={() => setModalTag(null)} />
    </div>
  );
}

export default QuickActions; 