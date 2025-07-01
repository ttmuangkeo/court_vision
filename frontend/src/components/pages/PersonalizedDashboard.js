import React, { useState, useEffect } from 'react';
import { useAuth } from '../common/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PersonalizedDashboard.css';

const PersonalizedDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentGames: [],
    favoriteTeamStats: null,
    favoritePlayerStats: [],
    recentPlays: [],
    upcomingGames: []
  });
  const [primaryTeam, setPrimaryTeam] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [enrichedFavoriteTeams, setEnrichedFavoriteTeams] = useState([]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get('/api/teams');
        setAllTeams(res.data.data || []);
      } catch (err) {
        setAllTeams([]);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!user?.favoriteTeams || allTeams.length === 0) {
      setEnrichedFavoriteTeams([]);
      return;
    }
    const enriched = user.favoriteTeams.map(fav =>
      allTeams.find(t => t.espnId === fav.espnId) || fav
    );
    setEnrichedFavoriteTeams(enriched);
  }, [user, allTeams]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!user) {
          setLoading(false);
          return;
        }
        // If user has no favorite teams, skip enrichment and load dashboard
        if (!user.favoriteTeams || user.favoriteTeams.length === 0) {
          setPrimaryTeam(null);
          setLoading(false);
          return;
        }
        // Use enriched favorite teams for branding
        if (enrichedFavoriteTeams.length > 0) {
          setPrimaryTeam(enrichedFavoriteTeams[activeTeamIndex] || enrichedFavoriteTeams[0]);
        }

        // Fetch dashboard data
        const [gamesRes, playsRes] = await Promise.all([
          axios.get('/api/games?limit=10'),
          axios.get('/api/plays?limit=20')
        ]);

        // Handle API response structure
        const gamesData = gamesRes.data.data || gamesRes.data || [];
        const playsData = playsRes.data.data || playsRes.data || [];

        // Ensure we have arrays
        const gamesArray = Array.isArray(gamesData) ? gamesData : [];
        const playsArray = Array.isArray(playsData) ? playsData : [];

        // Debug logging
        console.log('User object:', user);
        console.log('Games data:', gamesArray);
        console.log('Plays data:', playsArray);

        // Filter data based on user preferences (only if user exists)
        const recentGames = gamesArray.filter(game => {
          if (!user || !user.favoriteTeams || !Array.isArray(user.favoriteTeams) || user.favoriteTeams.length === 0) return true;
          return user.favoriteTeams.some(team => 
            team && team.espnId && (team.espnId === game.homeTeamId || team.espnId === game.awayTeamId)
          );
        });

        const recentPlays = playsArray.filter(play => {
          if (!user || !user.favoritePlayers || !Array.isArray(user.favoritePlayers) || user.favoritePlayers.length === 0) return true;
          return user.favoritePlayers.some(player => 
            player && player.espnId && (
              player.espnId === play.ballHandlerId || 
              player.espnId === play.primaryPlayerId || 
              player.espnId === play.secondaryPlayerId
            )
          );
        });

        setDashboardData({
          recentGames: recentGames.slice(0, 5),
          recentPlays: recentPlays.slice(0, 10),
          upcomingGames: gamesArray.filter(game => game.status === 'SCHEDULED').slice(0, 3)
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    // Always run when user and allTeams are loaded
    if (user && allTeams.length > 0) {
      fetchDashboardData();
    } else if (user && (!user.favoriteTeams || user.favoriteTeams.length === 0)) {
      // Failsafe: if user has no favorite teams, stop loading
      setLoading(false);
    }
  }, [user, activeTeamIndex, enrichedFavoriteTeams, allTeams]);

  const getTeamBranding = (team) => {
    if (!team) return {};
    
    return {
      '--primary-color': team.primaryColor ? `#${team.primaryColor}` : '#007bff',
      '--secondary-color': team.alternateColor ? `#${team.alternateColor}` : '#ffffff',
      '--gradient-start': team.primaryColor ? `#${team.primaryColor}` : '#007bff',
      '--gradient-end': team.alternateColor ? `#${team.alternateColor}` : '#0056b3'
    };
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const name = user?.firstName || user?.username || 'there';
    const teamName = primaryTeam?.name || 'basketball';

    return `${timeGreeting}, ${name}! Ready to analyze some ${teamName}?`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  return (
    <div 
      className="personalized-dashboard"
      style={getTeamBranding(primaryTeam)}
    >
      {/* Header with team branding */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getWelcomeMessage()}</h1>
          <p className="dashboard-subtitle">
            Your personalized basketball analytics dashboard
            {enrichedFavoriteTeams.length > 1
              ? ` • Favorites: ${enrichedFavoriteTeams.map(t => t.abbreviation || t.name).join(', ')}`
              : primaryTeam && ` • ${primaryTeam.name} focus`}
          </p>
        </div>
        {/* Favorite Teams Chips/Logos */}
        {enrichedFavoriteTeams.length > 1 && (
          <div className="favorite-teams-chips">
            {enrichedFavoriteTeams.map((team, idx) => (
              <div
                key={team.espnId}
                className={`team-chip${idx === activeTeamIndex ? ' active' : ''}`}
                onClick={() => setActiveTeamIndex(idx)}
                style={{
                  border: idx === activeTeamIndex ? '2px solid #222' : '1px solid #ccc',
                  borderRadius: 20,
                  padding: '4px 12px',
                  marginRight: 8,
                  cursor: 'pointer',
                  background: idx === activeTeamIndex ? '#f0f4ff' : '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.abbreviation} style={{ width: 24, height: 24, marginRight: 6, borderRadius: '50%' }} />
                ) : (
                  <span style={{ fontWeight: 'bold', marginRight: 6 }}>{team.abbreviation}</span>
                )}
                <span>{team.name}</span>
              </div>
            ))}
          </div>
        )}
        {primaryTeam && (
          <div className="team-branding">
            <div className="team-logo">
              {primaryTeam.logoUrl ? (
                <img src={primaryTeam.logoUrl} alt={primaryTeam.name} />
              ) : (
                <div className="team-initial">{primaryTeam.abbreviation}</div>
              )}
            </div>
            <div className="team-info">
              <h2>{primaryTeam.name}</h2>
              <p>{primaryTeam.conference} • {primaryTeam.division}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/games" className="action-card">
          <div className="action-icon">🏀</div>
          <h3>Live Games</h3>
          <p>Tag plays in real-time</p>
        </Link>
        
        <Link to="/analytics" className="action-card">
          <div className="action-icon">📊</div>
          <h3>Analytics</h3>
          <p>View insights & trends</p>
        </Link>
        
        <Link to="/teams" className="action-card">
          <div className="action-icon">🏆</div>
          <h3>Teams</h3>
          <p>Explore team data</p>
        </Link>
        
        <Link to="/players" className="action-card">
          <div className="action-icon">👤</div>
          <h3>Players</h3>
          <p>Player analysis</p>
        </Link>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Recent Games */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Games</h2>
            <Link to="/games" className="view-all">View All</Link>
          </div>
          
          <div className="games-grid">
            {dashboardData.recentGames.map(game => (
              <div key={game.espnId} className="game-card">
                <div className="game-teams">
                  <div className="team">
                    <span className="team-name">{game.homeTeam?.abbreviation}</span>
                    <span className="score">{game.homeScore || 0}</span>
                  </div>
                  <div className="vs">vs</div>
                  <div className="team">
                    <span className="team-name">{game.awayTeam?.abbreviation}</span>
                    <span className="score">{game.awayScore || 0}</span>
                  </div>
                </div>
                <div className="game-info">
                  <span className="game-date">
                    {new Date(game.date).toLocaleDateString()}
                  </span>
                  <span className={`game-status ${game.status.toLowerCase()}`}>
                    {game.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Players Activity */}
        {user?.favoritePlayers?.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your Favorite Players</h2>
              <Link to="/players" className="view-all">View All</Link>
            </div>
            
            <div className="players-grid">
              {user.favoritePlayers.slice(0, 4).map(player => (
                <div key={player.espnId} className="player-card">
                  <div className="player-avatar">
                    {player.headshot ? (
                      <img src={player.headshot} alt={player.fullName} />
                    ) : (
                      <div className="player-initial">
                        {player.fullName?.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="player-info">
                    <h3>{player.fullName}</h3>
                    <p>{player.position} • {player.team?.abbreviation || 'FA'}</p>
                  </div>
                  <Link to={`/players/${player.espnId}`} className="player-link">
                    View Stats →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Plays */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Plays</h2>
            <Link to="/plays" className="view-all">View All</Link>
          </div>
          
          <div className="plays-list">
            {dashboardData.recentPlays.map(play => (
              <div key={play.id} className="play-item">
                <div className="play-time">
                  {play.gameTime} Q{play.quarter}
                </div>
                <div className="play-description">
                  {play.description || 'Play tagged'}
                </div>
                <div className="play-players">
                  {play.ballHandler?.fullName && (
                    <span className="player-tag">{play.ballHandler.fullName}</span>
                  )}
                  {play.primaryPlayer?.fullName && (
                    <span className="player-tag">{play.primaryPlayer.fullName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Games</h2>
            <Link to="/games" className="view-all">View All</Link>
          </div>
          
          <div className="upcoming-games">
            {dashboardData.upcomingGames.map(game => (
              <div key={game.espnId} className="upcoming-game">
                <div className="game-teams">
                  <span>{game.homeTeam?.abbreviation}</span>
                  <span className="vs">vs</span>
                  <span>{game.awayTeam?.abbreviation}</span>
                </div>
                <div className="game-date">
                  {new Date(game.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Quick Access */}
      <div className="profile-quick-access">
        <Link to="/profile" className="profile-link">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h3>Update Profile</h3>
            <p>Manage preferences & favorites</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PersonalizedDashboard; 