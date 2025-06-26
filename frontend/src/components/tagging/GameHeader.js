import React from 'react';

function GameHeader({ game, onBack, currentQuarter }) {
  if (!game) return null;

  return (
    <>
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
    </>
  );
}

export default GameHeader; 