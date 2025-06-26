import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function PlayersList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/players?include=team`)
      .then(res => {
        setPlayers(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching players:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading players...</div>;

  return (
    <div>
      <h2>NBA Players</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>
            <strong>{player.name}</strong> ({player.position}) - {player.team?.abbreviation}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayersList;