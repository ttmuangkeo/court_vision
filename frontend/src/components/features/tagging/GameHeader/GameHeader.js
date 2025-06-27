import React from 'react';
import './GameHeader.css';

function GameHeader({ game, onBack, currentQuarter }) {
  if (!game) return null;

  return (
    <div className="game-header-container">
      <button className="game-header-back-btn" onClick={onBack}>&larr; Back</button>
      <span className="game-header-title">{game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}</span>
      <div style={{ textAlign: 'right' }}>
        <div>Q{currentQuarter}</div>
        <div>{game.status}</div>
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
    </div>
  );
}

export default GameHeader; 