import React, { useState, useEffect } from 'react';
import { useAuth } from '../common/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NewsSection from '../features/news/NewsSection';
import './PersonalizedDashboard.css';

const PersonalizedDashboard = () => {
  const { user, refreshUser } = useAuth();
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

  // Refresh user data when dashboard loads to ensure we have latest data
  useEffect(() => {
    const refreshUserData = async () => {
      if (user) {
        console.log('Dashboard: Refreshing user data...');
        await refreshUser();
      }
    };
    refreshUserData();
  }, []); // Only run once when component mounts

  // Debug logging for user data
  useEffect(() => {
    if (user?.favoritePlayers) {
      console.log('Dashboard: User favorite players:', user.favoritePlayers.map(p => ({
        name: p.fullName,
        headshot: p.headshot,
        hasHeadshot: !!p.headshot
      })));
    }
  }, [user]);

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
      allTeams.find(t => t.id === fav.id) || fav
    );
    setEnrichedFavoriteTeams(enriched);
    
    // Debug logging
    console.log('User favorite players:', user.favoritePlayers);
    if (user.favoritePlayers && user.favoritePlayers.length > 0) {
      user.favoritePlayers.forEach(player => {
        console.log(`Player ${player.firstName + " " + player.lastName}:`, {
          id: player.id,
          headshot: player.photoUrl,
          hasHeadshot: !!player.photoUrl
        });
      });
    }
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
            team && team.id && (team.id === game.homeTeamId || team.id === game.awayTeamId)
          );
        });

        const recentPlays = playsArray.filter(play => {
          if (!user || !user.favoritePlayers || !Array.isArray(user.favoritePlayers) || user.favoritePlayers.length === 0) return true;
          return user.favoritePlayers.some(player => 
            player && player.id && (
              player.id === play.ballHandlerId || 
              player.id === play.primaryPlayerId || 
              player.id === play.secondaryPlayerId
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
      className="personalized-dashboard-modern"
    >
      {/* Soft background gradient */}
      <div className="dashboard-bg-gradient" />
      <div className="dashboard-glass-card">
        {/* Header with avatar, welcome, and favorite teams chips */}
        <div className="dashboard-header-modern">
          <div className="dashboard-header-left">
            <div className="dashboard-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="dashboard-welcome">
              <h1>Welcome back, {user?.firstName || user?.username || 'there'}!</h1>
              <div className="dashboard-streak">🔥 Streak: {user?.streak || 1} day{user?.streak === 1 ? '' : 's'}</div>
              <div className="dashboard-fav-teams-chips">
                {enrichedFavoriteTeams.map((team, idx) => (
                  <div
                    key={team.id}
                    className={`team-chip-modern${idx === activeTeamIndex ? ' active' : ''}`}
                    onClick={() => setActiveTeamIndex(idx)}
                  >
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.key} />
                    ) : (
                      <span>{team.key}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-header-right">
            <div className="dashboard-tip">
              <span role="img" aria-label="tip">💡</span> Tip: Tag plays live for better insights!
            </div>
          </div>
        </div>

        {/* Quick Actions Modern */}
        <div className="dashboard-quick-actions-modern">
          <Link to="/games" className="quick-action-modern">
            <span className="quick-action-icon">🏀</span>
            <span>Tag a Game</span>
          </Link>
          <Link to="/analytics" className="quick-action-modern">
            <span className="quick-action-icon">📊</span>
            <span>View Analytics</span>
          </Link>
          <Link to="/teams" className="quick-action-modern">
            <span className="quick-action-icon">🏆</span>
            <span>Teams</span>
          </Link>
          <Link to="/players" className="quick-action-modern">
            <span className="quick-action-icon">👤</span>
            <span>Players</span>
          </Link>
          <Link to="/news" className="quick-action-modern">
            <span className="quick-action-icon">📰</span>
            <span>News</span>
          </Link>
        </div>

        {/* Dashboard Content Modern */}
        <div className="dashboard-content-modern">
          {/* Recent Games - horizontally scrollable */}
          <div className="dashboard-section-modern">
            <div className="section-header-modern">
              <h2>Recent Games</h2>
              <Link to="/games" className="view-all-modern">View All</Link>
            </div>
            <div className="games-scroll-row">
              {dashboardData.recentGames.map(game => (
                <div key={game.id} className="game-card-modern">
                  <div className="game-teams-modern">
                    <div className="team-modern">
                      <span className="team-name-modern">{game.homeTeam?.name}</span>
                      <span className="score-modern">{game.homeTeamScore || 0}</span>
                    </div>
                    <div className="vs-modern">vs</div>
                    <div className="team-modern">
                      <span className="team-name-modern">{game.awayTeam?.name}</span>
                      <span className="score-modern">{game.awayTeamScore || 0}</span>
                    </div>
                  </div>
                  <div className="game-info-modern">
                    <span className="game-date-modern">
                      {new Date(game.dateTime).toLocaleDateString()}
                    </span>
                    <span className={`game-status-modern ${game.status.toLowerCase()}`}>
                      {game.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Players Activity - horizontally scrollable */}
          {user?.favoritePlayers?.length > 0 && (
            <div className="dashboard-section-modern">
              <div className="section-header-modern">
                <h2>Your Favorite Players</h2>
                <Link to="/players" className="view-all-modern">View All</Link>
              </div>
              <div className="players-scroll-row">
                {user.favoritePlayers.slice(0, 8).map(player => (
                  <div key={player.id} className="player-card-modern">
                    <div className="player-avatar-modern">
                      {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.firstName + " " + player.lastName} />
                      ) : (
                        <div className="player-initials">
                          {(player.firstName + " " + player.lastName || 'P').split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="player-info-modern">
                      <h3>{player.firstName + " " + player.lastName}</h3>
                      <p>{player.position} • {player.teamAbbreviation || player.team?.abbreviation || 'FA'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Games */}
          <div className="dashboard-section-modern">
            <div className="section-header-modern">
              <h2>Upcoming Games</h2>
            </div>
            <div className="games-scroll-row">
              {dashboardData.upcomingGames.map(game => (
                <div key={game.id} className="game-card-modern upcoming">
                  <div className="game-teams-modern">
                    <div className="team-modern">
                      <span className="team-name-modern">{game.homeTeam?.name}</span>
                    </div>
                    <div className="vs-modern">vs</div>
                    <div className="team-modern">
                      <span className="team-name-modern">{game.awayTeam?.name}</span>
                    </div>
                  </div>
                  <div className="game-info-modern">
                    <span className="game-date-modern">
                      {new Date(game.dateTime).toLocaleDateString()}
                    </span>
                    <span className={`game-status-modern ${game.status.toLowerCase()}`}>
                      {game.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized News Section */}
          <NewsSection user={user} />
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard; 