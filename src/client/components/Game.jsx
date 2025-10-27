import { useRef, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { soundManager } from '../lib/sound.js';
import { multiplayerClient } from '../lib/multiplayer.js';
import HUD from './HUD';
import StartScreen from './StartScreen';
import GameOver from './GameOver';
import UpgradeScreen from './UpgradeScreen';
import TutorialOverlay from './TutorialOverlay';
import PauseMenu from './PauseMenu';
import Controls from './Controls';
import MuteButton from './MuteButton';
import MatchmakingScreen from './MatchmakingScreen';
import MatchEndScreen from './MatchEndScreen';
import StatsModal from './StatsModal';
import './Game.css';

export default function Game() {
  const canvasRef = useRef(null);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const {
    gameState,
    hudData,
    difficultyBadge,
    upgradeOptions,
    tutorialText,
    wasdKeys,
    isPaused,
    isMultiplayer,
    remotePlayers,
    matchState,
    startGame,
    startTutorialMode,
    startMultiplayerGame,
    continTutorial,
    restartGame,
    selectUpgrade,
    performDash,
    togglePause,
  } = useGameLoop(canvasRef, multiplayerClient);

  const handleStartMultiplayer = () => {
    soundManager.play('uiClick');
    setShowMatchmaking(true);
  };

  const handleMatchFound = () => {
    setShowMatchmaking(false);
    startMultiplayerGame();
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);
  };

  return (
    <div id="game-container">
      <canvas ref={canvasRef} id="game-canvas"></canvas>

      <div id="ui-overlay">
        {(gameState === 'playing' || gameState === 'tutorial') && (
          <>
            <HUD {...hudData} isMultiplayer={isMultiplayer} playerCount={remotePlayers.length + 1} />
            <div id="difficulty-badge">{difficultyBadge}</div>
          </>
        )}

        <div id="wave-info"></div>

        {gameState === 'start' && !showMatchmaking && (
          <StartScreen
            onStartGame={startGame}
            onStartTutorial={startTutorialMode}
            onStartMultiplayer={handleStartMultiplayer}
          />
        )}

        {showMatchmaking && (
          <MatchmakingScreen
            onMatchFound={handleMatchFound}
            onCancel={handleCancelMatchmaking}
            multiplayerClient={multiplayerClient}
          />
        )}

        {gameState === 'gameOver' && (
          <GameOver
            wave={hudData.wave}
            kills={hudData.kills}
            score={hudData.score}
            onRestart={restartGame}
            onMainMenu={restartGame}
          />
        )}

        {gameState === 'upgrade' && (
          <UpgradeScreen upgrades={upgradeOptions} onSelectUpgrade={selectUpgrade} />
        )}

        {gameState === 'tutorial' && tutorialText && (
          <TutorialOverlay text={tutorialText} onContinue={continTutorial} />
        )}

        {isPaused && (gameState === 'playing' || gameState === 'tutorial') && (
          <PauseMenu 
            onResume={togglePause} 
            onMainMenu={restartGame}
            onViewStats={() => setShowStats(true)}
          />
        )}

        {showStats && <StatsModal onClose={() => setShowStats(false)} />}

        {matchState && matchState.status === 'finished' && (
          <MatchEndScreen
            winner={matchState.winner}
            players={matchState.players}
            onPlayAgain={handleStartMultiplayer}
            onMainMenu={restartGame}
          />
        )}
      </div>

      <div id="crosshair"></div>

      <Controls performDash={performDash} wasdKeys={wasdKeys} />

      <MuteButton soundManager={soundManager} />
    </div>
  );
}
