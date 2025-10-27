import { useState } from 'react';
import './PauseMenu.css';

export default function PauseMenu({ onResume, onMainMenu, onViewStats }) {
  return (
    <div id="pause-menu">
      <div className="pause-content">
        <h2>⏸️ PAUSED</h2>
        <p>Press ESC to resume</p>
        <div className="pause-buttons">
          <button className="btn pause-btn" onClick={onResume}>
            ▶️ Resume Game
          </button>
          {onViewStats && (
            <button className="btn pause-btn" onClick={onViewStats}>
              📊 View Stats
            </button>
          )}
          <button className="btn pause-btn secondary" onClick={onMainMenu}>
            🏠 Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
