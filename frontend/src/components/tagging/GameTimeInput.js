import React from 'react';

function GameTimeInput({ gameTime, setGameTime, currentQuarter, setCurrentQuarter }) {
  const quickTimes = [
    { label: 'Start', value: '12:00' },
    { label: 'Early', value: '10:00' },
    { label: 'Middle', value: '6:00' },
    { label: 'Late', value: '2:00' },
    { label: 'End', value: '0:30' }
  ];

  const handleQuickTime = (timeValue) => {
    setGameTime(timeValue);
  };

  return (
    <>
      {/* Quarter Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quarter:</label>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[1, 2, 3, 4].map(q => (
            <button
              key={q}
              onClick={() => setCurrentQuarter(q)}
              style={{
                padding: '8px 12px',
                background: currentQuarter === q ? '#007bff' : '#fff',
                color: currentQuarter === q ? '#fff' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Q{q}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Time Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Game Time (Q{currentQuarter}):
        </label>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {quickTimes.map((time, index) => (
            <button
              key={index}
              onClick={() => handleQuickTime(time.value)}
              style={{
                padding: '8px 12px',
                background: gameTime === time.value ? '#28a745' : '#fff',
                color: gameTime === time.value ? '#fff' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                minWidth: '60px'
              }}
            >
              {time.label}
            </button>
          ))}
        </div>
        
        {/* Custom Time Input (Optional) */}
        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>
            Custom time (optional):
          </label>
          <input
            type="text"
            value={gameTime}
            onChange={(e) => setGameTime(e.target.value)}
            placeholder="e.g., 8:30"
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </>
  );
}

export default GameTimeInput; 