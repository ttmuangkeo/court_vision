import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getTeamLogo, getTeamPrimaryColor, getTeamAlternateColor, getTeamDisplayName, getTeamShortDisplayName } from '../../../../utils/teamBranding';

const API_BASE = 'http://localhost:3000/api';

function TeamDetail() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roster');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [rivals, setRivals] = useState([]);
    const [selectedRival, setSelectedRival] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [comparisonLoading, setComparisonLoading] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'stats' && teamId) {
            setStatsLoading(true);
            axios.get(`${API_BASE}/teams/${teamId}/statistics`)
                .then(res => {
                    setStats(res.data.data);
                    setStatsLoading(false);
                })
                .catch(err => {
                    setStats(null);
                    setStatsLoading(false);
                });
        }
    }, [activeTab, teamId]);

    useEffect(() => {
        if (activeTab === 'analytics' && teamId) {
            setAnalyticsLoading(true);
            axios.get(`${API_BASE}/teams/${teamId}/analytics`)
                .then(res => {
                    setAnalytics(res.data.data);
                    setAnalyticsLoading(false);
                })
                .catch(err => {
                    setAnalytics(null);
                    setAnalyticsLoading(false);
                });
        }
    }, [activeTab, teamId]);

    useEffect(() => {
        if (activeTab === 'comparison' && teamId) {
            // Fetch rivals
            axios.get(`${API_BASE}/teams/${teamId}/rivals`)
                .then(res => {
                    setRivals(res.data.data);
                })
                .catch(err => {
                    setRivals([]);
                });
        }
    }, [activeTab, teamId]);

    useEffect(() => {
        if (selectedRival && teamId) {
            setComparisonLoading(true);
            axios.get(`${API_BASE}/teams/${teamId}/compare/${selectedRival}`)
                .then(res => {
                    setComparison(res.data.data);
                    setComparisonLoading(false);
                })
                .catch(err => {
                    setComparison(null);
                    setComparisonLoading(false);
                });
        }
    }, [selectedRival, teamId]);

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

    const getGradeColor = (grade) => {
        const colors = {
            'A': '#10b981',
            'B': '#3b82f6',
            'C': '#f59e0b',
            'D': '#ef4444',
            'F': '#dc2626'
        };
        return colors[grade] || '#6b7280';
    };

    const getSleeperColor = (potential) => {
        const colors = {
            'High': '#10b981',
            'Medium': '#f59e0b',
            'Low': '#6b7280'
        };
        return colors[potential] || '#6b7280';
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

    // Get team branding data
    const primaryColor = getTeamPrimaryColor(team.id, [team]);
    const alternateColor = getTeamAlternateColor(team.id, [team]);
    const logoUrl = getTeamLogo(team.id, [team]);
    const displayName = getTeamDisplayName(team.id, [team]);
    const shortDisplayName = getTeamShortDisplayName(team.id, [team]);

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
                        ← Back to Teams
                    </button>
                    
                    <div style={{ 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        {/* Team Logo */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            backgroundColor: logoUrl ? 'transparent' : 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: logoUrl ? '0' : '2.5rem',
                            fontWeight: '700',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            border: logoUrl ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                            overflow: 'hidden'
                        }}>
                            {logoUrl ? (
                                <img 
                                    src={logoUrl} 
                                    alt={team.key}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain',
                                        padding: '10px'
                                    }}
                                />
                            ) : (
                                team.key
                            )}
                        </div>
                        
                        <div>
                            <h1 style={{ 
                                fontSize: '3rem', 
                                fontWeight: '700', 
                                marginBottom: '12px',
                                letterSpacing: '-0.02em',
                                lineHeight: '1.1'
                            }}>
                                {displayName}
                            </h1>
                            <p style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '400',
                                opacity: '0.9',
                                lineHeight: '1.4',
                                marginBottom: '0'
                            }}>
                                {team.city} • {team.conference} Conference • {team.division} Division
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                marginTop: '-20px',
                background: '#fff',
                borderRadius: '18px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                padding: '0 0 30px 0',
                minHeight: '400px',
                position: 'relative',
                top: '-30px'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '2px',
                    borderBottom: '1px solid #ececec',
                    padding: '0 30px',
                    background: 'transparent',
                    marginBottom: '0'
                }}>
                    <button onClick={() => setActiveTab('roster')} style={{
                        border: 'none',
                        background: activeTab === 'roster' ? primaryColor : 'transparent',
                        color: activeTab === 'roster' ? '#fff' : '#222',
                        fontWeight: '600',
                        fontSize: '1rem',
                        padding: '16px 28px',
                        borderRadius: '18px 18px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                    }}>Roster</button>
                    <button onClick={() => setActiveTab('stats')} style={{
                        border: 'none',
                        background: activeTab === 'stats' ? primaryColor : 'transparent',
                        color: activeTab === 'stats' ? '#fff' : '#222',
                        fontWeight: '600',
                        fontSize: '1rem',
                        padding: '16px 28px',
                        borderRadius: '18px 18px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                    }}>Stats</button>
                    <button onClick={() => setActiveTab('analytics')} style={{
                        border: 'none',
                        background: activeTab === 'analytics' ? primaryColor : 'transparent',
                        color: activeTab === 'analytics' ? '#fff' : '#222',
                        fontWeight: '600',
                        fontSize: '1rem',
                        padding: '16px 28px',
                        borderRadius: '18px 18px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                    }}>Analytics</button>
                    <button onClick={() => setActiveTab('comparison')} style={{
                        border: 'none',
                        background: activeTab === 'comparison' ? primaryColor : 'transparent',
                        color: activeTab === 'comparison' ? '#fff' : '#222',
                        fontWeight: '600',
                        fontSize: '1rem',
                        padding: '16px 28px',
                        borderRadius: '18px 18px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                    }}>Compare</button>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '30px' }}>
                    {activeTab === 'roster' && (
                        <div>
                            <h2 style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: '700', 
                                color: '#1e293b',
                                marginBottom: '24px',
                                letterSpacing: '-0.01em'
                            }}>
                                Team Roster
                            </h2>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '16px'
                            }}>
                                {players.map(player => (
                                    <div
                                        key={player.id}
                                        style={{
                                            backgroundColor: 'white',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                                        }}
                                        onClick={() => navigate(`/players/${player.id}`)}
                                    >
                                        {/* Player Avatar */}
                                        {player.photoUrl ? (
                                            <img
                                                src={player.photoUrl}
                                                alt={`${player.firstName + " " + player.lastName || player.firstName + " " + player.lastName || 'Player'} headshot`}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '12px',
                                                    objectFit: 'cover',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                    border: '1px solid rgba(0, 0, 0, 0.05)'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '12px',
                                            display: player.photoUrl ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            color: '#1e293b',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                            border: '1px solid rgba(0, 0, 0, 0.05)'
                                        }}>
                                            {(player.firstName + " " + player.lastName || player.firstName + " " + player.lastName || 'P').split(' ').map(n => n[0]).join('')}
                                        </div>
                                        
                                        {/* Player Info */}
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ 
                                                fontSize: '1rem', 
                                                fontWeight: '600', 
                                                color: '#1e293b',
                                                marginBottom: '4px'
                                            }}>
                                                {player.firstName + " " + player.lastName || player.firstName + " " + player.lastName || 'Unknown Player'}
                                            </h4>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: getPositionColor(player.position),
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {player.position}
                                                </span>
                                                {player.jersey && (
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#f1f5f9',
                                                        color: '#475569',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        #{player.jersey}
                                                    </span>
                                                )}
                                            </div>
                                            {player.height && (
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: '#64748b',
                                                    fontWeight: '500',
                                                    margin: '0'
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
                        <div>
                            {statsLoading ? (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>Loading team statistics...</div>
                            ) : stats && Object.keys(stats).length > 0 ? (
                                Object.entries(stats).map(([category, statsArr]) => (
                                    <div key={category} style={{ marginBottom: '32px' }}>
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: '700',
                                            marginBottom: '12px',
                                            color: primaryColor
                                        }}>{category.charAt(0).toUpperCase() + category.slice(1)} Stats</h3>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9f9f9', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                                                <thead>
                                                    <tr style={{ background: alternateColor || '#ececec' }}>
                                                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', fontSize: '1rem', color: '#333' }}>Stat</th>
                                                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', fontSize: '1rem', color: '#333' }}>Value</th>
                                                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', fontSize: '1rem', color: '#333' }}>Abbr</th>
                                                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: '600', fontSize: '1rem', color: '#333' }}>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {statsArr.map(stat => (
                                                        <tr key={stat.id}>
                                                            <td style={{ padding: '8px 12px', fontWeight: '500', color: '#222' }}>{stat.displayName}</td>
                                                            <td style={{ padding: '8px 12px', color: '#444' }}>{stat.displayValue}</td>
                                                            <td style={{ padding: '8px 12px', color: '#666' }}>{stat.abbreviation}</td>
                                                            <td style={{ padding: '8px 12px', color: '#888', fontSize: '0.95em' }}>{stat.description || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>No statistics available for this team.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div>
                            {analyticsLoading ? (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>Loading team analytics...</div>
                            ) : analytics ? (
                                <div>
                                    {/* Overall Grade */}
                                    <div style={{
                                        background: `linear-gradient(135deg, ${getGradeColor(analytics.analysis.overallGrade)} 0%, ${getGradeColor(analytics.analysis.overallGrade)}dd 100%)`,
                                        padding: '24px',
                                        borderRadius: '16px',
                                        color: 'white',
                                        marginBottom: '24px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                                                    Team Grade: {analytics.analysis.overallGrade}
                                                </h2>
                                                <p style={{ fontSize: '1rem', opacity: '0.9' }}>
                                                    Sleeper Potential: <span style={{ fontWeight: '600' }}>{analytics.analysis.sleeperPotential}</span>
                                                </p>
                                            </div>
                                            <div style={{
                                                fontSize: '3rem',
                                                fontWeight: '700',
                                                opacity: '0.8'
                                            }}>
                                                {analytics.analysis.overallGrade}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strengths */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#10b981' }}>
                                            🎯 Team Strengths
                                        </h3>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            {analytics.analysis.strengths.map((strength, index) => (
                                                <div key={index} style={{
                                                    background: '#f0fdf4',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #dcfce7'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#166534' }}>
                                                                {strength.stat}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#16a34a' }}>
                                                                {strength.value} ({strength.percentageDiff > 0 ? '+' : ''}{strength.percentageDiff.toFixed(1)}% vs league avg)
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            background: '#10b981',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {strength.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weaknesses */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#ef4444' }}>
                                            ⚠️ Areas for Improvement
                                        </h3>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            {analytics.analysis.weaknesses.map((weakness, index) => (
                                                <div key={index} style={{
                                                    background: '#fef2f2',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #fecaca'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#991b1b' }}>
                                                                {weakness.stat}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#dc2626' }}>
                                                                {weakness.value} ({weakness.percentageDiff.toFixed(1)}% vs league avg)
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {weakness.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>No analytics available for this team.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px' }}>
                                Compare with Conference Rivals
                            </h3>
                            
                            {/* Rival Selector */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                    Select a rival team:
                                </label>
                                <select 
                                    value={selectedRival || ''} 
                                    onChange={(e) => setSelectedRival(e.target.value)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        fontSize: '1rem',
                                        minWidth: '200px'
                                    }}
                                >
                                    <option value="">Choose a team...</option>
                                    {rivals.map(rival => (
                                        <option key={rival.id} value={rival.id}>
                                            {rival.name} ({rival.division})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Comparison Results */}
                            {comparisonLoading ? (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>Loading comparison...</div>
                            ) : comparison ? (
                                <div>
                                    {/* Head to Head */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
                                            Head to Head Comparison
                                        </h4>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            {Object.entries(comparison.headToHead).map(([metric, data]) => (
                                                <div key={metric} style={{
                                                    background: '#f9fafb',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>
                                                            {metric}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                            <div style={{ 
                                                                color: data.advantage === 'team1' ? '#10b981' : '#6b7280',
                                                                fontWeight: '600'
                                                            }}>
                                                                {data.team1Value}
                                                            </div>
                                                            <div style={{ color: '#9ca3af' }}>vs</div>
                                                            <div style={{ 
                                                                color: data.advantage === 'team2' ? '#10b981' : '#6b7280',
                                                                fontWeight: '600'
                                                            }}>
                                                                {data.team2Value}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '0.9rem', 
                                                        color: '#6b7280',
                                                        marginTop: '4px'
                                                    }}>
                                                        {data.percentageDiff > 0 ? '+' : ''}{data.percentageDiff.toFixed(1)}% difference
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Team Advantages */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: primaryColor }}>
                                                {comparison.team1.team.name} Advantages
                                            </h4>
                                            {comparison.advantages.team1.length > 0 ? (
                                                <div style={{ display: 'grid', gap: '8px' }}>
                                                    {comparison.advantages.team1.map((advantage, index) => (
                                                        <div key={index} style={{
                                                            background: '#f0fdf4',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem',
                                                            color: '#166534'
                                                        }}>
                                                            ✓ {advantage.advantage}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                                    No significant advantages
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#6b7280' }}>
                                                {comparison.team2.team.name} Advantages
                                            </h4>
                                            {comparison.advantages.team2.length > 0 ? (
                                                <div style={{ display: 'grid', gap: '8px' }}>
                                                    {comparison.advantages.team2.map((advantage, index) => (
                                                        <div key={index} style={{
                                                            background: '#fef2f2',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem',
                                                            color: '#991b1b'
                                                        }}>
                                                            ✓ {advantage.advantage}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                                    No significant advantages
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : selectedRival ? (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>No comparison data available.</div>
                            ) : (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>Select a rival team to see comparison.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeamDetail; 