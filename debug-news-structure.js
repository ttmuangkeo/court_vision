const axios = require('axios');

async function debugNewsStructure() {
  try {
    console.log('Debugging news article structure...\n');

    const response = await axios.get('http://localhost:3000/api/news/league?limit=1');
    const article = response.data.data[0];

    console.log('Full article structure:');
    console.log(JSON.stringify(article, null, 2));
    console.log('\n');

    console.log('Available properties:');
    Object.keys(article).forEach(key => {
      console.log(`- ${key}: ${typeof article[key]} ${Array.isArray(article[key]) ? `(array, length: ${article[key].length})` : ''}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugNewsStructure(); 