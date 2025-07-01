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
   * Filter news by team - uses general news and filters by team categories
   * @param {string} teamId - ESPN team ID
   * @param {number} limit - Number of articles to fetch (default: 5)
   * @returns {Promise<Array>} Array of news articles
   */
  async getTeamNews(teamId, limit = 5) {
    try {
      // Get general news and filter by team
      const allNews = await this.getLeagueNews(50); // Get more to filter from
      const teamNews = allNews.filter(article => {
        // Check if article has team categories that match the teamId
        if (article.categories && Array.isArray(article.categories)) {
          return article.categories.some(category => 
            category.type === 'team' && category.teamId === parseInt(teamId)
          );
        }
        return false;
      });

      return teamNews.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching team news for ${teamId}:`, error.message);
      return [];
    }
  }

  /**
   * Filter news by player - uses general news and filters by player categories
   * @param {string} playerId - ESPN player ID
   * @param {number} limit - Number of articles to fetch (default: 5)
   * @returns {Promise<Array>} Array of news articles
   */
  async getPlayerNews(playerId, limit = 5) {
    try {
      // Get general news and filter by player
      const allNews = await this.getLeagueNews(50); // Get more to filter from
      const playerNews = allNews.filter(article => {
        // Check if article has athlete categories that match the playerId
        if (article.categories && Array.isArray(article.categories)) {
          return article.categories.some(category => 
            category.type === 'athlete' && category.athleteId === parseInt(playerId)
          );
        }
        return false;
      });

      return playerNews.slice(0, limit);
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
    // Extract team and player information from categories
    const teams = [];
    const players = [];
    
    if (article.categories && Array.isArray(article.categories)) {
      article.categories.forEach(category => {
        if (category.type === 'team' && category.team) {
          teams.push({
            id: category.teamId,
            name: category.description,
            abbreviation: category.team.description
          });
        }
        if (category.type === 'athlete' && category.athlete) {
          players.push({
            id: category.athleteId,
            name: category.description
          });
        }
      });
    }

    return {
      id: article.id || article.uid,
      title: article.headline,
      description: article.description,
      content: article.content,
      url: article.links?.web?.href || article.links?.mobile?.href,
      image: article.images?.[0]?.url || null,
      publishedAt: article.published,
      updatedAt: article.lastModified,
      author: article.authors?.[0]?.name || article.byline || 'ESPN',
      category: article.categories?.[0]?.description || 'NBA',
      tags: article.categories?.map(cat => cat.description) || [],
      source: 'ESPN',
      teams,
      players,
      categories: article.categories || []
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
      tags: article.categories?.map(cat => cat.description) || [],
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
      // Get all news first
      const allNews = await this.getLeagueNews(30);
      
      // Filter news for favorite teams
      const teamNews = [];
      if (favoriteTeams.length > 0) {
        favoriteTeams.forEach(team => {
          const teamArticles = allNews.filter(article => 
            article.teams && article.teams.some(t => t.id === parseInt(team.espnId))
          );
          teamArticles.forEach(article => {
            teamNews.push({
              ...article,
              teamId: team.espnId,
              teamName: team.name
            });
          });
        });
      }

      // Filter news for favorite players
      const playerNews = [];
      if (favoritePlayers.length > 0) {
        favoritePlayers.forEach(player => {
          const playerArticles = allNews.filter(article => 
            article.players && article.players.some(p => p.id === parseInt(player.espnId))
          );
          playerArticles.forEach(article => {
            playerNews.push({
              ...article,
              playerId: player.espnId,
              playerName: player.fullName
            });
          });
        });
      }

      // Get some general league news
      const leagueNews = allNews.slice(0, 10);

      return {
        league: leagueNews,
        teams: teamNews.slice(0, 10),
        players: playerNews.slice(0, 10),
        all: [...leagueNews, ...teamNews, ...playerNews]
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 15)
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
      const allNews = await this.getLeagueNews(50);
      const teamNews = [];

      teams.forEach(team => {
        const teamArticles = allNews.filter(article => 
          article.teams && article.teams.some(t => t.id === parseInt(team.espnId))
        ).slice(0, limitPerTeam);

        teamArticles.forEach(article => {
          teamNews.push({
            ...article,
            teamId: team.espnId,
            teamName: team.name
          });
        });
      });

      return teamNews;
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
      const allNews = await this.getLeagueNews(50);
      const playerNews = [];

      players.forEach(player => {
        const playerArticles = allNews.filter(article => 
          article.players && article.players.some(p => p.id === parseInt(player.espnId))
        ).slice(0, limitPerPlayer);

        playerArticles.forEach(article => {
          playerNews.push({
            ...article,
            playerId: player.espnId,
            playerName: player.fullName
          });
        });
      });

      return playerNews;
    } catch (error) {
      console.error('Error fetching multiple player news:', error.message);
      return [];
    }
  }
}

module.exports = new NewsService(); 