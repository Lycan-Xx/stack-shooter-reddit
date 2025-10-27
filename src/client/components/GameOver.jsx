import { useState, useEffect } from 'react';
import './GameOver.css';

export default function GameOver({ wave, kills, score, onRestart, onMainMenu }) {
  const [playerStats, setPlayerStats] = useState(null);
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
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
    setLoading(false);
  };

  return (
    <div id="game-over">
      <h2>Game Over</h2>
      <div id="final-stats">
        <div className="match-stats">
          <h3>This Match</h3>
          Final Wave: {wave}
          <br />
          Total Kills: {kills}
          <br />
          Final Score: {score}
        </div>

        {!loading && playerStats && (
          <div className="overall-stats">
            <h3>Your Overall Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Wins:</span>
                <span className="stat-value">{playerStats.totalWins}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">K/D Ratio:</span>
                <span className="stat-value">{playerStats.kdRatio.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Score:</span>
                <span className="stat-value">{playerStats.bestScore}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Matches:</span>
                <span className="stat-value">{playerStats.totalMatches}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Kills:</span>
                <span className="stat-value">{playerStats.totalKills}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Vampires Slain:</span>
                <span className="stat-value">{playerStats.vampireKills}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <button className="btn" onClick={onRestart}>
          Play Again
        </button>
        <button className="btn" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </div>
  );
}
