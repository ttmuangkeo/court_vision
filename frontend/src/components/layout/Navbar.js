import React from 'react';

function Navbar({ currentView, onViewChange }) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'teams', label: 'Teams' },
    { key: 'players', label: 'Players' },
    { key: 'games', label: 'Games' }
  ];

  return (
    <nav style={{ 
      background: '#333', 
      padding: '15px 20px', 
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px'
    }}>
      {navItems.map(item => (
        <button 
          key={item.key}
          onClick={() => onViewChange(item.key)} 
          style={{ 
            padding: '8px 16px', 
            background: currentView === item.key ? '#007bff' : 'transparent',
            color: '#fff', 
            border: '1px solid #fff', 
            borderRadius: '4px', 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default Navbar; 