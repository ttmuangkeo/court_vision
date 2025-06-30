import React, { useState, useEffect } from 'react';
import './DefensiveScoutingPanel.css';

const DefensiveScoutingPanel = ({ playerId, playerName, gameId }) => {
    const [scoutingData, setScoutingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (playerId) {
            fetchScoutingData();
        }
    }, [playerId, gameId]);

    const fetchScoutingData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const url = gameId 
                ? `/api/analytics/defensive-scouting/${playerId}?gameId=${gameId}`
                : `/api/analytics/defensive-scouting/${playerId}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                setScoutingData(data.data);
            } else {
                setError(data.error || 'Failed to load scouting data');
            }
        } catch (err) {
            setError('Failed to load scouting data');
            console.error('Error fetching scouting data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return '#dc3545';
            case 'High': return '#fd7e14';
            case 'Medium': return '#ffc107';
            case 'Low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const renderStrategyCard = (strategy, index) => (
        <div key={index} className="strategy-card">
            <div className="strategy-header">
                <h4>{strategy.strategy}</h4>
                <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(strategy.priority) }}
                >
                    {strategy.priority}
                </span>
            </div>
            <div className="strategy-content">
                <p className="reasoning"><strong>Why:</strong> {strategy.reasoning}</p>
                <p className="execution"><strong>How:</strong> {strategy.execution}</p>
            </div>
        </div>
    );

    const renderPatternAnalysis = () => {
        if (!scoutingData?.offensivePatterns) return null;

        const { offensivePatterns } = scoutingData;
        
        return (
            <div className="pattern-analysis">
                <h3>Offensive Pattern Analysis</h3>
                
                <div className="pattern-section">
                    <h4>Most Frequent Sequences</h4>
                    <div className="sequence-list">
                        {Object.entries(offensivePatterns.mostFrequentSequences || {})
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([sequence, count], index) => (
                                <div key={index} className="sequence-item">
                                    <span className="sequence-text">{sequence}</span>
                                    <span className="sequence-count">{count} times</span>
                                </div>
                            ))}
                    </div>
                </div>

                {Object.keys(offensivePatterns.screenUsage || {}).length > 0 && (
                    <div className="pattern-section">
                        <h4>Screen Usage Patterns</h4>
                        <div className="pattern-grid">
                            {Object.entries(offensivePatterns.screenUsage).map(([action, count], index) => (
                                <div key={index} className="pattern-item">
                                    <span className="pattern-action">{action}</span>
                                    <span className="pattern-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.keys(offensivePatterns.shotSelection || {}).length > 0 && (
                    <div className="pattern-section">
                        <h4>Shot Selection</h4>
                        <div className="pattern-grid">
                            {Object.entries(offensivePatterns.shotSelection).map(([shot, count], index) => (
                                <div key={index} className="pattern-item">
                                    <span className="pattern-action">{shot}</span>
                                    <span className="pattern-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="defensive-scouting-panel">
                <div className="loading">Analyzing offensive patterns...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="defensive-scouting-panel">
                <div className="error">
                    <h3>Defensive Scouting Report</h3>
                    <p>Error: {error}</p>
                    <button onClick={fetchScoutingData} className="retry-btn">
                        Retry Analysis
                    </button>
                </div>
            </div>
        );
    }

    if (!scoutingData) {
        return (
            <div className="defensive-scouting-panel">
                <div className="no-data">
                    <h3>Defensive Scouting Report</h3>
                    <p>No scouting data available for this player.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="defensive-scouting-panel">
            <div className="scouting-header">
                <h3>🛡️ Defensive Scouting Report</h3>
                <div className="player-info">
                    <span className="player-name">{playerName}</span>
                    <span className="total-plays">{scoutingData.totalPlays} plays analyzed</span>
                </div>
            </div>

            {scoutingData.keyInsights && (
                <div className="key-insights">
                    <h4>Key Insights</h4>
                    <div className="insights-grid">
                        <div className="insight-item">
                            <span className="insight-label">Most Common Sequence:</span>
                            <span className="insight-value">{scoutingData.keyInsights.mostFrequentSequence}</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-label">Screen Dependency:</span>
                            <span className="insight-value">{scoutingData.keyInsights.screenDependency?.toFixed(1)}%</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-label">Isolation Frequency:</span>
                            <span className="insight-value">{scoutingData.keyInsights.isolationFrequency} times</span>
                        </div>
                    </div>
                </div>
            )}

            {renderPatternAnalysis()}

            <div className="defensive-strategies">
                <h3>Defensive Strategies</h3>
                
                {scoutingData.defensiveStrategies.primaryDefensiveFocus?.length > 0 && (
                    <div className="strategy-section">
                        <h4>Primary Defensive Focus</h4>
                        <div className="focus-list">
                            {scoutingData.defensiveStrategies.primaryDefensiveFocus.map((focus, index) => (
                                <span key={index} className="focus-item">{focus}</span>
                            ))}
                        </div>
                    </div>
                )}

                {scoutingData.defensiveStrategies.gamePlan?.length > 0 && (
                    <div className="strategy-section">
                        <h4>Overall Game Plan</h4>
                        <div className="strategy-grid">
                            {scoutingData.defensiveStrategies.gamePlan.map(renderStrategyCard)}
                        </div>
                    </div>
                )}

                {scoutingData.defensiveStrategies.screenDefense?.length > 0 && (
                    <div className="strategy-section">
                        <h4>Screen Defense</h4>
                        <div className="strategy-grid">
                            {scoutingData.defensiveStrategies.screenDefense.map(renderStrategyCard)}
                        </div>
                    </div>
                )}

                {scoutingData.defensiveStrategies.isolationDefense?.length > 0 && (
                    <div className="strategy-section">
                        <h4>Isolation Defense</h4>
                        <div className="strategy-grid">
                            {scoutingData.defensiveStrategies.isolationDefense.map(renderStrategyCard)}
                        </div>
                    </div>
                )}

                {scoutingData.defensiveStrategies.pressureDefense?.length > 0 && (
                    <div className="strategy-section">
                        <h4>Pressure Defense</h4>
                        <div className="strategy-grid">
                            {scoutingData.defensiveStrategies.pressureDefense.map(renderStrategyCard)}
                        </div>
                    </div>
                )}

                {scoutingData.defensiveStrategies.shotContest?.length > 0 && (
                    <div className="strategy-section">
                        <h4>Shot Contest</h4>
                        <div className="strategy-grid">
                            {scoutingData.defensiveStrategies.shotContest.map(renderStrategyCard)}
                        </div>
                    </div>
                )}
            </div>

            <div className="scouting-footer">
                <p className="disclaimer">
                    💡 <strong>Coaching Tip:</strong> Use these patterns to anticipate and counter the player's tendencies. 
                    Focus on disrupting their most frequent sequences while being prepared for their counter-moves.
                </p>
            </div>
        </div>
    );
};

export default DefensiveScoutingPanel; 