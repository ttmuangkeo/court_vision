import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DecisionQualityPanel.css';

const API_BASE = 'http://localhost:3000/api';

function DecisionQualityPanel({ gameId, selectedPlayer, refreshTrigger }) {
    const [decisionData, setDecisionData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDecisionQuality = async () => {
            if (!selectedPlayer?.id) {
                setDecisionData(null);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE}/analytics/decision-quality/${selectedPlayer.id}`, {
                    params: { gameId }
                });
                setDecisionData(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching decision quality:', error);
                setLoading(false);
            }
        };

        fetchDecisionQuality();
    }, [selectedPlayer?.id, gameId, refreshTrigger]);

    if (loading) {
        return (
            <div className="decision-panel-container">
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    Analyzing decisions...
                </div>
            </div>
        );
    }

    if (!selectedPlayer || !decisionData) {
        return (
            <div className="decision-panel-container">
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    Select a player to see decision quality
                </div>
            </div>
        );
    }

    const getQualityColor = (quality) => {
        switch (quality) {
            case 'excellent': return '#10b981';
            case 'good': return '#3b82f6';
            case 'questionable': return '#f59e0b';
            case 'risky': return '#ef4444';
            default: return '#64748b';
        }
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return '#10b981';
            case 'B': return '#3b82f6';
            case 'C': return '#f59e0b';
            case 'D': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <div className="decision-panel-container">
            <h3 className="decision-panel-title">
                🎯 Decision Quality
            </h3>

            {/* Overall Grade */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                            Overall Decision Grade
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                            {decisionData.decisionAnalysis.totalSequences} sequences analyzed
                        </div>
                    </div>
                    <div
                        className="decision-panel-grade-badge"
                        style={{ backgroundColor: getGradeColor(decisionData.decisionAnalysis.overallQuality.grade) }}
                    >
                        {decisionData.decisionAnalysis.overallQuality.grade}
                    </div>
                </div>
                <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#64748b', 
                    marginTop: '8px',
                    textAlign: 'center'
                }}>
                    Score: {decisionData.decisionAnalysis.overallQuality.averageScore}/4.0
                </div>
            </div>

            {/* Screen Actions */}
            {decisionData.decisionAnalysis?.screenActions && Object.keys(decisionData.decisionAnalysis.screenActions).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        🎯 Screen Actions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.screenActions).map(([action, data]) => (
                            <div key={action} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {action}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times • {data.reason}
                                    </div>
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Setup Actions */}
            {decisionData.decisionAnalysis?.setupActions && Object.keys(decisionData.decisionAnalysis.setupActions).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        🏀 Setup Actions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.setupActions).map(([action, data]) => (
                            <div key={action} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {action}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times • {data.reason}
                                    </div>
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Execution Actions */}
            {decisionData.decisionAnalysis?.executionActions && Object.keys(decisionData.decisionAnalysis.executionActions).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        ⚡ Execution Actions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.executionActions).map(([action, data]) => (
                            <div key={action} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {action}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times • {data.reason}
                                    </div>
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Complex Sequences */}
            {decisionData.decisionAnalysis?.complexSequences && Object.keys(decisionData.decisionAnalysis.complexSequences).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        🧠 Complex Sequences
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.complexSequences).map(([sequence, data]) => (
                            <div key={sequence} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>
                                        {sequence}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times • {data.reason}
                                    </div>
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Poor Decisions */}
            {decisionData.decisionAnalysis?.poorDecisions && Object.keys(decisionData.decisionAnalysis.poorDecisions).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        ⚠️ Areas for Improvement
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.poorDecisions).map(([action, data]) => (
                            <div key={action} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {action}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times • {data.reason}
                                    </div>
                                    {data.context && (
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                            After: {data.context}
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Defensive Responses */}
            {Object.keys(decisionData.decisionAnalysis.defensiveResponses).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        🛡️ Defensive Responses
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.defensiveResponses).map(([response, data]) => (
                            <div key={response} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {response}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times
                                    </div>
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Offensive Decisions */}
            {Object.keys(decisionData.decisionAnalysis.offensiveDecisions).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 className="decision-panel-section-title">
                        🏀 Offensive Decisions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(decisionData.decisionAnalysis.offensiveDecisions).map(([decision, data]) => (
                            <div key={decision} className="decision-panel-response-card">
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {decision}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {data.count} times
                                    </div>
                                </div>
                                <div
                                    className="decision-panel-quality-label"
                                    style={{ backgroundColor: getQualityColor(data.quality) }}
                                >
                                    {data.quality}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Sequences */}
            {decisionData.recentSequences.length > 0 && (
                <div>
                    <h4 className="decision-panel-section-title">
                        ⏱️ Recent Decisions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {decisionData.recentSequences.map((sequence, index) => (
                            <div key={index} className="decision-panel-sequence-card">
                                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                    {sequence.actions.join(' → ')}
                                </div>
                                {sequence.quality !== 'neutral' && (
                                    <div className="decision-panel-quality-label">
                                        {sequence.quality} decision
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DecisionQualityPanel; 