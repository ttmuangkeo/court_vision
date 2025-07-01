import React, { useState, useEffect } from 'react';
import { useAuth } from '../../common/AuthContext';
import axios from 'axios';
import './NewsPage.css';

const NewsPage = () => {
  const { user } = useAuth();
  const [news, setNews] = useState({
    league: [],
    teams: [],
    players: [],
    feed: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Fetch personalized news for logged-in users
          const personalizedRes = await axios.get('/api/news/personalized');
          if (personalizedRes.data.success) {
            setNews(personalizedRes.data.data);
          }
        } else {
          // Fetch general league news for non-logged-in users
          const leagueRes = await axios.get('/api/news/league?limit=20');
          if (leagueRes.data.success) {
            setNews({
              league: leagueRes.data.data,
              teams: [],
              players: [],
              feed: []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getNewsByTab = () => {
    switch (activeTab) {
      case 'league':
        return news.league;
      case 'teams':
        return news.teams;
      case 'players':
        return news.players;
      case 'all':
      default:
        return news.all || news.league;
    }
  };

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'league':
        return 'League News';
      case 'teams':
        return 'Team News';
      case 'players':
        return 'Player News';
      case 'all':
      default:
        return 'All News';
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'league':
        return news.league.length;
      case 'teams':
        return news.teams.length;
      case 'players':
        return news.players.length;
      case 'all':
      default:
        return (news.all || news.league).length;
    }
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="news-page-header">
          <h1>NBA News</h1>
          <p>Stay updated with the latest basketball news</p>
        </div>
        <div className="news-loading">
          <div className="loading-spinner"></div>
          <p>Loading latest news...</p>
        </div>
      </div>
    );
  }

  const currentNews = getNewsByTab();

  return (
    <div className="news-page">
      <div className="news-page-header">
        <div className="header-content">
          <h1>NBA News</h1>
          <p>Stay updated with the latest basketball news</p>
          {user && (
            <div className="user-context">
              <span>Personalized for you based on your favorites</span>
            </div>
          )}
        </div>
      </div>

      <div className="news-page-content">
        <div className="news-sidebar">
          <div className="news-tabs-vertical">
            {['all', 'league', 'teams', 'players'].map(tab => (
              <button
                key={tab}
                className={`news-tab-vertical${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="tab-label">{getTabLabel(tab)}</span>
                <span className="tab-count">({getTabCount(tab)})</span>
              </button>
            ))}
          </div>

          {user && (
            <div className="user-favorites">
              <h3>Your Favorites</h3>
              {user.favoriteTeams && user.favoriteTeams.length > 0 && (
                <div className="favorites-section">
                  <h4>Teams</h4>
                  <div className="favorites-list">
                    {user.favoriteTeams.map(team => (
                      <div key={team.espnId} className="favorite-item">
                        {team.logoUrl && (
                          <img src={team.logoUrl} alt={team.name} className="favorite-logo" />
                        )}
                        <span>{team.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {user.favoritePlayers && user.favoritePlayers.length > 0 && (
                <div className="favorites-section">
                  <h4>Players</h4>
                  <div className="favorites-list">
                    {user.favoritePlayers.map(player => (
                      <div key={player.espnId} className="favorite-item">
                        <div className="player-avatar-small">
                          {player.headshot ? (
                            <img src={player.headshot} alt={player.fullName} />
                          ) : (
                            <div className="player-initials-small">
                              {(player.fullName || 'P').split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        <span>{player.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="news-main">
          <div className="news-filters">
            <div className="filter-info">
              <span>Showing {currentNews.length} articles</span>
              {activeTab === 'teams' && user?.favoriteTeams?.length === 0 && (
                <span className="filter-note">Add favorite teams to see team news</span>
              )}
              {activeTab === 'players' && user?.favoritePlayers?.length === 0 && (
                <span className="filter-note">Add favorite players to see player news</span>
              )}
            </div>
          </div>

          <div className="news-grid-large">
            {currentNews.length === 0 ? (
              <div className="no-news">
                <div className="no-news-icon">📰</div>
                <h3>No news available</h3>
                <p>Try switching to a different category or check back later.</p>
              </div>
            ) : (
              currentNews.map(article => (
                <div key={article.id} className="news-card-large">
                  <div className="news-image-large">
                    {article.image ? (
                      <img src={article.image} alt={article.title} />
                    ) : (
                      <div className="news-placeholder-large">
                        <span>📰</span>
                      </div>
                    )}
                  </div>
                  <div className="news-content-large">
                    <div className="news-meta-large">
                      <span className="news-category-large">{article.category}</span>
                      <span className="news-time-large">{formatDate(article.publishedAt)}</span>
                    </div>
                    <h2 className="news-title-large">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="news-link-large"
                      >
                        {article.title}
                      </a>
                    </h2>
                    <p className="news-description-large">
                      {truncateText(article.description, 200)}
                    </p>
                    <div className="news-footer-large">
                      <span className="news-author-large">{article.author}</span>
                      {article.teamName && (
                        <span className="news-team-large">{article.teamName}</span>
                      )}
                      {article.playerName && (
                        <span className="news-player-large">{article.playerName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {currentNews.length > 0 && (
            <div className="news-footer-page">
              <a 
                href="https://www.espn.com/nba/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="view-more-news-page"
              >
                View More on ESPN →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage; 