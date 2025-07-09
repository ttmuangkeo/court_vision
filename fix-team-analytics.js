const fs = require('fs');
const path = require('path');

// Fix teamAnalytics.js
const teamAnalyticsPath = 'src/services/analytics/teamAnalytics.js';
let content = fs.readFileSync(teamAnalyticsPath, 'utf8');

// Fix espnId references to use id instead
content = content.replace(
    /espnId: true,/g,
    'id: true,'
);

content = content.replace(
    /where: \{\s+espnId: "(\d+)",/g,
    'where: {\n              id: parseInt("$1"),'
);

// Write the fixed content back
fs.writeFileSync(teamAnalyticsPath, content);

// Fix teams API
const teamsApiPath = 'src/api/teams/index.js';
let teamsContent = fs.readFileSync(teamsApiPath, 'utf8');

// Fix teamId to be parsed as integer
teamsContent = teamsContent.replace(
    /teamId: id,/g,
    'teamId: parseInt(id),'
);

// Write the fixed content back
fs.writeFileSync(teamsApiPath, teamsContent);

console.log('✅ Fixed team analytics and statistics issues:');
console.log('  - Changed espnId to id in team analytics service');
console.log('  - Fixed teamId parsing in teams API');
console.log('  - Updated conference rivals query to use id instead of espnId'); 