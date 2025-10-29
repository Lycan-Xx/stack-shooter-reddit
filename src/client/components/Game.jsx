import { useRef, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { soundManager } from '../lib/sound.js';
import HUD from './HUD';
import StartScreen from './StartScreen';
import GameOver from './GameOver';
import UpgradeScreen from './UpgradeScreen';
import TutorialOverlay from './TutorialOverlay';
import PauseMenu from './PauseMenu';
import Controls from './Controls';
import MuteButton from './MuteButton';
import StatsModal from './StatsModal';
import './Game.css';

export default function Game() {
  const canvasRef = useRef(null);
  const [showStats, setShowStats] = useState(false);

  const {
    gameState,
    hudData,
    difficultyBadge,
    upgradeOptions,
    tutorialText,
    wasdKeys,
    isPaused,
    startGame,
    startTutorialMode,
    continTutorial,
    restartGame,
    selectUpgrade,
    performDash,
    togglePause,
  } = useGameLoop(canvasRef);

  return (
    <div id="game-container">
      <canvas ref={canvasRef} id="game-canvas"></canvas>

      <div id="ui-overlay">
        {(gameState === 'playing' || gameState === 'tutorial') && (
          <>
            <HUD {...hudData} />
            <div id="difficulty-badge">{difficultyBadge}</div>
          </>
        )}

        <div id="wave-info"></div>

        {gameState === 'start' && (
          <StartScreen
            onStartGame={startGame}
            onStartTutorial={startTutorialMode}
          />
        )}

        {gameState === 'gameOver' && (
          <GameOver
            wave={hudData.wave}
            kills={hudData.kills}
            score={hudData.score}
            difficulty={hudData.difficulty || 'normal'}
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

        {isPaused && (gameState === 'playing' || gameState === 'tutorial') && !showStats && (
          <PauseMenu 
            onResume={togglePause} 
            onExit={() => setShowStats(true)}
          />
        )}

        {showStats && (
          <StatsModal 
            onClose={() => {
              setShowStats(false);
              restartGame();
            }} 
          />
        )}
      </div>

      <div id="crosshair"></div>

      <Controls performDash={performDash} wasdKeys={wasdKeys} />

      <MuteButton soundManager={soundManager} />
    </div>
  );
}
