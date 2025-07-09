const fs = require('fs');
const path = require('path');

const gamesApiPath = 'src/api/games/index.js';

// Read the current file
let content = fs.readFileSync(gamesApiPath, 'utf8');

// Fix 1: Change espnId to id in the game detail endpoint
content = content.replace(
    /\/\/ GET \/api\/games\/:espnId - Get game by ESPN ID\nrouter\.get\('\/:espnId', async \(req, res\) => \{[\s\S]*?const \{espnId\} = req\.params;[\s\S]*?const game = await prisma\.game\.findUnique\(\{[\s\S]*?where: \{espnId\},/g,
    `// GET /api/games/:id - Get game by ID
router.get('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {include} = req.query;

        const game = await prisma.game.findUnique({
            where: {id: parseInt(id)},`
);

// Fix 2: Change date to dateTime in the live games endpoint
content = content.replace(
    /orderBy: \{date: 'desc'\}/g,
    "orderBy: {dateTime: 'desc'}"
);

// Fix 3: Change date to dateTime in the today's games endpoint
content = content.replace(
    /where: \{\s+date: \{[\s\S]*?\}\s+\},[\s\S]*?orderBy: \{date: 'asc'\}/g,
    `where: {
                dateTime: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true
            },
            orderBy: {dateTime: 'asc'}`
);

// Write the fixed content back
fs.writeFileSync(gamesApiPath, content);

console.log('✅ Fixed games API issues:');
console.log('  - Changed espnId to id in game detail endpoint');
console.log('  - Changed date to dateTime in live games endpoint');
console.log('  - Changed date to dateTime in today\'s games endpoint'); 