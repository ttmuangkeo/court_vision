import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function TeamDetail() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roster');

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);
                
                // Fetch team details
                const teamRes = await axios.get(`${API_BASE}/teams/${teamId}`);
                setTeam(teamRes.data.data);
                
                // Fetch team players
                const playersRes = await axios.get(`${API_BASE}/players?team_ids=${teamId}`);
                setPlayers(playersRes.data.data);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching team data:', err);
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamData();
        }
    }, [teamId]);

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
                Loading team details...
            </div>
        );
    }

    if (!team) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                fontSize: '1.2rem',
                color: '#8e8e93'
            }}>
                Team not found
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
                            {team.name}
                        </h1>
                        <p style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '400',
                            opacity: '0.9',
                            lineHeight: '1.5',
                            marginBottom: '0'
                        }}>
                            {team.city} • {team.conference} Conference • {team.division} Division
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
                {/* Team Stats Summary */}
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
                            {players.length}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Players
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
                            {players.filter(p => p.position?.includes('G')).length}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Guards
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
                            {players.filter(p => p.position?.includes('C')).length}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Centers
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
                            {players.filter(p => p.position?.includes('F') && !p.position?.includes('C')).length}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            Forwards
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
                        onClick={() => setActiveTab('roster')}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: activeTab === 'roster' ? '#667eea' : 'transparent',
                            color: activeTab === 'roster' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Roster
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        style={{
                            flex: 1,
                            padding: '16px 24px',
                            border: 'none',
                            backgroundColor: activeTab === 'stats' ? '#667eea' : 'transparent',
                            color: activeTab === 'stats' ? 'white' : '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Team Stats
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'roster' && (
                    <div>
                        <h2 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1e293b',
                            marginBottom: '32px',
                            letterSpacing: '-0.01em'
                        }}>
                            Team Roster
                        </h2>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: '20px'
                        }}>
                            {players.map(player => (
                                <div
                                    key={player.id}
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                                    }}
                                >
                                    {/* Player Avatar */}
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                    }}>
                                        {player.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    
                                    {/* Player Info */}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '8px',
                                            lineHeight: '1.3'
                                        }}>
                                            {player.name}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                backgroundColor: getPositionColor(player.position),
                                                color: 'white',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}>
                                                {player.position}
                                            </span>
                                            {player.jerseyNumber && (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#475569',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    #{player.jerseyNumber}
                                                </span>
                                            )}
                                        </div>
                                        {player.height && (
                                            <p style={{ 
                                                fontSize: '0.875rem', 
                                                color: '#64748b',
                                                fontWeight: '500'
                                            }}>
                                                {player.height} • {player.weight} lbs
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
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
                            Team Statistics
                        </h3>
                        <p style={{ 
                            fontSize: '1rem',
                            color: '#64748b'
                        }}>
                            Coming soon! Team stats and analytics will be available here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeamDetail; 