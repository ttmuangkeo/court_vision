import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/games?include=teams&limit=20`)
      .then(res => {
        setGames(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching games:', err);
        setLoading(false);
      });
  }, []);

  const handleGameClick = (gameId) => {
    navigate(`/games/${gameId}/tag`);
  };

  if (loading) return <div>Loading games...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>NBA Games - Select to Tag</h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {games.map(game => (
          <div
            key={game.id}
            onClick={() => handleGameClick(game.id)}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              background: '#fff',
              transition: 'all 0.2s ease',
              ':hover': {
                background: '#f5f5f5',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f5f5f5';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                  {game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}
                </h3>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {new Date(game.date).toLocaleDateString()} • {new Date(game.date).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {game.homeScore} - {game.awayScore}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: game.status === 'FINISHED' ? '#28a745' : 
                         game.status === 'LIVE' ? '#dc3545' : '#6c757d'
                }}>
                  {game.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {games.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No games found. Make sure you've synced games from the API.</p>
        </div>
      )}
    </div>
  );
}

export default GamesList;