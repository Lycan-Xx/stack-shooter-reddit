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
  timeRemaining = 0,
  vampireKills = 0,
  playerKills = 0,
  powerUps = [],
}) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const energyPercent = Math.max(0, Math.min(100, (dashEnergy / maxDashEnergy) * 100));
  const dashPercent = Math.max(0, Math.min(100, 100 - (dashCooldown / maxDashCooldown) * 100));
  const dashText =
    dashCooldown <= 0 ? 'DASH READY' : `COOLDOWN: ${Math.ceil(dashCooldown / 1000)}s`;

  // Format time remaining (MM:SS)
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

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
            <div className="hud-item timer-display">
              <strong>⏱️ Time:</strong> <span className="timer-text">{timeText}</span>
            </div>
            <div className="hud-item">
              <strong>🎮 Players:</strong> <span>{playerCount}</span>
            </div>
            <div className="hud-item">
              <strong>👤 Kills:</strong> <span>{playerKills}</span>
            </div>
            <div className="hud-item">
              <strong>🧛 Vampires:</strong> <span>{vampireKills}</span>
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
