const fs = require('fs');
const path = require('path');

const playersApiFile = path.join(__dirname, 'src/api/players/index.js');

// Read the file
let content = fs.readFileSync(playersApiFile, 'utf8');

// Replace fullName references with firstName + lastName
// For search queries, we'll use OR with firstName and lastName
content = content.replace(/fullName: \{\s*contains: searchTerm,\s*mode: 'insensitive'\s*\}/g, 
    `OR: [
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
                }
            ]`);

content = content.replace(/fullName: \{\s*startsWith: searchTerm,\s*mode: 'insensitive'\s*\}/g, 
    `OR: [
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
            ]`);

// Replace fullName in select statements
content = content.replace(/fullName: true,/g, 'firstName: true, lastName: true,');

// Replace fullName in orderBy
content = content.replace(/orderBy: \{ fullName: order \}/g, 'orderBy: { firstName: order, lastName: order }');
content = content.replace(/orderBy = \{ fullName: order \};/g, 'orderBy = { firstName: order, lastName: order };');

// Write the fixed content back
fs.writeFileSync(playersApiFile, content, 'utf8');

console.log('✅ Fixed players API to use correct field names');
console.log('Changes made:');
console.log('- Replaced fullName with firstName + lastName');
console.log('- Updated search queries to use OR with firstName and lastName');
console.log('- Updated select statements and orderBy clauses'); 