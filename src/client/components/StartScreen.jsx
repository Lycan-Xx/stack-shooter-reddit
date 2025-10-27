import './StartScreen.css';

export default function StartScreen({ onStartGame, onStartTutorial }) {
  return (
    <div id="start-screen">
      <h1>🧛 Vampire Siege</h1>
      <p>
        Defend against endless hordes of vampires in this intense top-down shooter! Survive waves,
        collect upgrades, and hold your ground against the undead!
      </p>

      <div className="menu-buttons">
        <button className="btn tutorial-btn-menu" onClick={onStartTutorial}>
          📚 Play Tutorial
        </button>

        <p style={{ fontSize: '18px', margin: '20px 0 10px 0' }}>Select Difficulty:</p>
        <div className="difficulty-buttons">
          <button className="btn difficulty-btn" onClick={() => onStartGame('easy')}>
            😊 Easy
          </button>
          <button className="btn difficulty-btn" onClick={() => onStartGame('normal')}>
            😐 Normal
          </button>
          <button className="btn difficulty-btn" onClick={() => onStartGame('hard')}>
            😰 Hard
          </button>
          <button className="btn difficulty-btn" onClick={() => onStartGame('nightmare')}>
            💀 Nightmare
          </button>
        </div>
      </div>

      <div className="controls">
        <div className="desktop-only">
          Controls: WASD/Arrows to move | Mouse to aim | Click to shoot | Spacebar to dash
        </div>
        <div className="mobile-only">
          Tap anywhere to shoot | Use joystick to move | Tap dash button to dash
        </div>
      </div>
    </div>
  );
}
