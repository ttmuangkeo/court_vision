const fs = require('fs');
const path = require('path');

const teamsListFile = path.join(__dirname, 'frontend/src/components/pages/Teams/TeamsList/TeamsList.js');

// Read the file
let content = fs.readFileSync(teamsListFile, 'utf8');

// Replace all espnId references with id
content = content.replace(/team\.espnId/g, 'team.id');

// Write the fixed content back
fs.writeFileSync(teamsListFile, content, 'utf8');

console.log('✅ Fixed TeamsList component to use correct field names');
console.log('Changes made:');
console.log('- Replaced team.espnId with team.id');
console.log('- Teams should now display correctly with logos and colors'); 