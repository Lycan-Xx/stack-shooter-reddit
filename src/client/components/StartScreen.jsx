import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import './StartScreen.css';

export default function StartScreen({ onStartGame, onStartTutorial, onStartMultiplayer }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [communityStats, setCommunityStats] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [communityRes, playerRes] = await Promise.all([
        fetch('/api/stats/community'),
        fetch('/api/stats/player')
      ]);
      
      const communityData = await communityRes.json();
      const playerData = await playerRes.json();
      
      if (communityData.success) {
        setCommunityStats(communityData.stats);
      }
      
      if (playerData.success) {
        setPlayerStats(playerData.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <div id="start-screen">
        <h1>🧛 Vampire Siege</h1>
        <p>
          Defend against endless hordes of vampires in this intense top-down shooter! Survive waves,
          collect upgrades, and hold your ground against the undead!
        </p>

        {/* Quick Stats Display */}
        {communityStats && (
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-icon">🧛</span>
              <span className="stat-value">{formatNumber(communityStats.totalVampiresKilled)}</span>
              <span className="stat-label">Vampires Slain</span>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">⚔️</span>
              <span className="stat-value">{formatNumber(communityStats.totalMatches)}</span>
              <span className="stat-label">Battles Fought</span>
            </div>
            {playerStats && (
              <div className="quick-stat highlight">
                <span className="stat-icon">🏆</span>
                <span className="stat-value">{playerStats.totalWins}</span>
                <span className="stat-label">Your Wins</span>
              </div>
            )}
          </div>
        )}

        <div className="menu-buttons">
          <button className="btn multiplayer-btn" onClick={onStartMultiplayer}>
            🎮 Multiplayer (2-12 Players)
          </button>

          <button className="btn leaderboard-btn" onClick={() => setShowLeaderboard(true)}>
            🏆 View Leaderboards
          </button>

          <button className="btn tutorial-btn-menu" onClick={onStartTutorial}>
            📚 Play Tutorial
          </button>

          <p style={{ fontSize: '18px', margin: '20px 0 10px 0' }}>Solo Play - Select Difficulty:</p>
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

      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </>
  );
}
