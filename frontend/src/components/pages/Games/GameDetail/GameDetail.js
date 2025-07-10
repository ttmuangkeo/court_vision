import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function GameDetail() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentPlays, setRecentPlays] = useState([]);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                setLoading(true);
                
                // Fetch game details with teams
                const gameRes = await axios.get(`${API_BASE}/games/${gameId}?include=teams`);
                setGame(gameRes.data.data);
                
                // Fetch recent plays for this game
                const playsRes = await axios.get(`${API_BASE}/plays?game_id=${gameId}&limit=10`);
                setRecentPlays(playsRes.data.data || []);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching game data:', err);
                setLoading(false);
            }
        };

        if (gameId) {
            fetchGameData();
        }
    }, [gameId]);

    const handleBackClick = () => {
        navigate('/games');
    };

    const handleStartTagging = () => {
        navigate(`/games/${gameId}/tag`);
    };

    const handleViewAnalytics = () => {
        navigate(`/games/${gameId}/analytics`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'LIVE': return '#f59e0b';
            case 'FINISHED': return '#10b981';
            case 'SCHEDULED': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusBackground = (status) => {
        switch (status) {
            case 'LIVE': return '#fef3c7';
            case 'FINISHED': return '#d1fae5';
            case 'SCHEDULED': return '#f3f4f6';
            default: return '#f3f4f6';
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
                Loading game details...
            </div>
        );
    }

    if (!game) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                fontSize: '1.2rem',
                color: '#8e8e93'
            }}>
                Game not found
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
                        ← Back to Games
                    </button>
                    
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ 
                            fontSize: '3rem', 
                            fontWeight: '700', 
                            marginBottom: '16px',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.1'
                        }}>
                            {game.homeTeam?.name} vs {game.awayTeam?.name}
                        </h1>
                        <p style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '400',
                            opacity: '0.9',
                            lineHeight: '1.5',
                            marginBottom: '20px'
                        }}>
                            {new Date(game.dateTime).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: getStatusBackground(game.status),
                            color: getStatusColor(game.status),
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: getStatusColor(game.status),
                                borderRadius: '50%'
                            }} />
                            {game.status}
                        </div>
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
                {/* Game Score Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    marginBottom: '40px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    textAlign: 'center'
                }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr auto 1fr', 
                        alignItems: 'center',
                        gap: '40px'
                    }}>
                        {/* Home Team */}
                        <div>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: '0 auto 16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}>
                                {game.homeTeam?.name}
                            </div>
                            <h3 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '700', 
                                color: '#1e293b',
                                marginBottom: '8px'
                            }}>
                                {game.homeTeam?.name}
                            </h3>
                            <div style={{ 
                                fontSize: '3rem', 
                                fontWeight: '700', 
                                color: '#667eea'
                            }}>
                                {game.homeTeamScore || 0}
                            </div>
                        </div>

                        {/* VS */}
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#64748b' }}>
                            VS
                        </div>

                        {/* Away Team */}
                        <div>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: '0 auto 16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}>
                                {game.awayTeam?.name}
                            </div>
                            <h3 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '700', 
                                color: '#1e293b',
                                marginBottom: '8px'
                            }}>
                                {game.awayTeam?.name}
                            </h3>
                            <div style={{ 
                                fontSize: '3rem', 
                                fontWeight: '700', 
                                color: '#667eea'
                            }}>
                                {game.awayTeamScore || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    justifyContent: 'center',
                    marginBottom: '50px'
                }}>
                    <button
                        onClick={handleStartTagging}
                        style={{
                            padding: '16px 32px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }}
                    >
                        🏀 Start Tagging Plays
                    </button>
                    
                    <button
                        onClick={handleViewAnalytics}
                        style={{
                            padding: '16px 32px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }}
                    >
                        📊 View Analytics
                    </button>
                </div>

                {/* Recent Plays */}
                <div>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        marginBottom: '24px',
                        letterSpacing: '-0.01em'
                    }}>
                        Recent Plays
                    </h2>
                    
                    {recentPlays.length > 0 ? (
                        <div style={{ 
                            display: 'grid', 
                            gap: '16px'
                        }}>
                            {recentPlays.map(play => (
                                <div
                                    key={play.id}
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ 
                                                fontSize: '1rem', 
                                                color: '#1e293b',
                                                marginBottom: '4px',
                                                fontWeight: '500'
                                            }}>
                                                {play.description || 'Play tagged'}
                                            </p>
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '40px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                            <p style={{ 
                                fontSize: '1rem', 
                                color: '#64748b',
                                marginBottom: '16px'
                            }}>
                                No plays tagged yet for this game
                            </p>
                            <p style={{ 
                                fontSize: '0.875rem', 
                                color: '#94a3b8'
                            }}>
                                Start tagging plays to see them appear here
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GameDetail;
