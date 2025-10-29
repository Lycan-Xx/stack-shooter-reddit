import { useState, useEffect } from 'react';
import './Leaderboard.css';

export default function Leaderboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
    loadPlayerStats();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard/${activeTab}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlayerStats = async () => {
    try {
      const response = await fetch('/api/stats/player');
      const data = await response.json();
      
      if (data.success) {
        setPlayerStats(data.stats);
        setPlayerRank(data.rank);
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  };

  const getTabLabel = (tab) => {
    const labels = {
      global: '🌍 Global',
      subreddit: '📍 Subreddit',
      daily: '📅 Daily',
      weekly: '📆 Weekly'
    };
    return labels[tab] || tab;
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h2>🏆 Leaderboard</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="leaderboard-tabs">
          {['global', 'subreddit', 'daily', 'weekly'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {playerStats && playerRank && (
          <div className="player-rank-card">
            <div className="rank-badge">{getMedalEmoji(playerRank)}</div>
            <div className="rank-info">
              <div className="rank-label">Your Rank</div>
              <div className="rank-score">{playerStats.bestScore.toLocaleString()} pts</div>
            </div>
          </div>
        )}

        <div className="leaderboard-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <p>No scores yet. Be the first!</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="leaderboard-entry">
                  <div className="entry-rank">{getMedalEmoji(entry.rank)}</div>
                  <div className="entry-username">{entry.username}</div>
                  <div className="entry-score">{entry.score.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
