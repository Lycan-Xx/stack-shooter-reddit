import { useState, useEffect } from 'react';
import StatsModal from './StatsModal';
import './GameOver.css';

export default function GameOver({ wave, kills, score, difficulty, onRestart, onMainMenu }) {
  const [showStats, setShowStats] = useState(false);
  const [personalBest, setPersonalBest] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    checkPersonalBest();
    submitScore();
  }, []);

  const checkPersonalBest = () => {
    // Get personal best from localStorage
    const key = `best_${difficulty}`;
    const stored = localStorage.getItem(key);
    const best = stored ? parseInt(stored) : 0;

    setPersonalBest(best);

    if (score > best) {
      setIsNewBest(true);
      localStorage.setItem(key, score.toString());
    }
  };

  const submitScore = async () => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/score/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          wave,
          kills,
          difficulty,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        if (data.rank) {
          setRank(data.rank);
        }
      }
      
      // If challenge mode, also submit to challenge leaderboard
      if (difficulty === 'challenge') {
        const today = new Date().toISOString().split('T')[0];
        await fetch('/api/challenge/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score,
            wave,
            kills,
            date: today,
          }),
        });
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyEmoji = () => {
    const emojis = {
      easy: '😊',
      normal: '😐',
      hard: '😰',
      nightmare: '💀',
      tutorial: '📚',
    };
    return emojis[difficulty] || '😐';
  };

  const getDifficultyLabel = () => {
    return difficulty.toUpperCase();
  };

  return (
    <>
      <div id="game-over">
        <h2>💀 Game Over 💀</h2>

        {isNewBest && <div className="new-best-banner">🎉 NEW PERSONAL BEST! 🎉</div>}

        <div id="final-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🌊</div>
              <div className="stat-value">{wave}</div>
              <div className="stat-label">Final Wave</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💀</div>
              <div className="stat-value">{kills}</div>
              <div className="stat-label">Total Kills</div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{score.toLocaleString()}</div>
              <div className="stat-label">Final Score</div>
            </div>
          </div>

          <div className="difficulty-display">
            <span className="difficulty-emoji">{getDifficultyEmoji()}</span>
            <span className="difficulty-text">{getDifficultyLabel()} MODE</span>
          </div>

          {personalBest > 0 && !isNewBest && (
            <div className="personal-best">
              Your Best ({getDifficultyLabel()}): {personalBest.toLocaleString()}
            </div>
          )}

          {submitted && rank && <div className="rank-display">🏆 Global Rank: #{rank}</div>}

          {submitting && <div className="submitting">Submitting to leaderboard...</div>}
        </div>

        <div className="game-over-buttons">
          <button className="btn primary-btn" onClick={onRestart}>
            🔄 Play Again
          </button>
          <button className="btn secondary-btn" onClick={() => setShowStats(true)}>
            📊 View Stats
          </button>
          <button className="btn secondary-btn" onClick={onMainMenu}>
            🏠 Main Menu
          </button>
        </div>
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
}
