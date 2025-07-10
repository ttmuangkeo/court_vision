import React from 'react';
import { getTeamLogo, getTeamPrimaryColor } from '../../../../utils/teamBranding';
import './PlayerSelector.css';

function PlayerSelector({ 
  game, 
  players, 
  selectedPlayer, 
  selectedTeam, 
  onPlayerSelect, 
  onTeamSelect,
  teams = [] // Add teams prop for branding data
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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            
            {/* Home Team Button */}
            <button
              onClick={() => onTeamSelect(game.homeTeamId)}
              style={{
                padding: '8px 12px',
                background: selectedTeam === game.homeTeamId ? getTeamPrimaryColor(game.homeTeamId, teams) : '#fff',
                color: selectedTeam === game.homeTeamId ? '#fff' : '#333',
                border: `1px solid ${getTeamPrimaryColor(game.homeTeamId, teams)}`,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {getTeamLogo(game.homeTeamId, teams) && (
                <img 
                  src={getTeamLogo(game.homeTeamId, teams)} 
                  alt={game.homeTeam?.abbreviation}
                  style={{ width: '20px', height: '20px' }}
                />
              )}
              {game.homeTeam?.abbreviation}
            </button>
            
            {/* Away Team Button */}
            <button
              onClick={() => onTeamSelect(game.awayTeamId)}
              style={{
                padding: '8px 12px',
                background: selectedTeam === game.awayTeamId ? getTeamPrimaryColor(game.awayTeamId, teams) : '#fff',
                color: selectedTeam === game.awayTeamId ? '#fff' : '#333',
                border: `1px solid ${getTeamPrimaryColor(game.awayTeamId, teams)}`,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {getTeamLogo(game.awayTeamId, teams) && (
                <img 
                  src={getTeamLogo(game.awayTeamId, teams)} 
                  alt={game.awayTeam?.abbreviation}
                  style={{ width: '20px', height: '20px' }}
                />
              )}
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
                style={{
                  borderLeft: selectedPlayer && selectedPlayer.id === player.id 
                    ? `4px solid ${getTeamPrimaryColor(player.teamId, teams)}` 
                    : '4px solid transparent'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{player.firstName + " " + player.lastName || player.firstName + " " + player.lastName || 'Unknown Player'}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getTeamLogo(player.teamId, teams) && (
                    <img 
                      src={getTeamLogo(player.teamId, teams)} 
                      alt={player.team?.abbreviation}
                      style={{ width: '16px', height: '16px' }}
                    />
                  )}
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