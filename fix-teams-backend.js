const fs = require('fs');
const path = require('path');

const teamsApiFile = path.join(__dirname, 'src/api/teams/index.js');

// Read the file
let content = fs.readFileSync(teamsApiFile, 'utf8');

// Replace the espnId reference with id
content = content.replace(/where: \{espnId: id\}/g, 'where: {id: parseInt(id)}');

// Write the fixed content back
fs.writeFileSync(teamsApiFile, content, 'utf8');

console.log('✅ Fixed teams API to use correct field names');
console.log('Changes made:');
console.log('- Replaced espnId with id in team lookup');
console.log('- Team detail pages should now work correctly'); 