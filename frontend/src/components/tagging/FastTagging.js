import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameHeader from './GameHeader';
import PlayerSelector from './PlayerSelector';
import GameTimeInput from './GameTimeInput';
import QuickActions from './QuickActions';
import RecentPlays from './RecentPlays';
import { quickActions } from './quickActionsConfig';

const API_BASE = 'http://localhost:3000/api';

function FastTagging({ gameId, onBack }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [gameTime, setGameTime] = useState('');
  const [recentPlays, setRecentPlays] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    // Fetch game details and plays
    setLoading(true);
    axios.get(`${API_BASE}/games/${gameId}?include=full`)
      .then(res => {
        setGame(res.data.data);
        const plays = res.data.data.plays || [];
        setRecentPlays(plays.slice(-5)); // Show last 5 plays
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching game:', err);
        setLoading(false);
      });
  }, [gameId]);

  // Fetch tags (only once)
  useEffect(() => {
    axios.get(`${API_BASE}/tags`).then(res => setTags(res.data.data));
  }, []);

  // Fetch players when game data is available
  useEffect(() => {
    if (game && game.homeTeamId && game.awayTeamId) {
      const teamIds = [game.homeTeamId, game.awayTeamId];
      axios.get(`${API_BASE}/players?team_ids=${teamIds.join(',')}`)
        .then(res => setPlayers(res.data.data))
        .catch(err => {
          console.error('Error fetching players:', err);
          setPlayers([]); // Set empty array on error
        });
    }
  }, [game]);

  const handleQuickTag = async (actionName) => {
    if (!selectedPlayer) {
      alert('Please select a player first');
      return;
    }

    if (!gameTime) {
      alert('Please enter game time');
      return;
    }

    try {
      // Find the tag by name
      const tag = tags.find(t => t.name === actionName);
      if (!tag) {
        console.warn(`Tag "${actionName}" not found in database`);
        return;
      }

      // For demo, use a hardcoded user ID - replace with actual user ID in production
      const createdById = 'cmccsd5oj00001xhj6xnvor24';

      await axios.post(`${API_BASE}/plays`, {
        gameId,
        description: `${actionName} by ${selectedPlayer.name}`,
        quarter: currentQuarter,
        gameTime,
        createdById,
        tags: [
          {
            tagId: tag.id,
            playerId: selectedPlayer.id,
            teamId: selectedPlayer.teamId,
            context: { action: actionName }
          }
        ]
      });

      // Update recent plays
      const res = await axios.get(`${API_BASE}/games/${gameId}?include=full`);
      const plays = res.data.data.plays || [];
      setRecentPlays(plays.slice(-5));

      // Clear game time for next tag
      setGameTime('');
      
      console.log(`✅ Tagged: ${actionName} for ${selectedPlayer.name}`);
    } catch (err) {
      console.error('Error tagging play:', err);
      alert('Error tagging play: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
  };

  if (loading) return <div>Loading game...</div>;
  if (!game) return <div>Game not found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <GameHeader 
        game={game} 
        onBack={onBack} 
        currentQuarter={currentQuarter} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px' }}>
        <PlayerSelector
          game={game}
          players={players}
          selectedPlayer={selectedPlayer}
          selectedTeam={selectedTeam}
          onPlayerSelect={handlePlayerSelect}
          onTeamSelect={handleTeamSelect}
        />

        <div>
          <GameTimeInput
            gameTime={gameTime}
            setGameTime={setGameTime}
            currentQuarter={currentQuarter}
            setCurrentQuarter={setCurrentQuarter}
          />

          <QuickActions
            quickActions={quickActions}
            onQuickTag={handleQuickTag}
            selectedPlayer={selectedPlayer}
            gameTime={gameTime}
          />
        </div>

        <RecentPlays recentPlays={recentPlays} />
      </div>
    </div>
  );
}

export default FastTagging; 