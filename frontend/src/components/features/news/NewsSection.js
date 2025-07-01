import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsSection.css';

const NewsSection = ({ user }) => {
  const [news, setNews] = useState({
    league: [],
    teams: [],
    players: [],
    featured: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/news/dashboard');
        if (response.data.success) {
          setNews(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNews();
    }
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

  const truncateText = (text, maxLength = 100) => {
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
      case 'featured':
      default:
        return news.featured;
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
      case 'featured':
      default:
        return 'Featured';
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
      case 'featured':
      default:
        return news.featured.length;
    }
  };

  if (loading) {
    return (
      <div className="news-section-modern">
        <div className="section-header-modern">
          <h2>Latest News</h2>
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
    <div className="news-section-modern">
      <div className="section-header-modern">
        <h2>Latest News</h2>
        <div className="news-tabs">
          {['featured', 'league', 'teams', 'players'].map(tab => (
            <button
              key={tab}
              className={`news-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabLabel(tab)}
              <span className="tab-count">({getTabCount(tab)})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="news-content">
        {currentNews.length === 0 ? (
          <div className="no-news">
            <p>No news available for this category.</p>
            {activeTab === 'teams' && user?.favoriteTeams?.length === 0 && (
              <p>Add favorite teams to see team news!</p>
            )}
            {activeTab === 'players' && user?.favoritePlayers?.length === 0 && (
              <p>Add favorite players to see player news!</p>
            )}
          </div>
        ) : (
          <div className="news-grid">
            {currentNews.map(article => (
              <div key={article.id} className="news-card-modern">
                <div className="news-image">
                  {article.image ? (
                    <img src={article.image} alt={article.title} />
                  ) : (
                    <div className="news-placeholder">
                      <span>📰</span>
                    </div>
                  )}
                </div>
                <div className="news-content-modern">
                  <div className="news-meta">
                    <span className="news-category">{article.category}</span>
                    <span className="news-time">{formatDate(article.publishedAt)}</span>
                  </div>
                  <h3 className="news-title">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="news-link"
                    >
                      {article.title}
                    </a>
                  </h3>
                  <p className="news-description">
                    {truncateText(article.description, 120)}
                  </p>
                  <div className="news-footer">
                    <span className="news-author">{article.author}</span>
                    {article.teamName && (
                      <span className="news-team">{article.teamName}</span>
                    )}
                    {article.playerName && (
                      <span className="news-player">{article.playerName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentNews.length > 0 && (
        <div className="news-footer-modern">
          <a 
            href="https://www.espn.com/nba/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="view-more-news"
          >
            View More on ESPN →
          </a>
        </div>
      )}
    </div>
  );
};

export default NewsSection; 