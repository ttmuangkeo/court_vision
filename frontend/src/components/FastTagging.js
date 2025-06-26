import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function FastTagging({ gameId, onBack }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [gameTime, setGameTime] = useState('');
  const [recentPlays, setRecentPlays] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null); // Track selected team for filtering

  // Quick action buttons for common tags
  const quickActions = [
    { name: 'Double Team', color: '#FF6B6B', icon: '👥' },
    { name: 'Isolation', color: '#4ECDC4', icon: '🏀' },
    { name: 'Pick & Roll', color: '#45B7D1', icon: '🔄' },
    { name: 'Post Up', color: '#96CEB4', icon: '📯' },
    { name: 'Transition', color: '#FFEAA7', icon: '⚡' },
    { name: '3-Pointer', color: '#DDA0DD', icon: '🎯' },
    { name: 'Block', color: '#FF8C42', icon: '🛡️' },
    { name: 'Steal', color: '#FFD93D', icon: '🤲' }
  ];

  useEffect(() => {
    // Fetch game details and plays
    setLoading(true);
    axios.get(`${API_BASE}/games/${gameId}?include=full`)
      .then(res => {
        setGame(res.data.data);
        const plays = res.data.data.plays || [];
        setRecentPlays(plays.slice(-5)); // Show last 5 plays
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching game:', err);
        setLoading(false);
      });
  }, [gameId]);

  // Fetch tags (only once)
  useEffect(() => {
    axios.get(`${API_BASE}/tags`).then(res => setTags(res.data.data));
  }, []);

  // Fetch players when game data is available
  useEffect(() => {
    if (game && game.homeTeamId && game.awayTeamId) {
      const teamIds = [game.homeTeamId, game.awayTeamId];
      axios.get(`${API_BASE}/players?team_ids=${teamIds.join(',')}`)
        .then(res => setPlayers(res.data.data))
        .catch(err => {
          console.error('Error fetching players:', err);
          setPlayers([]); // Set empty array on error
        });
    }
  }, [game?.homeTeamId, game?.awayTeamId]); // Only depend on the specific team IDs

  const handleQuickTag = async (actionName) => {
    if (!selectedPlayer) {
      alert('Please select a player first');
      return;
    }

    if (!gameTime) {
      alert('Please enter game time');
      return;
    }

    try {
      // Find the tag by name
      const tag = tags.find(t => t.name === actionName);
      if (!tag) {
        console.warn(`Tag "${actionName}" not found in database`);
        return;
      }

      // For demo, use a hardcoded user ID - replace with actual user ID in production
      const createdById = 'cmccsd5oj00001xhj6xnvor24';

      await axios.post(`${API_BASE}/plays`, {
        gameId,
        description: `${actionName} by ${selectedPlayer.name}`,
        quarter: currentQuarter,
        gameTime,
        createdById,
        tags: [
          {
            tagId: tag.id,
            playerId: selectedPlayer.id,
            teamId: selectedPlayer.teamId,
            context: { action: actionName }
          }
        ]
      });

      // Update recent plays
      const res = await axios.get(`${API_BASE}/games/${gameId}?include=full`);
      const plays = res.data.data.plays || [];
      setRecentPlays(plays.slice(-5));

      // Clear game time for next tag
      setGameTime('');
      
      console.log(`✅ Tagged: ${actionName} for ${selectedPlayer.name}`);
    } catch (err) {
      console.error('Error tagging play:', err);
      alert('Error tagging play: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  if (loading) return <div>Loading game...</div>;
  if (!game) return <div>Game not found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ fontSize: '16px', padding: '8px 16px' }}>
          ← Back to Games
        </button>
        <h2 style={{ margin: 0 }}>
          {game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}
        </h2>
        <div style={{ textAlign: 'right' }}>
          <div>Q{currentQuarter}</div>
          <div>{game.status}</div>
        </div>
      </div>

      {/* Score Display */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '18px'
      }}>
        <strong>{game.homeTeam?.abbreviation} {game.homeScore} - {game.awayTeam?.abbreviation} {game.awayScore}</strong>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px' }}>
        {/* Player Selection */}
        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <h3>Select Player</h3>
          
          {/* Team Filter */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Filter by Team:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedTeam(null)}
                style={{
                  padding: '8px 12px',
                  background: selectedTeam === null ? '#007bff' : '#fff',
                  color: selectedTeam === null ? '#fff' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                All Players
              </button>
              <button
                onClick={() => setSelectedTeam(game.homeTeamId)}
                style={{
                  padding: '8px 12px',
                  background: selectedTeam === game.homeTeamId ? '#007bff' : '#fff',
                  color: selectedTeam === game.homeTeamId ? '#fff' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {game.homeTeam?.abbreviation}
              </button>
              <button
                onClick={() => setSelectedTeam(game.awayTeamId)}
                style={{
                  padding: '8px 12px',
                  background: selectedTeam === game.awayTeamId ? '#007bff' : '#fff',
                  color: selectedTeam === game.awayTeamId ? '#fff' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {game.awayTeam?.abbreviation}
              </button>
            </div>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {players
              .filter(player => !selectedTeam || player.teamId === selectedTeam)
              .map(player => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  style={{
                    padding: '8px 12px',
                    margin: '4px 0',
                    background: selectedPlayer?.id === player.id ? '#007bff' : '#fff',
                    color: selectedPlayer?.id === player.id ? '#fff' : '#333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #ddd'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {player.team?.abbreviation} • {player.position}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3>Quick Actions</h3>
          
          {/* Game Time Input */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Game Time (e.g., 11:45):
            </label>
            <input
              type="text"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              placeholder="11:45"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* Quarter Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Quarter:</label>
            <select
              value={currentQuarter}
              onChange={(e) => setCurrentQuarter(Number(e.target.value))}
              style={{
                padding: '8px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {[1, 2, 3, 4].map(q => (
                <option key={q} value={q}>Q{q}</option>
              ))}
            </select>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickTag(action.name)}
                disabled={!selectedPlayer || !gameTime}
                style={{
                  padding: '15px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: action.color,
                  color: '#fff',
                  cursor: selectedPlayer && gameTime ? 'pointer' : 'not-allowed',
                  opacity: selectedPlayer && gameTime ? 1 : 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                {action.name}
              </button>
            ))}
          </div>

          {/* Selected Player Display */}
          {selectedPlayer && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#e3f2fd', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <strong>Selected:</strong> {selectedPlayer.name} ({selectedPlayer.team?.abbreviation})
            </div>
          )}
        </div>

        {/* Recent Plays */}
        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <h3>Recent Plays</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {recentPlays.length > 0 ? (
              recentPlays.map(play => (
                <div key={play.id} style={{ 
                  padding: '10px', 
                  margin: '8px 0', 
                  background: '#fff', 
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Q{play.quarter} • {play.gameTime}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{play.description}</div>
                  {play.tags && play.tags.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#007bff' }}>
                      {play.tags.map(tag => tag.tag?.name).join(', ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No plays tagged yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FastTagging; 