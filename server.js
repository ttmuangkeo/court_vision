const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();


const teamsRouter = require('./src/api/teams');
const playersRouter = require('./src/api/players');
const tagsRouter = require('./src/api/tags');
const gamesRouter = require('./src/api/games');
const playsRouter = require('./src/api/plays');
const analyticsRouter = require('./src/api/analytics');
const patternsRouter = require('./src/api/patterns');
const authRouter = require('./src/api/auth');
const imagesRouter = require('./src/api/images');
const newsRouter = require('./src/api/news');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
   res.json({
       status: 'ok',
       message: 'Court Vision api is running',
       timestamp: new Date().toISOString()
   });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/plays', playsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/patterns', patternsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/news', newsRouter);

// API Docs
app.get('/api', (req, res) => {
   res.json({
       message: 'Court vision nba api',
       version: '1.0.0',
       endpoints: {
           auth: '/api/auth',
           teams: '/api/teams',
           players: '/api/players',
           games: '/api/games',
           tags: '/api/tags',
           plays: '/api/plays',
           analytics: '/api/analytics',
           patterns: '/api/patterns',
           images: '/api/images',
           news: '/api/news',
       }
   });
});

// Error Handling
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({
       message: 'something went wrong'
   });
});

// 404 Handler
app.use('*', (req, res) => {
   res.status(404).json({error: 'route not found'});
});

// Start Server 
app.listen(PORT, () => {
   console.log(`🏀 Court Vision API is running on port ${PORT}`);
   console.log(`health check: http://localhost:${PORT}/health`);
   console.log(`api docs: http://localhost:${PORT}/api`);
});

module.exports = app;