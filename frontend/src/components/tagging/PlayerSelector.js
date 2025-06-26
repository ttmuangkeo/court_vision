import React from 'react';

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
    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
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
      
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {players
          .filter(player => !selectedTeam || player.teamId === selectedTeam)
          .map(player => (
            <div
              key={player.id}
              onClick={() => onPlayerSelect(player)}
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
  );
}

export default PlayerSelector; 