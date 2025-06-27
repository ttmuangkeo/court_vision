# Automated NBA Data Sync System

## Overview

The Court Vision app automatically syncs NBA data from ESPN's Core API to keep your database up-to-date with the latest teams, players, games, and player statistics. This system runs in the background and handles both regular season and offseason periods intelligently.

## What Gets Synced

### 🏀 Athletes (Players)
- **Complete NBA player database** (820+ players)
- **Rich player profiles** including:
  - Basic info: name, position, height, weight, age
  - Career details: experience, college, draft info
  - Team assignments and active status
  - Headshots and biographical data
- **Source**: ESPN Core API (`sports.core.api.espn.com`)
- **Frequency**: Daily during season, weekly during offseason

### 🏆 Teams
- **All 30 NBA teams** with current rosters
- **Team branding** and location data
- **Source**: ESPN Core API
- **Frequency**: Weekly (teams don't change often)

### 🎮 Games
- **Recent games** from the current season
- **Game details** including scores, status, venue
- **Source**: ESPN Scoreboard API
- **Frequency**: Daily during season, weekly during offseason

### 📊 Player Statistics
- **Game-by-game player stats** for recent games
- **Top performer stats** (leaders) from each game
- **Limited to recent games** due to API constraints
- **Source**: ESPN Scoreboard API (leaders only)
- **Frequency**: Daily during season, weekly during offseason

## How It Works

### 1. Season Detection
The system automatically detects NBA seasons:
- **Regular Season**: October - June
- **Offseason**: July - September, early October, late June
- **Playoffs**: April - June

### 2. Sync Strategy
- **During Season**: Aggressive syncing (daily) to catch all games and stats
- **During Offseason**: Conservative syncing (weekly) to check for any available data
- **Smart Logging**: Different log levels based on season status

### 3. Data Flow
```
ESPN Core API → Sync Services → Database → App
     ↓              ↓            ↓        ↓
  Athletes      Transform    Store    Display
  Teams         Validate     Index    Query
  Games         Clean        Cache    Analytics
  Stats         Enrich       Backup   Reports
```

## Setup Instructions

### Prerequisites
- Node.js installed
- Database running (PostgreSQL with Prisma)
- ESPN API access (public endpoints)

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

### 3. Configure Cron Jobs

#### Option A: Interactive Setup
```bash
# Run the interactive setup script
node scripts/setup-cron-jobs.sh
```

#### Option B: Manual Setup
```bash
# Open crontab editor
crontab -e

# Add these lines for different frequencies:

# Daily sync at 6 AM
0 6 * * * cd /path/to/court_vision && node src/scripts/automated-player-stats-sync.js >> logs/sync.log 2>&1

# Weekly full sync on Sundays at 2 AM
0 2 * * 0 cd /path/to/court_vision && node src/scripts/automated-player-stats-sync.js --full >> logs/sync.log 2>&1

# Hourly monitoring during season (optional)
0 * * * * cd /path/to/court_vision && node scripts/monitor-sync.js >> logs/monitor.log 2>&1
```

### 4. Create Log Directory
```bash
mkdir -p logs
```

### 5. Test the Setup
```bash
# Test the sync manually
node src/scripts/automated-player-stats-sync.js

# Check the logs
tail -f logs/sync.log
```

## API Endpoints

### Manual Sync Triggers
```bash
# Sync all data
POST /api/sync/all

# Sync specific data types
POST /api/sync/athletes
POST /api/sync/teams
POST /api/sync/games
POST /api/sync/player-stats

# Get sync status
GET /api/sync/status
```

### Data Retrieval
```bash
# Get player stats
GET /api/player-stats/game/:gameId
GET /api/player-stats/player/:playerId
GET /api/player-stats/team/:teamId

# Get sync history
GET /api/sync/history
```

## Monitoring & Maintenance

### 1. Log Monitoring
```bash
# Monitor sync logs
tail -f logs/sync.log

# Check for errors
grep "ERROR\|FAILED" logs/sync.log

# Monitor recent activity
tail -n 50 logs/sync.log
```

### 2. Database Health Checks
```bash
# Check data counts
node src/scripts/check-data-counts.js

# Verify ID consistency
node src/scripts/check-id-consistency.js

# Test API connectivity
node src/scripts/test-core-api.js
```

### 3. Performance Monitoring
```bash
# Monitor sync performance
node scripts/monitor-sync.js

# Check database performance
node src/scripts/check-db-performance.js
```

## Troubleshooting

### Common Issues

#### 1. Sync Failing
```bash
# Check logs
tail -f logs/sync.log

# Test API connectivity
curl https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes

# Verify database connection
node src/scripts/test-db-connection.js
```

#### 2. Missing Data
```bash
# Check what's missing
node src/scripts/check-missing-data.js

# Force full sync
node src/scripts/automated-player-stats-sync.js --full

# Check API limits
node src/scripts/check-api-limits.js
```

#### 3. Performance Issues
```bash
# Check database size
node src/scripts/check-db-size.js

# Optimize database
node src/scripts/optimize-db.js

# Check sync frequency
crontab -l
```

### Error Codes
- `API_TIMEOUT`: ESPN API is slow or down
- `DB_CONNECTION_ERROR`: Database connection issues
- `INVALID_DATA`: Data format issues from API
- `RATE_LIMIT`: Too many API requests
- `OFFSEASON_DETECTED`: Normal during offseason

## Configuration Options

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/court_vision"

# API Settings
ESPN_API_BASE="https://sports.core.api.espn.com/v2"
ESPN_SCOREBOARD_BASE="https://site.api.espn.com/apis/site/v2/sports/basketball/nba"

# Sync Settings
SYNC_DELAY_MS=100
SYNC_BATCH_SIZE=25
SYNC_MAX_RETRIES=3

# Logging
LOG_LEVEL="info"
LOG_FILE="logs/sync.log"
```

### Sync Parameters
```bash
# Different sync modes
node src/scripts/automated-player-stats-sync.js --full      # Full sync
node src/scripts/automated-player-stats-sync.js --recent    # Recent only
node src/scripts/automated-player-stats-sync.js --dry-run   # Test mode
```

## Data Quality

### What We Get
- ✅ Complete NBA player database
- ✅ Current team rosters
- ✅ Recent game data
- ✅ Player stats for recent games
- ✅ Rich player profiles

### Limitations
- ⚠️ Player stats only available for recent games
- ⚠️ Only "leaders" (top performers) stats available
- ⚠️ Full boxscores not publicly accessible
- ⚠️ Historical stats limited

### Data Validation
- All IDs are 7+ digit Core API IDs
- Consistent team abbreviations
- Valid player-team relationships
- Proper data types and formats

## Security & Best Practices

### API Usage
- Respect rate limits (100ms delays between requests)
- Use public endpoints only
- Handle errors gracefully
- Log all activities

### Database
- Regular backups
- Index optimization
- Connection pooling
- Transaction safety

### Monitoring
- Log rotation
- Error alerting
- Performance tracking
- Data integrity checks

## Support & Maintenance

### Regular Tasks
- **Daily**: Monitor sync logs
- **Weekly**: Check data consistency
- **Monthly**: Review performance metrics
- **Quarterly**: Update documentation

### Emergency Procedures
1. Stop cron jobs: `crontab -r`
2. Check logs for errors
3. Test manual sync
4. Restart cron jobs when fixed

### Contact
For issues or questions:
- Check logs first
- Review this documentation
- Test with manual sync
- Create issue with logs attached

---

## Quick Reference

### Commands
```bash
# Start sync
node src/scripts/automated-player-stats-sync.js

# Check status
node scripts/monitor-sync.js

# View logs
tail -f logs/sync.log

# Test API
node src/scripts/test-core-api.js
```

### Files
- `src/scripts/automated-player-stats-sync.js` - Main sync script
- `scripts/monitor-sync.js` - Monitoring script
- `scripts/setup-cron-jobs.sh` - Cron setup
- `logs/sync.log` - Sync logs

### URLs
- ESPN Core API: `https://sports.core.api.espn.com/v2`
- ESPN Scoreboard: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba`

---

*Last updated: June 2025*
*Version: 1.0* 