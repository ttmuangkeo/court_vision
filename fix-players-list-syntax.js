const fs = require('fs');
const path = require('path');

const playersListFile = path.join(__dirname, 'frontend/src/components/pages/Players/PlayersList/PlayersList.js');

// Read the file
let content = fs.readFileSync(playersListFile, 'utf8');

// Fix the unterminated string constants and logical operator issues
content = content.replace(
    /{player\.height \? Math\.floor\(player\.height \/ 12\) \+ "'" \+ \(player\.height % 12\) \+ """ : null && \(/g,
    '{player.height ? Math.floor(player.height / 12) + "\'" + (player.height % 12) + "\"" : null && ('
);

content = content.replace(
    /{player\.height \? Math\.floor\(player\.height \/ 12\) \+ "'" \+ \(player\.height % 12\) \+ """ : null}/g,
    '{player.height ? Math.floor(player.height / 12) + "\'" + (player.height % 12) + "\"" : null}'
);

content = content.replace(
    /{player\.weight \? player\.weight \+ " lbs" : null && \(/g,
    '{player.weight && ('
);

content = content.replace(
    /{player\.weight \? player\.weight \+ " lbs" : null}/g,
    '{player.weight + " lbs"}'
);

content = content.replace(
    /{player\.birthCity && player\.birthState \? player\.birthCity \+ ", " \+ player\.birthState : player\.birthCity \|\| player\.birthState && \(/g,
    '{(player.birthCity && player.birthState) && ('
);

content = content.replace(
    /• {player\.birthCity && player\.birthState \? player\.birthCity \+ ", " \+ player\.birthState : player\.birthCity \|\| player\.birthState}/g,
    '• {player.birthCity && player.birthState ? player.birthCity + ", " + player.birthState : player.birthCity || player.birthState}'
);

// Write the fixed content back
fs.writeFileSync(playersListFile, content, 'utf8');

console.log('✅ Fixed syntax errors in PlayersList component');
console.log('Changes made:');
console.log('- Fixed unterminated string constants');
console.log('- Fixed logical operator issues');
console.log('- Corrected conditional rendering syntax'); 