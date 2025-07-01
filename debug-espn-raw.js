const axios = require('axios');

async function debugESPNRaw() {
  try {
    console.log('Debugging raw ESPN API response...\n');

    const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=1');
    const article = response.data.articles[0];

    console.log('Raw ESPN article structure:');
    console.log(JSON.stringify(article, null, 2));
    console.log('\n');

    console.log('Categories structure:');
    if (article.categories && Array.isArray(article.categories)) {
      console.log(`Found ${article.categories.length} categories:`);
      article.categories.forEach((cat, index) => {
        console.log(`Category ${index + 1}:`, {
          type: cat.type,
          description: cat.description,
          teamId: cat.teamId,
          athleteId: cat.athleteId,
          team: cat.team ? { id: cat.team.id, description: cat.team.description } : null,
          athlete: cat.athlete ? { id: cat.athlete.id, description: cat.athlete.description } : null
        });
      });
    } else {
      console.log('No categories found or categories is not an array');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugESPNRaw(); 