# 🏀 Court Vision

**Real-time basketball analytics for the modern NBA fan.** 

Court Vision is a lightning-fast tagging system that lets you capture and analyze basketball plays as they happen. Whether you're watching live games, reviewing film, or creating content, Court Vision helps you track defensive strategies, offensive actions, and player performance with just a few clicks.

## 🎯 What Makes Court Vision Special

### ⚡ **Speed-First Design**
- **One-click tagging** - Tag plays in under 2 seconds
- **Quick time inputs** - Pre-set buttons for common game times
- **Smart suggestions** - AI-powered play predictions
- **Minimal cognitive load** - Designed for live game watching

### 🏆 **Built for NBA Analysis**
- **Real-time data** - Live integration with ESPN Core API
- **Complete NBA database** - 820+ players with rich profiles
- **Automated sync** - Intelligent data synchronization
- **Comprehensive tagging** - 20+ basketball action categories
- **Player tracking** - Follow individual players across games
- **Team insights** - Analyze defensive schemes and offensive patterns

### 🎬 **Perfect for Content Creators**
- **Film room companion** - Tag plays during replay analysis
- **Export capabilities** - Share insights with your audience
- **Historical tracking** - Build databases of player tendencies
- **Collaborative features** - Work with other analysts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Set up automated sync
node scripts/setup-cron-jobs.sh

# Start development server
npm run dev
```

## 🎮 How It Works

### 1. **Select a Game**
Choose from recent NBA games or upcoming matchups

### 2. **Pick Your Player**
Focus on one star player or track multiple players

### 3. **Tag Plays Fast**
- Click quick action buttons (Double Team, ISO, PnR, etc.)
- Use time presets (0:30, 1:00, 2:00, etc.)
- See recent plays update in real-time

### 4. **Analyze Patterns**
Review tagged plays to identify trends and strategies

## 🏀 Basketball Actions You Can Tag

### **Offensive Actions**
- Pick and Roll (PnR)
- Isolation (ISO) 
- Post Up
- Drive
- Pull Up Jump Shot
- Catch and Shoot
- Off-Ball Movement

### **Defensive Actions**
- Drop Coverage
- Switch
- Double Team
- Trap
- Blitz
- Zone Defense
- Help Defense

### **Special Situations**
- Transition
- Set Plays
- End of Quarter
- Crunch Time

## 📊 Data Integration

Court Vision integrates with **ESPN's Core API** to provide comprehensive NBA data:

### 🏀 **Complete NBA Database**
- **820+ Players** - Full NBA roster with rich profiles
- **30 Teams** - All NBA teams with current rosters
- **Recent Games** - Live game data and statistics
- **Player Stats** - Game-by-game performance metrics

### 🔄 **Automated Sync System**
- **Season Detection** - Automatically adjusts for regular season vs offseason
- **Daily Sync** - Keeps data fresh during the season
- **Smart Logging** - Comprehensive monitoring and error handling
- **Offseason Handling** - Continues monitoring during breaks

### Data Sources
- **ESPN Core API** (`sports.core.api.espn.com`) - Complete player and team data
- **ESPN Scoreboard API** - Recent games and player statistics
- **Automated Sync** - Background data synchronization

### Sync Commands

```bash
# Manual sync
node src/scripts/automated-player-stats-sync.js

# Check sync status
node scripts/monitor-sync.js

# View logs
tail -f logs/sync.log
```

## 🗄 Technical Architecture

### **Frontend**
- React.js with modern hooks
- Component-based architecture
- Responsive design for any screen size

### **Backend**
- Node.js with Express
- Prisma ORM for database management
- PostgreSQL for data storage
- Real-time WebSocket support

### **Data Services**
- **ESPN Integration** - Core API and Scoreboard API
- **Automated Sync** - Intelligent data synchronization
- **Error Handling** - Robust error management and logging

### **Database Schema**
- **Teams & Players** - NBA roster data (ESPN Core API)
- **Games & Plays** - Game events and tagging
- **Player Stats** - Game-by-game statistics
- **Tags & Categories** - Basketball action taxonomy
- **Users & Analytics** - User preferences and insights

## 🔧 Development

### Database Commands
```bash
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio      # Open Prisma Studio
npx prisma db seed     # Seed with sample data
```

### Sync Commands
```bash
# Full data sync
node src/scripts/automated-player-stats-sync.js

# Individual syncs
node src/scripts/sync-all-athletes.js
node src/scripts/sync-all-teams.js
node src/scripts/sync-all-games.js
node src/scripts/sync-recent-player-stats.js

# Monitoring
node scripts/monitor-sync.js
```

### API Development
```bash
npm start              # Start production server
npm run dev            # Start with nodemon
```

## 📚 Documentation

- **[Automated Sync Setup](docs/AUTOMATED_SYNC_SETUP.md)** - Complete setup guide for the automated sync system
- **[Player Stats Sync](docs/PLAYER_STATS_SYNC.md)** - Detailed documentation of the player statistics system

## 🎯 Use Cases

### **For NBA Fans**
- Track your favorite player's defensive assignments
- Analyze team defensive schemes
- Build databases of player tendencies
- Access comprehensive player profiles and statistics

### **For Content Creators**
- Create data-driven analysis videos
- Generate insights for social media
- Collaborate with other analysts
- Use rich player data for storytelling

### **For Coaches & Scouts**
- Review opponent tendencies
- Track player development
- Build scouting reports
- Access detailed player statistics

## 🤝 Contributing

We're building the future of basketball analysis! Contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tim Muangkeo** - [@ttmuangkeo](https://github.com/ttmuangkeo)

## 🎉 Acknowledgments

- **ESPN** for providing comprehensive NBA data through their Core API
- **Prisma team** for the excellent ORM
- **Express.js community** for the robust backend framework
- **React team** for the amazing frontend framework

---

*Building the future of basketball analysis, one tag at a time.* 🏀