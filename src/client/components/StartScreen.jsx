import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import DailyChallenge from './DailyChallenge';
import './StartScreen.css';

export default function StartScreen({ onStartGame, onStartTutorial }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
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
        <div className="header-section">
          <h1 className="game-title">Stack Shooter</h1>
          <h2 className="game-subtitle">Vampire Siege</h2>
          <p className="game-description">
            A top-down survival shooter where you defend against endless waves of vampires.
            Shoot, dash, and upgrade your way through the undead horde!
          </p>
        </div>

        {/* Community Stats */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">🧛</span>
              <span className="stat-value">{formatNumber(communityStats?.totalVampiresKilled || 0)}</span>
              <span className="stat-label">Vampires Slain</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⚔️</span>
              <span className="stat-value">{formatNumber(communityStats?.totalMatches || 0)}</span>
              <span className="stat-label">Battles Fought</span>
            </div>
            {playerStats && (
              <div className="stat-card personal">
                <span className="stat-icon">🏆</span>
                <span className="stat-value">{playerStats.totalWins}</span>
                <span className="stat-label">Your Wins</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Modes */}
        <div className="modes-section">
          <h3 className="section-title">Game Modes</h3>
          <div className="mode-buttons">
            <button className="mode-btn challenge" onClick={() => setShowChallenge(true)}>
              <span className="mode-icon">📅</span>
              <span className="mode-text">Daily Challenge</span>
            </button>
            <button className="mode-btn tutorial" onClick={onStartTutorial}>
              <span className="mode-icon">📚</span>
              <span className="mode-text">Tutorial</span>
            </button>
            <button className="mode-btn leaderboard" onClick={() => setShowLeaderboard(true)}>
              <span className="mode-icon">🏆</span>
              <span className="mode-text">Leaderboards</span>
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="difficulty-section">
          <h3 className="section-title">Select Difficulty</h3>
          <div className="difficulty-grid">
            <button className="difficulty-card easy" onClick={() => onStartGame('easy')}>
              <span className="difficulty-icon">😊</span>
              <span className="difficulty-name">Easy</span>
            </button>
            <button className="difficulty-card normal" onClick={() => onStartGame('normal')}>
              <span className="difficulty-icon">😐</span>
              <span className="difficulty-name">Normal</span>
            </button>
            <button className="difficulty-card hard" onClick={() => onStartGame('hard')}>
              <span className="difficulty-icon">😰</span>
              <span className="difficulty-name">Hard</span>
            </button>
            <button className="difficulty-card nightmare" onClick={() => onStartGame('nightmare')}>
              <span className="difficulty-icon">💀</span>
              <span className="difficulty-name">Nightmare</span>
            </button>
          </div>
        </div>

        {/* Controls Info */}
        <div className="controls-section">
          <div className="desktop-only">
            <span className="controls-label">Controls:</span> WASD/Arrows • Mouse Aim • Click to Shoot • Space to Dash
          </div>
          <div className="mobile-only">
            <span className="controls-label">Controls:</span> Joystick to Move • Tap to Shoot • Dash Button
          </div>
        </div>
      </div>

      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showChallenge && (
        <DailyChallenge
          onClose={() => setShowChallenge(false)}
          onStartChallenge={(challenge) => onStartGame('challenge', challenge)}
        />
      )}
    </>
  );
}
