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

  const { gameInfo, teamAnalysis, matchup, gamePlan, aiAnalysis } = analysis;

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

      {/* AI Analysis Summary */}
      {aiAnalysis && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            🤖 AI Analysis
          </h3>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
              {aiAnalysis.summary}
            </div>
            {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>
                  Key Insights:
                </div>
                <ul style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
                  {aiAnalysis.keyInsights.map((insight, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Analysis */}
      {aiAnalysis && aiAnalysis.teamAnalysis && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            🏀 Team Performance Analysis
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Away Team */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#3b82f6' }}>
                {gameInfo.awayTeam}
              </h4>
              
              {aiAnalysis.teamAnalysis.away && (
                <div>
                  {aiAnalysis.teamAnalysis.away.strengths && aiAnalysis.teamAnalysis.away.strengths.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#059669' }}>
                        Strengths:
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '20px', color: '#059669' }}>
                        {aiAnalysis.teamAnalysis.away.strengths.map((strength, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiAnalysis.teamAnalysis.away.weaknesses && aiAnalysis.teamAnalysis.away.weaknesses.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                        Areas for Improvement:
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '20px', color: '#dc2626' }}>
                        {aiAnalysis.teamAnalysis.away.weaknesses.map((weakness, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiAnalysis.teamAnalysis.away.performance && (
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                        Performance Analysis:
                      </div>
                      <div style={{ color: '#475569', lineHeight: '1.5' }}>
                        {aiAnalysis.teamAnalysis.away.performance}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Home Team */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>
                {gameInfo.homeTeam}
              </h4>
              
              {aiAnalysis.teamAnalysis.home && (
                <div>
                  {aiAnalysis.teamAnalysis.home.strengths && aiAnalysis.teamAnalysis.home.strengths.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#059669' }}>
                        Strengths:
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '20px', color: '#059669' }}>
                        {aiAnalysis.teamAnalysis.home.strengths.map((strength, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiAnalysis.teamAnalysis.home.weaknesses && aiAnalysis.teamAnalysis.home.weaknesses.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#dc2626' }}>
                        Areas for Improvement:
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '20px', color: '#dc2626' }}>
                        {aiAnalysis.teamAnalysis.home.weaknesses.map((weakness, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiAnalysis.teamAnalysis.home.performance && (
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                        Performance Analysis:
                      </div>
                      <div style={{ color: '#475569', lineHeight: '1.5' }}>
                        {aiAnalysis.teamAnalysis.home.performance}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategic Insights */}
      {aiAnalysis && aiAnalysis.strategicInsights && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            🎯 Strategic Insights
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#8b5cf6' }}>
                Offensive Strategy
              </h4>
              <div style={{ color: '#475569', lineHeight: '1.5' }}>
                {aiAnalysis.strategicInsights.offensiveStrategy}
              </div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#f59e0b' }}>
                Defensive Strategy
              </h4>
              <div style={{ color: '#475569', lineHeight: '1.5' }}>
                {aiAnalysis.strategicInsights.defensiveStrategy}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Plans */}
      {aiAnalysis && aiAnalysis.gamePlan && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            📋 Strategic Game Plans
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Winner's Strategy */}
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
                color: '#059669'
              }}>
                🏆 {gameInfo.winner} - Going Forward
              </h4>
              <div style={{ color: '#475569', lineHeight: '1.5' }}>
                {aiAnalysis.gamePlan.forWinner}
              </div>
            </div>

            {/* Loser's Strategy */}
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
                color: '#dc2626'
              }}>
                🔄 {gameInfo.winner === gameInfo.awayTeam ? gameInfo.homeTeam : gameInfo.awayTeam} - Adjustments
              </h4>
              <div style={{ color: '#475569', lineHeight: '1.5' }}>
                {aiAnalysis.gamePlan.forLoser}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traditional Team Advantages (fallback) */}
      {matchup && matchup.advantages && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#1e293b' }}>
            📊 Statistical Advantages
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
      )}
    </div>
  );
};

export default GameAnalysis; 