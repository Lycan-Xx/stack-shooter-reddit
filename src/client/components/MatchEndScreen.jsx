import { useState, useEffect } from 'react';
import './MatchEndScreen.css';

export default function MatchEndScreen({ winner, players, onPlayAgain, onMainMenu }) {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    loadPlayerStats();
  }, []);

  const loadPlayerStats = async () => {
    try {
      const response = await fetch('/api/stats/player');
      const data = await response.json();
      
      if (data.success) {
        setPlayerStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
    setLoading(false);
  };

  return (
    <div className="match-end-screen">
      <div className="match-end-container">
        <div className="winner-announcement">
          <h1>🏆 Match Complete! 🏆</h1>
          <h2 className="winner-name">{winner} Wins!</h2>
        </div>

        <div className="final-scores">
          <h3>Final Scores</h3>
          <div className="scores-list">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className={`score-row ${index === 0 ? 'winner-row' : ''}`}>
                <span className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </span>
                <span className="player-name">{player.username}</span>
                <div className="player-stats">
                  <span className="stat">
                    <span className="stat-label">Score:</span>
                    <span className="stat-value">{player.score}</span>
                  </span>
                  <span className="stat">
                    <span className="stat-label">👤:</span>
                    <span className="stat-value">{player.kills || 0}</span>
                  </span>
                  <span className="stat">
                    <span className="stat-label">🧛:</span>
                    <span className="stat-value">{player.vampireKills || 0}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Stats Summary */}
        {!loading && playerStats && (
          <div className="personal-stats-summary">
            <h3>Your Overall Stats</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{playerStats.totalWins}</div>
                <div className="stat-label">Total Wins</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{playerStats.kdRatio.toFixed(2)}</div>
                <div className="stat-label">K/D Ratio</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{playerStats.totalMatches}</div>
                <div className="stat-label">Matches Played</div>
              </div>
            </div>
          </div>
        )}

        <div className="match-end-buttons">
          <button className="btn play-again-btn" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button className="btn main-menu-btn" onClick={onMainMenu}>
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
