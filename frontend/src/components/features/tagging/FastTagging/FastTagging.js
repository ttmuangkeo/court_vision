import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GameHeader from '../GameHeader';
import PlayerSelector from '../PlayerSelector';
import GameTimeInput from '../GameTimeInput';
import QuickActions from '../QuickActions';
import PredictionPanel from '../PredictionPanel';
import DecisionQualityPanel from '../DecisionQualityPanel';
import './FastTagging.css';

const API_BASE = 'http://localhost:3000/api';

function useWindowWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

function FastTagging() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [gameTime, setGameTime] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPlayTags, setCurrentPlayTags] = useState([]); // Track multiple tags for current play
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger for refreshing panels

  const width = useWindowWidth();
  const isVeryNarrow = width < 900;

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/games/${gameId}?include=teams`)
      .then(res => {
        setGame(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching game:', err);
        setLoading(false);
      });
  }, [gameId]);

  useEffect(() => {
    axios.get(`${API_BASE}/tags`).then(res => setTags(res.data.data));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/teams`)
      .then(res => setTeams(res.data.data))
      .catch(err => {
        console.error('Error fetching teams:', err);
        setTeams([]);
      });
  }, []);

  useEffect(() => {
    if (game && game.homeTeamId && game.awayTeamId) {
      const teamIds = [game.homeTeamId, game.awayTeamId];
      axios.get(`${API_BASE}/players?team_ids=${teamIds.join(',')}&limit=100`)
        .then(res => setPlayers(res.data.data))
        .catch(err => {
          console.error('Error fetching players:', err);
          setPlayers([]);
        });
    }
  }, [game]);

  const handleBackClick = () => {
    navigate(`/games/${gameId}`);
  };

  const handleQuickTag = async (actionName) => {
    if (!selectedPlayer) {
      alert('Please select a player first');
      return;
    }
    if (!gameTime) {
      alert('Please enter game time');
      return;
    }
    const tag = tags.find(t => t.name === actionName);
    if (!tag) {
      console.warn(`Tag "${actionName}" not found in database`);
      return;
    }
    setCurrentPlayTags(prev => [...prev, { tag, actionName }]);
  };

  const handleSavePlay = async () => {
    if (currentPlayTags.length === 0) {
      alert('Please add at least one tag to the play');
      return;
    }
    try {
      const createdById = 'demo-user-1';
      const playData = {
        gameId,
        description: `${currentPlayTags.map(t => t.actionName).join(' → ')} by ${selectedPlayer.fullName || selectedPlayer.name || 'Unknown Player'}`,
        quarter: currentQuarter,
        gameTime,
        createdById,
        tags: currentPlayTags.map(tagData => ({
          tagId: tagData.tag.id,
          playerId: selectedPlayer.espnId,
          teamId: selectedPlayer.teamId,
          context: {
            action: tagData.actionName,
            sequence: currentPlayTags.indexOf(tagData) + 1,
            totalActions: currentPlayTags.length
          }
        }))
      };
      await axios.post(`${API_BASE}/plays`, playData);
      setCurrentPlayTags([]);
      setGameTime('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error tagging play:', err);
      alert('Error tagging play: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleClearPlay = () => {
    setCurrentPlayTags([]);
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
    <div
      className={`fast-tagging-root`}
      style={{
        padding: '0',
        maxWidth: '100vw',
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <GameHeader
        game={game}
        onBack={handleBackClick}
        currentQuarter={currentQuarter}
      />
      <div className="fast-tagging-main-row">
        {/* Sidebar: Player/Team selection */}
        <div
          className={`fast-tagging-sidebar${isVeryNarrow ? ' narrow' : ''}`}
        >
          <PlayerSelector
            game={game}
            players={players}
            selectedPlayer={selectedPlayer}
            selectedTeam={selectedTeam}
            onPlayerSelect={handlePlayerSelect}
            onTeamSelect={handleTeamSelect}
            teams={teams}
          />
        </div>
        {/* Main Area */}
        <div className="fast-tagging-main-area">
          {/* Top Bar: Game Time/Quarter */}
          <div className="fast-tagging-topbar">
            <GameTimeInput
              gameTime={gameTime}
              setGameTime={setGameTime}
              currentQuarter={currentQuarter}
              setCurrentQuarter={setCurrentQuarter}
            />
          </div>
          {/* Main Row: Sequence | Quick Actions | Prediction | Decision Quality */}
          <div className="fast-tagging-panels-row">
            {/* Sequence Box */}
            <div className="fast-tagging-sequence-panel">
              <div className="fast-tagging-sequence-title">Current Play Sequence</div>
              {currentPlayTags.length > 0 ? (
                <>
                  <div className="fast-tagging-sequence-list">
                    {currentPlayTags.map((tagData, index) => (
                      <div className="fast-tagging-sequence-tag" key={index}>
                        <span>{index + 1}.</span>
                        <span>{tagData.actionName}</span>
                        {index < currentPlayTags.length - 1 && <span>→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="fast-tagging-sequence-actions">
                    <button
                      className="fast-tagging-save-btn"
                      onClick={handleSavePlay}
                    >
                      ✅ Save Play
                    </button>
                    <button
                      className="fast-tagging-clear-btn"
                      onClick={handleClearPlay}
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </>
              ) : (
                <div className="fast-tagging-sequence-empty">No actions tagged yet. Use the buttons below to build your sequence.</div>
              )}
            </div>
            {/* Quick Actions Bar (contextual) - now outside the sequence box */}
            <div className="fast-tagging-quickactions-panel">
              <QuickActions
                onQuickTag={handleQuickTag}
                selectedPlayer={selectedPlayer}
                gameTime={gameTime}
                compact={true}
                currentSequence={currentPlayTags}
              />
            </div>
            {/* Prediction Panel */}
            <div className="fast-tagging-prediction-panel">
              <PredictionPanel
                gameId={gameId}
                selectedPlayer={selectedPlayer}
                selectedTeam={selectedTeam}
                currentQuarter={currentQuarter}
                gameTime={gameTime}
                refreshTrigger={refreshTrigger}
              />
            </div>
            {/* Decision Quality Panel */}
            <div className="fast-tagging-decision-panel">
              <DecisionQualityPanel
                gameId={gameId}
                selectedPlayer={selectedPlayer}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FastTagging; 