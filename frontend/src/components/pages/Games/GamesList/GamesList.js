import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [sortBy, setSortBy] = useState('dateTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  // Fetch teams for filter dropdown
  useEffect(() => {
    axios.get(`${API_BASE}/teams`)
      .then(res => {
        setTeams(res.data.data);
      })
      .catch(err => {
        console.error('Error fetching teams:', err);
      });
  }, []);

  // Fetch games with filters and pagination
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        const params = {
          include: 'teams',
          limit: 50, // Increased limit
          page: currentPage,
          sortBy: sortBy,
          sortOrder: sortOrder
        };

        if (statusFilter) params.status = statusFilter;
        if (teamFilter) params.team = teamFilter;

        const response = await axios.get(`${API_BASE}/games`, { params });
        
        setGames(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalGames(response.data.pagination.total);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setLoading(false);
      }
    };

    fetchGames();
  }, [currentPage, sortBy, sortOrder, statusFilter, teamFilter]);

  const handleGameClick = (gameId) => {
    navigate(`/games/${gameId}`);
  };

  

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FINISHED': return '#28a745';
      case 'LIVE': return '#dc3545';
      case 'SCHEDULED': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' • ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        color: '#8e8e93'
      }}>
        Loading games...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1e293b' }}>
            NBA Games
          </h2>
          <p style={{ margin: '0', color: '#64748b', fontSize: '1rem' }}>
            {totalGames} games available • Select to tag plays
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Sort Dropdown */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px'
            }}
          >
            <option value="dateTime-desc">Newest First</option>
            <option value="dateTime-asc">Oldest First</option>
            <option value="homeTeamScore-desc">Highest Score</option>
            <option value="awayTeamScore-desc">Highest Away Score</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px'
            }}
          >
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="FINISHED">Finished</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => {
              setTeamFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.city} {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Games Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {games.map(game => (
          <div
            key={game.id}
            onClick={() => handleGameClick(game.id)}
            style={{
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              background: '#fff',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Status Badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: getStatusColor(game.status)
            }}>
              {game.status}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {game.homeTeam?.name} vs {game.awayTeam?.name}
                </h3>
                <div style={{ 
                  color: '#64748b', 
                  fontSize: '0.9rem',
                  marginBottom: '12px'
                }}>
                  {formatDate(game.dateTime)}
                </div>
                
                {/* Score */}
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {game.homeTeamScore || 0} - {game.awayTeamScore || 0}
                </div>
              </div>

              {/* Team Logos Placeholder */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#64748b'
                }}>
                  {game.homeTeam?.name?.charAt(0)}
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>vs</span>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#64748b'
                }}>
                  {game.awayTeam?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '10px',
          marginTop: '40px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage === 1 ? '#f1f5f9' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Previous
          </button>

          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: currentPage === totalPages ? '#f1f5f9' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Next
          </button>
        </div>
      )}
      
      {games.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
            No games found matching your filters.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
            Try adjusting your filters or check if games have been synced.
          </p>
        </div>
      )}
    </div>
  );
}

export default GamesList;