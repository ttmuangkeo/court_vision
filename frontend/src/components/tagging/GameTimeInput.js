import React from 'react';

function GameTimeInput({ gameTime, setGameTime, currentQuarter, setCurrentQuarter }) {
  return (
    <>
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
    </>
  );
}

export default GameTimeInput; 