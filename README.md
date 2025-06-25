# Court Vision 🏀

A film-room companion for NBA superfans, analysts, and creators. Tag plays in real-time, build your personal Synergy-style database, and export ready-made content for YouTube/Twitter.

##  Features

- **Real-time NBA Statistics**: Live game data and player stats
- **Player Analytics**: Advanced metrics and performance analysis
- **Game Insights**: Historical data and predictive analytics
- **User Authentication**: Secure user accounts and preferences
- **API Integration**: RESTful API for data access

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Database | PostgreSQL (self-hosted) | Full SQL control, analytics, Timescale/pgvector ready |
| API | Express + Prisma | Familiar JS, schema-driven, easy migrations |
| Real-time | Socket.io | Push new plays/tags instantly to all viewers |
| External Data | balldontlie/BallIsLife API | Pull teams, players & daily schedule |
| Auth | JWT (passport-jwt) | Simple to start, upgrade to Clerk later |
| Frontend | React (placeholder) | Game clock, tag buttons, real-time play lists |
| Deployment | Docker-compose → Fly.io/Render | One command to spin DB + API |

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager
- Docker (optional, for easy setup)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ttmuangkeo/court_vision.git
cd court_vision
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/court_vision"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

### 4. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run seed data
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure 