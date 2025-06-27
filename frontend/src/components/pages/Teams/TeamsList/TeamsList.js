import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getTeamLogo, getTeamPrimaryColor, getTeamDisplayName } from '../../../../utils/teamBranding';

const API_BASE = 'http://localhost:3000/api';

function TeamsList() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
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
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '80px 20px 60px',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ 
                        fontSize: '3.5rem', 
                        fontWeight: '700', 
                        marginBottom: '16px',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.1'
                    }}>
                        NBA Teams
                    </h1>
                    <p style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '400',
                        opacity: '0.9',
                        lineHeight: '1.5',
                        marginBottom: '0'
                    }}>
                        Discover all 30 teams and explore their rosters
                    </p>
                </div>
            </div>

            {/* Teams Grid */}
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '60px 20px',
                backgroundColor: '#fafafa'
            }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {teams.map(team => {
                        const primaryColor = getTeamPrimaryColor(team.id, teams);
                        const logoUrl = getTeamLogo(team.id, teams);
                        const displayName = getTeamDisplayName(team.id, teams);
                        
                        return (
                            <div
                                key={team.id}
                                onClick={() => handleTeamClick(team.id)}
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
                                    backgroundColor: primaryColor,
                                    borderRadius: '16px 16px 0 0'
                                }} />
                                
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
                                        marginBottom: '8px',
                                        lineHeight: '1.3',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {displayName}
                                    </h3>
                                    <p style={{ 
                                        fontSize: '1rem', 
                                        color: '#64748b',
                                        marginBottom: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {team.city}
                                    </p>
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
            </div>
        </div>
    );
}

export default TeamsList;