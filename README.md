# 🏀 Court Vision

Film-room companion for NBA superfans, analysts, and creators. Real-time basketball analytics and tagging system.

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

## 📊 BallDontLie API Integration

Court Vision integrates with the [BallDontLie API](https://www.balldontlie.io/) to populate your database with current NBA data.

### Sync Commands

```bash
# Sync all data (teams, players, games)
npm run sync:data

# Or run individual syncs via API
curl -X POST http://localhost:3000/api/teams/sync \
  -H "Content-Type: application/json" \
  -d '{"season": "2023-24"}'
```

### What Gets Synced

- **Teams**: All 30 NBA teams with conference/division info
- **Players**: Current roster players with stats and team relationships  
- **Games**: Game schedule, scores, and live status
- **Tags**: Basketball action categories (seeded manually)

### Rate Limiting

The sync process includes built-in rate limiting to be respectful to the BallDontLie API:
- 100ms delay between individual records
- 1 second delay between major operations (teams → players → games)

## 🗄 Database Schema

### Core NBA Data
- **Teams**: All NBA teams with conference/division info
- **Players**: NBA players with team relationships
- **Games**: Game schedule and live data
- **Tags**: Basketball action categories (PnR, ISO, Drop, etc.)

### App Features
- **Plays**: Individual play events for tagging
- **PlayTags**: User tagging relationships
- **Users**: User accounts and preferences
- **Predictions**: AI prediction system
- **GlossaryEntries**: Basketball education system

## 🎓 Basketball Tags

The system includes comprehensive basketball action categories:

### Offensive Actions
- Pick and Roll, Isolation, Post Up, Drive, Pull Up Jump Shot

### Defensive Actions  
- Drop Coverage, Switch, Double Team, Trap

### Categories
- OFFENSIVE_ACTION, DEFENSIVE_ACTION, TRANSITION, SET_PLAY, SPECIAL_SITUATION

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

- NBA and balldontlie API for data
- Prisma team for the excellent ORM
- Express.js community

---

*Building the future of basketball analysis, one tag at a time.*