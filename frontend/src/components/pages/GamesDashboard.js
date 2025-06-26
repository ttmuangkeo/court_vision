import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FastTagging from '../tagging/FastTagging';

const API_BASE = 'http://localhost:3000/api';

function GamesDashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [stats, setStats] = useState({ totalGames: 0, totalPlays: 0 });

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

  if (loading) return <div>Loading dashboard...</div>;

  if (selectedGameId) {
    return (
      <FastTagging
        gameId={selectedGameId}
        onBack={() => setSelectedGameId(null)}
      />
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', color: '#333' }}>
          🏀 Court Vision
        </h1>
        <p style={{ margin: '0', fontSize: '1.1rem', color: '#666' }}>
          Fast basketball play tagging and analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.totalGames}
          </div>
          <div style={{ color: '#666' }}>Games Available</div>
        </div>
        <div style={{ 
          background: '#f3e5f5', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>
            {stats.totalPlays}
          </div>
          <div style={{ color: '#666' }}>Plays Tagged</div>
        </div>
        <div style={{ 
          background: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
            {games.filter(g => g.status === 'LIVE').length}
          </div>
          <div style={{ color: '#666' }}>Live Games</div>
        </div>
      </div>

      {/* Recent Games */}
      <div>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          Recent Games - Select to Start Tagging
        </h2>
        
        {games.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {games.map(game => (
              <div
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: '#fff',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                      {game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}
                    </h3>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {new Date(game.date).toLocaleDateString()} • {new Date(game.date).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px' }}>
                      {game.homeScore} - {game.awayScore}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: game.status === 'FINISHED' ? '#e8f5e8' : 
                                 game.status === 'LIVE' ? '#fff3e0' : '#f5f5f5',
                      color: game.status === 'FINISHED' ? '#388e3c' : 
                             game.status === 'LIVE' ? '#f57c00' : '#666'
                    }}>
                      {game.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <p>No games found. Make sure you've synced games from the API.</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 15px 0', color: '#666' }}>
          Need to sync data or view other sections?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Teams
          </button>
          <button style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Players
          </button>
        </div>
      </div>
    </div>
  );
}

export default GamesDashboard; 