const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Fix the team_ids parsing to convert strings to integers
content = content.replace(
    /if\(team_ids\) \{\s*const teamIdArray = team_ids\.split\('\),'\);\s*where\.teamId = \{ in: teamIdArray \};\s*\}/g,
    `if(team_ids) {
            const teamIdArray = team_ids.split(',').map(id => parseInt(id.trim()));
            where.teamId = { in: teamIdArray };
        }`
);

// Fix the single team parameter to also convert to integer
content = content.replace(
    /if\(team\) where\.teamId = team;/g,
    'if(team) where.teamId = parseInt(team);'
);

// Fix any remaining fullName references in orderBy
content = content.replace(
    /orderBy: \{ fullName: "asc" \}/g,
    'orderBy: { firstName: "asc", lastName: "asc" }'
);

content = content.replace(
    /orderBy: \{ fullName: order \}/g,
    'orderBy: { firstName: order, lastName: order }'
);

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Fixed players API final issues');
console.log('Changes made:');
console.log('- Convert team_ids strings to integers');
console.log('- Convert single team parameter to integer');
console.log('- Fixed remaining fullName references in orderBy'); 