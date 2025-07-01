const axios = require('axios');

class UnsplashService {
  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.baseURL = 'https://api.unsplash.com';
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 60; // 1 hour cache
  }

  async getBasketballImages(count = 4) {
    try {
      // Check cache first
      const cacheKey = `basketball_${count}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      // Fetch from Unsplash API
      const response = await axios.get(`${this.baseURL}/search/photos`, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`
        },
        params: {
          query: 'basketball court game',
          orientation: 'landscape',
          per_page: count,
          order_by: 'relevant'
        }
      });

      const images = response.data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        alt: photo.alt_description || 'Basketball game',
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        downloadUrl: photo.links.download_location
      }));

      // Cache the results
      this.cache.set(cacheKey, {
        data: images,
        timestamp: Date.now()
      });

      return images;
    } catch (error) {
      console.error('Error fetching Unsplash images:', error.message);
      
      // Fallback to hardcoded images if API fails
      return this.getFallbackImages(count);
    }
  }

  getFallbackImages(count = 4) {
    const fallbackImages = [
      {
        id: 'fallback-1',
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=800&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&crop=center',
        alt: 'Basketball court',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        downloadUrl: null
      },
      {
        id: 'fallback-2',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
        alt: 'Basketball game',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        downloadUrl: null
      },
      {
        id: 'fallback-3',
        url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&h=800&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=300&fit=crop&crop=center',
        alt: 'Basketball player',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        downloadUrl: null
      },
      {
        id: 'fallback-4',
        url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&h=800&fit=crop&crop=center',
        thumb: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=300&fit=crop&crop=center',
        alt: 'Basketball hoop',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        downloadUrl: null
      }
    ];

    return fallbackImages.slice(0, count);
  }

  async getRandomBasketballImage() {
    const images = await this.getBasketballImages(1);
    return images[0];
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new UnsplashService(); 