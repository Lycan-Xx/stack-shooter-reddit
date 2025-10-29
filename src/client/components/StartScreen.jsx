import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import DailyChallenge from './DailyChallenge';
import SquadManager from './SquadManager';
import DifficultySelect from './DifficultySelect';
import './StartScreen.css';

export default function StartScreen({ onStartGame, onStartTutorial }) {
  const [view, setView] = useState('main'); // main, difficulty, leaderboard, challenge, squads
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showSquads, setShowSquads] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
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

  // Show difficulty select screen
  if (view === 'difficulty') {
    return (
      <DifficultySelect
        onSelectDifficulty={(difficulty) => {
          setView('main');
          onStartGame(difficulty);
        }}
        onBack={() => setView('main')}
      />
    );
  }

  return (
    <>
      <div id="start-screen">
        <div className="header-section">
          <h1 className="game-title">🧛 Vampire Siege</h1>
          <p className="game-description">
            Defend against endless waves of vampires in this intense top-down shooter!
          </p>
        </div>

        {/* Community Stats */}
        {communityStats && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🧛</span>
                <span className="stat-value">{formatNumber(communityStats.totalVampiresKilled)}</span>
                <span className="stat-label">Vampires Slain</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚔️</span>
                <span className="stat-value">{formatNumber(communityStats.totalMatches)}</span>
                <span className="stat-label">Battles Fought</span>
              </div>
              {playerStats && (
                <div className="stat-card personal">
                  <span className="stat-icon">🏆</span>
                  <span className="stat-value">{playerStats.bestScore.toLocaleString()}</span>
                  <span className="stat-label">Your Best</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Menu Buttons */}
        <div className="main-menu">
          <button className="menu-btn primary" onClick={() => setView('difficulty')}>
            <span className="btn-icon">🎮</span>
            <span className="btn-text">Solo Play</span>
            <span className="btn-subtitle">Choose your difficulty</span>
          </button>

          <button className="menu-btn challenge" onClick={() => setShowChallenge(true)}>
            <span className="btn-icon">📅</span>
            <span className="btn-text">Daily Challenge</span>
            <span className="btn-subtitle">Today's special modifiers</span>
          </button>

          <button className="menu-btn tutorial" onClick={onStartTutorial}>
            <span className="btn-icon">📚</span>
            <span className="btn-text">Tutorial</span>
            <span className="btn-subtitle">Learn the basics</span>
          </button>

          <div className="menu-row">
            <button className="menu-btn secondary" onClick={() => setShowSquads(true)}>
              <span className="btn-icon">👥</span>
              <span className="btn-text">Squads</span>
            </button>

            <button className="menu-btn secondary" onClick={() => setShowLeaderboard(true)}>
              <span className="btn-icon">🏆</span>
              <span className="btn-text">Leaderboards</span>
            </button>
          </div>

          <button className="menu-btn info" onClick={() => setShowHowToPlay(true)}>
            <span className="btn-icon">❓</span>
            <span className="btn-text">How to Play</span>
          </button>
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
      {showSquads && <SquadManager onClose={() => setShowSquads(false)} />}
      
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="how-to-play-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 How to Play</h2>
              <button className="close-btn" onClick={() => setShowHowToPlay(false)}>✕</button>
            </div>
            <div className="modal-content">
              <section>
                <h3>🎯 Objective</h3>
                <p>Survive as many waves as possible. Clear all vampires to complete each wave and unlock powerful upgrades every 3 waves!</p>
              </section>
              
              <section>
                <h3>🎮 Controls</h3>
                <div className="controls-grid">
                  <div className="control-item">
                    <strong>Desktop:</strong>
                    <p>WASD/Arrows to move<br/>Mouse to aim<br/>Click to shoot<br/>Space to dash</p>
                  </div>
                  <div className="control-item">
                    <strong>Mobile:</strong>
                    <p>Joystick to move<br/>Tap to shoot<br/>Dash button to dash</p>
                  </div>
                </div>
              </section>
              
              <section>
                <h3>⚡ Upgrades</h3>
                <p>Every 3 waves, choose from 3 random upgrades:</p>
                <ul>
                  <li>❤️ <strong>Vitality</strong> - Increase max health</li>
                  <li>💥 <strong>Firepower</strong> - Increase damage</li>
                  <li>⚡ <strong>Rapid Fire</strong> - Shoot faster</li>
                  <li>🏃 <strong>Agility</strong> - Move faster</li>
                  <li>💨 <strong>Quick Dash</strong> - Dash more often</li>
                  <li>🎯 <strong>Piercing Shots</strong> - Bullets pierce enemies</li>
                </ul>
              </section>
              
              <section>
                <h3>🏆 Community Features</h3>
                <ul>
                  <li><strong>Daily Challenges</strong> - Compete with unique modifiers</li>
                  <li><strong>Squads</strong> - Team up and combine scores</li>
                  <li><strong>Leaderboards</strong> - Global, Subreddit, Daily, Weekly</li>
                </ul>
              </section>
              
              <section>
                <h3>💡 Pro Tips</h3>
                <ul>
                  <li>Use dash strategically to escape when surrounded</li>
                  <li>Keep moving to avoid getting cornered</li>
                  <li>Balance offensive and defensive upgrades</li>
                  <li>Watch your dash energy - it regenerates over time</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
