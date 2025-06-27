# Player Stats Sync System

## Overview

The Player Stats Sync system extracts basketball statistics from ESPN's public APIs and stores them in the Court Vision database. This system focuses on recent games and top performers due to API limitations.

## What Data We Get

### ✅ Available Data
- **Recent Games**: Last 7-14 days of NBA games
- **Top Performers**: "Leaders" from each game (usually 4-8 players per game)
- **Basic Stats**: Points, rebounds, assists, steals, blocks, etc.
- **Game Context**: Team, opponent, date, venue

### ⚠️ Limitations
- **Recent Games Only**: Cannot access historical games
- **Leaders Only**: Not full boxscores for all players
- **Limited Players**: Only top performers per game
- **No Historical Data**: Cannot sync past seasons

## Why These Limitations?

### ESPN API Constraints
1. **Public API Only**: We use ESPN's public endpoints
2. **Boxscore Endpoint**: Returns 404 errors (not publicly accessible)
3. **Scoreboard Endpoint**: Only provides "leaders" data
4. **Rate Limits**: Must respect API usage limits

### What We've Tried
- ✅ Scoreboard endpoint (works, limited data)
- ❌ Boxscore endpoint (404 errors)
- ❌ Historical endpoints (not accessible)
- ❌ Alternative APIs (balldontlie, etc.)

## Data Sources

### Primary Source: ESPN Scoreboard
```
https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard
```

**What we get:**
- Recent games (last 7-14 days)
- Game leaders (top performers)
- Basic game information

**Example response:**
```json
{
  "events": [
    {
      "id": "401766128",
      "name": "Indiana Pacers @ Oklahoma City Thunder",
      "leaders": [
        {
          "name": "Bennedict Mathurin",
          "value": 24,
          "displayValue": "24 PTS"
        }
      ]
    }
  ]
}
```

### Secondary Source: ESPN Core API
```
https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes
```

**What we get:**
- Complete player profiles
- Season/career statistics
- Team assignments
- Rich biographical data

## Sync Process

### 1. Game Detection
```javascript
// Fetch recent games from scoreboard
const scoreboard = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
const games = scoreboard.events;
```

### 2. Leader Extraction
```javascript
// Extract leaders from each game
games.forEach(game => {
  const leaders = game.leaders || [];
  // Process each leader's stats
});
```

### 3. Data Transformation
```javascript
// Transform ESPN data to our format
const playerStat = {
  gameId: game.id,
  playerId: leader.athlete.id,
  points: leader.value,
  // ... other stats
};
```

### 4. Database Storage
```javascript
// Upsert to avoid duplicates
await prisma.playerGameStat.upsert({
  where: { gameId_playerId: { gameId, playerId } },
  update: stats,
  create: stats
});
```

## API Endpoints

### Manual Sync
```bash
# Sync recent player stats
POST /api/player-stats/sync

# Sync specific game
POST /api/player-stats/sync/game/:gameId

# Get sync status
GET /api/player-stats/sync/status
```

### Data Retrieval
```bash
# Get stats by game
GET /api/player-stats/game/:gameId

# Get stats by player
GET /api/player-stats/player/:playerId

# Get stats by team
GET /api/player-stats/team/:teamId

# Get recent stats
GET /api/player-stats/recent
```

## Database Schema

### PlayerGameStat Table
```sql
CREATE TABLE player_game_stats (
  id UUID PRIMARY KEY,
  gameId STRING NOT NULL,
  playerId STRING NOT NULL,
  teamId STRING NOT NULL,
  points INTEGER,
  rebounds INTEGER,
  assists INTEGER,
  steals INTEGER,
  blocks INTEGER,
  turnovers INTEGER,
  fouls INTEGER,
  threesMade INTEGER,
  threesAtt INTEGER,
  fieldGoalsMade INTEGER,
  fieldGoalsAtt INTEGER,
  freeThrowsMade INTEGER,
  freeThrowsAtt INTEGER,
  plusMinus INTEGER,
  minutes STRING,
  starter BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE(gameId, playerId)
);
```

## Usage Examples

### Get Recent Player Stats
```javascript
// Fetch recent stats for a player
const stats = await prisma.playerGameStat.findMany({
  where: { playerId: "3064290" }, // Aaron Gordon
  include: {
    game: true,
    player: true
  },
  orderBy: { game: { date: 'desc' } },
  take: 10
});
```

### Get Game Leaders
```javascript
// Get top performers from a specific game
const leaders = await prisma.playerGameStat.findMany({
  where: { gameId: "401766128" },
  include: { player: true },
  orderBy: { points: 'desc' },
  take: 5
});
```

### Team Performance
```javascript
// Get team stats for recent games
const teamStats = await prisma.playerGameStat.groupBy({
  by: ['gameId'],
  where: { teamId: "13" }, // Lakers
  _sum: {
    points: true,
    rebounds: true,
    assists: true
  }
});
```

## Monitoring & Alerts

### Sync Status
```bash
# Check recent sync activity
curl http://localhost:3000/api/player-stats/sync/status

# Response
{
  "lastSync": "2025-06-27T06:39:55.008Z",
  "gamesProcessed": 1,
  "statsSynced": 4,
  "errors": 0,
  "offseason": true
}
```

### Error Handling
```javascript
// Common error scenarios
const errors = {
  API_TIMEOUT: "ESPN API is slow or down",
  NO_GAMES: "No recent games found (normal during offseason)",
  INVALID_DATA: "Data format issues from API",
  RATE_LIMIT: "Too many API requests"
};
```

## Best Practices

### 1. Sync Frequency
- **During Season**: Daily or every few hours
- **During Offseason**: Weekly (fewer games)
- **Game Days**: More frequent during active games

### 2. Data Management
- **Cleanup**: Remove old stats periodically
- **Backup**: Regular database backups
- **Monitoring**: Watch for sync failures

### 3. Performance
- **Indexing**: Index on gameId, playerId, teamId
- **Caching**: Cache frequently accessed stats
- **Pagination**: Handle large result sets

## Troubleshooting

### Common Issues

#### 1. No Stats Found
```bash
# Check if it's offseason
node -e "console.log(new Date().toISOString())"

# Test API directly
curl https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard
```

#### 2. Sync Errors
```bash
# Check logs
tail -f logs/sync.log

# Test manual sync
node src/scripts/sync-recent-player-stats.js
```

#### 3. Missing Players
```bash
# Check if player exists
node src/scripts/check-player-ids.js

# Verify Core API sync
node src/scripts/sync-all-athletes.js
```

## Future Enhancements

### Potential Improvements
1. **Multiple Sources**: Combine with other APIs
2. **Historical Data**: Find alternative sources
3. **Full Boxscores**: If ESPN opens access
4. **Real-time Updates**: WebSocket integration
5. **Advanced Analytics**: Derived statistics

### Alternative APIs to Consider
- **NBA Stats API**: Official NBA data (requires approval)
- **Basketball Reference**: Historical data
- **MySportsFeeds**: Comprehensive stats
- **SportRadar**: Professional sports data

## Support

### Getting Help
1. **Check Logs**: `tail -f logs/sync.log`
2. **Test API**: `node src/scripts/test-espn-api.js`
3. **Verify Data**: `node src/scripts/check-player-stats.js`
4. **Review Docs**: This documentation

### Contact
- Create issue with logs attached
- Include API response examples
- Specify error scenarios
- Provide environment details

---

## Quick Reference

### Commands
```bash
# Sync recent stats
node src/scripts/sync-recent-player-stats.js

# Check sync status
curl http://localhost:3000/api/player-stats/sync/status

# View recent stats
curl http://localhost:3000/api/player-stats/recent
```

### Files
- `src/services/espn/playerStatsSyncService.js` - Main sync service
- `src/scripts/sync-recent-player-stats.js` - Recent stats sync
- `src/api/players/stats/index.js` - API endpoints

### URLs
- ESPN Scoreboard: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`
- ESPN Core API: `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba`

---

*Last updated: June 2025*
*Version: 1.0* 