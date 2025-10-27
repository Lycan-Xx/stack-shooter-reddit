import { useState, useEffect } from 'react';
import './StatsModal.css';

export default function StatsModal({ onClose }) {
  const [playerStats, setPlayerStats] = useState(null);
  const [playerRank, setPlayerRank] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      const response = await fetch('/api/stats/player');
      const data = await response.json();
      
      if (data.success) {
        setPlayerStats(data.stats);
        setPlayerRank(data.rank || 0);
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
    setLoading(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="stats-modal-overlay">
      <div className="stats-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>📊 Your Statistics</h2>

        {loading ? (
          <div className="loading">Loading stats...</div>
        ) : playerStats ? (
          <>
            <div className="rank-display">
              <div className="rank-label">Global Rank</div>
              <div className="rank-value">#{playerRank || 'Unranked'}</div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{playerStats.totalWins}</div>
                <div className="stat-label">Total Wins</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚔️</div>
                <div className="stat-value">{playerStats.kdRatio.toFixed(2)}</div>
                <div className="stat-label">K/D Ratio</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{formatNumber(playerStats.bestScore)}</div>
                <div className="stat-label">Best Score</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-value">{playerStats.totalMatches}</div>
                <div className="stat-label">Matches Played</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💀</div>
                <div className="stat-value">{formatNumber(playerStats.totalKills)}</div>
                <div className="stat-label">Total Kills</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🧛</div>
                <div className="stat-value">{formatNumber(playerStats.vampireKills)}</div>
                <div className="stat-label">Vampires Slain</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-value">{formatNumber(playerStats.playerKills)}</div>
                <div className="stat-label">Player Kills</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">☠️</div>
                <div className="stat-value">{playerStats.totalDeaths}</div>
                <div className="stat-label">Deaths</div>
              </div>
            </div>

            <div className="win-rate">
              <div className="win-rate-label">Win Rate</div>
              <div className="win-rate-bar">
                <div 
                  className="win-rate-fill" 
                  style={{ width: `${(playerStats.totalWins / playerStats.totalMatches * 100) || 0}%` }}
                ></div>
              </div>
              <div className="win-rate-text">
                {((playerStats.totalWins / playerStats.totalMatches * 100) || 0).toFixed(1)}%
              </div>
            </div>
          </>
        ) : (
          <div className="no-stats">No stats available yet. Play some matches!</div>
        )}

        <button className="btn close-stats-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
