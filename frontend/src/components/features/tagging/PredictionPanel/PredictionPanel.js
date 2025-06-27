import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PredictionPanel.css';

const API_BASE = 'http://localhost:3000/api';

function PredictionPanel({ gameId, selectedPlayer, selectedTeam, currentQuarter, gameTime, refreshTrigger }) {
    const [playerPatterns, setPlayerPatterns] = useState(null);
    const [teamTendencies, setTeamTendencies] = useState(null);
    const [gameContext, setGameContext] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch analytics data when context changes
    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // Fetch game context
                const gameRes = await axios.get(`${API_BASE}/analytics/game-context/${gameId}`);
                setGameContext(gameRes.data.data);

                // Fetch suggestions
                const suggestionsRes = await axios.get(`${API_BASE}/analytics/suggestions`, {
                    params: {
                        gameId,
                        playerId: selectedPlayer?.id,
                        teamId: selectedTeam,
                        quarter: currentQuarter,
                        gameTime
                    }
                });
                setSuggestions(suggestionsRes.data.data.suggestions);

                // Fetch player patterns if player is selected
                if (selectedPlayer?.id) {
                    const playerRes = await axios.get(`${API_BASE}/analytics/player-patterns/${selectedPlayer.id}`, {
                        params: { gameId }
                    });
                    setPlayerPatterns(playerRes.data.data);
                } else {
                    setPlayerPatterns(null);
                }

                // Fetch team tendencies if team is selected
                if (selectedTeam) {
                    const teamRes = await axios.get(`${API_BASE}/analytics/team-tendencies/${selectedTeam}`, {
                        params: { gameId }
                    });
                    setTeamTendencies(teamRes.data.data);
                } else {
                    setTeamTendencies(null);
                }

            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        if (gameId) {
            fetchAnalytics();
        }
    }, [gameId, selectedPlayer?.id, selectedTeam, currentQuarter, gameTime, refreshTrigger]);

    if (loading) {
        return (
            <div className="prediction-panel-container">
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    Loading predictions...
                </div>
            </div>
        );
    }

    return (
        <div className="prediction-panel-container">
            <h3 className="prediction-panel-title">
                🧠 Predictions & Insights
            </h3>

            {/* Smart Suggestions */}
            {(suggestions || []).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="prediction-panel-section-title">
                        💡 Smart Predictions
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                        Based on {gameContext?.totalPlaysAnalyzed || 'recent'} plays analyzed
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(suggestions || []).map((suggestion, index) => (
                            <div
                                key={index}
                                className="prediction-panel-suggestion-card"
                                style={{
                                    borderLeft: suggestion.warning ? '4px solid #f59e0b' : '4px solid #3b82f6',
                                    backgroundColor: suggestion.warning ? '#fef3c7' : '#f8fafc'
                                }}
                            >
                                <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                                    {suggestion.message}
                                </div>
                                <div className="prediction-panel-confidence">
                                    Confidence: {Math.round(suggestion.confidence * 100)}%
                                </div>
                                {suggestion.context && (
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#64748b', 
                                        marginTop: '4px',
                                        fontStyle: 'italic'
                                    }}>
                                        {suggestion.context}
                                    </div>
                                )}
                                {suggestion.action && (
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#3b82f6', 
                                        marginTop: '4px',
                                        fontWeight: '500'
                                    }}>
                                        Suggested action: {suggestion.action}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Confidence Explanation */}
                    <div style={{ 
                        marginTop: '12px', 
                        padding: '8px 12px', 
                        backgroundColor: '#f1f5f9', 
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#475569'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>What does confidence mean?</div>
                        <div>• <strong>Next Action:</strong> How likely the player will follow this pattern</div>
                        <div>• <strong>Defensive Adjustment:</strong> How likely the defense will catch on</div>
                        <div>• <strong>Player Tendency:</strong> Strength of the player's recent behavior</div>
                        <div>• <strong>Quarter Pattern:</strong> How well this works in current game context</div>
                    </div>
                </div>
            )}

            {/* Player Patterns */}
            {selectedPlayer && playerPatterns && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="prediction-panel-section-title">
                        🎯 {selectedPlayer.name} Patterns
                    </h4>
                    {playerPatterns.totalPlays > 0 ? (
                        <div>
                            <div className="prediction-panel-pattern-list">
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                                    Most Common Actions ({playerPatterns.totalPlays} total plays):
                                </div>
                                {(playerPatterns.mostCommonActions || []).map((action, index) => (
                                    <div
                                        key={index}
                                        className={`prediction-panel-pattern-item${index === 0 ? ' top' : ''}`}
                                    >
                                        <span style={{ color: '#1e293b', fontWeight: '500' }}>
                                            {action.tag}
                                        </span>
                                        <span style={{ color: '#64748b' }}>
                                            {action.count} ({action.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {(playerPatterns.recentPlays || []).length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                                        Recent Plays ({playerPatterns.totalPlays} total):
                                    </div>
                                    {(playerPatterns.recentPlays || []).slice(0, 10).map((play, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '6px 8px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '6px',
                                                marginBottom: '4px',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {play.sequence}
                                            <span style={{ color: '#94a3b8', marginLeft: 8 }}>
                                                {play.time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            No tagged plays yet for this player.
                        </div>
                    )}
                </div>
            )}

            {/* Team Tendencies */}
            {selectedTeam && teamTendencies && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="prediction-panel-section-title">
                        🏀 Team Tendencies
                    </h4>
                    {teamTendencies.totalPlays > 0 ? (
                        <div>
                            <div className="prediction-panel-pattern-list">
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                                    Most Common Actions ({teamTendencies.totalPlays} total plays):
                                </div>
                                {(teamTendencies.mostCommonActions || []).map((action, index) => (
                                    <div
                                        key={index}
                                        className={`prediction-panel-pattern-item${index === 0 ? ' top' : ''}`}
                                    >
                                        <span style={{ color: '#1e293b', fontWeight: '500' }}>
                                            {action.tag}
                                        </span>
                                        <span style={{ color: '#64748b' }}>
                                            {action.count} ({action.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            No tagged plays yet for this team.
                        </div>
                    )}
                </div>
            )}

            {/* Game Context */}
            {gameContext && (
                <div>
                    <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        📊 Game Context
                    </h4>
                    
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                            Most Common in This Game:
                        </div>
                        {(gameContext.mostCommonInGame || []).length > 0 ? (
                            (gameContext.mostCommonInGame || []).map((action, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '6px 8px',
                                        backgroundColor: index === 0 ? '#fef3c7' : '#f1f5f9',
                                        borderRadius: '6px',
                                        marginBottom: '4px',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    <span style={{ color: '#1e293b', fontWeight: '500' }}>
                                        {action.tag}
                                    </span>
                                    <span style={{ color: '#64748b' }}>
                                        {action.count} times
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                No plays tagged in this game yet
                            </div>
                        )}
                    </div>

                    {(gameContext.recentPlays || []).length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                                Recent Plays:
                            </div>
                            {(gameContext.recentPlays || []).slice(0, 3).map((play, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '6px 8px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '6px',
                                        marginBottom: '4px',
                                        fontSize: '0.75rem',
                                        color: '#475569'
                                    }}
                                >
                                    Q{play.quarter} • {play.gameTime} • {play.tags.map(t => t.name).join(', ')}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* No Data State */}
            {!selectedPlayer && !selectedTeam && !gameContext && (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    Select a player or team to see predictions
                </div>
            )}
        </div>
    );
}

export default PredictionPanel; 