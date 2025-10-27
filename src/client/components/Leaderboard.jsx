import { useState, useEffect } from 'react';
import './Leaderboard.css';

export default function Leaderboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [playerRank, setPlayerRank] = useState(0);
  const [communityStats, setCommunityStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    loadPlayerStats();
    loadCommunityStats();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint = `/api/leaderboard/${activeTab}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
    setLoading(false);
  };

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
  };

  const loadCommunityStats = async () => {
    try {
      const response = await fetch('/api/stats/community');
      const data = await response.json();
      
      if (data.success) {
        setCommunityStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading community stats:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>🏆 Leaderboards</h2>

        {/* Player Stats Card */}
        {playerStats && (
          <div className="player-stats-card">
            <div className="stat-row">
              <span className="stat-label">Your Rank:</span>
              <span className="stat-value">#{playerRank || 'Unranked'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Best Score:</span>
              <span className="stat-value">{formatNumber(playerStats.bestScore)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">K/D Ratio:</span>
              <span className="stat-value">{playerStats.kdRatio.toFixed(2)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Wins:</span>
              <span className="stat-value">{playerStats.totalWins}/{playerStats.totalMatches}</span>
            </div>
          </div>
        )}

        {/* Community Stats */}
        {communityStats && (
          <div className="community-stats">
            <h3>🧛 Community Stats</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{formatNumber(communityStats.totalVampiresKilled)}</div>
                <div className="stat-label">Vampires Slain</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{formatNumber(communityStats.totalMatches)}</div>
                <div className="stat-label">Matches Played</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{formatNumber(communityStats.weeklyVampires)}</div>
                <div className="stat-label">This Week</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="leaderboard-tabs">
          <button 
            className={activeTab === 'global' ? 'active' : ''} 
            onClick={() => setActiveTab('global')}
          >
            🌍 Global
          </button>
          <button 
            className={activeTab === 'subreddit' ? 'active' : ''} 
            onClick={() => setActiveTab('subreddit')}
          >
            📍 Subreddit
          </button>
          <button 
            className={activeTab === 'daily' ? 'active' : ''} 
            onClick={() => setActiveTab('daily')}
          >
            📅 Daily
          </button>
          <button 
            className={activeTab === 'weekly' ? 'active' : ''} 
            onClick={() => setActiveTab('weekly')}
          >
            📆 Weekly
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-table">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">No entries yet. Be the first!</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className={entry.username === playerStats?.username ? 'highlight' : ''}>
                    <td className="rank">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </td>
                    <td className="username">{entry.username}</td>
                    <td className="score">{formatNumber(entry.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
