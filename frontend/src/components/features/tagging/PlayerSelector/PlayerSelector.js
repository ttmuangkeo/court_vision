import React from 'react';
import './PlayerSelector.css';

function PlayerSelector({ 
  game, 
  players, 
  selectedPlayer, 
  selectedTeam, 
  onPlayerSelect, 
  onTeamSelect 
}) {
  if (!game) return null;

  return (
    <div className="player-selector-container">
      <div className="player-selector-team-selector">
        <h3>Select Player</h3>
        
        {/* Team Filter */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Filter by Team:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onTeamSelect(null)}
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
              onClick={() => onTeamSelect(game.homeTeamId)}
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
              onClick={() => onTeamSelect(game.awayTeamId)}
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
      </div>
      
      <div className="player-selector-list">
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {players
            .filter(player => !selectedTeam || player.teamId === selectedTeam)
            .map(player => (
              <div
                key={player.id}
                className={`player-selector-item${selectedPlayer && selectedPlayer.id === player.id ? ' selected' : ''}`}
                onClick={() => onPlayerSelect(player)}
              >
                <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {player.team?.abbreviation} • {player.position}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default PlayerSelector; 