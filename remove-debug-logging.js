const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Remove debug logging
content = content.replace(/\/\/ Debug logging[\s\S]*?console\.log\('DEBUG \/api\/players where:', JSON\.stringify\(where, null, 2\)\);\s*console\.log\('DEBUG \/api\/players orderBy:', JSON\.stringify\(orderBy, null, 2\)\);\s*/g, '');

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Removed debug logging from players API');
console.log('The API is now clean and production-ready'); 