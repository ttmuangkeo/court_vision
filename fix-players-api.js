const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Replace all teamEspnId references with teamId
content = content.replace(/teamEspnId/g, 'teamId');

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Fixed players API to use correct field names');
console.log('Changes made:');
console.log('- Replaced teamEspnId with teamId');
console.log('- Players should now be properly associated with teams'); 