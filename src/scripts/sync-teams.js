const {syncTeamsFromAPI} = require('../services/nba/teamsService');

async function main() {
    try {
        console.log('teams sync only');
        await syncTeamsFromAPI();
        console.log('teams sync completed successfully');
        process.exit(0);
    }
    catch(error) {
        console.error('teams sync failed', error.message);
        process.exit(1);
    }
}

main();