import './GameOver.css';

export default function GameOver({ wave, kills, score, onRestart, onMainMenu }) {
  return (
    <div id="game-over">
      <h2>Game Over</h2>
      <div id="final-stats">
        Final Wave: {wave}<br />
        Total Kills: {kills}<br />
        Final Score: {score}
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button className="btn" onClick={onRestart}>Play Again</button>
        <button className="btn" onClick={onMainMenu}>Main Menu</button>
      </div>
    </div>
  );
}
