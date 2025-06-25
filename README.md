# Court Vision 🏀

A film-room companion for NBA superfans, analysts, and creators. Tag plays in real-time, build your personal Synergy-style database, and export ready-made content for YouTube/Twitter.

## 🛠 Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Database | PostgreSQL + Prisma | ✅ Complete |
| API Server | Express.js | ✅ Complete |
| Real-time | Socket.io | 🔄 Coming Soon |
| External Data | balldontlie API | 🔄 Coming Soon |
| Authentication | JWT | 🔄 Coming Soon |
| Frontend | React | 🔄 Coming Soon |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/ttmuangkeo/court_vision.git
cd court_vision

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Set up database
npm run db:generate
npm run db:push
npm run db:seed

# Start the API server
npm start
# or for development
npm run dev
```

## �� Project Structure