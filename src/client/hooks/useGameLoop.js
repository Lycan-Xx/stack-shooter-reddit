import { useEffect, useRef, useState } from 'react';
import { DIFFICULTY } from '../lib/difficulty.js';
import { Vampire, Bullet, Particle, BloodSplatter, FloatingText } from '../lib/entities.js';
import { tutorialSteps, nextTutorialStep, startTutorial } from '../lib/tutorial.js';
import { getRandomUpgrades, applyUpgrade } from '../lib/upgrades.js';
import { soundManager } from '../lib/sound.js';

export function useGameLoop(canvasRef) {
  const [gameState, setGameState] = useState('start');
  const [hudData, setHudData] = useState({
    health: 100,
    maxHealth: 100,
    wave: 1,
    enemies: 0,
    kills: 0,
    score: 0,
    dashEnergy: 100,
    maxDashEnergy: 100,
    dashCooldown: 0,
    maxDashCooldown: 4000,
  });
  const [difficulty, setDifficulty] = useState('normal');
  const [difficultyBadge, setDifficultyBadge] = useState('😐 NORMAL MODE');
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const [tutorialText, setTutorialText] = useState('');
  const [wasdKeys, setWasdKeys] = useState(new Set());

  const gameRef = useRef({
    state: 'start',
    wave: 1,
    kills: 0,
    score: 0,
    paused: false,
    difficulty: 'normal',
    tutorialStep: 0,
    waveInProgress: false,
    waitingForNextWave: false,
    expectedEnemies: 0,
    spawnedEnemies: 0,
    isFirstGame: true,
  });

  const [isPaused, setIsPaused] = useState(false);

  const playerRef = useRef({
    x: 0,
    y: 0,
    radius: 30,
    size: 60,
    health: 100,
    maxHealth: 100,
    speed: 5,
    angle: 0,
    isDashing: false,
    dashCooldown: 0,
    maxDashCooldown: 4000,
    dashDuration: 200,
    dashSpeed: 15,
    dashEnergy: 100,
    maxDashEnergy: 100,
    dashEnergyRegen: 0.5,
    weapon: {
      ammo: 999,
      maxAmmo: 999,
      clipSize: 999,
      damage: 50,
      fireRate: 300,
      reloadTime: 0,
      lastShot: 0,
      isReloading: false,
      piercing: 0,
    },
    upgrades: {},
  });

  const mouseRef = useRef({ x: 0, y: 0, down: false });
  const keysRef = useRef({});
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const particlesRef = useRef([]);
  const bloodSplattersRef = useRef([]);
  const floatingTextsRef = useRef([]);
  const imagesRef = useRef({
    vampire: new Image(),
    player: new Image(),
    heart: new Image(),
  });
  const cursorLockRef = useRef({ locked: false, requested: false });

  useEffect(() => {
    // Load images
    imagesRef.current.vampire.src = 'https://play.rosebud.ai/assets/Vampire Enemy.png?0u3E';
    imagesRef.current.player.src = 'https://play.rosebud.ai/assets/character_idle.png?Poid';
    imagesRef.current.heart.src = 'https://play.rosebud.ai/assets/heart.png?Cn7I';

    // Initialize joystick input
    window.joystickInput = { x: 0, y: 0 };
  }, []);

  const updateHUD = () => {
    const player = playerRef.current;
    const game = gameRef.current;

    setHudData({
      health: player.health,
      maxHealth: player.maxHealth,
      wave: game.wave,
      enemies: enemiesRef.current.length,
      kills: game.kills,
      score: game.score,
      dashEnergy: player.dashEnergy,
      maxDashEnergy: player.maxDashEnergy,
      dashCooldown: player.dashCooldown,
      maxDashCooldown: player.maxDashCooldown,
    });
  };

  const showFloatingText = (x, y, text, color) => {
    floatingTextsRef.current.push(new FloatingText(x, y, text, color));
  };

  const showWaveInfo = (text) => {
    const waveInfo = document.getElementById('wave-info');
    if (waveInfo) {
      waveInfo.textContent = text;
      waveInfo.style.opacity = '1';
      setTimeout(() => {
        waveInfo.style.opacity = '0';
      }, 2000);
    }
  };

  const spawnWave = () => {
    const game = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (game.waveInProgress) return;

    game.waveInProgress = true;
    game.waitingForNextWave = false;

    const diff = DIFFICULTY[game.difficulty];
    const baseEnemies =
      game.state === 'tutorial' && game.tutorialStep < 5 ? 1 : diff.enemiesPerWave;
    const numEnemies = baseEnemies + Math.floor((game.wave - 1) * 0.5);

    game.expectedEnemies = numEnemies;
    game.spawnedEnemies = 0;

    for (let i = 0; i < numEnemies; i++) {
      setTimeout(() => {
        if ((game.state !== 'playing' && game.state !== 'tutorial') || !game.waveInProgress) {
          return;
        }

        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
          case 0:
            x = Math.random() * canvas.width;
            y = -50;
            break;
          case 1:
            x = canvas.width + 50;
            y = Math.random() * canvas.height;
            break;
          case 2:
            x = Math.random() * canvas.width;
            y = canvas.height + 50;
            break;
          case 3:
            x = -50;
            y = Math.random() * canvas.height;
            break;
        }

        const vampire = new Vampire(
          x,
          y,
          game.wave,
          game.difficulty,
          imagesRef.current,
          playerRef.current
        );
        enemiesRef.current.push(vampire);
        game.spawnedEnemies++;
      }, i * 400);
    }

    showWaveInfo(`Wave ${game.wave}`);
  };

  const shoot = () => {
    const player = playerRef.current;
    const mouse = mouseRef.current;
    const game = gameRef.current;
    const now = Date.now();

    if (now - player.weapon.lastShot < player.weapon.fireRate) return;

    player.weapon.lastShot = now;

    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bulletsRef.current.push(
      new Bullet(player.x, player.y, angle, game.difficulty, player.weapon.piercing)
    );

    soundManager.play('shoot');

    for (let i = 0; i < 5; i++) {
      particlesRef.current.push(
        new Particle(player.x + Math.cos(angle) * 20, player.y + Math.sin(angle) * 20, '#ffaa00')
      );
    }

    updateHUD();
  };

  const performDash = () => {
    const player = playerRef.current;
    const game = gameRef.current;

    if (
      (game.state === 'playing' || game.state === 'tutorial') &&
      player.dashEnergy >= 50 &&
      !player.isDashing
    ) {
      player.isDashing = true;
      player.dashEnergy = Math.max(0, player.dashEnergy - 50);
      player.dashCooldown = player.maxDashCooldown;

      soundManager.play('dash');

      for (let i = 0; i < 20; i++) {
        particlesRef.current.push(new Particle(player.x, player.y, '#4a90e2'));
      }

      setTimeout(() => {
        player.isDashing = false;
      }, player.dashDuration);

      updateHUD();
      return true;
    }
    return false;
  };

  const gameOver = () => {
    const game = gameRef.current;
    game.state = 'gameOver';
    setGameState('gameOver');
    soundManager.play('gameOver');
    soundManager.stopMusic();
  };

  const showUpgradeScreen = () => {
    const player = playerRef.current;
    const upgrades = getRandomUpgrades(player.upgrades, 3);
    setUpgradeOptions(upgrades);
    setGameState('upgrade');
  };

  const selectUpgrade = (upgradeKey) => {
    const player = playerRef.current;
    const game = gameRef.current;

    applyUpgrade(player, player.upgrades, upgradeKey);
    setGameState('playing');
    game.state = 'playing';

    setTimeout(() => {
      game.wave++;
      updateHUD();
      spawnWave();
    }, 500);
  };

  const initGame = () => {
    const game = gameRef.current;
    const player = playerRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    game.state = 'playing';
    game.wave = 1;
    game.kills = 0;
    game.score = 0;
    game.waveInProgress = false;
    game.waitingForNextWave = false;
    game.expectedEnemies = 0;
    game.spawnedEnemies = 0;

    const diff = DIFFICULTY[game.difficulty];
    player.health = diff.playerHealth;
    player.maxHealth = diff.playerHealth;
    player.speed = diff.playerSpeed;
    player.weapon.damage = diff.playerDamage;
    player.weapon.fireRate = diff.fireRate;
    player.maxDashCooldown = diff.dashCooldown;
    player.weapon.piercing = 0;
    player.dashCooldown = 0;
    player.isDashing = false;
    player.dashEnergy = player.maxDashEnergy;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    bulletsRef.current.length = 0;
    enemiesRef.current.length = 0;
    particlesRef.current.length = 0;
    bloodSplattersRef.current.length = 0;
    floatingTextsRef.current.length = 0;

    updateHUD();
    spawnWave();
  };

  const startGame = (selectedDifficulty) => {
    const game = gameRef.current;

    soundManager.play('uiClick');
    game.difficulty = selectedDifficulty;
    setDifficulty(selectedDifficulty);

    const badges = {
      easy: '😊 EASY MODE',
      normal: '😐 NORMAL MODE',
      hard: '😰 HARD MODE',
      nightmare: '💀 NIGHTMARE MODE',
    };
    setDifficultyBadge(badges[selectedDifficulty]);

    setGameState('playing');
    game.state = 'playing';
    initGame();
    soundManager.playMusic();
  };

  const startTutorialMode = () => {
    const game = gameRef.current;

    soundManager.play('uiClick');
    game.state = 'tutorial';
    game.difficulty = 'tutorial';
    game.tutorialStep = 0;
    setGameState('tutorial');
    setDifficulty('tutorial');
    setDifficultyBadge('📚 TUTORIAL');

    initGame();
    soundManager.playMusic();
    setTutorialText(tutorialSteps[0].text);
  };

  const continTutorial = () => {
    const game = gameRef.current;
    const player = playerRef.current;

    soundManager.play('uiClick');
    game.tutorialStep++;

    if (game.tutorialStep >= tutorialSteps.length) {
      setGameState('playing');
      game.state = 'playing';
      game.difficulty = 'easy';
      game.wave = 1;
      game.waveInProgress = false;
      game.waitingForNextWave = false;
      setDifficulty('easy');
      setDifficultyBadge('😊 EASY MODE');

      const diff = DIFFICULTY['easy'];
      player.maxHealth = diff.playerHealth;
      player.health = diff.playerHealth;
      player.speed = diff.playerSpeed;
      player.weapon.fireRate = diff.fireRate;
      player.maxDashCooldown = diff.dashCooldown;

      updateHUD();
      spawnWave();
      return;
    }

    const step = tutorialSteps[game.tutorialStep];
    setTutorialText(step.text);
  };

  const restartGame = () => {
    soundManager.play('uiClick');
    setGameState('start');
    gameRef.current.state = 'start';
    setIsPaused(false);
    gameRef.current.paused = false;
  };

  const togglePause = () => {
    const game = gameRef.current;
    
    if (game.state !== 'playing' && game.state !== 'tutorial') {
      return;
    }

    game.paused = !game.paused;
    setIsPaused(game.paused);
    soundManager.play('uiClick');

    if (game.paused) {
      soundManager.stopMusic();
    } else {
      soundManager.playMusic();
    }
  };

  const update = () => {
    const game = gameRef.current;
    const player = playerRef.current;
    const canvas = canvasRef.current;
    const mouse = mouseRef.current;
    const keys = keysRef.current;

    if (!canvas || (game.state !== 'playing' && game.state !== 'tutorial') || game.paused) return;

    if (player.dashCooldown > 0) {
      player.dashCooldown = Math.max(0, player.dashCooldown - 16);
      updateHUD();
    }

    if (player.dashEnergy < player.maxDashEnergy) {
      player.dashEnergy = Math.min(
        player.maxDashEnergy,
        player.dashEnergy + player.dashEnergyRegen
      );
      updateHUD();
    }

    const joystickInput = window.joystickInput || { x: 0, y: 0 };

    let moveX =
      (keys['d'] || keys['D'] || keys['arrowright'] ? 1 : 0) -
      (keys['a'] || keys['A'] || keys['arrowleft'] ? 1 : 0);
    let moveY =
      (keys['s'] || keys['S'] || keys['arrowdown'] ? 1 : 0) -
      (keys['w'] || keys['W'] || keys['arrowup'] ? 1 : 0);

    if (Math.abs(joystickInput.x) > 0.2 || Math.abs(joystickInput.y) > 0.2) {
      moveX = joystickInput.x;
      moveY = joystickInput.y;
    }

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      const currentSpeed = player.isDashing ? player.dashSpeed : player.speed;
      player.x += (moveX / length) * currentSpeed;
      player.y += (moveY / length) * currentSpeed;

      if (player.isDashing) {
        particlesRef.current.push(new Particle(player.x, player.y, '#4a90e2'));
      }

      const margin = player.size / 2 + 5;
      player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
      player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
    }

    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    if (mouse.down) {
      shoot();
    }

    const bullets = bulletsRef.current;
    const enemies = enemiesRef.current;
    const particles = particlesRef.current;
    const bloodSplatters = bloodSplattersRef.current;
    const floatingTexts = floatingTextsRef.current;

    for (let i = bullets.length - 1; i >= 0; i--) {
      if (!bullets[i].update(canvas)) {
        bullets.splice(i, 1);
      }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bullet.radius + enemy.radius) {
          const killed = enemy.hit(bullet.damage);

          if (killed) {
            soundManager.play('enemyDeath');
            soundManager.play('scorePoint');
            game.kills++;
            game.score += enemy.scoreValue;
            enemies.splice(j, 1);

            bloodSplatters.push(new BloodSplatter(enemy.x, enemy.y));

            for (let k = 0; k < 15; k++) {
              particles.push(new Particle(enemy.x, enemy.y, '#8b0000'));
            }

            showFloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, '#ffff00');
          } else {
            soundManager.play('enemyHit');
          }

          if (!bullet.piercing || bullet.piercing <= 0) {
            bullets.splice(i, 1);
            updateHUD();
            break;
          } else {
            bullet.piercing--;
          }

          updateHUD();
        }
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i]) {
        enemies[i].update(canvas, updateHUD, gameOver);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update()) {
        particles.splice(i, 1);
      }
    }

    for (let i = bloodSplatters.length - 1; i >= 0; i--) {
      if (!bloodSplatters[i].update()) {
        bloodSplatters.splice(i, 1);
      }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      if (!floatingTexts[i].update()) {
        floatingTexts.splice(i, 1);
      }
    }

    const allEnemiesSpawned = game.spawnedEnemies >= game.expectedEnemies;
    if (
      enemies.length === 0 &&
      game.waveInProgress &&
      !game.waitingForNextWave &&
      allEnemiesSpawned &&
      (game.state === 'playing' || game.state === 'tutorial')
    ) {
      game.waveInProgress = false;
      game.waitingForNextWave = true;

      player.health = player.maxHealth;
      updateHUD();

      soundManager.play('waveComplete');
      const bonus = 50 * DIFFICULTY[game.difficulty].scoreMultiplier;
      if (bonus > 0) {
        game.score += bonus;
        updateHUD();
        showFloatingText(
          canvas.width / 2,
          canvas.height / 2,
          `Wave Complete! +${bonus}`,
          '#4CAF50'
        );
      } else {
        showFloatingText(canvas.width / 2, canvas.height / 2, `Wave Complete!`, '#4CAF50');
      }

      if (game.wave % 3 === 0 && game.state === 'playing') {
        showUpgradeScreen();
      } else {
        setTimeout(() => {
          if ((game.state === 'playing' || game.state === 'tutorial') && game.waitingForNextWave) {
            game.wave++;
            game.waitingForNextWave = false;
            updateHUD();

            if (game.state === 'tutorial') {
              continTutorial();
            } else {
              spawnWave();
            }
          }
        }, 2000);
      }
    }
  };

  const draw = () => {
    const game = gameRef.current;
    const player = playerRef.current;
    const canvas = canvasRef.current;
    const mouse = mouseRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (game.state === 'playing' || game.state === 'tutorial') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      if (imagesRef.current.player.complete) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        ctx.drawImage(
          imagesRef.current.player,
          -player.size / 2,
          -player.size / 2,
          player.size,
          player.size
        );
        ctx.restore();
      } else {
        ctx.fillStyle = '#4a90e2';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      bulletsRef.current.forEach((bullet) => bullet.draw(ctx));
      enemiesRef.current.forEach((enemy) => enemy.draw(ctx));
      particlesRef.current.forEach((particle) => particle.draw(ctx));
      bloodSplattersRef.current.forEach((splatter) => splatter.draw(ctx));
      floatingTextsRef.current.forEach((text) => text.draw(ctx));
    }
  };

  useEffect(() => {
    let animationId;

    const gameLoop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const player = playerRef.current;
      if (player.x && player.y) {
        const margin = player.size / 2 + 5;
        player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
        player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (e) => {
      keysRef.current[e.key] = true;
      keysRef.current[e.key.toLowerCase()] = true;

      setWasdKeys((prev) => new Set([...prev, e.code]));

      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (performDash()) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
      keysRef.current[e.key.toLowerCase()] = false;
      setWasdKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.code);
        return newSet;
      });
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      const crosshair = document.getElementById('crosshair');
      if (crosshair) {
        crosshair.style.left = e.clientX + 'px';
        crosshair.style.top = e.clientY + 'px';
      }
    };

    const handleMouseDown = () => {
      mouseRef.current.down = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.down = false;
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const joystickContainer = document.getElementById('joystick-container');
      const dashButton = document.getElementById('mobile-dash');

      if (joystickContainer && dashButton) {
        const joystickRect = joystickContainer.getBoundingClientRect();
        const dashRect = dashButton.getBoundingClientRect();

        const touchX = touch.clientX;
        const touchY = touch.clientY;

        const isOnJoystick =
          touchX >= joystickRect.left &&
          touchX <= joystickRect.right &&
          touchY >= joystickRect.top &&
          touchY <= joystickRect.bottom;
        const isOnDash =
          touchX >= dashRect.left &&
          touchX <= dashRect.right &&
          touchY >= dashRect.top &&
          touchY <= dashRect.bottom;

        if (!isOnJoystick && !isOnDash) {
          const rect = canvas.getBoundingClientRect();
          mouseRef.current.x = touch.clientX - rect.left;
          mouseRef.current.y = touch.clientY - rect.top;
          mouseRef.current.down = true;
        }
      }
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        mouseRef.current.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return {
    gameState,
    hudData,
    difficulty,
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
  };
}
