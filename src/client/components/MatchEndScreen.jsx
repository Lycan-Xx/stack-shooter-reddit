import './MatchEndScreen.css';

export default function MatchEndScreen({ winner, players, onPlayAgain, onMainMenu }) {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

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
                <span className="rank">#{index + 1}</span>
                <span className="player-name">{player.username}</span>
                <div className="player-stats">
                  <span className="stat">
                    <span className="stat-label">Score:</span>
                    <span className="stat-value">{player.score}</span>
                  </span>
                  <span className="stat">
                    <span className="stat-label">👤:</span>
                    <span className="stat-value">{player.kills}</span>
                  </span>
                  <span className="stat">
                    <span className="stat-label">🧛:</span>
                    <span className="stat-value">{player.vampireKills}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

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
