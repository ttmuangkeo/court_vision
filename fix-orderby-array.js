const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Fix the orderBy to use array format instead of object
content = content.replace(
    /orderBy = \{\s*firstName: order,\s*lastName: order\s*\};/g,
    'orderBy = [{ firstName: order }, { lastName: order }];'
);

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Fixed orderBy to use array format');
console.log('Changed from: { firstName: order, lastName: order }');
console.log('Changed to: [{ firstName: order }, { lastName: order }]'); 