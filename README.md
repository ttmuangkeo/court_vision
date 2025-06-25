# Court Vision 🏀

A comprehensive NBA analytics and insights application providing real-time statistics, player analysis, and game insights.

##  Features

- **Real-time NBA Statistics**: Live game data and player stats
- **Player Analytics**: Advanced metrics and performance analysis
- **Game Insights**: Historical data and predictive analytics
- **User Authentication**: Secure user accounts and preferences
- **API Integration**: RESTful API for data access

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL (self-hosted) |
| ORM | Prisma |
| API Server | Express.js |
| Authentication | Clerk/Auth.js |
| Hosting | Render/Fly.io/Railway |

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

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