import { useState } from 'react';
import StatsModal from './StatsModal';
import './GameOver.css';

export default function GameOver({ wave, kills, score, onRestart, onMainMenu }) {
  const [showStats, setShowStats] = useState(false);

  return (
    <>
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
        </div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn" onClick={onRestart}>
            Play Again
          </button>
          <button className="btn" onClick={() => setShowStats(true)}>
            📊 View Stats
          </button>
          <button className="btn" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>

      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </>
  );
}
