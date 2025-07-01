const express = require('express');
const router = express.Router();
const unsplashService = require('../../services/unsplashService');

// GET /api/images/basketball - Get basketball images for landing page
router.get('/basketball', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 4;
    const images = await unsplashService.getBasketballImages(count);
    
    res.json({
      success: true,
      images,
      count: images.length
    });
  } catch (error) {
    console.error('Error fetching basketball images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images',
      images: unsplashService.getFallbackImages(4)
    });
  }
});

// GET /api/images/basketball/random - Get a single random basketball image
router.get('/basketball/random', async (req, res) => {
  try {
    const image = await unsplashService.getRandomBasketballImage();
    
    res.json({
      success: true,
      image
    });
  } catch (error) {
    console.error('Error fetching random basketball image:', error);
    const fallbackImages = unsplashService.getFallbackImages(1);
    res.json({
      success: false,
      error: 'Failed to fetch random image',
      image: fallbackImages[0]
    });
  }
});

// POST /api/images/cache/clear - Clear the image cache (admin only)
router.post('/cache/clear', async (req, res) => {
  try {
    unsplashService.clearCache();
    res.json({
      success: true,
      message: 'Image cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing image cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

module.exports = router;
