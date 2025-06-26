import React from 'react';

function QuickActions({ quickActions, onQuickTag, selectedPlayer, gameTime }) {
  return (
    <div>
      <h3>Quick Actions</h3>
      
      {/* Quick Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onQuickTag(action.name)}
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
  );
}

export default QuickActions; 