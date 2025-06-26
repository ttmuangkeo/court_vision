import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function PlayerDetail() {
    const { playerId } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [playerPatterns, setPlayerPatterns] = useState(null);
    const [decisionQuality, setDecisionQuality] = useState(null);
    const [recentPlays, setRecentPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setLoading(true);
                
                // Fetch player details with team
                const playerRes = await axios.get(`${API_BASE}/players/${playerId}?include=team`);
                setPlayer(playerRes.data.data);
                
                // Fetch player patterns and analytics
                const patternsRes = await axios.get(`${API_BASE}/analytics/player-patterns/${playerId}`);
                setPlayerPatterns(patternsRes.data.data);
                
                // Fetch decision quality analysis
                const decisionRes = await axios.get(`${API_BASE}/analytics/decision-quality/${playerId}`);
                setDecisionQuality(decisionRes.data.data);
                
                // Fetch recent plays for this player
                const playsRes = await axios.get(`${API_BASE}/plays?playerId=${playerId}&limit=20&include=tags`);
                setRecentPlays(playsRes.data.data || []);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching player data:', err);
                setLoading(false);
            }
        };

        if (playerId) {
            fetchPlayerData();
        }
    }, [playerId]);

    const handleBackClick = () => {
        navigate('/teams');
    };

    const getPositionColor = (position) => {
        const colors = {
            'G': '#3b82f6', // Blue for guards
            'F': '#10b981', // Green for forwards
            'C': '#f59e0b', // Orange for centers
            'G-F': '#8b5cf6', // Purple for combo
            'F-G': '#8b5cf6',
            'F-C': '#ef4444', // Red for big men
            'C-F': '#ef4444'
        };
        return colors[position] || '#6b7280';
    };

    const getQualityColor = (quality) => {
        switch (quality) {
            case 'excellent': return '#10b981';
            case 'good': return '#3b82f6';
            case 'questionable': return '#f59e0b';
            case 'risky': return '#ef4444';
            default: return '#64748b';
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '60vh',
                fontSize: '1.1rem',
                color: '#8e8e93',
                fontWeight: '400'
            }}>
                Loading player details...
            </div>
        );
    }

    if (!player) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                fontSize: '1.2rem',
                color: '#8e8e93'
            }}>
                Player not found
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            padding: '0'
        }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '60px 20px 40px',
                color: 'white',
                position: 'relative'
            }}>
                {/* Back Button */}
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    <button
                        onClick={handleBackClick}
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.2s ease',
                            marginBottom: '40px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        ← Back to Teams
                    </button>
                    
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ 
                            fontSize: '3.5rem', 
                            fontWeight: '700', 
                            marginBottom: '16px',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.1'
                        }}>
                            {player.name}
                        </h1>
                        <p style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '400',
                            opacity: '0.9',
                            lineHeight: '1.5',
                            marginBottom: '0'
                        }}>
                            {player.team?.name} • {player.position}
                            {player.jerseyNumber && ` • #${player.jerseyNumber}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '60px 20px',
                backgroundColor: '#fafafa'
            }}>
                {/* Player Stats Summary */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '50px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px 24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                            {playerPatterns?.totalPlays || 0}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Plays Tagged
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px 24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                            {decisionQuality?.decisionAnalysis?.totalSequences || 0}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Sequences Analyzed
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px 24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                            {decisionQuality?.decisionAnalysis?.overallQuality?.grade || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Decision Grade
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px 24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                            {player.height || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Height
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0',
                    marginBottom: '40px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '4px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: activeTab === 'overview' ? '#667eea' : 'transparent',
                            color: activeTab === 'overview' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('patterns')}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: activeTab === 'patterns' ? '#667eea' : 'transparent',
                            color: activeTab === 'patterns' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Play Patterns
                    </button>
                    <button
                        onClick={() => setActiveTab('decisions')}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: activeTab === 'decisions' ? '#667eea' : 'transparent',
                            color: activeTab === 'decisions' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Decision Quality
                    </button>
                    <button
                        onClick={() => setActiveTab('recent')}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: activeTab === 'recent' ? '#667eea' : 'transparent',
                            color: activeTab === 'recent' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Recent Plays
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1e293b',
                            marginBottom: '32px',
                            letterSpacing: '-0.01em'
                        }}>
                            Player Profile
                        </h2>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '30px'
                        }}>
                            {/* Player Info Card */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '32px',
                                borderRadius: '16px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '24px'
                                }}>
                                    Basic Information
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Position:</span>
                                        <span style={{
                                            padding: '6px 12px',
                                            backgroundColor: getPositionColor(player.position),
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600'
                                        }}>
                                            {player.position}
                                        </span>
                                    </div>
                                    
                                    {player.jerseyNumber && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Jersey Number:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>#{player.jerseyNumber}</span>
                                        </div>
                                    )}
                                    
                                    {player.height && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Height:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{player.height}</span>
                                        </div>
                                    )}
                                    
                                    {player.weight && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Weight:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{player.weight} lbs</span>
                                        </div>
                                    )}
                                    
                                    {player.birthDate && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Birth Date:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                {new Date(player.birthDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {player.college && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>College:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{player.college}</span>
                                        </div>
                                    )}
                                    
                                    {player.draftYear && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Draft Year:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                {player.draftYear} (Round {player.draftRound}, Pick {player.draftNumber})
                                            </span>
                                        </div>
                                    )}
                                    
                                    {player.country && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b', fontWeight: '500' }}>Country:</span>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{player.country}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Analytics Summary Card */}
                            <div style={{
                                backgroundColor: 'white',
                                padding: '32px',
                                borderRadius: '16px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '24px'
                                }}>
                                    Analytics Summary
                                </h3>
                                
                                {playerPatterns?.mostCommonActions?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>
                                            Most Common Actions:
                                        </div>
                                        {playerPatterns.mostCommonActions.slice(0, 3).map((action, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px',
                                                backgroundColor: index === 0 ? '#fef3c7' : '#f1f5f9',
                                                borderRadius: '8px'
                                            }}>
                                                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                    {action.tag}
                                                </span>
                                                <span style={{ color: '#64748b' }}>
                                                    {action.count} ({action.percentage}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                                        No play data available yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'patterns' && (
                    <div>
                        <h2 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1e293b',
                            marginBottom: '32px',
                            letterSpacing: '-0.01em'
                        }}>
                            Play Patterns & Tendencies
                        </h2>
                        
                        {playerPatterns ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '30px'
                            }}>
                                {/* Most Common Actions */}
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '32px',
                                    borderRadius: '16px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                    border: '1px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <h3 style={{ 
                                        fontSize: '1.25rem', 
                                        fontWeight: '700', 
                                        color: '#1e293b',
                                        marginBottom: '20px'
                                    }}>
                                        Most Common Actions
                                    </h3>
                                    
                                    {playerPatterns.mostCommonActions?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {playerPatterns.mostCommonActions.map((action, index) => (
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
                                                    <span style={{ color: '#64748b' }}>
                                                        {action.count} times ({action.percentage}%)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                                            No play patterns available
                                        </div>
                                    )}
                                </div>

                                {/* Quarter Patterns */}
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '32px',
                                    borderRadius: '16px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                    border: '1px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <h3 style={{ 
                                        fontSize: '1.25rem', 
                                        fontWeight: '700', 
                                        color: '#1e293b',
                                        marginBottom: '20px'
                                    }}>
                                        Quarter-by-Quarter Patterns
                                    </h3>
                                    
                                    {playerPatterns.quarterPatterns && Object.keys(playerPatterns.quarterPatterns).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {Object.entries(playerPatterns.quarterPatterns).map(([quarter, actions]) => (
                                                <div key={quarter}>
                                                    <h4 style={{ 
                                                        fontSize: '1rem', 
                                                        fontWeight: '600', 
                                                        color: '#374151',
                                                        marginBottom: '8px'
                                                    }}>
                                                        Quarter {quarter}
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                        {Object.entries(actions).slice(0, 3).map(([action, count]) => (
                                                            <div key={action} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '8px 12px',
                                                                backgroundColor: '#f8fafc',
                                                                borderRadius: '6px',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                <span style={{ color: '#475569' }}>{action}</span>
                                                                <span style={{ color: '#64748b', fontWeight: '500' }}>{count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                                            No quarter patterns available
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '80px 40px',
                                color: '#64748b'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '600', 
                                    color: '#1e293b',
                                    marginBottom: '16px'
                                }}>
                                    No Play Data Available
                                </h3>
                                <p style={{ 
                                    fontSize: '1rem',
                                    color: '#64748b'
                                }}>
                                    This player hasn't been tagged in any plays yet. Start tagging plays to see patterns and analytics.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'decisions' && (
                    <div>
                        <h2 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1e293b',
                            marginBottom: '32px',
                            letterSpacing: '-0.01em'
                        }}>
                            Decision Quality Analysis
                        </h2>
                        
                        {decisionQuality ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '30px'
                            }}>
                                {/* Overall Grade */}
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '32px',
                                    borderRadius: '16px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                    border: '1px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <h3 style={{ 
                                        fontSize: '1.25rem', 
                                        fontWeight: '700', 
                                        color: '#1e293b',
                                        marginBottom: '20px'
                                    }}>
                                        Overall Decision Grade
                                    </h3>
                                    
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '20px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                                                Decision Quality
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                                                {decisionQuality.decisionAnalysis.totalSequences} sequences analyzed
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                backgroundColor: getQualityColor(decisionQuality.decisionAnalysis.overallQuality.grade),
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                fontWeight: '700'
                                            }}
                                        >
                                            {decisionQuality.decisionAnalysis.overallQuality.grade}
                                        </div>
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#64748b', 
                                        marginTop: '8px',
                                        textAlign: 'center'
                                    }}>
                                        Score: {decisionQuality.decisionAnalysis.overallQuality.averageScore}/4.0
                                    </div>
                                </div>

                                {/* Defensive Responses */}
                                {Object.keys(decisionQuality.decisionAnalysis.defensiveResponses).length > 0 && (
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '32px',
                                        borderRadius: '16px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <h3 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '20px'
                                        }}>
                                            Defensive Responses
                                        </h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {Object.entries(decisionQuality.decisionAnalysis.defensiveResponses).map(([response, data]) => (
                                                <div key={response} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '12px 16px',
                                                    backgroundColor: '#f8fafc',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                            {response}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                            {data.count} times
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: getQualityColor(data.quality),
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {data.quality}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Offensive Decisions */}
                                {Object.keys(decisionQuality.decisionAnalysis.offensiveDecisions).length > 0 && (
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '32px',
                                        borderRadius: '16px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <h3 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '20px'
                                        }}>
                                            Offensive Decisions
                                        </h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {Object.entries(decisionQuality.decisionAnalysis.offensiveDecisions).map(([decision, data]) => (
                                                <div key={decision} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '12px 16px',
                                                    backgroundColor: '#f8fafc',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                            {decision}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                            {data.count} times
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: getQualityColor(data.quality),
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {data.quality}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '80px 40px',
                                color: '#64748b'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '600', 
                                    color: '#1e293b',
                                    marginBottom: '16px'
                                }}>
                                    No Decision Data Available
                                </h3>
                                <p style={{ 
                                    fontSize: '1rem',
                                    color: '#64748b'
                                }}>
                                    This player needs more tagged plays with sequences to analyze decision quality.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'recent' && (
                    <div>
                        <h2 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1e293b',
                            marginBottom: '32px',
                            letterSpacing: '-0.01em'
                        }}>
                            Recent Plays
                        </h2>
                        
                        {recentPlays.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '20px'
                            }}>
                                {recentPlays.map(play => (
                                    <div
                                        key={play.id}
                                        style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <h4 style={{ 
                                                    fontSize: '1.1rem', 
                                                    color: '#1e293b',
                                                    marginBottom: '4px',
                                                    fontWeight: '600'
                                                }}>
                                                    {play.description || 'Play tagged'}
                                                </h4>
                                                <p style={{ 
                                                    fontSize: '0.875rem', 
                                                    color: '#64748b'
                                                }}>
                                                    Q{play.quarter} • {play.gameTime}
                                                </p>
                                            </div>
                                            <div style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#f1f5f9',
                                                color: '#475569',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '500'
                                            }}>
                                                {play.tags?.length || 0} tags
                                            </div>
                                        </div>
                                        
                                        {play.tags && play.tags.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {play.tags.map(tag => (
                                                    <span key={tag.id} style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#e0e7ff',
                                                        color: '#3730a3',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        {tag.tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '80px 40px',
                                color: '#64748b'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: '600', 
                                    color: '#1e293b',
                                    marginBottom: '16px'
                                }}>
                                    No Recent Plays
                                </h3>
                                <p style={{ 
                                    fontSize: '1rem',
                                    color: '#64748b'
                                }}>
                                    This player hasn't been tagged in any plays yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlayerDetail; 