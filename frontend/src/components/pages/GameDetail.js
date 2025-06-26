import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function GameDetail({ gameId, onBack }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [description, setDescription] = useState('');
  const [quarter, setQuarter] = useState(1);
  const [tagId, setTagId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [gameTime, setGameTime] = useState('');

  // Fetch game details
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/games/${gameId}?include=full`)
      .then(res => {
        setGame(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching game:', err);
        setLoading(false);
      });
  }, [gameId]);

  // Fetch tags, players, teams for the form
  useEffect(() => {
    axios.get(`${API_BASE}/tags`).then(res => setTags(res.data.data));
    axios.get(`${API_BASE}/players`).then(res => setPlayers(res.data.data));
    axios.get(`${API_BASE}/teams`).then(res => setTeams(res.data.data));
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // For demo, use the first user in your DB as createdById
    // In production, use the logged-in user's ID
    const createdById = 'cmcbiuq8z000kpqkgzdegexx6'; // Replace with a real user ID

    try {
      await axios.post(`${API_BASE}/plays`, {
        gameId,
        description,
        quarter: Number(quarter),
        gameTime,
        createdById,
        tags: [
          {
            tagId,
            playerId,
            teamId,
            context: { result: "custom" }
          }
        ]
      });
      // Refresh game details to show the new play
      const res = await axios.get(`${API_BASE}/games/${gameId}?include=full`);
      setGame(res.data.data);
      // Reset form
      setDescription('');
      setQuarter(1);
      setTagId('');
      setPlayerId('');
      setTeamId('');
      setGameTime('');
    } catch (err) {
      alert('Error tagging play: ' + (err.response?.data?.error || err.message));
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading game details...</div>;
  if (!game) return <div>Game not found.</div>;

  return (
    <div>
      <button onClick={onBack}>← Back to Games</button>
      <h2>
        {game.homeTeam?.name} vs {game.awayTeam?.name}
      </h2>
      <p>
        <strong>Date:</strong> {new Date(game.date).toLocaleString()}<br />
        <strong>Status:</strong> {game.status}<br />
        <strong>Score:</strong> {game.homeTeam?.abbreviation} {game.homeScore} - {game.awayTeam?.abbreviation} {game.awayScore}
      </p>

      <h3>Tag a New Play</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <label>
          Description:
          <input value={description} onChange={e => setDescription(e.target.value)} required />
        </label>
        <br />
        <label>
          Quarter:
          <select value={quarter} onChange={e => setQuarter(e.target.value)}>
            {[1,2,3,4].map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </label>
        <br />
        <label>
          Game Time (e.g., 11:45 Q2):
          <input
            value={gameTime}
            onChange={e => setGameTime(e.target.value)}
            required
            placeholder="e.g., 11:45 Q2"
          />
        </label>
        <br />
        <label>
          Tag:
          <select value={tagId} onChange={e => setTagId(e.target.value)} required>
            <option value="">Select tag</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Player:
          <select value={playerId} onChange={e => setPlayerId(e.target.value)} required>
            <option value="">Select player</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Team:
          <select value={teamId} onChange={e => setTeamId(e.target.value)} required>
            <option value="">Select team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.abbreviation}</option>
            ))}
          </select>
        </label>
        <br />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Tagging...' : 'Tag Play'}
        </button>
      </form>

      <h3>Plays</h3>
      {game.plays && game.plays.length > 0 ? (
        <ul>
          {game.plays.map(play => (
            <li key={play.id}>
              <strong>Q{play.quarter}:</strong> {play.description || 'No description'}
              {play.tags && play.tags.length > 0 && (
                <ul>
                  {play.tags.map(tag => (
                    <li key={tag.id}>
                      <span>{tag.tag?.name}</span>
                      {tag.player && <> ({tag.player.name})</>}
                      {tag.team && <> [{tag.team.abbreviation}]</>}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No plays tagged for this game yet.</p>
      )}
    </div>
  );
}

export default GameDetail;
