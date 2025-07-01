const axios = require('axios');

class NewsService {
  constructor() {
    this.baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
    this.nowUrl = 'https://now.core.api.espn.com/v1/sports/news';
  }

  /**
   * Fetch general NBA news
   * @param {number} limit - Number of articles to fetch (default: 10)
   * @returns {Promise<Array>} Array of news articles
   */
  async getLeagueNews(limit = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/news`, {
        params: { limit },
        timeout: 10000
      });

      if (response.data && response.data.articles) {
        return response.data.articles.map(article => this.transformArticle(article));
      }

      return [];
    } catch (error) {
      console.error('Error fetching league news:', error.message);
      return [];
    }
  }

  /**
   * Fetch news for a specific team
   * @param {string} teamId - ESPN team ID
   * @param {number} limit - Number of articles to fetch (default: 5)
   * @returns {Promise<Array>} Array of news articles
   */
  async getTeamNews(teamId, limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/teams/${teamId}/news`, {
        params: { limit },
        timeout: 10000
      });

      if (response.data && response.data.articles) {
        return response.data.articles.map(article => this.transformArticle(article));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching team news for ${teamId}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch news for a specific player
   * @param {string} playerId - ESPN player ID
   * @param {number} limit - Number of articles to fetch (default: 5)
   * @returns {Promise<Array>} Array of news articles
   */
  async getPlayerNews(playerId, limit = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/athletes/${playerId}/news`, {
        params: { limit },
        timeout: 10000
      });

      if (response.data && response.data.articles) {
        return response.data.articles.map(article => this.transformArticle(article));
      }

      return [];
    } catch (error) {
      console.error(`Error fetching player news for ${playerId}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch real-time news feed
   * @param {number} limit - Number of articles to fetch (default: 10)
   * @returns {Promise<Array>} Array of news articles
   */
  async getNewsFeed(limit = 10) {
    try {
      const response = await axios.get(this.nowUrl, {
        params: { limit },
        timeout: 10000
      });

      if (response.data && response.data.content) {
        return response.data.content.map(article => this.transformNowArticle(article));
      }

      return [];
    } catch (error) {
      console.error('Error fetching news feed:', error.message);
      return [];
    }
  }

  /**
   * Transform ESPN article to our format
   * @param {Object} article - ESPN article object
   * @returns {Object} Transformed article
   */
  transformArticle(article) {
    return {
      id: article.id || article.uid,
      title: article.headline,
      description: article.description,
      content: article.content,
      url: article.links?.web?.href || article.links?.mobile?.href,
      image: article.images?.[0]?.url || null,
      publishedAt: article.published,
      updatedAt: article.lastModified,
      author: article.authors?.[0]?.name || 'ESPN',
      category: article.categories?.[0]?.description || 'NBA',
      tags: article.tags?.map(tag => tag.name) || [],
      source: 'ESPN'
    };
  }

  /**
   * Transform NOW API article to our format
   * @param {Object} article - NOW API article object
   * @returns {Object} Transformed article
   */
  transformNowArticle(article) {
    return {
      id: article.id,
      title: article.headline,
      description: article.description,
      content: article.content,
      url: article.links?.web?.href || article.links?.mobile?.href,
      image: article.images?.[0]?.url || null,
      publishedAt: article.published,
      updatedAt: article.lastModified,
      author: article.authors?.[0]?.name || 'ESPN',
      category: article.categories?.[0]?.description || 'NBA',
      tags: article.tags?.map(tag => tag.name) || [],
      source: 'ESPN NOW'
    };
  }

  /**
   * Get personalized news for a user based on their favorites
   * @param {Array} favoriteTeams - Array of team objects
   * @param {Array} favoritePlayers - Array of player objects
   * @returns {Promise<Object>} Object with different news categories
   */
  async getPersonalizedNews(favoriteTeams = [], favoritePlayers = []) {
    try {
      const [leagueNews, teamNews, playerNews] = await Promise.all([
        this.getLeagueNews(5),
        this.getTeamNewsForMultiple(favoriteTeams, 3),
        this.getPlayerNewsForMultiple(favoritePlayers, 3)
      ]);

      return {
        league: leagueNews,
        teams: teamNews,
        players: playerNews,
        all: [...leagueNews, ...teamNews, ...playerNews]
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching personalized news:', error.message);
      return {
        league: [],
        teams: [],
        players: [],
        all: []
      };
    }
  }

  /**
   * Get news for multiple teams
   * @param {Array} teams - Array of team objects
   * @param {number} limitPerTeam - Number of articles per team
   * @returns {Promise<Array>} Array of news articles
   */
  async getTeamNewsForMultiple(teams, limitPerTeam = 3) {
    if (!teams || teams.length === 0) return [];

    try {
      const teamNewsPromises = teams.map(team => 
        this.getTeamNews(team.espnId, limitPerTeam)
          .then(news => news.map(article => ({ ...article, teamId: team.espnId, teamName: team.name })))
      );

      const allTeamNews = await Promise.all(teamNewsPromises);
      return allTeamNews.flat();
    } catch (error) {
      console.error('Error fetching multiple team news:', error.message);
      return [];
    }
  }

  /**
   * Get news for multiple players
   * @param {Array} players - Array of player objects
   * @param {number} limitPerPlayer - Number of articles per player
   * @returns {Promise<Array>} Array of news articles
   */
  async getPlayerNewsForMultiple(players, limitPerPlayer = 3) {
    if (!players || players.length === 0) return [];

    try {
      const playerNewsPromises = players.map(player => 
        this.getPlayerNews(player.espnId, limitPerPlayer)
          .then(news => news.map(article => ({ ...article, playerId: player.espnId, playerName: player.fullName })))
      );

      const allPlayerNews = await Promise.all(playerNewsPromises);
      return allPlayerNews.flat();
    } catch (error) {
      console.error('Error fetching multiple player news:', error.message);
      return [];
    }
  }
}

module.exports = new NewsService(); 