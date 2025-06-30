import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function GamesDashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalGames: 0, totalPlays: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recent games
    axios.get(`${API_BASE}/games?include=teams&limit=10`)
      .then(res => {
        setGames(res.data.data);
        setStats({ totalGames: res.data.data.length });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching games:', err);
        setLoading(false);
      });

    // Fetch total plays count
    axios.get(`${API_BASE}/plays?limit=1`)
      .then(res => {
        setStats(prev => ({ ...prev, totalPlays: res.data.pagination?.total || 0 }));
      })
      .catch(err => console.error('Error fetching plays count:', err));
  }, []);

  const handleGameClick = (gameId) => {
    navigate(`/games/${gameId}`);
  };

  if (loading) return <div>Loading dashboard...</div>;

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
            🏀 Court Vision
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            fontWeight: '400',
            opacity: '0.9',
            lineHeight: '1.5',
            marginBottom: '0'
          }}>
            Fast basketball play tagging and analytics
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '60px 20px',
        backgroundColor: '#fafafa'
      }}>
        {/* Quick Stats */}
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
              {stats.totalGames}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
              Games Available
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
              {stats.totalPlays}
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
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
              {games.filter(g => g.status === 'LIVE').length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
              Live Games
            </div>
          </div>
        </div>

        {/* Recent Games */}
        <div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '32px',
            letterSpacing: '-0.01em'
          }}>
            Recent Games - Select to View Details
          </h2>
          
          {games.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '20px'
            }}>
              {games.map(game => (
                <div
                  key={game.espnId}
                  onClick={() => handleGameClick(game.espnId)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px) scale(1.02)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  {/* Subtle background pattern */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(30px, -30px)'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        {game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}
                      </h3>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginBottom: '12px'
                      }}>
                        {new Date(game.date).toLocaleDateString()} • {new Date(game.date).toLocaleTimeString()}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: game.status === 'FINISHED' ? '#d1fae5' : 
                                       game.status === 'LIVE' ? '#fef3c7' : '#f1f5f9',
                        color: game.status === 'FINISHED' ? '#065f46' : 
                               game.status === 'LIVE' ? '#92400e' : '#475569',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          backgroundColor: game.status === 'FINISHED' ? '#10b981' : 
                                         game.status === 'LIVE' ? '#f59e0b' : '#6b7280',
                          borderRadius: '50%'
                        }} />
                        {game.status}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700', 
                        marginBottom: '4px',
                        color: '#667eea'
                      }}>
                        {game.homeScore || 0} - {game.awayScore || 0}
                      </div>
                      <div style={{
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Final Score
                      </div>
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
                No games found. Make sure you've synced games from the API.
              </p>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#94a3b8'
              }}>
                Check the backend sync scripts to populate game data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamesDashboard; 