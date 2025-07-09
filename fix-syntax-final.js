const fs = require('fs');
const path = require('path');

const playersListFile = path.join(__dirname, 'frontend/src/components/pages/Players/PlayersList/PlayersList.js');

// Read the file
let content = fs.readFileSync(playersListFile, 'utf8');

// Fix the specific problematic line with the unterminated string
content = content.replace(
    /{player\.height \? Math\.floor\(player\.height \/ 12\) \+ "'" \+ \(player\.height % 12\) \+ """ : null && \(\s*<span style=\{\{\s*fontSize: '0\.875rem',\s*color: '#64748b',\s*fontWeight: '500'\s*\}\}>\s*\{player\.height \? Math\.floor\(player\.height \/ 12\) \+ "'" \+ \(player\.height % 12\) \+ """ : null\}/g,
    `{player.height && (
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {Math.floor(player.height / 12) + "'" + (player.height % 12) + '"'}`
);

// Write the fixed content back
fs.writeFileSync(playersListFile, content, 'utf8');

console.log('✅ Fixed the specific syntax error on line 605');
console.log('Replaced the problematic unterminated string with proper syntax'); 