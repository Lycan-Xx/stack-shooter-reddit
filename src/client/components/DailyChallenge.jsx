import { useState, useEffect } from 'react';
import './DailyChallenge.css';

export default function DailyChallenge({ onClose, onStartChallenge }) {
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    setLoading(true);
    try {
      const [challengeRes, leaderboardRes, statsRes] = await Promise.all([
        fetch('/api/challenge/daily'),
        fetch('/api/challenge/leaderboard'),
        fetch('/api/challenge/stats'),
      ]);

      const challengeData = await challengeRes.json();
      const leaderboardData = await leaderboardRes.json();
      const statsData = await statsRes.json();

      if (challengeData.success) {
        setChallenge(challengeData.challenge);
      }

      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard);
      }

      if (statsData.success && statsData.stats) {
        setPlayerStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    if (challenge) {
      onStartChallenge(challenge);
      onClose();
    }
  };

  const getTotalScoreMultiplier = () => {
    if (!challenge) return 1.0;
    return challenge.modifiers.reduce((total, mod) => {
      return total * (mod.effect.scoreMultiplier || 1.0);
    }, 1.0);
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="challenge-overlay">
        <div className="challenge-modal">
          <div className="loading">Loading today's challenge...</div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenge-overlay">
        <div className="challenge-modal">
          <div className="error">Failed to load challenge</div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-overlay">
      <div className="challenge-modal">
        <div className="challenge-header">
          <h2>📅 Daily Challenge</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="challenge-content">
          <div className="challenge-info">
            <div className="challenge-title">{challenge.name}</div>
            <div className="challenge-date">{new Date(challenge.date).toLocaleDateString()}</div>

            <div className="modifiers-list">
              {challenge.modifiers.map((modifier) => (
                <div key={modifier.id} className="modifier-card">
                  <div className="modifier-icon">{modifier.icon}</div>
                  <div className="modifier-details">
                    <div className="modifier-name">{modifier.name}</div>
                    <div className="modifier-description">{modifier.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="score-multiplier">
              <span className="multiplier-label">Score Multiplier:</span>
              <span className="multiplier-value">×{getTotalScoreMultiplier().toFixed(1)}</span>
            </div>

            {playerStats && (
              <div className="player-challenge-stats">
                <div className="stats-header">Your Best Today</div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{playerStats.score.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Wave</span>
                    <span className="stat-value">{playerStats.wave}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Kills</span>
                    <span className="stat-value">{playerStats.kills}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="challenge-leaderboard">
            <h3>🏆 Today's Leaders</h3>
            {leaderboard.length === 0 ? (
              <div className="empty-leaderboard">
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

        <div className="challenge-actions">
          <button className="btn primary-btn" onClick={handleStartChallenge}>
            🎮 Start Challenge
          </button>
          <button className="btn secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
