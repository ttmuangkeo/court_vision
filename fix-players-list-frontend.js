const fs = require('fs');
const path = require('path');

const playersListFile = path.join(__dirname, 'frontend/src/components/pages/Players/PlayersList/PlayersList.js');

// Read the file
let content = fs.readFileSync(playersListFile, 'utf8');

// Fix player field references
content = content.replace(/player\.espnId/g, 'player.id');
content = content.replace(/player\.headshot/g, 'player.photoUrl');
content = content.replace(/player\.fullName/g, 'player.firstName + " " + player.lastName');
content = content.replace(/player\.name/g, 'player.firstName + " " + player.lastName');
content = content.replace(/player\.jerseyNumber/g, 'player.jersey');
content = content.replace(/player\.shortName/g, 'player.firstName + " " + player.lastName');
content = content.replace(/player\.age/g, 'player.birthDate ? Math.floor((new Date() - new Date(player.birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : null');
content = content.replace(/player\.displayHeight/g, 'player.height ? Math.floor(player.height / 12) + "\'" + (player.height % 12) + "\"" : null');
content = content.replace(/player\.displayWeight/g, 'player.weight ? player.weight + " lbs" : null');
content = content.replace(/player\.birthPlace/g, 'player.birthCity && player.birthState ? player.birthCity + ", " + player.birthState : player.birthCity || player.birthState');

// Fix the player name display logic
content = content.replace(
    /{(player\.fullName \|\| player\.name \|\| 'P')\.split\(' '\)\.map\(n => n\[0\]\)\.join\(''\)}/g,
    '{((player.firstName + " " + player.lastName) || "P").split(" ").map(n => n[0]).join("")}'
);

content = content.replace(
    /{player\.fullName \|\| player\.name \|\| 'Unknown Player'}/g,
    '{player.firstName + " " + player.lastName || "Unknown Player"}'
);

content = content.replace(
    /{player\.shortName \&\& player\.shortName !== \(player\.fullName \|\| player\.name\) \&\& \(/g,
    '{false && ('
);

// Write the fixed content back
fs.writeFileSync(playersListFile, content, 'utf8');

console.log('✅ Fixed PlayersList component field names');
console.log('Changes made:');
console.log('- Changed player.espnId to player.id');
console.log('- Changed player.headshot to player.photoUrl');
console.log('- Changed player.fullName/name to firstName + lastName');
console.log('- Changed player.jerseyNumber to player.jersey');
console.log('- Changed player.shortName to firstName + lastName');
console.log('- Added age calculation from birthDate');
console.log('- Added height/weight formatting');
console.log('- Added birthPlace formatting'); 