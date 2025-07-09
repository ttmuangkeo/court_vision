import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OnboardingSteps.css';

const PlayerPreferencesStep = ({ data, onUpdate, onNext, onBack, isFirstStep, isLastStep }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState(data.favoritePlayers || []);
    const [filterPosition, setFilterPosition] = useState('all');

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const response = await axios.get('/api/players?limit=100');
            setPlayers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerToggle = (playerId) => {
        setSelectedPlayers(prev => 
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const handleContinue = () => {
        onUpdate({ favoritePlayers: selectedPlayers });
        onNext();
    };

    const positions = [
        { value: 'all', label: 'All Positions' },
        { value: 'G', label: 'Guards' },
        { value: 'F', label: 'Forwards' },
        { value: 'C', label: 'Centers' }
    ];

    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.firstName + " " + player.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             player.team?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = filterPosition === 'all' || player.position === filterPosition;
        return matchesSearch && matchesPosition;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading NBA players...</p>
            </div>
        );
    }

    return (
        <div className="player-preferences-step">
            <div className="step-description">
                <h4>Follow Your Favorite Players</h4>
                <p>
                    Select players you want to track and analyze. We'll provide 
                    detailed insights and decision quality analysis for these players.
                </p>
            </div>

            <div className="filters-container">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="player-search"
                    />
                </div>

                <div className="position-filter">
                    {positions.map((position) => (
                        <button
                            key={position.value}
                            className={`filter-button ${filterPosition === position.value ? 'active' : ''}`}
                            onClick={() => setFilterPosition(position.value)}
                        >
                            {position.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="players-grid">
                {filteredPlayers.slice(0, 50).map((player) => (
                    <div
                        key={player.id}
                        className={`player-card ${selectedPlayers.includes(player.id) ? 'selected' : ''}`}
                        onClick={() => handlePlayerToggle(player.id)}
                    >
                        <div className="player-avatar">
                            {player.photoUrl ? (
                                <img src={player.photoUrl} alt={player.firstName + " " + player.lastName} />
                            ) : (
                                <div className="player-placeholder">
                                    {player.firstName?.[0]}{player.lastName?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="player-info">
                            <div className="player-name">{player.firstName + " " + player.lastName}</div>
                            <div className="player-details">
                                {player.position} • {player.team?.name || 'Free Agent'}
                            </div>
                            {player.jersey && (
                                <div className="player-number">#{player.jersey}</div>
                            )}
                        </div>
                        <div className="selection-indicator">
                            {selectedPlayers.includes(player.id) && '✓'}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPlayers.length === 0 && searchTerm && (
                <div className="no-results">
                    <p>No players found matching "{searchTerm}"</p>
                </div>
            )}

            <div className="selection-summary">
                <p>
                    {selectedPlayers.length === 0 
                        ? 'No players selected' 
                        : `${selectedPlayers.length} player${selectedPlayers.length !== 1 ? 's' : ''} selected`
                    }
                </p>
            </div>

            <div className="step-actions">
                <button onClick={onBack} className="back-button">
                    ← Back
                </button>
                <button 
                    onClick={handleContinue}
                    className="continue-button"
                >
                    Continue to Tutorial →
                </button>
            </div>
        </div>
    );
};

export default PlayerPreferencesStep; 