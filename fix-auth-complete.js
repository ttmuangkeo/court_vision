const fs = require('fs');
const path = require('path');

const authFile = path.join(__dirname, 'src/api/auth/index.js');

// Read the file
let content = fs.readFileSync(authFile, 'utf8');

// Fix all the field name issues
// 1. Replace fullName with firstName + lastName (we'll handle this in frontend)
// 2. Replace headshot with photoUrl
// 3. Remove duplicate team fields
// 4. Remove abbreviation field that doesn't exist

// Fix favoritePlayers selects
const favoritePlayersSelect = `favoritePlayers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                        photoUrl: true,
                        teamId: true,
                        team: {
                            select: {
                                key: true,
                                city: true,
                                name: true
                            }
                        }
                    }
                }`;

// Replace all instances of the problematic favoritePlayers select
const patterns = [
    // Pattern 1: with fullName and headshot
    /favoritePlayers: \{\s*select: \{\s*id: true,\s*firstName: true,\s*lastName: true,\s*fullName: true,\s*position: true,\s*headshot: true,\s*teamId: true,\s*team: \{\s*select: \{\s*key: true,\s*city: true,\s*name: true\s*\}\s*\},\s*team: \{\s*select: \{\s*abbreviation: true\s*\}\s*\}\s*\}\s*\}/g,
    
    // Pattern 2: with fullName and headshot (different spacing)
    /favoritePlayers: \{\s*select: \{\s*id: true,\s*firstName: true,\s*lastName: true,\s*fullName: true,\s*position: true,\s*headshot: true,\s*teamId: true,\s*team: \{\s*select: \{\s*key: true,\s*city: true,\s*name: true\s*\}\s*\},\s*team: \{\s*select: \{\s*abbreviation: true\s*\}\s*\}\s*\}\s*\}/g
];

patterns.forEach(pattern => {
    content = content.replace(pattern, favoritePlayersSelect);
});

// Also fix any remaining individual field references
content = content.replace(/fullName: true,/g, '');
content = content.replace(/headshot: true,/g, 'photoUrl: true,');
content = content.replace(/abbreviation: true,/g, '');

// Remove duplicate team fields in favoritePlayers
const duplicateTeamPattern = /,\s*team: \{\s*select: \{\s*abbreviation: true\s*\}\s*\}\s*\}/g;
content = content.replace(duplicateTeamPattern, '');

// Fix the login function favoriteTeams and favoritePlayers select
content = content.replace(
    /favoriteTeams: \{\s*select: \{\s*id: true,\s*key: true,\s*name: true,\s*abbreviation: true,\s*logoUrl: true\s*\}\s*\},/g,
    `favoriteTeams: {
                    select: {
                        id: true,
                        key: true,
                        name: true,
                        city: true,
                        wikipediaLogoUrl: true
                    }
                },`
);

// Fix the /me endpoint
content = content.replace(
    /favoriteTeams: \{\s*select: \{\s*id: true,\s*key: true,\s*name: true,\s*abbreviation: true,\s*logoUrl: true\s*\}\s*\},/g,
    `favoriteTeams: {
                    select: {
                        id: true,
                        key: true,
                        name: true,
                        city: true,
                        wikipediaLogoUrl: true
                    }
                },`
);

// Fix the profile endpoint
content = content.replace(
    /include: \{\s*favoriteTeams: \{\s*select: \{\s*id: true,\s*key: true,\s*name: true,\s*abbreviation: true,\s*logoUrl: true,\s*primaryColor: true,\s*alternateColor: true\s*\}\s*\},/g,
    `include: {
                favoriteTeams: {
                    select: {
                        id: true,
                        key: true,
                        name: true,
                        city: true,
                        wikipediaLogoUrl: true,
                        primaryColor: true,
                        secondaryColor: true
                    }
                },`
);

// Fix the favorite teams and players mapping
content = content.replace(/set: favoriteTeams\.map\(teamId => \(\{ id: teamId \}\)\)/g, 'set: favoriteTeams.map(teamId => ({ id: parseInt(teamId) }))');
content = content.replace(/set: favoritePlayers\.map\(playerId => \(\{ id: playerId \}\)\)/g, 'set: favoritePlayers.map(playerId => ({ id: parseInt(playerId) }))');

// Write the fixed content back
fs.writeFileSync(authFile, content, 'utf8');

console.log('✅ Fixed auth file field name issues');
console.log('Changes made:');
console.log('- Removed fullName field (does not exist in Player model)');
console.log('- Changed headshot to photoUrl');
console.log('- Removed duplicate team fields');
console.log('- Removed abbreviation field (does not exist in Team model)'); 