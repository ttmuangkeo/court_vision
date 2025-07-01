const axios = require('axios');

async function checkArticleContent() {
  try {
    console.log('Checking article content from ESPN API...\n');

    // Get a few articles to examine their content
    const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=3');
    
    for (let index = 0; index < response.data.articles.length; index++) {
      const article = response.data.articles[index];
      console.log(`\n=== Article ${index + 1}: ${article.headline} ===`);
      console.log('Available fields:');
      Object.keys(article).forEach(key => {
        const value = article[key];
        if (typeof value === 'string') {
          console.log(`- ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        } else if (Array.isArray(value)) {
          console.log(`- ${key}: Array with ${value.length} items`);
        } else if (typeof value === 'object' && value !== null) {
          console.log(`- ${key}: Object with keys: ${Object.keys(value).join(', ')}`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      });

      // Check if there's detailed content
      if (article.content) {
        console.log('\n📄 Article content preview:');
        console.log(article.content.substring(0, 300) + '...');
      }

      // Check if there's a full article URL
      if (article.links?.web?.href) {
        console.log('\n🔗 Full article URL:', article.links.web.href);
        
        // Try to get the full article content
        try {
          console.log('Attempting to fetch full article content...');
          const fullArticleResponse = await axios.get(article.links.web.href, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          // Extract text content (basic approach)
          const htmlContent = fullArticleResponse.data;
          const textMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/g);
          if (textMatch) {
            const textContent = textMatch
              .map(p => p.replace(/<[^>]*>/g, ''))
              .join(' ')
              .substring(0, 500);
            console.log('📖 Extracted content preview:', textContent + '...');
          }
        } catch (fetchError) {
          console.log('❌ Could not fetch full article content:', fetchError.message);
        }
      }

      console.log('\n' + '='.repeat(60));
    }

    // Check if there's a content API endpoint
    console.log('\n🔍 Checking for content API endpoints...');
    const sampleArticle = response.data.articles[0];
    if (sampleArticle.links?.api?.self?.href) {
      console.log('API endpoint found:', sampleArticle.links.api.self.href);
      
      try {
        const contentResponse = await axios.get(sampleArticle.links.api.self.href);
        console.log('Content API response structure:');
        console.log(Object.keys(contentResponse.data));
        
        if (contentResponse.data.content) {
          console.log('📄 Content API provides article content!');
          console.log('Preview:', contentResponse.data.content.substring(0, 300) + '...');
        }
      } catch (apiError) {
        console.log('❌ Content API error:', apiError.message);
      }
    }

  } catch (error) {
    console.error('Error checking article content:', error.message);
  }
}

checkArticleContent(); 