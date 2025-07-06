# Play-by-Play Sync Quick Reference

## Quick Commands

### 🔄 Sync Recent Games (Current Season)
```bash
node src/scripts/automated-play-sync.js
```

### 📊 Sync All Games for Current Season
```bash
node src/scripts/automated-play-sync.js season
```

### 🔁 Start Continuous Sync
```bash
node src/scripts/automated-play-sync.js loop
```

### 📈 Generate Report
```bash
node src/scripts/automated-play-sync.js report
```

### 🗂️ Archive Old Seasons
```bash
node src/scripts/play-partitioning.js archive --seasons=2020,2021
```

### ⚡ Optimize Database
```bash
node src/scripts/play-partitioning.js optimize
```

## Manual Sync Options

### Sync Specific Games
```bash
# Single game
node src/scripts/sync-sportsdata-play-by-play.js --game-ids=20991

# Multiple games
node src/scripts/sync-sportsdata-play-by-play.js --game-ids=20991,20992,20993

# Dry run (preview)
node src/scripts/sync-sportsdata-play-by-play.js --game-ids=20991 --dry-run
```

### Sync by Season
```bash
# All games for specific season
node src/scripts/sync-sportsdata-play-by-play.js --season=2025

# Custom batch size
node src/scripts/sync-sportsdata-play-by-play.js --season=2025 --batch-size=5
```

## Automation Options

### Continuous Loop
```bash
# Default (30 min intervals)
node src/scripts/automated-play-sync.js loop

# Custom interval (10 minutes)
node src/scripts/automated-play-sync.js loop --interval=600000

# Limit games per run
node src/scripts/automated-play-sync.js loop --max-games=5

# Disable archiving
node src/scripts/automated-play-sync.js loop --no-partitioning
```

## Cron Job Examples

```bash
# Sync every 30 minutes
*/30 * * * * cd /path/to/court_vision && node src/scripts/automated-play-sync.js once

# Full season sync every Sunday at 2 AM
0 2 * * 0 cd /path/to/court_vision && node src/scripts/automated-play-sync.js season

# Database optimization every Saturday at 3 AM
0 3 * * 6 cd /path/to/court_vision && node src/scripts/play-partitioning.js optimize
```

## Troubleshooting

### Common Issues

| Issue | Command to Fix |
|-------|----------------|
| API key missing | `echo "SPORTSDATA_API_KEY=your_key" >> .env` |
| Database schema outdated | `npx prisma migrate dev` |
| Demo user missing | `node seed-demo-user.js` |
| Games not found | `node src/scripts/sync-sportsdata-games.js` |
| Rate limit errors | Wait 1 minute, then retry |

### Check Status

```bash
# View play counts by season
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

# Check sync logs
tail -f sync.log
```

## Season Detection

The system automatically detects the current NBA season:
- **January-September**: Current year (e.g., 2025)
- **October-December**: Next year (e.g., 2026)

**No manual season entry needed!**

## Data Stats

- **Plays per game**: ~400-500
- **Games per season**: ~1,230
- **Plays per season**: ~500K-600K
- **Storage per season**: ~50-100 MB

## Performance Tips

1. **Use dry runs** before large syncs
2. **Archive old seasons** to improve performance
3. **Monitor logs** for errors
4. **Use appropriate batch sizes** for your system
5. **Schedule syncs** during off-peak hours

## Emergency Commands

```bash
# Stop all sync processes
pkill -f automated-play-sync

# Reset database (DANGER!)
npx prisma migrate reset

# Check API connectivity
curl "https://api.sportsdata.io/v3/nba/pbp/json/PlayByPlay/20991?key=$SPORTSDATA_API_KEY"
``` 