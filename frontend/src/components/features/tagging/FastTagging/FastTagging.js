import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../common/AuthContext';
import GameHeader from '../GameHeader';
import PlayerSelector from '../PlayerSelector';
import GameTimeInput from '../GameTimeInput/GameTimeInput';
import QuickActions from '../QuickActions/QuickActionsSimple';
import PredictionPanel from '../PredictionPanel';
import DecisionQualityPanel from '../DecisionQualityPanel';
import './FastTagging.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

// Example glossary for inference (replace with real glossary if available)
const GLOSSARY = [
  { tag: 'Pick and Roll', coverageType: 'switch', possessionType: 'half-court' },
  { tag: 'Transition', possessionType: 'transition' },
  // Add more rules as needed
];

function inferContextFields(tagSequence) {
  let coverageType, possessionType;
  for (const tagData of tagSequence) {
    const glossaryEntry = GLOSSARY.find(g => g.tag === tagData.actionName);
    if (glossaryEntry) {
      if (glossaryEntry.coverageType) coverageType = glossaryEntry.coverageType;
      if (glossaryEntry.possessionType) possessionType = glossaryEntry.possessionType;
    }
  }
  return { coverageType, possessionType };
}

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

  const { user } = useAuth();

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

    // Handle special actions
    if (actionName === 'CLEAR_ALL') {
      setCurrentPlayTags([]);
      return;
    }

    if (actionName.startsWith('REMOVE_AT_INDEX_')) {
      const index = parseInt(actionName.replace('REMOVE_AT_INDEX_', ''));
      setCurrentPlayTags(prev => prev.filter((_, i) => i !== index));
      return;
    }

    const tag = tags.find(t => t.name === actionName);
    if (!tag) {
      console.warn(`Tag "${actionName}" not found in database`);
      return;
    }
    setCurrentPlayTags(prev => [...prev, { tag, actionName }]);
  };

  const handleTimeIncrement = () => {
    if (!gameTime) return;
    
    const [minutes, seconds] = gameTime.split(':').map(Number);
    let newMinutes = minutes;
    let newSeconds = seconds - 20; // Assume 20 seconds between plays

    if (newSeconds < 0) {
      newMinutes -= 1;
      newSeconds = 60 + newSeconds;
    }

    if (newMinutes < 0) {
      if (currentQuarter > 1) {
        setCurrentQuarter(currentQuarter - 1);
        newMinutes = 11;
        newSeconds = 40;
      } else {
        newMinutes = 0;
        newSeconds = 0;
      }
    }

    const newTime = `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    setGameTime(newTime);
  };

  const handleSavePlay = async () => {
    if (currentPlayTags.length === 0) {
      alert('Please add at least one tag to the play');
      return;
    }
    try {
      const createdById = user?.id; // Use authenticated user's ID
      if (!createdById) {
        alert('Please log in to tag plays');
        return;
      }

      // Infer context fields for the sequence
      const inferred = inferContextFields(currentPlayTags);

      const playData = {
        gameId,
        description: `${currentPlayTags.map(t => t.actionName).join(' → ')} by ${selectedPlayer.fullName || selectedPlayer.name || 'Unknown Player'}`,
        quarter: currentQuarter,
        gameTime,
        createdById,
        tags: currentPlayTags.map(tagData => ({
          tagId: tagData.tag.id,
          playerId: selectedPlayer.id,
          teamId: selectedPlayer.teamId,
          context: {
            action: tagData.actionName,
            sequence: currentPlayTags.indexOf(tagData) + 1,
            totalActions: currentPlayTags.length,
            ...inferred // Add inferred fields if present
          }
        }))
      };
      await axios.post(`${API_BASE}/plays`, playData);
      setCurrentPlayTags([]);
      handleTimeIncrement();
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
            <div className="fast-tagging-topbar-left">
              <GameTimeInput
                gameTime={gameTime}
                setGameTime={setGameTime}
                currentQuarter={currentQuarter}
                setCurrentQuarter={setCurrentQuarter}
                onTimeChange={refreshTrigger}
              />
            </div>
            {/* Current Sequence Display - moved to top right */}
            {currentPlayTags.length > 0 && (
              <div className="fast-tagging-sequence-display">
                <div className="sequence-display-header">
                  <span className="sequence-display-title">Current Sequence:</span>
                  <div className="sequence-display-actions">
                    <button
                      className="sequence-save-btn"
                      onClick={handleSavePlay}
                      title="Save Play"
                    >
                      ✅
                    </button>
                    <button
                      className="sequence-clear-btn"
                      onClick={handleClearPlay}
                      title="Clear Sequence"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="sequence-display-items">
                  {currentPlayTags.map((tagData, index) => (
                    <span key={index} className="sequence-display-item">
                      {tagData.actionName}
                      {index < currentPlayTags.length - 1 && <span className="sequence-display-arrow">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Main Row: Quick Actions | Prediction | Decision Quality */}
          <div className="fast-tagging-panels-row">
            {/* Quick Actions Bar */}
            <div className="fast-tagging-quickactions-panel">
              <QuickActions
                onQuickTag={handleQuickTag}
                onAutoSave={handleSavePlay}
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