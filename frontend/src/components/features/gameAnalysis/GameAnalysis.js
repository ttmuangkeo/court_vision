import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

const GameAnalysis = ({ gameId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameId) {
      fetchAnalysis();
    }
  }, [gameId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/games/${gameId}/analysis`);
      setAnalysis(response.data.data);
    } catch (err) {
      console.error('Error fetching game analysis:', err);
      setError('Failed to load game analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '1.1rem',
        color: '#8e8e93'
      }}>
        Loading game analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        color: '#ef4444',
        fontSize: '1rem'
      }}>
        {error}
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { gameInfo, teamAnalysis, matchup, gamePlan } = analysis;

  return (
    <div style={{ padding: '20px' }}>
      {/* Game Summary */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>
          Game Analysis: {gameInfo.awayTeam} vs {gameInfo.homeTeam}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
              {gameInfo.awayTeam} {gameInfo.awayScore} - {gameInfo.homeTeam} {gameInfo.homeScore}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
              Winner: {gameInfo.winner} (Margin: {gameInfo.margin} points)
            </div>
          </div>
          <div style={{ 
            background: '#10b981',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {gameInfo.winner === gameInfo.awayTeam ? 'Away Win' : 'Home Win'}
          </div>
        </div>
      </div>

      {/* Team Advantages */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
          🎯 Team Advantages
        </h3>
        
        {/* Away Team Advantages */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#3b82f6' }}>
            {gameInfo.awayTeam} Advantages
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {matchup.advantages.away.map((advantage, index) => (
              <div key={index} style={{
                background: '#eff6ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1e40af' }}>
                      {advantage.stat}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#3b82f6' }}>
                      {advantage.awayValue} vs {advantage.homeValue} ({advantage.difference > 0 ? '+' : ''}{advantage.difference.toFixed(1)})
                    </div>
                  </div>
                  <div style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {advantage.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Home Team Advantages */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>
            {gameInfo.homeTeam} Advantages
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {matchup.advantages.home.map((advantage, index) => (
              <div key={index} style={{
                background: '#f0fdf4',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #dcfce7'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#166534' }}>
                      {advantage.stat}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#16a34a' }}>
                      {advantage.homeValue} vs {advantage.awayValue} ({advantage.difference > 0 ? '+' : ''}{advantage.difference.toFixed(1)})
                    </div>
                  </div>
                  <div style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {advantage.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Plans */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
          📋 Strategic Game Plans
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Away Team Game Plan */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h4 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#3b82f6',
              textAlign: 'center'
            }}>
              {gameInfo.awayTeam} Strategy
            </h4>
            
            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🎯 Offensive Focus
              </h5>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '20px' }}>
                {gamePlan.away.offensive.map((strategy, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{strategy}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🛡️ Defensive Focus
              </h5>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '20px' }}>
                {gamePlan.away.defensive.map((strategy, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{strategy}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🔑 Keys to Success
              </h5>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '20px' }}>
                {gamePlan.away.keys.map((key, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{key}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Home Team Game Plan */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h4 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#10b981',
              textAlign: 'center'
            }}>
              {gameInfo.homeTeam} Strategy
            </h4>
            
            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🎯 Offensive Focus
              </h5>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '20px' }}>
                {gamePlan.home.offensive.map((strategy, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{strategy}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🛡️ Defensive Focus
              </h5>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '20px' }}>
                {gamePlan.home.defensive.map((strategy, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{strategy}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🔑 Keys to Success
              </h5>
              <ul style={{ fontSize: '0.9rem', color: '#64748b', paddingLeft: '20px' }}>
                {gamePlan.home.keys.map((key, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{key}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Team Performance */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
          📊 Detailed Performance Analysis
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Away Team Performance */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h4 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#3b82f6',
              textAlign: 'center'
            }}>
              {gameInfo.awayTeam} Performance
            </h4>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Points:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.away.basic.points}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>FG%:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.away.basic.fieldGoalPercentage}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>3P%:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.away.basic.threePointPercentage}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Rebounds:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.away.basic.rebounds}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Assists:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.away.basic.assists}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Turnovers:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.away.basic.turnovers}</span>
              </div>
            </div>
          </div>

          {/* Home Team Performance */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <h4 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '16px', 
              color: '#10b981',
              textAlign: 'center'
            }}>
              {gameInfo.homeTeam} Performance
            </h4>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Points:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.home.basic.points}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>FG%:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.home.basic.fieldGoalPercentage}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>3P%:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.home.basic.threePointPercentage}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Rebounds:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.home.basic.rebounds}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Assists:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.home.basic.assists}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Turnovers:</span>
                <span style={{ fontWeight: '600' }}>{teamAnalysis.home.basic.turnovers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis; 