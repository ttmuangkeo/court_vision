import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GameDetail from './GameDetail';

const API_BASE = 'http://localhost:3000/api';

function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/games?include=teams&limit=20`)
      .then(res => {
        setGames(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching games:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading games...</div>;

  if (selectedGameId) {
    return (
      <GameDetail
        gameId={selectedGameId}
        onBack={() => setSelectedGameId(null)}
      />
    );
  }

  return (
    <div>
      <h2>NBA Games</h2>
      <ul>
        {games.map(game => (
          <li key={game.id}>
            <button onClick={() => setSelectedGameId(game.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'blue', textDecoration: 'underline' }}>
              {game.homeTeam?.abbreviation} vs {game.awayTeam?.abbreviation}
            </button>
            {' '}on {new Date(game.date).toLocaleString()}<br />
            Status: {game.status} | Score: {game.homeScore} - {game.awayScore}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GamesList;