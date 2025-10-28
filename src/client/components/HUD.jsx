import './HUD.css';

export default function HUD({
  health,
  maxHealth,
  wave,
  enemies,
  kills,
  score,
  dashEnergy,
  maxDashEnergy,
  dashCooldown,
  maxDashCooldown,
  isMultiplayer = false,
  playerCount = 1,
  teamLives = 3,
  maxTeamLives = 3,
  waveEnemiesRemaining = 0,
  vampireKills = 0,
  powerUps = [],
}) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const energyPercent = Math.max(0, Math.min(100, (dashEnergy / maxDashEnergy) * 100));
  const dashPercent = Math.max(0, Math.min(100, 100 - (dashCooldown / maxDashCooldown) * 100));
  const dashText =
    dashCooldown <= 0 ? 'DASH READY' : `COOLDOWN: ${Math.ceil(dashCooldown / 1000)}s`;

  // Determine lives color
  const livesClass = teamLives === 1 ? 'lives-critical' : teamLives === 2 ? 'lives-warning' : 'lives-normal';

  return (
    <>
      <div id="hud">
        <div className="hud-item">
          <div id="health-bar">
            <div id="health-fill" style={{ width: `${healthPercent}%` }}></div>
            <div id="health-text">
              {Math.max(0, Math.floor(health))} / {maxHealth}
            </div>
          </div>
        </div>
        {isMultiplayer ? (
          <>
            <div className={`hud-item ${livesClass}`}>
              <strong>❤️ Team Lives:</strong> <span>{teamLives}/{maxTeamLives}</span>
            </div>
            <div className="hud-item">
              <strong>🌊 Wave:</strong> <span>{wave}</span>
            </div>
            <div className="hud-item">
              <strong>🧛 Enemies:</strong> <span>{waveEnemiesRemaining}</span>
            </div>
            <div className="hud-item">
              <strong>🎮 Players:</strong> <span>{playerCount}</span>
            </div>
            <div className="hud-item">
              <strong>💀 Kills:</strong> <span>{vampireKills}</span>
            </div>
            <div className="hud-item">
              <strong>Score:</strong> <span id="score">{score}</span>
            </div>
          </>
        ) : (
          <>
            <div className="hud-item">
              <strong>Wave:</strong> <span id="wave">{wave}</span>
            </div>
            <div className="hud-item">
              <strong>Enemies:</strong> <span id="enemies">{enemies}</span>
            </div>
            <div className="hud-item">
              <strong>Kills:</strong> <span id="kills">{kills}</span>
            </div>
            <div className="hud-item">
              <strong>Ammo:</strong> <span id="ammo">∞</span>
            </div>
            <div className="hud-item">
              <strong>Score:</strong> <span id="score">{score}</span>
            </div>
          </>
        )}
      </div>

      {/* Large wave display for multiplayer co-op */}
      {isMultiplayer && (
        <div id="wave-display" className={livesClass}>
          <div className="wave-display-label">WAVE</div>
          <div className="wave-display-value">{wave}</div>
          <div className="wave-display-enemies">{waveEnemiesRemaining} enemies left</div>
        </div>
      )}

      {/* Power-up indicators */}
      {powerUps && powerUps.length > 0 && (
        <div id="powerup-indicators">
          {powerUps.map((powerUp, index) => (
            <div key={index} className={`powerup-indicator powerup-${powerUp.type}`}>
              {powerUp.type === 'speed' && '⚡'}
              {powerUp.type === 'shield' && '🛡️'}
              {powerUp.type === 'fireRate' && '🔥'}
            </div>
          ))}
        </div>
      )}

      <div id="dash-cooldown">
        <div>{dashText}</div>
        <div id="dash-bar">
          <div id="dash-fill" style={{ width: `${dashPercent}%` }}></div>
        </div>
      </div>

      <div id="energy-bar">
        <div>Energy: {Math.floor(dashEnergy)}</div>
        <div id="energy-fill">
          <div id="energy-fill-bar" style={{ width: `${energyPercent}%` }}></div>
        </div>
      </div>
    </>
  );
}
