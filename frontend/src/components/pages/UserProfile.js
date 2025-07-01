import React, { useState, useEffect } from 'react';
import { useAuth } from '../common/AuthContext';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    experienceLevel: user?.experienceLevel || 'beginner',
    coachingRole: user?.coachingRole || '',
    teamLevel: user?.teamLevel || '',
    avatar: user?.avatar || ''
  });

  // Fetch teams and players for selection
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamsRes, playersRes, userPrefsRes] = await Promise.all([
          axios.get('/api/teams'),
          axios.get('/api/players'),
          axios.get('/api/auth/profile')
        ]);

        // Handle API response structure
        const teamsData = teamsRes.data.data || teamsRes.data || [];
        const playersData = playersRes.data.data || playersRes.data || [];
        
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setPlayers(Array.isArray(playersData) ? playersData : []);
        
        // Set current user preferences
        if (userPrefsRes.data.user?.favoriteTeams) {
          setSelectedTeams(userPrefsRes.data.user.favoriteTeams.map(team => team.espnId));
        }
        if (userPrefsRes.data.user?.favoritePlayers) {
          setSelectedPlayers(userPrefsRes.data.user.favoritePlayers.map(player => player.espnId));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effect to search players from API
  useEffect(() => {
    if (!playerSearchTerm) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/players?search=${encodeURIComponent(playerSearchTerm)}&limit=8`);
        setSearchResults(res.data.data || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [playerSearchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const response = await axios.put('/api/auth/profile', {
        ...formData,
        favoriteTeams: selectedTeams,
        favoritePlayers: selectedPlayers
      });

      if (response.data.success) {
        await refreshUser();
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getTeamBranding = (team) => {
    return {
      backgroundColor: team.primaryColor ? `#${team.primaryColor}` : '#1a1a1a',
      color: team.alternateColor ? `#${team.alternateColor}` : '#ffffff'
    };
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {formData.avatar ? (
            <img src={formData.avatar} alt="Profile" />
          ) : (
            <div className="avatar-placeholder">
              {formData.firstName?.charAt(0) || formData.username?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : formData.username}</h1>
          <p className="profile-email">{formData.email}</p>
          {formData.bio && <p className="profile-bio">{formData.bio}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-sections">
          {/* Personal Information */}
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="avatar">Profile Picture URL</label>
                <input
                  type="url"
                  id="avatar"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          {/* Basketball Experience */}
          <div className="form-section">
            <h2>Basketball Experience</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="coachingRole">Coaching Role</label>
                <select
                  id="coachingRole"
                  name="coachingRole"
                  value={formData.coachingRole}
                  onChange={handleInputChange}
                >
                  <option value="">Select role</option>
                  <option value="head">Head Coach</option>
                  <option value="assistant">Assistant Coach</option>
                  <option value="volunteer">Volunteer Coach</option>
                  <option value="player">Player</option>
                  <option value="analyst">Analyst</option>
                  <option value="fan">Fan</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="teamLevel">Team Level</label>
                <select
                  id="teamLevel"
                  name="teamLevel"
                  value={formData.teamLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select level</option>
                  <option value="youth">Youth</option>
                  <option value="high-school">High School</option>
                  <option value="college">College</option>
                  <option value="pro">Professional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Favorite Teams */}
          <div className="form-section">
            <h2>Favorite Teams</h2>
            <p className="section-description">Select your favorite NBA teams to personalize your dashboard</p>
            <div className="teams-grid">
              {teams.map(team => (
                <div
                  key={team.espnId}
                  className={`team-card ${selectedTeams.includes(team.espnId) ? 'selected' : ''}`}
                  onClick={() => handleTeamToggle(team.espnId)}
                  style={getTeamBranding(team)}
                >
                  <div className="team-logo">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} />
                    ) : (
                      <div className="team-initial">{team.abbreviation}</div>
                    )}
                  </div>
                  <div className="team-info">
                    <h3>{team.name}</h3>
                    <p>{team.conference} • {team.division}</p>
                  </div>
                  <div className="selection-indicator">
                    {selectedTeams.includes(team.espnId) && '✓'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Players */}
          <div className="form-section">
            <h2>Favorite Players</h2>
            <p className="section-description">Select your favorite NBA players to track their performance</p>
            <input
              type="text"
              placeholder="Search players by name..."
              value={playerSearchTerm}
              onChange={e => setPlayerSearchTerm(e.target.value)}
              className="profile-search-input"
              style={{ marginBottom: 12, padding: 6, width: '100%' }}
            />
            {searchLoading && <div style={{marginBottom: 8}}>Searching...</div>}
            <div className="players-list">
              {(playerSearchTerm ? searchResults : players.slice(0, 8))
                .map(player => (
                  <div
                    key={player.espnId}
                    className={`player-card${selectedPlayers.includes(player.espnId) ? ' selected' : ''}`}
                    onClick={() => handlePlayerToggle(player.espnId)}
                  >
                    <div className="player-avatar">
                      {player.headshot ? (
                        <img src={player.headshot} alt={player.fullName} />
                      ) : (
                        <div className="player-initials">
                          {(player.fullName || 'P').split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="player-info">
                      <h3>{player.fullName}</h3>
                      <p>{player.position} • {player.team?.abbreviation || (player.teamEspnId ? teams.find(t => t.espnId === player.teamEspnId)?.abbreviation : 'FA')}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile; 