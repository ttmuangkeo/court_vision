# Play-by-Play Ingestion System

This document covers the automated play-by-play data ingestion system for Court Vision, which pulls detailed play data from the sportsdata.io NBA API.

## Overview

The play-by-play ingestion system automatically syncs detailed play data for NBA games, including:
- Individual play details (shots, assists, rebounds, etc.)
- Game timing and sequence information
- Player and team statistics
- Shot locations and coordinates
- Fast break and transition plays

## Architecture

### Components

1. **PlayByPlayService** (`src/services/sportsdata/playByPlayService.js`)
   - Handles API calls to sportsdata.io
   - Rate limiting and error handling
   - Data validation and normalization

2. **PlayByPlayIngestionService** (`src/scripts/sync-sportsdata-play-by-play.js`)
   - Batch processing of games
   - Database upserts and deduplication
   - Progress tracking and error reporting

3. **AutomatedPlaySync** (`src/scripts/automated-play-sync.js`)
   - Automatic season detection
   - Incremental and full season syncs
   - Continuous monitoring and archival

4. **PlayPartitioningService** (`src/scripts/play-partitioning.js`)
   - Database optimization
   - Season archiving for performance
   - Partitioning strategies

### Database Schema

The `Play` model includes all fields from the sportsdata.io API:

```prisma
model Play {
  // Sportsdata.io API fields
  playId               Int?           @unique // PlayID from sportsdata.io API
  quarterId            Int?           // QuarterID from API
  quarterName          String?        // QuarterName from API
  sequence             Int?           // Sequence from API
  season               Int?           // Season for partitioning
  timeRemainingMinutes Int?           // TimeRemainingMinutes from API
  timeRemainingSeconds Int?           // TimeRemainingSeconds from API
  awayTeamScore        Int?           // AwayTeamScore from API
  homeTeamScore        Int?           // HomeTeamScore from API
  potentialPoints      Int?           // PotentialPoints from API
  points               Int?           // Points from API
  shotMade             Boolean?       // ShotMade from API
  category             String?        // Category from API
  type                 String?        // Type from API
  teamId               Int?           // TeamID from API
  team                 String?        // Team from API
  opponentId           Int?           // OpponentID from API
  opponent             String?        // Opponent from API
  receivingTeamId      Int?           // ReceivingTeamID from API
  receivingTeam        String?        // ReceivingTeam from API
  description          String?        // Description from API
  playerId             Int?           // PlayerID from API
  assistedByPlayerId   Int?           // AssistedByPlayerID from API
  blockedByPlayerId    Int?           // BlockedByPlayerID from API
  fastBreak            Boolean?       // FastBreak from API
  sideOfBasket         String?        // SideOfBasket from API
  substituteInPlayerId Int?           // SubstituteInPlayerID from API
  substituteOutPlayerId Int?          // SubstituteOutPlayerID from API
  awayPlayerId         Int?           // AwayPlayerID from API
  homePlayerId         Int?           // HomePlayerId from API
  receivingPlayerId    Int?           // ReceivingPlayerID from API
  baselineOffsetPercentage Float?     // BaselineOffsetPercentage from API
  sidelineOffsetPercentage Float?     // SidelineOffsetPercentage from API
  coordinates          String?        // Coordinates from API
  stolenByPlayerId     Int?           // StolenByPlayerID from API
  
  // Custom fields for tagging and analytics
  id                   String         @id @default(cuid())
  gameId               Int
  timestamp            DateTime       @default(now())
  gameTime             String
  quarter              Int
  timeInQuarter        String?
  possession           Possession?
  playType             PlayType?
  ballLocation         BallLocation?
  ballHandlerId        Int?
  primaryPlayerId      Int?
  secondaryPlayerId    Int?
  result               PlayResult?
  createdById          String
  isVerified           Boolean        @default(false)
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  defensiveTeamId      Int?
  gameSituation        Json?
  offensiveTeamId      Int?
  teamContext          Json?
  
  // Relations
  tags                 PlayTag[]
  ballHandler          Player?        @relation("BallHandler", fields: [ballHandlerId], references: [id])
  createdBy            User           @relation("UserPlays", fields: [createdById], references: [id])
  defensiveTeam        Team?          @relation("DefensiveTeam", fields: [defensiveTeamId], references: [id])
  game                 Game           @relation(fields: [gameId], references: [id])
  offensiveTeam        Team?          @relation("OffensiveTeam", fields: [offensiveTeamId], references: [id])
  primaryPlayer        Player?        @relation("PrimaryPlayer", fields: [primaryPlayerId], references: [id])
  secondaryPlayer      Player?        @relation("SecondaryPlayer", fields: [secondaryPlayerId], references: [id])
  predictions          Prediction[]
  teamContexts         TeamContext[]

  @@map("plays")
  @@index([gameId, quarter, sequence])
  @@index([playId])
  @@index([season, gameId])
}
```

## Setup

### Prerequisites

1. **API Key**: Ensure `SPORTSDATA_API_KEY` is set in your `.env` file
2. **Database**: Run migrations to create the updated Play table
3. **Demo User**: Ensure a demo user exists for API imports

### Initial Setup

```bash
# 1. Add API key to .env
echo "SPORTSDATA_API_KEY=your_api_key_here" >> .env

# 2. Run database migrations
npx prisma migrate dev --name add-sportsdata-play-fields

# 3. Seed demo user (if not already done)
node seed-demo-user.js

# 4. Test the system
node test-play-by-play.js
```

## Usage

### Manual Commands

#### Sync Specific Games

```bash
# Sync a single game
node src/scripts/sync-sportsdata-play-by-play.js --game-ids=20991

# Sync multiple games
node src/scripts/sync-sportsdata-play-by-play.js --game-ids=20991,20992,20993

# Dry run to see what would be synced
node src/scripts/sync-sportsdata-play-by-play.js --game-ids=20991 --dry-run
```

#### Sync by Season

```bash
# Sync all games for a specific season
node src/scripts/sync-sportsdata-play-by-play.js --season=2025

# Sync with custom batch size
node src/scripts/sync-sportsdata-play-by-play.js --season=2025 --batch-size=5
```

### Automated Commands

#### One-Time Sync (Current Season)

```bash
# Automatically detects current season and syncs recent games
node src/scripts/automated-play-sync.js

# This will:
# - Detect current NBA season (2025)
# - Find games without plays
# - Find games with incomplete plays (< 50 plays)
# - Sync them automatically
```

#### Full Season Sync

```bash
# Sync ALL games for the current season
node src/scripts/automated-play-sync.js season

# This will:
# - Find all games for current season
# - Skip games that already have plays
# - Process in batches with rate limiting
# - Provide detailed progress and summary
```

#### Continuous Sync Loop

```bash
# Start continuous monitoring (runs every 30 minutes by default)
node src/scripts/automated-play-sync.js loop

# Custom interval (every 10 minutes)
node src/scripts/automated-play-sync.js loop --interval=600000

# Limit games per run
node src/scripts/automated-play-sync.js loop --max-games=5
```

#### Reports and Maintenance

```bash
# Generate sync report
node src/scripts/automated-play-sync.js report

# Archive old seasons
node src/scripts/play-partitioning.js archive --seasons=2020,2021

# Optimize database
node src/scripts/play-partitioning.js optimize

# View partitioning report
node src/scripts/play-partitioning.js report
```

## Automation

### Cron Job Setup

Add to your crontab for automated syncing:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Sync every 30 minutes during NBA season
*/30 * * * * cd /path/to/court_vision && node src/scripts/automated-play-sync.js once

# Full season sync every Sunday at 2 AM
0 2 * * 0 cd /path/to/court_vision && node src/scripts/automated-play-sync.js season

# Database optimization every Saturday at 3 AM
0 3 * * 6 cd /path/to/court_vision && node src/scripts/play-partitioning.js optimize
```

### Background Process

```bash
# Start continuous sync in background
nohup node src/scripts/automated-play-sync.js loop > sync.log 2>&1 &

# Check status
ps aux | grep automated-play-sync

# Stop the process
pkill -f automated-play-sync
```

## Season Detection Logic

The system automatically detects the current NBA season:

```javascript
getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // NBA season typically starts in October
  if (month >= 10) {
    return year + 1; // Next year's season
  } else {
    return year; // Current year's season
  }
}
```

**Examples:**
- January 2025 → Season 2025
- October 2025 → Season 2026
- December 2025 → Season 2026

## Performance Considerations

### Database Size

- **Average plays per game**: ~400-500 plays
- **Games per season**: ~1,230 games
- **Plays per season**: ~500,000-600,000 plays
- **Storage per season**: ~50-100 MB

### Partitioning Strategy

```bash
# Archive seasons older than 2 years
node src/scripts/play-partitioning.js archive --threshold=2

# This creates archive tables like:
# - plays_archive_2020
# - plays_archive_2021
# - plays_archive_2022
```

### Indexes

The system includes optimized indexes:
- `[gameId, quarter, sequence]` - For game queries
- `[playId]` - For upserts
- `[season, gameId]` - For season-based queries

## Troubleshooting

### Common Issues

#### API Rate Limits

**Error**: `Rate limit exceeded`
**Solution**: The system includes automatic rate limiting (1 second between requests)

#### Missing Games

**Error**: `Game not found in database`
**Solution**: Sync games first:
```bash
node src/scripts/sync-sportsdata-games.js
```

#### Foreign Key Errors

**Error**: `Foreign key constraint violated`
**Solution**: Ensure demo user exists:
```bash
node seed-demo-user.js
```

#### Database Column Errors

**Error**: `column does not exist`
**Solution**: Run migrations:
```bash
npx prisma migrate dev
```

### Monitoring

#### Check Sync Status

```bash
# View recent sync activity
node src/scripts/automated-play-sync.js report

# Check play counts by season
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.play.groupBy({
  by: ['season'],
  _count: { id: true }
}).then(stats => {
  console.log('Plays by season:', stats);
  prisma.\$disconnect();
});
"
```

#### Log Analysis

```bash
# View sync logs
tail -f sync.log

# Search for errors
grep -i error sync.log

# Check API calls
grep -i "api" sync.log
```

## Data Quality

### Validation

The system validates:
- Game existence before syncing
- Play data structure from API
- Required fields (PlayID, QuarterID, etc.)
- Duplicate prevention via upserts

### Completeness Checks

- Games with < 50 plays are flagged as potentially incomplete
- System automatically retries failed games
- Progress tracking shows completion status

## Future Enhancements

### Planned Features

1. **Real-time sync**: WebSocket-based live updates
2. **Advanced analytics**: Play pattern recognition
3. **ML integration**: Predictive play tagging
4. **Multi-sport support**: Extend to other sports
5. **API fallbacks**: Multiple data sources

### Customization

The system is designed to be extensible:
- Add new play types via schema updates
- Custom validation rules
- Integration with external analytics
- Custom partitioning strategies

## Support

For issues or questions:
1. Check this documentation
2. Review the troubleshooting section
3. Check logs for specific error messages
4. Verify API key and database connectivity
5. Test with a single game first

## API Reference

### sportsdata.io Endpoints

- **PlayByPlay**: `https://api.sportsdata.io/v3/nba/pbp/json/PlayByPlay/{gameId}`
- **Rate Limit**: 1 request per second
- **Data Format**: JSON
- **Authentication**: API key in query parameter

### Response Structure

```json
{
  "Game": {
    "GameID": 14620,
    "Season": 2020,
    "Status": "Final",
    "DateTime": "2020-01-30T20:00:00",
    "HomeTeam": "BOS",
    "AwayTeam": "GS"
  },
  "Plays": [
    {
      "PlayID": 2572325,
      "QuarterID": 57255,
      "QuarterName": "1",
      "Sequence": 2,
      "TimeRemainingMinutes": 12,
      "TimeRemainingSeconds": 0,
      "Description": "Scrambled",
      "PlayerID": null,
      "TeamID": null,
      "Points": 0,
      "ShotMade": false
    }
  ]
}
``` 