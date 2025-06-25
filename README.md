
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

## �� API Endpoints

### Health Check
- `GET /health` - Server status

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams?include=players` - Get teams with players
- `GET /api/teams/:id` - Get specific team

### Players
- `GET /api/players` - Get all players
- `GET /api/players?include=team` - Get players with team info
- `GET /api/players?team=teamId` - Filter by team
- `GET /api/players/:id` - Get specific player

### Tags
- `GET /api/tags` - Get all basketball tags
- `GET /api/tags?category=OFFENSIVE_ACTION` - Filter by category
- `GET /api/tags/:id` - Get specific tag

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Get all teams
curl http://localhost:3000/api/teams

# Get teams with players
curl http://localhost:3000/api/teams?include=players

# Get offensive tags
curl http://localhost:3000/api/tags?category=OFFENSIVE_ACTION
```

## �� Current Features

### ✅ Completed
- [x] Database schema with Prisma
- [x] Seeded NBA data (teams, players, tags)
- [x] Express API server with middleware
- [x] Teams, players, and tags endpoints
- [x] Database relationships working
- [x] Health check and API documentation

### 🔄 In Progress
- [ ] Games endpoint
- [ ] Plays endpoint for tagging
- [ ] User authentication
- [ ] Real-time Socket.io integration

### 📋 Planned
- [ ] Frontend React interface
- [ ] Live game tagging system
- [ ] Predictive tagging AI
- [ ] Export functionality
- [ ] balldontlie API integration

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

## �� Acknowledgments

- NBA and balldontlie API for data
- Prisma team for the excellent ORM
- Express.js community

---

*Building the future of basketball analysis, one tag at a time.*