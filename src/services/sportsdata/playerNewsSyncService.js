const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = `https://api.sportsdata.io/v3/nba/scores/json/News?key=${process.env.SPORTSDATA_API_KEY}`;

class SportsdataPlayerNewsSyncService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchNews() {
    const response = await axios.get(API_URL);
    return response.data;
  }

  transformNewsData(news) {
    return {
      id: news.NewsID,
      source: news.Source,
      updated: news.Updated ? new Date(news.Updated) : new Date(),
      title: news.Title,
      content: news.Content,
      url: news.Url,
      author: news.Author,
      categories: news.Categories,
      playerId: news.PlayerID || null,
      teamId: news.TeamID || null,
      originalSource: news.OriginalSource,
      originalSourceUrl: news.OriginalSourceUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async syncAllNews() {
    const newsItems = await this.fetchNews();
    let synced = 0, failed = 0, skipped = 0;
    for (const news of newsItems) {
      const data = this.transformNewsData(news);
      // If playerId or teamId is present, check if they exist
      if (data.playerId) {
        const playerExists = await this.prisma.player.findUnique({ where: { id: data.playerId } });
        if (!playerExists) {
          skipped++;
          console.warn(`⚠️  Skipping news for missing player ${data.playerId}`);
          continue;
        }
      }
      if (data.teamId) {
        const teamExists = await this.prisma.team.findUnique({ where: { id: data.teamId } });
        if (!teamExists) {
          skipped++;
          console.warn(`⚠️  Skipping news for missing team ${data.teamId}`);
          continue;
        }
      }
      try {
        await this.prisma.playerNews.upsert({
          where: { id: data.id },
          update: data,
          create: data,
        });
        synced++;
        console.log(`✅ Synced: News ${data.id} (${data.title})`);
      } catch (err) {
        failed++;
        console.error(`❌ Failed to sync news ${data.id}:`, err.message);
      }
    }
    await this.prisma.$disconnect();
    return { synced, failed, skipped };
  }
}

module.exports = SportsdataPlayerNewsSyncService; 