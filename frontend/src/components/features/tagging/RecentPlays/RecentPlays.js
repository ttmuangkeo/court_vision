import React from 'react';
import './RecentPlays.css';

function RecentPlays({ recentPlays }) {
  return (
    <div className="recent-plays-container">
      <h3>Recent Plays</h3>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {recentPlays.length > 0 ? (
          recentPlays.map(play => (
            <div key={play.id} className="recent-play-item">
              <div className="recent-play-description">
                {play.description}
              </div>
              <div className="recent-play-timestamp">
                Q{play.quarter} • {play.gameTime}
              </div>
              {play.tags && play.tags.length > 0 && (
                <div className="recent-play-tags">
                  {play.tags.map(tag => tag.tag?.name).join(', ')}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="recent-play-no-plays">No plays tagged yet</p>
        )}
      </div>
    </div>
  );
}

export default RecentPlays; 