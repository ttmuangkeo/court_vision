import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OnboardingSteps.css';

const TeamSelectionStep = ({ data, onUpdate, onNext, onBack, isFirstStep, isLastStep }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeams, setSelectedTeams] = useState(data.favoriteTeams || []);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await axios.get('/api/teams');
            setTeams(response.data.data || []);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTeamToggle = (teamId) => {
        setSelectedTeams(prev => 
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleContinue = () => {
        onUpdate({ favoriteTeams: selectedTeams });
        onNext();
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading NBA teams...</p>
            </div>
        );
    }

    return (
        <div className="team-selection-step">
            <div className="step-description">
                <h4>Choose Your Favorite Teams</h4>
                <p>
                    Select the teams you want to follow. This will help us personalize 
                    your experience and show you relevant analytics.
                </p>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="team-search"
                />
            </div>

            <div className="teams-grid">
                {filteredTeams.map((team) => (
                    <div
                        key={team.espnId}
                        className={`team-card ${selectedTeams.includes(team.espnId) ? 'selected' : ''}`}
                        onClick={() => handleTeamToggle(team.espnId)}
                    >
                        <div className="team-logo">
                            {team.logoUrl ? (
                                <img src={team.logoUrl} alt={team.name} />
                            ) : (
                                <div className="team-placeholder">
                                    {team.abbreviation}
                                </div>
                            )}
                        </div>
                        <div className="team-info">
                            <div className="team-name">{team.name}</div>
                            <div className="team-conference">
                                {team.conference} • {team.division}
                            </div>
                        </div>
                        <div className="selection-indicator">
                            {selectedTeams.includes(team.espnId) && '✓'}
                        </div>
                    </div>
                ))}
            </div>

            {filteredTeams.length === 0 && searchTerm && (
                <div className="no-results">
                    <p>No teams found matching "{searchTerm}"</p>
                </div>
            )}

            <div className="selection-summary">
                <p>
                    {selectedTeams.length === 0 
                        ? 'No teams selected' 
                        : `${selectedTeams.length} team${selectedTeams.length !== 1 ? 's' : ''} selected`
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
                    disabled={selectedTeams.length === 0}
                >
                    Continue to Player Selection →
                </button>
            </div>
        </div>
    );
};

export default TeamSelectionStep; 