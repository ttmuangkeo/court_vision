import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getTeamLogo, getTeamPrimaryColor, getTeamAlternateColor, getTeamDisplayName, getTeamShortDisplayName } from '../../../../utils/teamBranding';

const API_BASE = 'http://localhost:3000/api';

function TeamsList() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConference, setSelectedConference] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [showSleepers, setShowSleepers] = useState(false);
    const [sleepers, setSleepers] = useState([]);
    const [sleepersLoading, setSleepersLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE}/teams`)
            .then(res => {
                setTeams(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching teams:', err);
                setLoading(false);
            });
    }, []);

    const fetchSleepers = async () => {
        setSleepersLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/teams/sleepers`);
            setSleepers(response.data.data);
        } catch (error) {
            console.error('Error fetching sleeper teams:', error);
            setSleepers([]);
        }
        setSleepersLoading(false);
    };

    useEffect(() => {
        if (showSleepers) {
            fetchSleepers();
        }
    }, [showSleepers]);

    const handleTeamClick = (teamId) => {
        navigate(`/teams/${teamId}`);
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
                Loading teams...
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            padding: '0'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 20px',
                color: 'white',
                textAlign: 'center'
            }}>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '700', 
                    marginBottom: '12px',
                    letterSpacing: '-0.02em'
                }}>
                    NBA Teams
                </h1>
                <p style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '400',
                    opacity: '0.9',
                    marginBottom: '0'
                }}>
                    Explore all 30 NBA teams and their analytics
                </p>
            </div>

            {/* Controls */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '30px 20px'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    {/* Search */}
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    {/* Conference Filter */}
                    <select
                        value={selectedConference}
                        onChange={(e) => setSelectedConference(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            fontSize: '1rem',
                            outline: 'none',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">All Conferences</option>
                        <option value="Eastern">Eastern</option>
                        <option value="Western">Western</option>
                    </select>

                    {/* Division Filter */}
                    <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            fontSize: '1rem',
                            outline: 'none',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">All Divisions</option>
                        <option value="Atlantic">Atlantic</option>
                        <option value="Central">Central</option>
                        <option value="Southeast">Southeast</option>
                        <option value="Northwest">Northwest</option>
                        <option value="Pacific">Pacific</option>
                        <option value="Southwest">Southwest</option>
                    </select>

                    {/* Sleeper Teams Button */}
                    <button
                        onClick={() => setShowSleepers(!showSleepers)}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: showSleepers ? '#10b981' : '#3b82f6',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {showSleepers ? '⭐' : '🔮'} {showSleepers ? 'Hide Sleepers' : 'Sleeper Teams'}
                    </button>
                </div>

                {/* Sleeper Teams Section */}
                {showSleepers && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '20px',
                            color: '#1f2937'
                        }}>
                            🔮 Sleeper Teams - High Potential Picks
                        </h2>
                        
                        {sleepersLoading ? (
                            <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading sleeper teams...</div>
                        ) : sleepers.length > 0 ? (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {sleepers.map((sleeper, index) => (
                                    <div key={sleeper.team.id} style={{
                                        background: '#f0fdf4',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid #dcfce7',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                backgroundColor: '#10b981',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '700',
                                                fontSize: '1.2rem'
                                            }}>
                                                {sleeper.team.key}
                                            </div>
                                            <div>
                                                <h3 style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: '700',
                                                    color: '#166534',
                                                    marginBottom: '4px'
                                                }}>
                                                    {sleeper.team.name}
                                                </h3>
                                                <p style={{
                                                    fontSize: '0.9rem',
                                                    color: '#16a34a',
                                                    marginBottom: '8px'
                                                }}>
                                                    Grade: {sleeper.grade} • {sleeper.team.conference} Conference
                                                </p>
                                                <p style={{
                                                    fontSize: '0.9rem',
                                                    color: '#059669',
                                                    fontStyle: 'italic'
                                                }}>
                                                    {sleeper.keyInsight}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                background: '#10b981',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                marginBottom: '8px'
                                            }}>
                                                Top Strengths
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#059669' }}>
                                                {sleeper.strengths.map(s => s.stat).join(', ')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                                No sleeper teams found. Teams are analyzed based on offensive efficiency, defensive performance, and overall balance.
                            </div>
                        )}
                    </div>
                )}

                {/* Teams Grid */}
                {!showSleepers && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '20px'
                    }}>
                        {teams.map(team => {
                            const primaryColor = getTeamPrimaryColor(team.espnId, teams);
                            const alternateColor = getTeamAlternateColor(team.espnId, teams);
                            const logoUrl = getTeamLogo(team.espnId, teams);
                            const displayName = getTeamDisplayName(team.espnId, teams);
                            const shortDisplayName = getTeamShortDisplayName(team.espnId, teams);
                            
                            return (
                                <div
                                    key={team.espnId}
                                    onClick={() => handleTeamClick(team.espnId)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        padding: '32px 24px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                        border: `2px solid ${primaryColor}20`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                                        e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                                        e.target.style.borderColor = `${primaryColor}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                                        e.target.style.borderColor = `${primaryColor}20`;
                                    }}
                                >
                                    {/* Team-colored background accent */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        right: '0',
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${primaryColor} 0%, ${alternateColor} 100%)`,
                                        borderRadius: '16px 16px 0 0'
                                    }} />
                                    
                                    {/* Team Status Badge */}
                                    {team.isAllStar && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            padding: '4px 8px',
                                            backgroundColor: '#fbbf24',
                                            color: '#92400e',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            zIndex: 1
                                        }}>
                                            ⭐ All-Star
                                        </div>
                                    )}
                                    
                                    {/* Team Logo */}
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: logoUrl ? 'transparent' : primaryColor,
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: logoUrl ? '0' : '2rem',
                                        fontWeight: '700',
                                        color: logoUrl ? 'transparent' : '#ffffff',
                                        marginBottom: '24px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        border: logoUrl ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
                                        overflow: 'hidden'
                                    }}>
                                        {logoUrl ? (
                                            <img 
                                                src={logoUrl} 
                                                alt={team.abbreviation}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'contain',
                                                    padding: '8px'
                                                }}
                                            />
                                        ) : (
                                            team.abbreviation
                                        )}
                                    </div>
                                    
                                    {/* Team Info */}
                                    <div>
                                        <h3 style={{ 
                                            fontSize: '1.5rem', 
                                            fontWeight: '700', 
                                            color: '#1e293b',
                                            marginBottom: '4px',
                                            lineHeight: '1.3',
                                            letterSpacing: '-0.01em'
                                        }}>
                                            {displayName}
                                        </h3>
                                        {shortDisplayName !== displayName && (
                                            <p style={{ 
                                                fontSize: '0.9rem', 
                                                color: '#94a3b8',
                                                marginBottom: '8px',
                                                fontWeight: '500',
                                                fontStyle: 'italic'
                                            }}>
                                                {shortDisplayName}
                                            </p>
                                        )}
                                        <p style={{ 
                                            fontSize: '1rem', 
                                            color: '#64748b',
                                            marginBottom: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {team.city}
                                        </p>
                                        
                                        {/* Team Colors */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: primaryColor,
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.1)'
                                            }} />
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: alternateColor,
                                                borderRadius: '4px',
                                                border: '1px solid rgba(0, 0, 0, 0.1)'
                                            }} />
                                        </div>
                                        
                                        {team.conference && team.division && (
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '6px 12px',
                                                backgroundColor: `${primaryColor}10`,
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                color: primaryColor,
                                                fontWeight: '600',
                                                border: `1px solid ${primaryColor}20`
                                            }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    backgroundColor: primaryColor,
                                                    borderRadius: '50%'
                                                }} />
                                                {team.conference} • {team.division}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Arrow indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '24px',
                                        right: '24px',
                                        color: primaryColor,
                                        fontSize: '1.25rem',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        →
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeamsList;