import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function GameAnalytics() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState('overview');

    useEffect(() => {
        const fetchGameAnalytics = async () => {
            try {
                setLoading(true);
                
                // Fetch game details
                const gameRes = await axios.get(`${API_BASE}/games/${gameId}?include=full`);
                setGame(gameRes.data.data);

                // Fetch comprehensive analytics
                const analyticsRes = await axios.get(`${API_BASE}/analytics/game-context/${gameId}`);
                setAnalytics(analyticsRes.data.data);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setLoading(false);
            }
        };

        fetchGameAnalytics();
    }, [gameId]);

    const handleBackClick = () => {
        navigate(`/games/${gameId}`);
    };

    if (loading) return <div>Loading analytics...</div>;
    if (!game || !analytics) return <div>Game not found.</div>;

    const renderOverview = () => (
        <div className="analytics-section">
            <h3>📊 Game Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {analytics.totalPlays}
                    </div>
                    <div style={{ color: '#64748b' }}>Total Plays Tagged</div>
                </div>
                
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                        {analytics.mostCommonInGame.length > 0 ? analytics.mostCommonInGame[0].count : 0}
                    </div>
                    <div style={{ color: '#a16207' }}>
                        Most Common Action
                    </div>
                </div>
                
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
                        {new Set(analytics.recentPlays.map(p => p.tags[0]?.player)).size}
                    </div>
                    <div style={{ color: '#1d4ed8' }}>Players Involved</div>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h4>🏷️ Most Common Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analytics.mostCommonInGame.map((action, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            backgroundColor: index === 0 ? '#fef3c7' : '#f1f5f9',
                            borderRadius: '8px',
                            border: index === 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0'
                        }}>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                {action.tag}
                            </span>
                            <span style={{ 
                                backgroundColor: index === 0 ? '#f59e0b' : '#64748b',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem'
                            }}>
                                {action.count} times
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPlayerAnalysis = () => {
        // Group plays by player
        const playerPlays = {};
        analytics.recentPlays.forEach(play => {
            play.tags.forEach(tag => {
                if (tag.player) {
                    if (!playerPlays[tag.player]) {
                        playerPlays[tag.player] = [];
                    }
                    playerPlays[tag.player].push({ ...play, tag: tag.name });
                }
            });
        });

        return (
            <div className="analytics-section">
                <h3>👥 Player Analysis</h3>
                {Object.entries(playerPlays).map(([playerName, plays]) => {
                    const actionCounts = plays.reduce((acc, play) => {
                        acc[play.tag] = (acc[play.tag] || 0) + 1;
                        return acc;
                    }, {});

                    const mostCommonAction = Object.entries(actionCounts)
                        .sort(([,a], [,b]) => b - a)[0];

                    return (
                        <div key={playerName} style={{
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h4 style={{ marginBottom: '12px', color: '#1e293b' }}>
                                {playerName}
                            </h4>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                                        Most Common Action:
                                    </div>
                                    <div style={{ 
                                        padding: '8px 12px',
                                        backgroundColor: '#dbeafe',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        color: '#1e40af'
                                    }}>
                                        {mostCommonAction ? `${mostCommonAction[0]} (${mostCommonAction[1]}x)` : 'No data'}
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                                        Total Actions:
                                    </div>
                                    <div style={{ 
                                        padding: '8px 12px',
                                        backgroundColor: '#dcfce7',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        color: '#166534'
                                    }}>
                                        {plays.length} plays
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                                    Recent Actions:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {plays.slice(0, 5).map((play, index) => (
                                        <span key={index} style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#f1f5f9',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            color: '#475569'
                                        }}>
                                            Q{play.quarter} • {play.tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderGameFlow = () => (
        <div className="analytics-section">
            <h3>⏱️ Game Flow</h3>
            <div style={{ marginBottom: '20px' }}>
                <h4>Recent Plays Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analytics.recentPlays.slice(0, 10).map((play, index) => (
                        <div key={index} style={{
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                    Q{play.quarter} • {play.gameTime}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {play.description}
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 8px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                color: '#1e40af',
                                fontWeight: '500'
                            }}>
                                {play.tags.map(t => t.name).join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div>
                    <button 
                        onClick={handleBackClick}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginBottom: '8px'
                        }}
                    >
                        ← Back to Game
                    </button>
                    <h1 style={{ margin: 0, color: '#1e293b' }}>
                        Game Analytics
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
                        {game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '30px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px'
            }}>
                {[
                    { id: 'overview', label: '📊 Overview', component: renderOverview },
                    { id: 'players', label: '👥 Players', component: renderPlayerAnalysis },
                    { id: 'flow', label: '⏱️ Game Flow', component: renderGameFlow }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedView(tab.id)}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: selectedView === tab.id ? '#1e293b' : '#f8fafc',
                            color: selectedView === tab.id ? 'white' : '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {[
                { id: 'overview', component: renderOverview },
                { id: 'players', component: renderPlayerAnalysis },
                { id: 'flow', component: renderGameFlow }
            ].find(tab => tab.id === selectedView)?.component()}
        </div>
    );
}

export default GameAnalytics; 