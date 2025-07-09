const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Fix team_ids parsing - convert strings to integers
content = content.replace(
    /if\(team_ids\) \{\s*const teamIdArray = team_ids\.split\('\),'\);\s*where\.teamId = \{ in: teamIdArray \};\s*\}/g,
    `if(team_ids) {
            const teamIdArray = team_ids.split(',').map(id => parseInt(id.trim()));
            where.teamId = { in: teamIdArray };
        }`
);

// Fix the search query structure - remove nested OR and fullName references
content = content.replace(
    /where\.OR = \[\s*\{\s*fullName: \{\s*contains: searchTerm,\s*mode: 'insensitive'\s*\}\s*\},\s*\{\s*OR: \[\s*\{\s*firstName: \{\s*startsWith: searchTerm,\s*mode: 'insensitive'\s*\}\s*\},\s*\{\s*lastName: \{\s*startsWith: searchTerm,\s*mode: 'insensitive'\s*\}\s*\}\s*\]\s*\},\s*\{\s*firstName: \{\s*contains: searchTerm,\s*mode: 'insensitive'\s*\}\s*\},\s*\{\s*lastName: \{\s*contains: searchTerm,\s*mode: 'insensitive'\s*\}\s*\}\s*\];/g,
    `where.OR = [
                {
                    firstName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    firstName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    lastName: {
                        startsWith: searchTerm,
                        mode: 'insensitive'
                    }
                }
            ];`
);

// Fix the orderBy clause
content = content.replace(
    /orderBy = \{\s*fullName: order\s*\};/g,
    'orderBy = { firstName: order, lastName: order };'
);

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Fixed players API with clean approach');
console.log('Changes made:');
console.log('- Fixed team_ids parsing to convert strings to integers');
console.log('- Cleaned up search query structure');
console.log('- Fixed orderBy clause'); 