const axios = require('axios');

async function testContentAPI() {
  try {
    console.log('Testing ESPN Content API...\n');

    // First, get some article IDs from the news API
    console.log('1. Getting article IDs from news API...');
    const newsResponse = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=3');
    
    const articles = newsResponse.data.articles;
    console.log(`Found ${articles.length} articles to test\n`);

    // Test each article's content API endpoint
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n=== Testing Article ${i + 1}: ${article.headline} ===`);
      console.log(`Article ID: ${article.id}`);
      
      if (article.links?.api?.self?.href) {
        const contentUrl = article.links.api.self.href;
        console.log(`Content API URL: ${contentUrl}`);
        
        try {
          console.log('Fetching content from API...');
          const contentResponse = await axios.get(contentUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          console.log('✅ Content API Response:');
          console.log('Status:', contentResponse.status);
          console.log('Response keys:', Object.keys(contentResponse.data));
          
          // Check for specific fields
          if (contentResponse.data.headlines && contentResponse.data.headlines.length > 0) {
            const headline = contentResponse.data.headlines[0];
            console.log('\n📰 Headline data:');
            console.log('Keys:', Object.keys(headline));
            
            // Check for content fields
            if (headline.content) {
              console.log('📄 Content found!');
              console.log('Content preview:', headline.content.substring(0, 300) + '...');
            } else {
              console.log('❌ No content field in headline');
            }
            
            if (headline.description) {
              console.log('📝 Description:', headline.description);
            }
            
            if (headline.body) {
              console.log('📖 Body found!');
              console.log('Body preview:', headline.body.substring(0, 300) + '...');
            }
            
            if (headline.summary) {
              console.log('📋 Summary:', headline.summary);
            }
            
            // Check for any text content
            const textFields = ['content', 'body', 'summary', 'description', 'text', 'article'];
            textFields.forEach(field => {
              if (headline[field] && typeof headline[field] === 'string' && headline[field].length > 50) {
                console.log(`✅ Found substantial ${field}:`, headline[field].substring(0, 200) + '...');
              }
            });
            
          } else {
            console.log('❌ No headlines in response');
            console.log('Full response structure:', JSON.stringify(contentResponse.data, null, 2));
          }
          
        } catch (apiError) {
          console.log('❌ Content API error:', apiError.message);
          if (apiError.response) {
            console.log('Response status:', apiError.response.status);
            console.log('Response data:', apiError.response.data);
          }
        }
      } else {
        console.log('❌ No content API URL found');
      }
      
      console.log('\n' + '='.repeat(80));
    }

    // Also test the general content API endpoint
    console.log('\n2. Testing general content API endpoint...');
    try {
      const generalContentUrl = 'https://content.core.api.espn.com/v1/sports/basketball/nba/news';
      console.log(`Testing: ${generalContentUrl}`);
      
      const generalResponse = await axios.get(generalContentUrl, {
        params: { limit: 3 },
        timeout: 10000
      });
      
      console.log('✅ General content API response:');
      console.log('Status:', generalResponse.status);
      console.log('Response keys:', Object.keys(generalResponse.data));
      
      if (generalResponse.data.headlines && generalResponse.data.headlines.length > 0) {
        console.log(`Found ${generalResponse.data.headlines.length} headlines`);
        const sampleHeadline = generalResponse.data.headlines[0];
        console.log('Sample headline keys:', Object.keys(sampleHeadline));
        
        // Check for content
        if (sampleHeadline.content) {
          console.log('📄 Content found in general API!');
          console.log('Preview:', sampleHeadline.content.substring(0, 300) + '...');
        }
      }
      
    } catch (generalError) {
      console.log('❌ General content API error:', generalError.message);
    }

  } catch (error) {
    console.error('Error testing content API:', error.message);
  }
}

testContentAPI(); 