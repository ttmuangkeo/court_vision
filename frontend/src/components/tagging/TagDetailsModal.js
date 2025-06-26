import React from 'react';

function TagDetailsModal({ tag, onClose }) {
  if (!tag) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 28,
        minWidth: 320,
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 22,
            color: '#64748b',
            cursor: 'pointer'
          }}
          aria-label="Close"
        >
          ×
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          {tag.icon && <span style={{ fontSize: 28 }}>{tag.icon}</span>}
          <span style={{ fontWeight: 700, fontSize: 20, color: tag.color || '#1e293b' }}>{tag.name}</span>
        </div>
        {tag.description && (
          <div style={{ color: '#475569', marginBottom: 12 }}>{tag.description}</div>
        )}
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
          <strong>Category:</strong> {tag.category || 'N/A'}
        </div>
        {tag.triggers && Array.isArray(tag.triggers) && tag.triggers.length > 0 && (
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            <strong>Common Triggers:</strong> {tag.triggers.join(', ')}
          </div>
        )}
        {tag.suggestions && Array.isArray(tag.suggestions) && tag.suggestions.length > 0 && (
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            <strong>Common Suggestions:</strong> {tag.suggestions.join(', ')}
          </div>
        )}
        {tag.glossaryEntry && (
          <div style={{ fontSize: 14, color: '#334155', marginTop: 10 }}>
            <strong>Glossary:</strong> {tag.glossaryEntry.definition}
            {tag.glossaryEntry.videoUrl && (
              <div style={{ marginTop: 6 }}>
                <a href={tag.glossaryEntry.videoUrl} target="_blank" rel="noopener noreferrer">Watch Example Video</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TagDetailsModal; 