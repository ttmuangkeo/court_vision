import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/teams', label: 'Teams' },
    { path: '/players', label: 'Players' },
    { path: '/games', label: 'Games' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

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
        <Link 
          key={item.path}
          to={item.path}
          style={{ 
            padding: '8px 16px', 
            background: isActive(item.path) ? '#007bff' : 'transparent',
            color: '#fff', 
            border: '1px solid #fff', 
            borderRadius: '4px', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default Navbar; 