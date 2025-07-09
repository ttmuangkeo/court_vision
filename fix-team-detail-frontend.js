const fs = require('fs');
const path = require('path');

const teamDetailFile = path.join(__dirname, 'frontend/src/components/pages/Teams/TeamDetail/TeamDetail.js');

// Read the file
let content = fs.readFileSync(teamDetailFile, 'utf8');

// Fix team branding - change espnId to id
content = content.replace(/team\.espnId/g, 'team.id');

// Fix player field references
content = content.replace(/player\.espnId/g, 'player.id');
content = content.replace(/player\.headshot/g, 'player.photoUrl');
content = content.replace(/player\.fullName/g, 'player.firstName + " " + player.lastName');
content = content.replace(/player\.name/g, 'player.firstName + " " + player.lastName');
content = content.replace(/player\.jerseyNumber/g, 'player.jersey');

// Fix the player name display logic
content = content.replace(
    /{(player\.fullName \|\| player\.name \|\| 'P')\.split\(' '\)\.map\(n => n\[0\]\)\.join\(''\)}/g,
    '{((player.firstName + " " + player.lastName) || "P").split(" ").map(n => n[0]).join("")}'
);

content = content.replace(
    /{player\.fullName \|\| player\.name \|\| 'Unknown Player'}/g,
    '{player.firstName + " " + player.lastName || "Unknown Player"}'
);

// Write the fixed content back
fs.writeFileSync(teamDetailFile, content, 'utf8');

console.log('✅ Fixed TeamDetail component field names');
console.log('Changes made:');
console.log('- Changed team.espnId to team.id');
console.log('- Changed player.espnId to player.id');
console.log('- Changed player.headshot to player.photoUrl');
console.log('- Changed player.fullName/name to firstName + lastName');
console.log('- Changed player.jerseyNumber to player.jersey'); 