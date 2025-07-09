const fs = require('fs');
const path = require('path');

const playsApiPath = 'src/api/plays/index.js';

// Read the current file
let content = fs.readFileSync(playsApiPath, 'utf8');

// Fix the destructuring syntax error in the GET route
content = content.replace(
    /const \{ gameId: parseInt\(gameId\), playerId, tagId, teamId, include, limit = 20, page = 1 \} = req\.query;/g,
    `const { gameId, playerId, tagId, teamId, include, limit = 20, page = 1 } = req.query;
    const parsedGameId = gameId ? parseInt(gameId) : undefined;`
);

// Fix the destructuring syntax error in the POST route
content = content.replace(
    /const \{\s+gameId: parseInt\(gameId\),/g,
    `const {
      gameId,`
);

// Update the where clause to use parsedGameId
content = content.replace(
    /if \(gameId\) where\.gameId = gameId;/g,
    'if (parsedGameId) where.gameId = parsedGameId;'
);

// Write the fixed content back
fs.writeFileSync(playsApiPath, content);

console.log('✅ Fixed plays API syntax errors:');
console.log('  - Fixed destructuring assignment syntax');
console.log('  - Added proper gameId parsing'); 