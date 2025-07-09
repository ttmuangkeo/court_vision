const fs = require('fs');
const path = require('path');

// Function to recursively find all JS files
function findJsFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...findJsFiles(fullPath));
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Get all JS files in frontend/src
const frontendDir = path.join(__dirname, 'frontend/src');
const jsFiles = findJsFiles(frontendDir);

console.log(`Found ${jsFiles.length} JS files to process`);

let totalChanges = 0;

for (const filePath of jsFiles) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let fileChanges = 0;
        
        // Fix team espnId references
        content = content.replace(/team\.espnId/g, 'team.id');
        content = content.replace(/teamEspnId/g, 'teamId');
        
        // Fix player espnId references
        content = content.replace(/player\.espnId/g, 'player.id');
        content = content.replace(/playerEspnId/g, 'playerId');
        
        // Fix game espnId references
        content = content.replace(/game\.espnId/g, 'game.id');
        content = content.replace(/gameEspnId/g, 'gameId');
        
        // Fix specific field references
        content = content.replace(/player\.headshot/g, 'player.photoUrl');
        content = content.replace(/player\.fullName/g, 'player.firstName + " " + player.lastName');
        content = content.replace(/player\.name/g, 'player.firstName + " " + player.lastName');
        content = content.replace(/player\.jerseyNumber/g, 'player.jersey');
        content = content.replace(/player\.shortName/g, 'player.firstName + " " + player.lastName');
        
        // Fix team abbreviation references
        content = content.replace(/team\.abbreviation/g, 'team.key');
        
        // Count changes
        const originalContent = fs.readFileSync(filePath, 'utf8');
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            fileChanges = 1;
            totalChanges++;
            console.log(`✅ Fixed: ${path.relative(frontendDir, filePath)}`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

console.log(`\n🎉 Completed! Fixed ${totalChanges} files`);
console.log('Changes made:');
console.log('- Changed team.espnId to team.id');
console.log('- Changed player.espnId to player.id');
console.log('- Changed game.espnId to game.id');
console.log('- Changed player.headshot to player.photoUrl');
console.log('- Changed player.fullName/name to firstName + lastName');
console.log('- Changed player.jerseyNumber to player.jersey');
console.log('- Changed team.abbreviation to team.key'); 