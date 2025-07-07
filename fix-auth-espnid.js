const fs = require('fs');
const path = require('path');

const authFile = path.join(__dirname, 'src/api/auth/index.js');
let content = fs.readFileSync(authFile, 'utf8');

// Replace espnId with id for teams
content = content.replace(/espnId: true/g, 'id: true');
content = content.replace(/espnId: true/g, 'key: true');

// Replace teamEspnId with teamId for players
content = content.replace(/teamEspnId: true/g, 'teamId: true');

// Replace espnId in favoriteTeams mapping
content = content.replace(/espnId: teamId/g, 'id: teamId');

// Replace espnId in favoritePlayers mapping
content = content.replace(/espnId: playerId/g, 'id: playerId');

// Add the missing key field for teams and other necessary fields
content = content.replace(
    /favoriteTeams: \{\s*select: \{\s*id: true,/g,
    `favoriteTeams: {
                    select: {
                        id: true,
                        key: true,`
);

content = content.replace(
    /favoritePlayers: \{\s*select: \{\s*id: true,/g,
    `favoritePlayers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,`
);

// Add team relation for players
content = content.replace(
    /teamId: true,/g,
    `teamId: true,
                        team: {
                            select: {
                                key: true,
                                city: true,
                                name: true
                            }
                        },`
);

fs.writeFileSync(authFile, content);
console.log('Fixed all espnId references in auth file'); 