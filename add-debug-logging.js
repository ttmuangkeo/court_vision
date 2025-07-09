const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Add debug logging before the prisma.player.findMany call
content = content.replace(
    /(\s*)(const players = await prisma\.player\.findMany\(\{)/g,
    `$1        // Debug log for query
        console.log('DEBUG /api/players where:', JSON.stringify(where, null, 2));
        console.log('DEBUG /api/players orderBy:', JSON.stringify(orderBy, null, 2));

        $2`
);

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Added debug logging to players API');
console.log('Now when you hit the /api/players endpoint, check your server console for the debug output'); 