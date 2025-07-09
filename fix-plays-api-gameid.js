const fs = require('fs');
const path = require('path');

const playsApiPath = 'src/api/plays/index.js';

// Read the current file
let content = fs.readFileSync(playsApiPath, 'utf8');

// Fix the gameId type issue in the play creation
content = content.replace(
    /gameId,/g,
    'gameId: parseInt(gameId),'
);

// Write the fixed content back
fs.writeFileSync(playsApiPath, content);

console.log('✅ Fixed plays API gameId type issue:');
console.log('  - Changed gameId to parseInt(gameId) in play creation'); 