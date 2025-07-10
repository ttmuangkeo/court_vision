import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getTeamLogo, getTeamPrimaryColor, getTeamAlternateColor, getTeamDisplayName, getTeamShortDisplayName } from '../../../../utils/teamBranding';
import DefensiveScoutingPanel from '../../../features/tagging/DefensiveScoutingPanel';

const API_BASE = 'http://localhost:3000/api';

function PlayerDetail() {
    const { playerId } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [playerPatterns, setPlayerPatterns] = useState(null);
    const [decisionQuality, setDecisionQuality] = useState(null);
    const [recentPlays, setRecentPlays] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Helper function to format stats for display
    const formatStat = (value, type = 'decimal') => {
        if (value === null || value === undefined) return null;
        
        switch (type) {
            case 'decimal':
                // Round to 1 decimal place for per-game stats (24.5 ppg, 8.1 apg)
                return Math.round(value * 10) / 10;
            case 'percentage':
                // Round to 1 decimal place for percentages (42.9%)
                return Math.round(value * 10) / 10;
            case 'integer':
                // Round to whole numbers for games played, etc.
                return Math.round(value);
            default:
                return value;
        }
    };

    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setLoading(true);
                
                // Fetch player details with team and stats
                const playerRes = await axios.get(`${API_BASE}/players/${playerId}?include=team&with_stats=true`);
                const playerData = playerRes.data.data;
                setPlayer(playerData);
                
                // Fetch teams for branding
                const teamsRes = await axios.get(`${API_BASE}/teams`);
                setTeams(teamsRes.data.data);
                
                // Use player.id for analytics calls
                if (playerData && playerData.id) {
                    // Fetch player patterns and analytics
                    const patternsRes = await axios.get(`${API_BASE}/analytics/player-patterns/${playerData.id}`);
                    setPlayerPatterns(patternsRes.data.data);
                    
                    // Fetch decision quality analysis
                    const decisionRes = await axios.get(`${API_BASE}/analytics/decision-quality/${playerData.id}`);
                    setDecisionQuality(decisionRes.data.data);
                    
                    // Fetch recent plays for this player
                    const playsRes = await axios.get(`${API_BASE}/plays?playerId=${playerData.id}&limit=20&include=tags`);
                    setRecentPlays(playsRes.data.data || []);
                }
                
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
        navigate('/players');
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

    // Get team branding data if player is on an NBA team
    const teamId = player.teamId;
    const primaryColor = teamId ? getTeamPrimaryColor(teamId, teams) : '#667eea';
    const alternateColor = teamId ? getTeamAlternateColor(teamId, teams) : '#ffffff';
    const logoUrl = teamId ? getTeamLogo(teamId, teams) : null;
    const teamDisplayName = teamId ? getTeamDisplayName(teamId, teams) : null;
    const teamShortDisplayName = teamId ? getTeamShortDisplayName(teamId, teams) : null;

    return (
        <div style={{ 
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            padding: '0'
        }}>
            {/* Hero Section */}
            <div style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                padding: '40px 20px 30px',
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
                            padding: '10px 16px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.2s ease',
                            marginBottom: '30px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        ← Back to Players
                    </button>
                    
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        flexWrap: 'wrap'
                    }}>
                        {/* Player Headshot */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: player.photoUrl ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: player.photoUrl ? '0' : '2.5rem',
                            fontWeight: '700',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            border: player.photoUrl ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                            overflow: 'hidden'
                        }}>
                            {player.photoUrl ? (
                                <img 
                                    src={player.photoUrl} 
                                    alt={player.firstName + " " + player.lastName || player.firstName + " " + player.lastName}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                (player.firstName + " " + player.lastName || player.firstName + " " + player.lastName || 'P').split(' ').map(n => n[0]).join('')
                            )}
                        </div>
                        
                        {/* Player Info */}
                        <div style={{ flex: 1 }}>
                            <h1 style={{ 
                                fontSize: '2.5rem', 
                                fontWeight: '700', 
                                marginBottom: '8px',
                                letterSpacing: '-0.02em',
                                lineHeight: '1.1'
                            }}>
                                {player.firstName + " " + player.lastName || player.firstName + " " + player.lastName}
                            </h1>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '4px 10px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    {player.position}
                                </span>
                                {player.jersey && (
                                    <span style={{
                                        padding: '4px 10px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        #{player.jersey}
                                    </span>
                                )}
                                {teamDisplayName && (
                                    <span style={{
                                        padding: '4px 10px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        {teamDisplayName}
                                    </span>
                                )}
                            </div>
                            <p style={{ 
                                fontSize: '1rem', 
                                fontWeight: '400',
                                opacity: '0.9',
                                lineHeight: '1.4',
                                marginBottom: '0'
                            }}>
                                {player.displayHeight && player.displayWeight ? `${player.displayHeight} • ${player.displayWeight} lbs` : ''}
                                {player.age ? ` • ${player.age} years old` : ''}
                                {player.experience ? ` • ${player.experience} years experience` : ''}
                            </p>
                        </div>

                        {/* Team Logo (if NBA player) */}
                        {teamId && logoUrl && (
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <img 
                                    src={logoUrl} 
                                    alt={teamDisplayName}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain',
                                        padding: '8px'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '40px 20px',
                backgroundColor: '#fafafa'
            }}>
                {/* Quick Stats Bar */}
                <div style={{ 
                    display: 'flex', 
                    gap: '16px',
                    marginBottom: '30px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: `1px solid ${primaryColor}20`,
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: primaryColor }}>
                            {recentPlays.length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                            Recent Plays
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#3b82f6' }}>
                            {playerPatterns?.totalPatterns || 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                            Patterns
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#10b981' }}>
                            {decisionQuality?.averageScore ? Math.round(decisionQuality.averageScore * 100) / 100 : 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                            Decision Score
                        </div>
                    </div>
                    
                    <div style={{
                        backgroundColor: 'white',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        minWidth: '120px'
                    }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f59e0b' }}>
                            {player.experience || 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                            Years Exp
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 320px',
                    gap: '30px',
                    alignItems: 'start'
                }}>
                    {/* Main Content */}
                    <div>
                        {/* Tabs */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '0',
                            marginBottom: '30px',
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
                                    padding: '14px 20px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'overview' ? primaryColor : 'transparent',
                                    color: activeTab === 'overview' ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('patterns')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'patterns' ? primaryColor : 'transparent',
                                    color: activeTab === 'patterns' ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Play Patterns
                            </button>
                            <button
                                onClick={() => setActiveTab('decisions')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'decisions' ? primaryColor : 'transparent',
                                    color: activeTab === 'decisions' ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Decision Quality
                            </button>
                            <button
                                onClick={() => setActiveTab('recent')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'recent' ? primaryColor : 'transparent',
                                    color: activeTab === 'recent' ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Recent Plays
                            </button>
                            <button
                                onClick={() => setActiveTab('scouting')}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'scouting' ? primaryColor : 'transparent',
                                    color: activeTab === 'scouting' ? 'white' : '#64748b',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Defensive Scouting
                            </button>

                        </div>

                        {/* Content */}
                        {activeTab === 'overview' && (
                            <div>
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '24px',
                                    letterSpacing: '-0.01em'
                                }}>
                                    Player Overview
                                </h2>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {/* Basic Info Card */}
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <h3 style={{ 
                                            fontSize: '1.1rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '16px'
                                        }}>
                                            👤 Basic Information
                                        </h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Full Name:</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                    {player.firstName + " " + player.lastName || player.firstName + " " + player.lastName}
                                                </span>
                                            </div>
                                            {player.firstName + " " + player.lastName && player.firstName + " " + player.lastName !== (player.firstName + " " + player.lastName || player.firstName + " " + player.lastName) && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Short Name:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        {player.firstName + " " + player.lastName}
                                                    </span>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Position:</span>
                                                <span style={{ 
                                                    fontSize: '0.85rem', 
                                                    fontWeight: '600', 
                                                    color: 'white',
                                                    backgroundColor: getPositionColor(player.position),
                                                    padding: '2px 6px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {player.position}
                                                </span>
                                            </div>
                                            {player.jersey && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Jersey:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        #{player.jersey}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Physical Info Card */}
                                    {(player.displayHeight || player.displayWeight || player.age) && (
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '700', 
                                                color: '#1e293b',
                                                marginBottom: '16px'
                                            }}>
                                                📏 Physical Information
                                            </h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {player.displayHeight && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Height:</span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                            {player.displayHeight}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.displayWeight && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Weight:</span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                            {player.displayWeight}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.age && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Age:</span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                            {player.age} years old
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Career Info Card */}
                                    {(player.experience || player.debutYear || player.college) && (
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                        <h3 style={{ 
                                            fontSize: '1.1rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '16px'
                                        }}>
                                            🏀 Career Information
                                        </h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {player.experience && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Experience:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        {player.experience} years
                                                    </span>
                                                </div>
                                            )}
                                            {player.debutYear && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Debut Year:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        {player.debutYear}
                                                    </span>
                                                </div>
                                            )}
                                            {player.college && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>College:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        {player.college}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}

                                    {/* Personal Info Card */}
                                    {(player.birthPlace || player.dateOfBirth) && (
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                        <h3 style={{ 
                                            fontSize: '1.1rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '16px'
                                        }}>
                                            👤 Personal Information
                                        </h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {player.birthPlace && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Birth Place:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        {player.birthPlace}
                                                    </span>
                                                </div>
                                            )}
                                            {player.dateOfBirth && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Birth Date:</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                                                        {new Date(player.dateOfBirth).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}

                                    {/* Statistics Card */}
                                    {(player.avgPoints || player.avgRebounds || player.avgAssists || player.avgSteals || player.avgBlocks || player.avgTurnovers || player.avgFouls || player.fieldGoalPct || player.threePointPct || player.freeThrowPct || player.minutesPerGame || player.gamesPlayed || player.gamesStarted) && (
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '700', 
                                                color: '#1e293b',
                                                marginBottom: '16px'
                                            }}>
                                                📊 Season Statistics
                                            </h3>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {/* Scoring Stats */}
                                                {player.avgPoints && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Points per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.2rem', 
                                                            fontWeight: '700', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgPoints)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.avgRebounds && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Rebounds per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.2rem', 
                                                            fontWeight: '700', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgRebounds)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.avgAssists && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Assists per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.2rem', 
                                                            fontWeight: '700', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgAssists)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.avgSteals && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Steals per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgSteals)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.avgBlocks && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Blocks per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgBlocks)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.avgTurnovers && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Turnovers per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgTurnovers)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.avgFouls && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Fouls per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.avgFouls)}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.minutesPerGame && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Minutes per Game:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.minutesPerGame)}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {/* Shooting Percentages */}
                                                {(player.fieldGoalPct || player.threePointPct || player.freeThrowPct) && (
                                                    <>
                                                        <div style={{ 
                                                            height: '1px', 
                                                            backgroundColor: '#e2e8f0', 
                                                            margin: '8px 0' 
                                                        }}></div>
                                                        <div style={{ 
                                                            fontSize: '0.8rem', 
                                                            color: '#64748b', 
                                                            fontWeight: '600',
                                                            marginBottom: '4px'
                                                        }}>
                                                            SHOOTING PERCENTAGES
                                                        </div>
                                                    </>
                                                )}
                                                {player.fieldGoalPct && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Field Goal %:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.fieldGoalPct, 'percentage')}%
                                                        </span>
                                                    </div>
                                                )}
                                                {player.threePointPct && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>3-Point %:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.threePointPct, 'percentage')}%
                                                        </span>
                                                    </div>
                                                )}
                                                {player.freeThrowPct && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Free Throw %:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.freeThrowPct, 'percentage')}%
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {/* Games Information */}
                                                {(player.gamesPlayed || player.gamesStarted) && (
                                                    <>
                                                        <div style={{ 
                                                            height: '1px', 
                                                            backgroundColor: '#e2e8f0', 
                                                            margin: '8px 0' 
                                                        }}></div>
                                                        <div style={{ 
                                                            fontSize: '0.8rem', 
                                                            color: '#64748b', 
                                                            fontWeight: '600',
                                                            marginBottom: '4px'
                                                        }}>
                                                            GAMES
                                                        </div>
                                                    </>
                                                )}
                                                {player.gamesPlayed && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Games Played:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.gamesPlayed, 'integer')}
                                                        </span>
                                                    </div>
                                                )}
                                                {player.gamesStarted && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Games Started:</span>
                                                        <span style={{ 
                                                            fontSize: '1.1rem', 
                                                            fontWeight: '600', 
                                                            color: '#1e293b'
                                                        }}>
                                                            {formatStat(player.gamesStarted, 'integer')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'patterns' && (
                            <div>
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '24px',
                                    letterSpacing: '-0.01em'
                                }}>
                                    Play Patterns Analysis
                                </h2>
                                
                                {playerPatterns ? (
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: '20px'
                                    }}>
                                        {/* Most Common Actions */}
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '700', 
                                                color: '#1e293b',
                                                marginBottom: '16px'
                                            }}>
                                                🎯 Most Common Actions
                                            </h3>
                                            
                                            {playerPatterns.mostCommonActions && playerPatterns.mostCommonActions.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {playerPatterns.mostCommonActions.map((action, index) => (
                                                        <div key={index} style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '12px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                                                    {action.tag}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                                    {action.count} times
                                                                </div>
                                                            </div>
                                                            <div style={{ 
                                                                fontSize: '1rem', 
                                                                fontWeight: '700', 
                                                                color: primaryColor,
                                                                backgroundColor: `${primaryColor}10`,
                                                                padding: '4px 8px',
                                                                borderRadius: '6px'
                                                            }}>
                                                                {action.percentage}%
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                    No pattern data available yet.
                                                </p>
                                            )}
                                        </div>

                                        {/* Quarter Patterns */}
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '700', 
                                                color: '#1e293b',
                                                marginBottom: '16px'
                                            }}>
                                                ⏰ Quarter Patterns
                                            </h3>
                                            
                                            {playerPatterns.quarterPatterns && Object.keys(playerPatterns.quarterPatterns).length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {Object.entries(playerPatterns.quarterPatterns).map(([quarter, patterns]) => (
                                                        <div key={quarter} style={{ 
                                                            padding: '12px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ 
                                                                fontSize: '0.9rem', 
                                                                fontWeight: '600', 
                                                                color: '#1e293b',
                                                                marginBottom: '8px'
                                                            }}>
                                                                Quarter {quarter}
                                                            </div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                {Object.entries(patterns).map(([action, count]) => (
                                                                    <span key={action} style={{
                                                                        fontSize: '0.75rem',
                                                                        padding: '4px 8px',
                                                                        backgroundColor: `${primaryColor}20`,
                                                                        color: primaryColor,
                                                                        borderRadius: '4px',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {action} ({count})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                    No quarter pattern data available yet.
                                                </p>
                                            )}
                                        </div>

                                        {/* Recent Plays */}
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '700', 
                                                color: '#1e293b',
                                                marginBottom: '16px'
                                            }}>
                                                📊 Recent Plays
                                            </h3>
                                            
                                            {playerPatterns.recentPlays && playerPatterns.recentPlays.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {playerPatterns.recentPlays.slice(0, 5).map((play, index) => (
                                                        <div key={index} style={{ 
                                                            padding: '10px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ 
                                                                fontSize: '0.8rem', 
                                                                fontWeight: '600', 
                                                                color: primaryColor,
                                                                marginBottom: '4px'
                                                            }}>
                                                                {play.tag}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
                                                                Q{play.quarter} • {play.gameTime}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                {new Date(play.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                    No recent plays available yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '60px 40px',
                                        color: '#64748b'
                                    }}>
                                        <p style={{ fontSize: '1rem' }}>
                                            Loading pattern data...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'decisions' && (
                            <div>
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '24px',
                                    letterSpacing: '-0.01em'
                                }}>
                                    Decision Quality Analysis
                                </h2>
                                
                                {decisionQuality ? (
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: '20px'
                                    }}>
                                        {/* Overall Quality Score */}
                                        <div style={{
                                            backgroundColor: 'white',
                                            padding: '24px',
                                            borderRadius: '16px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                fontWeight: '700', 
                                                color: '#1e293b',
                                                marginBottom: '16px'
                                            }}>
                                                📊 Overall Decision Quality
                                            </h3>
                                            
                                            {decisionQuality.decisionAnalysis?.overallQuality ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '16px',
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                                                Average Score
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                                {decisionQuality.decisionAnalysis.overallQuality.totalDecisions} decisions analyzed
                                                            </div>
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '1.5rem', 
                                                            fontWeight: '700', 
                                                            color: getQualityColor(decisionQuality.decisionAnalysis.overallQuality.grade),
                                                            backgroundColor: `${getQualityColor(decisionQuality.decisionAnalysis.overallQuality.grade)}10`,
                                                            padding: '8px 12px',
                                                            borderRadius: '8px'
                                                        }}>
                                                            {decisionQuality.decisionAnalysis.overallQuality.averageScore}
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '12px',
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                                                            Grade
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '1.2rem', 
                                                            fontWeight: '700', 
                                                            color: getQualityColor(decisionQuality.decisionAnalysis.overallQuality.grade),
                                                            backgroundColor: `${getQualityColor(decisionQuality.decisionAnalysis.overallQuality.grade)}20`,
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            minWidth: '40px',
                                                            textAlign: 'center'
                                                        }}>
                                                            {decisionQuality.decisionAnalysis.overallQuality.grade}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                    No decision quality data available yet.
                                                </p>
                                            )}
                                        </div>

                                        {/* Screen Actions */}
                                        {decisionQuality.decisionAnalysis?.screenActions && Object.keys(decisionQuality.decisionAnalysis.screenActions).length > 0 && (
                                            <div style={{
                                                backgroundColor: 'white',
                                                padding: '24px',
                                                borderRadius: '16px',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <h3 style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '700', 
                                                    color: '#1e293b',
                                                    marginBottom: '16px'
                                                }}>
                                                    🎯 Screen Actions
                                                </h3>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {Object.entries(decisionQuality.decisionAnalysis.screenActions).map(([action, data]) => (
                                                        <div key={action} style={{ 
                                                            padding: '10px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                                                                    {action}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '0.7rem',
                                                                    padding: '2px 6px',
                                                                    backgroundColor: `${getQualityColor(data.quality)}20`,
                                                                    color: getQualityColor(data.quality),
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {data.quality}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                {data.count} times • {data.reason}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Setup Actions */}
                                        {decisionQuality.decisionAnalysis?.setupActions && Object.keys(decisionQuality.decisionAnalysis.setupActions).length > 0 && (
                                            <div style={{
                                                backgroundColor: 'white',
                                                padding: '24px',
                                                borderRadius: '16px',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <h3 style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '700', 
                                                    color: '#1e293b',
                                                    marginBottom: '16px'
                                                }}>
                                                    🏀 Setup Actions
                                                </h3>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {Object.entries(decisionQuality.decisionAnalysis.setupActions).map(([action, data]) => (
                                                        <div key={action} style={{ 
                                                            padding: '10px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                                                                    {action}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '0.7rem',
                                                                    padding: '2px 6px',
                                                                    backgroundColor: `${getQualityColor(data.quality)}20`,
                                                                    color: getQualityColor(data.quality),
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {data.quality}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                {data.count} times • {data.reason}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Execution Actions */}
                                        {decisionQuality.decisionAnalysis?.executionActions && Object.keys(decisionQuality.decisionAnalysis.executionActions).length > 0 && (
                                            <div style={{
                                                backgroundColor: 'white',
                                                padding: '24px',
                                                borderRadius: '16px',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <h3 style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '700', 
                                                    color: '#1e293b',
                                                    marginBottom: '16px'
                                                }}>
                                                    ⚡ Execution Actions
                                                </h3>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {Object.entries(decisionQuality.decisionAnalysis.executionActions).map(([action, data]) => (
                                                        <div key={action} style={{ 
                                                            padding: '10px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                                                                    {action}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '0.7rem',
                                                                    padding: '2px 6px',
                                                                    backgroundColor: `${getQualityColor(data.quality)}20`,
                                                                    color: getQualityColor(data.quality),
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {data.quality}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                {data.count} times • {data.reason}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Complex Sequences */}
                                        {decisionQuality.decisionAnalysis?.complexSequences && Object.keys(decisionQuality.decisionAnalysis.complexSequences).length > 0 && (
                                            <div style={{
                                                backgroundColor: 'white',
                                                padding: '24px',
                                                borderRadius: '16px',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <h3 style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '700', 
                                                    color: '#1e293b',
                                                    marginBottom: '16px'
                                                }}>
                                                    🧠 Complex Sequences
                                                </h3>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {Object.entries(decisionQuality.decisionAnalysis.complexSequences).map(([sequence, data]) => (
                                                        <div key={sequence} style={{ 
                                                            padding: '10px',
                                                            backgroundColor: '#f8fafc',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                                                                    {sequence}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '0.7rem',
                                                                    padding: '2px 6px',
                                                                    backgroundColor: `${getQualityColor(data.quality)}20`,
                                                                    color: getQualityColor(data.quality),
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {data.quality}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                {data.count} times • {data.reason}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Poor Decisions */}
                                        {decisionQuality.decisionAnalysis?.poorDecisions && Object.keys(decisionQuality.decisionAnalysis.poorDecisions).length > 0 && (
                                            <div style={{
                                                backgroundColor: 'white',
                                                padding: '24px',
                                                borderRadius: '16px',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <h3 style={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: '700', 
                                                    color: '#1e293b',
                                                    marginBottom: '16px'
                                                }}>
                                                    ⚠️ Areas for Improvement
                                                </h3>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {Object.entries(decisionQuality.decisionAnalysis.poorDecisions).map(([action, data]) => (
                                                        <div key={action} style={{ 
                                                            padding: '10px',
                                                            backgroundColor: '#fef2f2',
                                                            borderRadius: '6px',
                                                            border: '1px solid #fecaca'
                                                        }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '4px'
                                                            }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                                                                    {action}
                                                                </div>
                                                                <div style={{ 
                                                                    fontSize: '0.7rem',
                                                                    padding: '2px 6px',
                                                                    backgroundColor: `${getQualityColor(data.quality)}20`,
                                                                    color: getQualityColor(data.quality),
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {data.quality}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                                {data.count} times • {data.reason}
                                                            </div>
                                                            {data.context && (
                                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                                                                    After: {data.context}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Offensive Decisions */}
                                    </div>
                                ) : (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '60px 40px',
                                        color: '#64748b'
                                    }}>
                                        <p style={{ fontSize: '1rem' }}>
                                            Loading decision quality data...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'recent' && (
                            <div>
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
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
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                                        gap: '20px'
                                    }}>
                                        {recentPlays.map((play, index) => (
                                            <div key={play.id || index} style={{
                                                backgroundColor: 'white',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                                                        Q{play.quarter} • {play.gameTime}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {new Date(play.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                
                                                <div style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '12px', lineHeight: '1.4' }}>
                                                    {play.description}
                                                </div>
                                                
                                                {play.tags && play.tags.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {play.tags.map((playTag, tagIndex) => (
                                                            <span key={tagIndex} style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#475569',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '500'
                                                            }}>
                                                                {playTag.tag.name}
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
                                        padding: '60px 20px',
                                        color: '#64748b',
                                        fontSize: '1.1rem'
                                    }}>
                                        No recent plays found for this player.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'scouting' && (
                            <div>
                                <h2 style={{ 
                                    fontSize: '1.75rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '24px',
                                    letterSpacing: '-0.01em'
                                }}>
                                    Defensive Scouting Report
                                </h2>
                                
                                <DefensiveScoutingPanel 
                                    playerId={player.id}
                                    playerName={player.firstName + " " + player.lastName || player.firstName + " " + player.lastName}
                                    gameId={null}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        {/* Team Information (if NBA player) */}
                        {teamId && (
                            <div style={{
                                backgroundColor: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                border: `2px solid ${primaryColor}20`
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '16px'
                                }}>
                                    🏀 Team Information
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {/* Team Logo */}
                                    {logoUrl && (
                                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                            <img 
                                                src={logoUrl} 
                                                alt={teamDisplayName}
                                                style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    borderRadius: '12px',
                                                    objectFit: 'contain',
                                                    border: '2px solid #e2e8f0'
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Team Name */}
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                                            Current Team
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                                            {teamDisplayName}
                                        </div>
                                        {teamShortDisplayName !== teamDisplayName && (
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                                {teamShortDisplayName}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Team Colors */}
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
                                            Team Colors
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: primaryColor,
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.1)'
                                            }}></div>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: alternateColor,
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.1)'
                                            }}></div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                Primary • Alternate
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Player Status */}
                        <div style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '700', 
                                color: '#1e293b',
                                marginBottom: '16px'
                            }}>
                                📊 Player Status
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    backgroundColor: player.status === 'Active' ? '#dcfce7' : 
                                                   player.status === 'Injured' ? '#fee2e2' : '#fef3c7',
                                    color: player.status === 'Active' ? '#166534' : 
                                          player.status === 'Injured' ? '#dc2626' : '#92400e',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    {player.status === 'Active' ? '🟢 Active' : 
                                     player.status === 'Injured' ? '🏥 Injured' : player.status}
                                </span>
                                {player.collegeAthlete && (
                                    <span style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#dbeafe',
                                        color: '#1e40af',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    }}>
                                        🎓 College Athlete
                                    </span>
                                )}
                                {player.hasStatistics && (
                                    <span style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#f0fdf4',
                                        color: '#166534',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        textAlign: 'center'
                                    }}>
                                        📊 Has Statistics
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* ESPN Links */}
                        {player.espnLinks && Array.isArray(player.espnLinks) && player.espnLinks.length > 0 && (
                            <div style={{
                                backgroundColor: 'white',
                                padding: '24px',
                                borderRadius: '16px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '700', 
                                    color: '#1e293b',
                                    marginBottom: '16px'
                                }}>
                                    🔗 ESPN Resources
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {player.espnLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 10px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '6px',
                                                textDecoration: 'none',
                                                color: '#3b82f6',
                                                fontSize: '0.8rem',
                                                fontWeight: '500',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid #e2e8f0'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#eff6ff';
                                                e.target.style.borderColor = '#3b82f6';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#f8fafc';
                                                e.target.style.borderColor = '#e2e8f0';
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem' }}>
                                                {link.text === 'Player Card' ? '👤' : 
                                                 link.text === 'Stats' ? '📊' : 
                                                 link.text === 'Splits' ? '📈' : 
                                                 link.text === 'Game Log' ? '📅' : 
                                                 link.text === 'News' ? '📰' : 
                                                 link.text === 'Bio' ? '📖' : 
                                                 link.text === 'Overview' ? '👁️' : 
                                                 link.text === 'Advanced Stats' ? '📊' : '🔗'}
                                            </span>
                                            {link.shortText || link.text}
                                            {link.isExternal && (
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>↗</span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlayerDetail; 