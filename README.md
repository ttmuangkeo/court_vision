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
- **Real-time data** - Live integration with BallDontLie API
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
npm run db:generate
npm run db:push
npm run db:seed

# Sync NBA data from BallDontLie API
npm run sync:data

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

Court Vision integrates with the [BallDontLie API](https://www.balldontlie.io/) to provide:

- **Live game data** - Scores, schedules, and player stats
- **Current rosters** - All 30 NBA teams and players
- **Historical data** - Past games and performance metrics

### Sync Commands

```bash
# Sync all data (teams, players, games)
npm run sync:data

# Or run individual syncs
npm run sync:teams
npm run sync:players
npm run sync:games
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

### **Database Schema**
- **Teams & Players** - NBA roster data
- **Games & Plays** - Game events and tagging
- **Tags & Categories** - Basketball action taxonomy
- **Users & Analytics** - User preferences and insights

## 🎯 Use Cases

### **For NBA Fans**
- Track your favorite player's defensive assignments
- Analyze team defensive schemes
- Build databases of player tendencies

### **For Content Creators**
- Create data-driven analysis videos
- Generate insights for social media
- Collaborate with other analysts

### **For Coaches & Scouts**
- Review opponent tendencies
- Track player development
- Build scouting reports

## 🔧 Development

### Database Commands
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed with sample data
```

### API Development
```bash
npm start              # Start production server
npm run dev            # Start with nodemon
```

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

- [BallDontLie API](https://www.balldontlie.io/) for comprehensive NBA data
- Prisma team for the excellent ORM
- Express.js community for the robust backend framework

---

*Building the future of basketball analysis, one tag at a time.* 🏀