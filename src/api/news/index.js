const express = require('express');
const router = express.Router();
const newsService = require('../../services/espn/newsService');
const authenticateJWT = require('../../middleware/auth');
const prisma = require('../../db/client');

// GET /api/news/league - Get general NBA news
router.get('/league', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const news = await newsService.getLeagueNews(parseInt(limit));
    
    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching league news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch league news'
    });
  }
});

// GET /api/news/team/:teamId - Get news for a specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit = 5 } = req.query;
    const news = await newsService.getTeamNews(teamId, parseInt(limit));
    
    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching team news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team news'
    });
  }
});

// GET /api/news/player/:playerId - Get news for a specific player
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 5 } = req.query;
    const news = await newsService.getPlayerNews(playerId, parseInt(limit));
    
    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching player news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player news'
    });
  }
});

// GET /api/news/feed - Get real-time news feed
router.get('/feed', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const news = await newsService.getNewsFeed(parseInt(limit));
    
    res.json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error) {
    console.error('Error fetching news feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news feed'
    });
  }
});

// GET /api/news/personalized - Get personalized news for authenticated user
router.get('/personalized', authenticateJWT, async (req, res) => {
  try {
    // Get user's favorite teams and players
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        favoriteTeams: {
          select: {
            espnId: true,
            name: true,
            abbreviation: true
          }
        },
        favoritePlayers: {
          select: {
            espnId: true,
            fullName: true,
            position: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const personalizedNews = await newsService.getPersonalizedNews(
      user.favoriteTeams,
      user.favoritePlayers
    );

    res.json({
      success: true,
      data: personalizedNews,
      userPreferences: {
        favoriteTeams: user.favoriteTeams.length,
        favoritePlayers: user.favoritePlayers.length
      }
    });
  } catch (error) {
    console.error('Error fetching personalized news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized news'
    });
  }
});

// GET /api/news/dashboard - Get news optimized for dashboard display
router.get('/dashboard', authenticateJWT, async (req, res) => {
  try {
    // Get user's favorite teams and players
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        favoriteTeams: {
          select: {
            espnId: true,
            name: true,
            abbreviation: true
          }
        },
        favoritePlayers: {
          select: {
            espnId: true,
            fullName: true,
            position: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get a mix of news for dashboard
    const [leagueNews, teamNews, playerNews] = await Promise.all([
      newsService.getLeagueNews(3),
      newsService.getTeamNewsForMultiple(user.favoriteTeams, 2),
      newsService.getPlayerNewsForMultiple(user.favoritePlayers, 2)
    ]);

    // Combine and sort by date
    const allNews = [...leagueNews, ...teamNews, ...playerNews]
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        league: leagueNews,
        teams: teamNews,
        players: playerNews,
        featured: allNews.slice(0, 4),
        recent: allNews
      },
      userPreferences: {
        favoriteTeams: user.favoriteTeams.length,
        favoritePlayers: user.favoritePlayers.length
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard news'
    });
  }
});

module.exports = router; 