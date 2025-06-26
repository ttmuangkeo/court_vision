import React from 'react';

function RecentPlays({ recentPlays }) {
  return (
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
  );
}

export default RecentPlays; 