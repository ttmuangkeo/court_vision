import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function PlayersList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [viewMode, setViewMode] = useState('recent'); // recent, most-tagged, all
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [sortBy, setSortBy] = useState('recent_activity');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Debounce search term with better implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 5000); // 5000ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Fetch teams for filter
    axios.get(`${API_BASE}/teams`)
      .then(res => {
        setTeams(res.data.data);
      })
      .catch(err => {
        console.error('Error fetching teams:', err);
      });
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [viewMode, pagination.page, selectedTeam, sortBy, debouncedSearchTerm]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/players`;
      let params = {
        include: 'team',
        limit: pagination.limit,
        page: pagination.page,
        sort: sortBy,
        search: debouncedSearchTerm
      };

      // Use different endpoints based on view mode
      if (viewMode === 'recent') {
        url = `${API_BASE}/players/recently-active`;
        params.limit = 50; // Higher limit since it's filtered
        delete params.sort; // This endpoint has its own sorting
      } else if (viewMode === 'most-tagged') {
        url = `${API_BASE}/players/most-tagged`;
        params.limit = 50; // Higher limit since it's filtered
        params.timeframe = 'all';
        delete params.sort; // This endpoint has its own sorting
      }

      if (selectedTeam) {
        params.team_ids = selectedTeam;
      }

      const response = await axios.get(url, { params });
      
      if (viewMode === 'all') {
        setPlayers(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.count,
          pages: Math.ceil(response.data.count / pagination.limit)
        }));
      } else {
        setPlayers(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.count,
          pages: Math.ceil(response.data.count / pagination.limit)
        }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching players:', err);
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    const colors = {
      'G': '#3b82f6', // Blue for guards
      'F': '#10b981', // Green for forwards
      'C': '#f59e0b', // Orange for centers
      'G-F': '#8b5cf6', // Purple for combo
      'F-G': '#8b5cf6',
      'F-C': '#ef4444', // Red for big men
      'C-F': '#ef4444'
    };
    return colors[position] || '#6b7280';
  };

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

  const getViewModeDescription = () => {
    switch (viewMode) {
      case 'recent':
        return 'Players tagged in the last 7 days';
      case 'most-tagged':
        return 'Players with the most tagged plays';
      case 'all':
        return 'All NBA players';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '1.1rem',
        color: '#8e8e93',
        fontWeight: '400'
      }}>
        Loading players...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px 40px',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}>
              NBA Players
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              fontWeight: '400',
              opacity: '0.9',
              lineHeight: '1.5',
              marginBottom: '0'
            }}>
              Explore player profiles, analytics, and performance data
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '60px 20px',
        backgroundColor: '#fafafa'
      }}>
        {/* View Mode Selector */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '16px'
          }}>
            View Mode
          </h3>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handleViewModeChange('recent')}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: viewMode === 'recent' ? '#667eea' : '#f1f5f9',
                color: viewMode === 'recent' ? 'white' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              🔥 Recently Active
            </button>
            
            <button
              onClick={() => handleViewModeChange('most-tagged')}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: viewMode === 'most-tagged' ? '#667eea' : '#f1f5f9',
                color: viewMode === 'most-tagged' ? 'white' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Most Tagged
            </button>
            
            <button
              onClick={() => handleViewModeChange('all')}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: viewMode === 'all' ? '#667eea' : '#f1f5f9',
                color: viewMode === 'all' ? 'white' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              👥 All Players
            </button>
          </div>
          
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#64748b', 
            marginTop: '12px',
            fontStyle: 'italic'
          }}>
            {getViewModeDescription()}
          </p>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Search */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Search Players
                {searchTerm && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: '#64748b', 
                    fontWeight: '400',
                    marginLeft: '8px'
                  }}>
                    {debouncedSearchTerm !== searchTerm ? ' (typing...)' : ` (${pagination.total} results)`}
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="Search by first name, last name, or both..."
                value={searchTerm}
                onChange={handleSearchChange}
                ref={searchInputRef}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: searchTerm ? '#fef3c7' : 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* Team Filter */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Filter by Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.espnId} value={team.espnId}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options (only for 'all' view) */}
            {viewMode === 'all' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="recent_activity">Recent Activity</option>
                  <option value="name">Name</option>
                  <option value="team">Team</option>
                  <option value="position">Position</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#1e293b'
          }}>
            Players ({pagination.total})
          </h2>
          
          {pagination.pages > 1 && (
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
            </div>
          )}
        </div>

        {/* Players Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {players.map(player => (
            <div
              key={player.espnId}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
              }}
              onClick={() => handlePlayerClick(player.espnId)}
            >
              {/* Player Avatar */}
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                {player.headshot ? (
                  <img 
                    src={player.headshot} 
                    alt={player.fullName || player.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  (player.fullName || player.name || 'P').split(' ').map(n => n[0]).join('')
                )}
              </div>
              
              {/* Player Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  marginBottom: '4px',
                  lineHeight: '1.3'
                }}>
                  {player.fullName || player.name || 'Unknown Player'}
                </h4>
                {player.shortName && player.shortName !== (player.fullName || player.name) && (
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#94a3b8',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontStyle: 'italic'
                  }}>
                    {player.shortName}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: getPositionColor(player.position),
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {player.position}
                  </span>
                  {player.jerseyNumber && (
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      #{player.jerseyNumber}
                    </span>
                  )}
                  {player.age && (
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {player.age} years old
                    </span>
                  )}
                  {player.experience && (
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {player.experience} years exp
                    </span>
                  )}
                  {player._count?.playTags > 0 && (
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {player._count.playTags} plays
                    </span>
                  )}
                </div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  {player.team?.name}
                </p>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                  {player.displayHeight && (
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {player.displayHeight}
                    </span>
                  )}
                  {player.displayWeight && (
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {player.displayWeight}
                    </span>
                  )}
                  {player.birthPlace && (
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      • {player.birthPlace}
                    </span>
                  )}
                </div>
                {player.status && player.status !== 'Active' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: player.status === 'Injured' ? '#fee2e2' : '#fef3c7',
                      color: player.status === 'Injured' ? '#dc2626' : '#92400e',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {player.status === 'Injured' ? '🏥 Injured' : player.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '40px'
          }}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: pagination.page === 1 ? '#f1f5f9' : '#667eea',
                color: pagination.page === 1 ? '#9ca3af' : 'white',
                fontWeight: '500',
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              ← Previous
            </button>
            
            <span style={{
              padding: '10px 16px',
              backgroundColor: '#f1f5f9',
              color: '#374151',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: pagination.page === pagination.pages ? '#f1f5f9' : '#667eea',
                color: pagination.page === pagination.pages ? '#9ca3af' : 'white',
                fontWeight: '500',
                cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              Next →
            </button>
          </div>
        )}

        {players.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            color: '#64748b'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              No Players Found
            </h3>
            <p style={{ 
              fontSize: '1rem',
              color: '#64748b'
            }}>
              Try adjusting your search terms, team filter, or view mode.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayersList;