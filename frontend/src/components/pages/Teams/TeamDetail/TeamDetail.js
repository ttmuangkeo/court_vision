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
    const [showCompleteStats, setShowCompleteStats] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [rivals, setRivals] = useState([]);
    const [selectedRival, setSelectedRival] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [comparisonLoading, setComparisonLoading] = useState(false);
    const [games, setGames] = useState([]);
    const [gamesLoading, setGamesLoading] = useState(false);

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
                    setStats(res.data.data.categories);
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
    useEffect(() => {
        if (activeTab === 'games' && teamId) {
            setGamesLoading(true);
            axios.get(`${API_BASE}/games?team=${teamId}&limit=50&include=teams`)
                .then(res => {
                    setGames(res.data.data);
                    setGamesLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching games:', err);
                    setGames([]);
                    setGamesLoading(false);
                });
        }
    }, [activeTab, teamId]);

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
                    <button onClick={() => setActiveTab('games')} style={{
                        border: 'none',
                        background: activeTab === 'games' ? primaryColor : 'transparent',
                        color: activeTab === 'games' ? '#fff' : '#222',
                        fontWeight: '600',
                        fontSize: '1rem',
                        padding: '16px 28px',
                        borderRadius: '18px 18px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none',
                    }}>Games</button>
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
                            {showCompleteStats ? (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            color: '#1e293b'
                                        }}>Complete Team Statistics</h3>
                                        <button
                                            onClick={() => setShowCompleteStats(false)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#6b7280',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Back to Summary
                                        </button>
                                    </div>
                                    {Object.entries(stats).map(([category, statsArr]) => (
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
                                                            <tr key={stat.name}>
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
                                    ))}
                                </div>
                            ) : statsLoading ? (
                                <div style={{ color: '#888', fontSize: '1.1rem' }}>Loading team statistics...</div>
                            ) : stats && Object.keys(stats).length > 0 ? (
                                <div>
                                    {/* Key Performance Indicators */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            marginBottom: '20px',
                                            color: '#1e293b'
                                        }}>🏆 Key Performance Indicators</h3>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                            gap: '16px'
                                        }}>
                                            {(() => {
                                                const kpiStats = [];
                                                if (stats.offensive) {
                                                    const wins = stats.offensive.find(s => s.name === 'wins');
                                                    const losses = stats.offensive.find(s => s.name === 'losses');
                                                    const points = stats.offensive.find(s => s.name === 'points');
                                                    const assists = stats.offensive.find(s => s.name === 'assists');
                                                    
                                                    if (wins && losses) {
                                                        const winRate = ((wins.value / (wins.value + losses.value)) * 100).toFixed(1);
                                                        kpiStats.push({
                                                            title: 'Win Rate',
                                                            value: winRate + '%',
                                                            subtitle: wins.value + 'W - ' + losses.value + 'L',
                                                            color: '#10b981',
                                                            icon: '🏆'
                                                        });
                                                    }
                                                    
                                                    if (points) {
                                                        kpiStats.push({
                                                            title: 'Points Per Game',
                                                            value: (points.value / 82).toFixed(1),
                                                            subtitle: points.value + ' total points',
                                                            color: '#3b82f6',
                                                            icon: '🏀'
                                                        });
                                                    }
                                                    
                                                    if (assists) {
                                                        kpiStats.push({
                                                            title: 'Assists Per Game',
                                                            value: (assists.value / 82).toFixed(1),
                                                            subtitle: assists.value + ' total assists',
                                                            color: '#8b5cf6',
                                                            icon: '🤝'
                                                        });
                                                    }
                                                }
                                                
                                                return kpiStats.map((kpi, index) => (
                                                    <div key={index} style={{
                                                        background: 'white',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                            <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{kpi.icon}</span>
                                                            <span style={{ 
                                                                fontSize: '0.9rem', 
                                                                fontWeight: '600', 
                                                                color: kpi.color,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>{kpi.title}</span>
                                                        </div>
                                                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                                                            {kpi.value}
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                                            {kpi.subtitle}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    {/* Shooting Efficiency */}
                                    {stats.offensive && (
                                        <div style={{ marginBottom: '32px' }}>
                                            <h3 style={{
                                                fontSize: '1.3rem',
                                                fontWeight: '700',
                                                marginBottom: '16px',
                                                color: '#1e293b'
                                            }}>🎯 Shooting Efficiency</h3>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '12px'
                                            }}>
                                                {(() => {
                                                    const shootingStats = [];
                                                    const fgPct = stats.offensive.find(s => s.name === 'fieldGoalsPercentage');
                                                    const threePct = stats.offensive.find(s => s.name === 'threePointersPercentage');
                                                    const ftPct = stats.offensive.find(s => s.name === 'freeThrowsPercentage');
                                                    
                                                    if (fgPct) shootingStats.push({
                                                        label: 'FG%',
                                                        value: fgPct.displayValue,
                                                        color: '#10b981'
                                                    });
                                                    if (threePct) shootingStats.push({
                                                        label: '3P%',
                                                        value: threePct.displayValue,
                                                        color: '#3b82f6'
                                                    });
                                                    if (ftPct) shootingStats.push({
                                                        label: 'FT%',
                                                        value: ftPct.displayValue,
                                                        color: '#8b5cf6'
                                                    });
                                                    
                                                    return shootingStats.map((stat, index) => (
                                                        <div key={index} style={{
                                                            background: 'white',
                                                            padding: '16px',
                                                            borderRadius: '8px',
                                                            textAlign: 'center',
                                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                                        }}>
                                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                                                                {stat.label}
                                                            </div>
                                                            <div style={{ 
                                                                fontSize: '1.5rem', 
                                                                fontWeight: '700', 
                                                                color: stat.color 
                                                            }}>
                                                                {stat.value}
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Defensive Metrics */}
                                    {stats.defensive && (
                                        <div style={{ marginBottom: '32px' }}>
                                            <h3 style={{
                                                fontSize: '1.3rem',
                                                fontWeight: '700',
                                                marginBottom: '16px',
                                                color: '#1e293b'
                                            }}>🛡️ Defensive Performance</h3>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '12px'
                                            }}>
                                                {(() => {
                                                    const defensiveStats = [];
                                                    const rebounds = stats.defensive.find(s => s.name === 'rebounds');
                                                    const blocks = stats.defensive.find(s => s.name === 'blockedShots');
                                                    const steals = stats.defensive.find(s => s.name === 'steals');
                                                    
                                                    if (rebounds) defensiveStats.push({
                                                        label: 'Rebounds',
                                                        value: (rebounds.value / 82).toFixed(1),
                                                        subtitle: 'per game',
                                                        color: '#f59e0b'
                                                    });
                                                    if (blocks) defensiveStats.push({
                                                        label: 'Blocks',
                                                        value: (blocks.value / 82).toFixed(1),
                                                        subtitle: 'per game',
                                                        color: '#ef4444'
                                                    });
                                                    if (steals) defensiveStats.push({
                                                        label: 'Steals',
                                                        value: (steals.value / 82).toFixed(1),
                                                        subtitle: 'per game',
                                                        color: '#10b981'
                                                    });
                                                    
                                                    return defensiveStats.map((stat, index) => (
                                                        <div key={index} style={{
                                                            background: 'white',
                                                            padding: '16px',
                                                            borderRadius: '8px',
                                                            textAlign: 'center',
                                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                                        }}>
                                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '4px' }}>
                                                                {stat.label}
                                                            </div>
                                                            <div style={{ 
                                                                fontSize: '1.5rem', 
                                                                fontWeight: '700', 
                                                                color: stat.color 
                                                            }}>
                                                                {stat.value}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                                {stat.subtitle}
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Advanced Stats */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{
                                            fontSize: '1.3rem',
                                            fontWeight: '700',
                                            marginBottom: '16px',
                                            color: '#1e293b'
                                        }}>📊 Advanced Analytics</h3>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                            gap: '16px'
                                        }}>
                                            {(() => {
                                                const advancedStats = [];
                                                if (stats.offensive) {
                                                    const trueShooting = stats.offensive.find(s => s.name === 'trueShootingPercentage');
                                                    const effectiveFG = stats.offensive.find(s => s.name === 'effectiveFieldGoalsPercentage');
                                                    
                                                    if (trueShooting) advancedStats.push({
                                                        title: 'True Shooting %',
                                                        value: trueShooting.displayValue,
                                                        description: 'Overall shooting efficiency including 3-pointers and free throws',
                                                        color: '#10b981'
                                                    });
                                                    if (effectiveFG) advancedStats.push({
                                                        title: 'Effective FG %',
                                                        value: effectiveFG.displayValue,
                                                        description: 'Field goal percentage adjusted for 3-point shots',
                                                        color: '#3b82f6'
                                                    });
                                                }
                                                
                                                return advancedStats.map((stat, index) => (
                                                    <div key={index} style={{
                                                        background: 'white',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                        border: '1px solid rgba(0, 0, 0, 0.05)'
                                                    }}>
                                                        <div style={{ 
                                                            fontSize: '1rem', 
                                                            fontWeight: '600', 
                                                            color: stat.color,
                                                            marginBottom: '8px'
                                                        }}>
                                                            {stat.title}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '1.8rem', 
                                                            fontWeight: '700', 
                                                            color: '#1e293b',
                                                            marginBottom: '8px'
                                                        }}>
                                                            {stat.value}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '0.9rem', 
                                                            color: '#64748b',
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {stat.description}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    {/* View All Stats Button */}
                                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                                        <button
                                            onClick={() => {
                                                // Show the complete table format
                                                setShowCompleteStats(true);
                                            }}
                                            style={{
                                                padding: '12px 24px',
                                                background: primaryColor,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.opacity = '0.9';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.opacity = '1';
                                            }}
                                        >
                                            View Complete Statistics
                                        </button>
                                    </div>
                                </div>
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

                    
                    {activeTab === 'games' && (
                        <div>
                            <h2 style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: '700', 
                                color: '#1e293b',
                                marginBottom: '24px',
                                letterSpacing: '-0.01em'
                            }}>
                                Team Games
                            </h2>
                            
                            {gamesLoading ? (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    height: '200px',
                                    fontSize: '1.1rem',
                                    color: '#8e8e93'
                                }}>
                                    Loading games...
                                </div>
                            ) : games.length > 0 ? (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                    gap: '20px'
                                }}>
                                    {games.map(game => (
                                        <div
                                            key={game.id}
                                            onClick={() => navigate(`/games/${game.id}/tag`)}
                                            style={{
                                                backgroundColor: 'white',
                                                padding: '20px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                                transition: 'all 0.2s ease',
                                                position: 'relative',
                                                overflow: 'hidden'
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
                                            {/* Status Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: 'white',
                                                backgroundColor: game.status === 'FINISHED' ? '#28a745' : 
                                                               game.status === 'LIVE' ? '#dc3545' : '#6c757d'
                                            }}>
                                                {game.status}
                                            </div>

                                            <h3 style={{ 
                                                        margin: '0 0 8px 0', 
                                                        fontSize: '1.1rem',
                                                        fontWeight: '600',
                                                        color: '#1e293b'
                                                    }}>
                                                        {game.homeTeam?.name} vs {game.awayTeam?.name}
                                                    </h3>
                                                    <p style={{
                                                        margin: '0',
                                                        fontSize: '0.9rem',
                                                        color: '#6b7280',
                                                        fontWeight: '500'
                                                    }}>
                                                        {new Date(game.dateTime).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '60px 20px',
                                    color: '#64748b'
                                }}>
                                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                                        No games found for this team.
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                                        Games will appear here once they are synced from the API.
                                    </p>
                                </div>
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