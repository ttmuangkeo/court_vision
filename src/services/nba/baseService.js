const axios = require('axios');

const apiClient = axios.create({
    baseURL: 'https://api.balldontlie.io/v1',
    headers: {
        Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`
    }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const filterCurrentNBATeams = (teams) => {
    return teams.filter(team => {
        team.conference === 'East' || team.conference === 'West'
    })
}

const filterCurrentNBAPlayers = (players) => {
    return players.filter(player => 
        player.team && (player.team.conference === 'East' || player.team.conference === 'West')
    );
}

module.exports = {
    apiClient,
    delay,
    filterCurrentNBATeams,
    filterCurrentNBAPlayers
}