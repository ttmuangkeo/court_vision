const fs = require('fs');
const path = require('path');

const authFile = path.join(__dirname, 'src/api/auth/index.js');
let content = fs.readFileSync(authFile, 'utf8');

// Fix the incorrect import path
content = content.replace(
    "const prisma = require('../../../src/db/client');",
    "const prisma = require('../../db/client');"
);

fs.writeFileSync(authFile, content);
console.log('Fixed Prisma import path in auth file'); 