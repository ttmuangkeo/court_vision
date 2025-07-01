import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../common/AuthContext';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/teams', label: 'Teams' },
    { path: '/players', label: 'Players' },
    { path: '/games', label: 'Games' },
    { path: '/news', label: 'News' }
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            <span className="brand-icon">🏀</span>
            <span className="brand-text">Court Vision</span>
          </Link>
        </div>

        <div className="navbar-nav">
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={handleUserMenuToggle}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span>{user.firstName?.[0] || user.username[0]}</span>
                  )}
                </div>
                <span className="user-name">{user.firstName || user.username}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-info">
                    <div className="user-full-name">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username
                      }
                    </div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  
                  <div className="menu-divider"></div>
                  
                  <Link 
                    to="/profile" 
                    className="menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="menu-icon">👤</span>
                    Profile
                  </Link>
                  
                  <Link 
                    to="/settings" 
                    className="menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="menu-icon">⚙️</span>
                    Settings
                  </Link>
                  
                  <div className="menu-divider"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="menu-item logout-button"
                  >
                    <span className="menu-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/auth" className="auth-link">
                Sign In
              </Link>
              <Link to="/auth?mode=register" className="auth-link signup-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 