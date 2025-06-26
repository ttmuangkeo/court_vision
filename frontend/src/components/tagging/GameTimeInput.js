import React from 'react';
import './GameTimeInput.css';

function GameTimeInput({ gameTime, setGameTime, currentQuarter, setCurrentQuarter }) {
  const quickTimes = [
    { label: 'Start', value: '12:00' },
    { label: 'Early', value: '10:00' },
    { label: 'Middle', value: '6:00' },
    { label: 'Late', value: '2:00' },
    { label: 'End', value: '0:30' }
  ];

  return (
    <div className="game-time-input-container">
      <label className="game-time-input-label" htmlFor="game-time-input">Game Time:</label>
      <input
        className="game-time-input-field"
        id="game-time-input"
        type="text"
        value={gameTime}
        onChange={e => setGameTime(e.target.value)}
        placeholder="MM:SS"
      />
      {/* Quick time buttons */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
        {quickTimes.map(qt => (
          <button
            key={qt.label}
            className="game-time-quick-btn"
            type="button"
            onClick={() => setGameTime(qt.value)}
          >
            {qt.label}
          </button>
        ))}
      </div>
      <label className="game-time-input-label" htmlFor="quarter-input" style={{ marginLeft: 16 }}>Quarter:</label>
      {/* Quarter buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(q => (
          <button
            key={q}
            className={`game-time-quick-btn${currentQuarter === q ? ' selected' : ''}`}
            type="button"
            onClick={() => setCurrentQuarter(q)}
            style={currentQuarter === q ? { background: '#dbeafe', color: '#1d4ed8' } : {}}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GameTimeInput; 