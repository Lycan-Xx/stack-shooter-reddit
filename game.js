// Vampire Hunter Game
import { DIFFICULTY } from './js/difficulty.js';
import { Vampire, Bullet, Particle, BloodSplatter, FloatingText } from './js/entities.js';
import { tutorialSteps, nextTutorialStep, startTutorial } from './js/tutorial.js';
import { getRandomUpgrades, applyUpgrade } from './js/upgrades.js';
import { soundManager } from './js/sound.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
// Load assets
const images = {
    vampire: new Image(),
    player: new Image(),
    heart: new Image()
};
images.vampire.src = 'https://play.rosebud.ai/assets/Vampire Enemy.png?0u3E';
images.player.src = 'https://play.rosebud.ai/assets/character_idle.png?Poid';
images.heart.src = 'https://play.rosebud.ai/assets/heart.png?Cn7I';
let imagesLoaded = 0;
const totalImages = 3;
Object.values(images).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
    };
});
// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (typeof player !== 'undefined' && player.x && player.y) {
        const margin = player.size / 2 + 5;
        player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
        player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
    }
}
window.addEventListener('resize', resizeCanvas);
// Game state
const game = {
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
    isFirstGame: true
};

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
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
    dashEnergy: 100, // Energy for dashing (0-100)
    maxDashEnergy: 100,
    dashEnergyRegen: 0.5, // Energy regen per frame
    weapon: {
        ammo: 999,
        maxAmmo: 999,
        clipSize: 999,
        damage: 50,
        fireRate: 300, // ms between shots
        reloadTime: 0,
        lastShot: 0,
        isReloading: false,
        piercing: 0
    },
    upgrades: {}
};
// Initial canvas resize now that player is defined
resizeCanvas();
// Input
const keys = {};
const mouse = {
    x: 0,
    y: 0,
    down: false
};

// Cursor lock state
let isCursorLocked = false;
let cursorLockRequested = false;

// Cursor lock functions
function requestCursorLock() {
    if (!isCursorLocked && (game.state === 'playing' || game.state === 'tutorial')) {
        cursorLockRequested = true;
        canvas.requestPointerLock().catch(err => {
            console.log('Cursor lock failed:', err);
            cursorLockRequested = false;
        });
    }
}

function exitCursorLock() {
    if (isCursorLocked) {
        document.exitPointerLock();
    }
}

// Handle cursor lock state changes
document.addEventListener('pointerlockchange', () => {
    isCursorLocked = (document.pointerLockElement === canvas);
    cursorLockRequested = false;

    if (isCursorLocked) {
        console.log('Cursor locked to game');
    } else {
        console.log('Cursor unlocked from game');
    }
});

document.addEventListener('pointerlockerror', () => {
    console.log('Cursor lock error');
    cursorLockRequested = false;
    isCursorLocked = false;
});

// Game objects
const bullets = [];
const enemies = [];
const particles = [];
const bloodSplatters = [];
const floatingTexts = [];

function showFloatingText(x, y, text, color) {
    floatingTexts.push(new FloatingText(x, y, text, color));
}

// Spawn enemies
function spawnWave() {
    // Prevent multiple wave spawns (only check waveInProgress)
    if (game.waveInProgress) {
        console.log('Wave spawn blocked - wave already in progress');
        return;
    }
    
    game.waveInProgress = true;
    game.waitingForNextWave = false;
    
    const diff = DIFFICULTY[game.difficulty];
    const baseEnemies = game.state === 'tutorial' && game.tutorialStep < 5 ? 1 : diff.enemiesPerWave;
    // More balanced wave scaling: slower growth
    const numEnemies = baseEnemies + Math.floor((game.wave - 1) * 0.5);
    
    console.log(`Spawning wave ${game.wave} with ${numEnemies} enemies in ${game.difficulty} mode`);
    
    // Track how many enemies we're expecting to spawn
    game.expectedEnemies = numEnemies;
    game.spawnedEnemies = 0;
    
    for (let i = 0; i < numEnemies; i++) {
        setTimeout(() => {
            // Only spawn if game is still active and wave is in progress
            if ((game.state !== 'playing' && game.state !== 'tutorial') || !game.waveInProgress) {
                console.log('Spawn cancelled:', { state: game.state, waveInProgress: game.waveInProgress });
                return;
            }
            
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
                case 0: // top
                    x = Math.random() * canvas.width;
                    y = -50;
                    break;
                case 1: // right
                    x = canvas.width + 50;
                    y = Math.random() * canvas.height;
                    break;
                case 2: // bottom
                    x = Math.random() * canvas.width;
                    y = canvas.height + 50;
                    break;
                case 3: // left
                    x = -50;
                    y = Math.random() * canvas.height;
                    break;
            }
            
            const vampire = new Vampire(x, y, game.wave, game.difficulty, images, player);
            enemies.push(vampire);
            game.spawnedEnemies++;
            console.log(`Spawned vampire ${game.spawnedEnemies}/${game.expectedEnemies} at (${x}, ${y}), total enemies: ${enemies.length}`);
        }, i * 400);
    }
    
    showWaveInfo(`Wave ${game.wave}`);
}

let waveInfoTimeout = null;

function showWaveInfo(text) {
    const waveInfo = document.getElementById('wave-info');
    
    // Clear any existing timeout to prevent stacking
    if (waveInfoTimeout) {
        clearTimeout(waveInfoTimeout);
    }
    
    waveInfo.textContent = text;
    waveInfo.style.opacity = '1';
    
    waveInfoTimeout = setTimeout(() => {
        waveInfo.style.opacity = '0';
        waveInfoTimeout = null;
    }, 2000);
}

// Shooting
function shoot() {
    const now = Date.now();
    
    if (now - player.weapon.lastShot < player.weapon.fireRate) return;
    
    player.weapon.lastShot = now;
    
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push(new Bullet(player.x, player.y, angle, game.difficulty, player.weapon.piercing));
    
    // Play shoot sound
    soundManager.play('shoot');
    
    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(
            player.x + Math.cos(angle) * 20,
            player.y + Math.sin(angle) * 20,
            '#ffaa00'
        ));
    }
    
    updateHUD();
}

function reload() {
    // No reloading needed with infinite ammo
    return;
}

// Update HUD
function updateHUD() {
    const healthPercent = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent =
        `${Math.max(0, Math.floor(player.health))} / ${player.maxHealth}`;
    document.getElementById('wave').textContent = game.wave;
    document.getElementById('enemies').textContent = enemies.length;
    document.getElementById('kills').textContent = game.kills;
    document.getElementById('ammo').textContent = '∞';
    document.getElementById('score').textContent = game.score;

    // Update energy bar
    const energyPercent = Math.max(0, Math.min(100, (player.dashEnergy / player.maxDashEnergy) * 100));
    document.getElementById('energy-fill-bar').style.width = `${energyPercent}%`;
    document.getElementById('energy-text').textContent = Math.floor(player.dashEnergy);

    // Update dash cooldown (inverted - full when ready, empty when on cooldown)
    const dashPercent = Math.max(0, Math.min(100, 100 - (player.dashCooldown / player.maxDashCooldown * 100)));
    document.getElementById('dash-fill').style.width = `${dashPercent}%`;

    // Update dash text
    const dashText = player.dashCooldown <= 0 ? 'DASH READY' : `COOLDOWN: ${Math.ceil(player.dashCooldown / 1000)}s`;
    document.querySelector('#dash-cooldown > div').textContent = dashText;
}

// Initialize global key tracking for WASD visual feedback
if (!window.wasdKeys) {
    window.wasdKeys = new Set();
}

// Dash function that can be called from keyboard or mobile
function performDash() {
    if ((game.state === 'playing' || game.state === 'tutorial') &&
        player.dashEnergy >= 50 && !player.isDashing) { // Need at least 50% energy to dash
        player.isDashing = true;
        player.dashEnergy = Math.max(0, player.dashEnergy - 50); // Consume 50 energy
        player.dashCooldown = player.maxDashCooldown;

        // Play dash sound
        soundManager.play('dash');

        // Dash particles
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(player.x, player.y, '#4a90e2'));
        }

        setTimeout(() => {
            player.isDashing = false;
        }, player.dashDuration);

        updateHUD();
        return true;
    }
    return false;
}

// Make dash function globally accessible for mobile controls
window.performDash = performDash;

// Input handlers
window.addEventListener('keydown', (e) => {
    // Store both original and lowercase to handle all cases
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;

    // Track for WASD visual feedback
    window.wasdKeys.add(e.code);

    // Cursor lock/unlock (Ctrl+L)
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        if (isCursorLocked) {
            exitCursorLock();
        } else {
            requestCursorLock();
        }
        return;
    }

    // Escape to unlock cursor
    if (e.key === 'Escape' && isCursorLocked) {
        exitCursorLock();
        return;
    }

    // Dash
    if (e.key === ' ' || e.code === 'Space') {
        if (performDash()) {
            e.preventDefault();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
    
    // Track for WASD visual feedback
    window.wasdKeys.delete(e.code);
});

window.addEventListener('mousemove', (e) => {
    if (isCursorLocked) {
        // When cursor is locked, use movement deltas
        mouse.x += e.movementX;
        mouse.y += e.movementY;

        // Keep mouse position within canvas bounds
        mouse.x = Math.max(0, Math.min(canvas.width, mouse.x));
        mouse.y = Math.max(0, Math.min(canvas.height, mouse.y));

        // Update crosshair position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const crosshair = document.getElementById('crosshair');
        crosshair.style.left = (rect.left + mouse.x) + 'px';
        crosshair.style.top = (rect.top + mouse.y) + 'px';
    } else {
        // Normal mouse tracking when cursor is not locked
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        const crosshair = document.getElementById('crosshair');
        crosshair.style.left = e.clientX + 'px';
        crosshair.style.top = e.clientY + 'px';
    }
});

window.addEventListener('mousedown', () => {
    mouse.down = true;
});

window.addEventListener('mouseup', () => {
    mouse.down = false;
});

// Touch support for mobile shooting
canvas.addEventListener('touchstart', (e) => {
    // Only handle touches that aren't on the joystick or dash button
    const touch = e.touches[0];
    const joystickContainer = document.getElementById('joystick-container');
    const dashButton = document.getElementById('mobile-dash');
    
    if (joystickContainer && dashButton) {
        const joystickRect = joystickContainer.getBoundingClientRect();
        const dashRect = dashButton.getBoundingClientRect();
        
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // Check if touch is not on controls
        const isOnJoystick = touchX >= joystickRect.left && touchX <= joystickRect.right &&
                             touchY >= joystickRect.top && touchY <= joystickRect.bottom;
        const isOnDash = touchX >= dashRect.left && touchX <= dashRect.right &&
                        touchY >= dashRect.top && touchY <= dashRect.bottom;
        
        if (!isOnJoystick && !isOnDash) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
            mouse.down = true;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        mouse.down = false;
    }
});

// Update WASD highlighting
function updateWASDHighlighting() {
    const wasdKeys = document.querySelectorAll('.wasd-key[data-key]');
    
    wasdKeys.forEach(keyEl => {
        const keyCode = keyEl.getAttribute('data-key');
        let isPressed = false;
        
        if (window.wasdKeys) {
            switch(keyCode) {
                case 'KeyW':
                    isPressed = window.wasdKeys.has('KeyW') || window.wasdKeys.has('ArrowUp');
                    break;
                case 'KeyA':
                    isPressed = window.wasdKeys.has('KeyA') || window.wasdKeys.has('ArrowLeft');
                    break;
                case 'KeyS':
                    isPressed = window.wasdKeys.has('KeyS') || window.wasdKeys.has('ArrowDown');
                    break;
                case 'KeyD':
                    isPressed = window.wasdKeys.has('KeyD') || window.wasdKeys.has('ArrowRight');
                    break;
                case 'Space':
                    isPressed = window.wasdKeys.has('Space');
                    break;
                default:
                    isPressed = window.wasdKeys.has(keyCode);
            }
        }
        
        keyEl.classList.toggle('active', isPressed);
    });
}

// Game loop
function update() {
    if (game.state !== 'playing' && game.state !== 'tutorial') return;

    // Update dash cooldown
    if (player.dashCooldown > 0) {
        player.dashCooldown = Math.max(0, player.dashCooldown - 16); // ~60fps
        updateHUD(); // Update dash display
    }

    // Regenerate dash energy
    if (player.dashEnergy < player.maxDashEnergy) {
        player.dashEnergy = Math.min(player.maxDashEnergy, player.dashEnergy + player.dashEnergyRegen);
        updateHUD(); // Update energy display
    }
    
    // Get mobile input state
    const mobileInput = window.mobileControls ? window.mobileControls.getInput() : { x: 0, y: 0, left: false, right: false };
    
    // Update player position (handle keyboard, arrow keys, and mobile joystick)
    let moveX = (keys['d'] || keys['D'] || keys['arrowright'] ? 1 : 0) - 
                (keys['a'] || keys['A'] || keys['arrowleft'] ? 1 : 0);
    let moveY = (keys['s'] || keys['S'] || keys['arrowdown'] ? 1 : 0) - 
                (keys['w'] || keys['W'] || keys['arrowup'] ? 1 : 0);
    
    // Add joystick input if it's stronger than threshold
    if (Math.abs(mobileInput.x) > 0.2 || Math.abs(mobileInput.y) > 0.2) {
        moveX = mobileInput.x;
        moveY = mobileInput.y;
    }
    
    if (moveX !== 0 || moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        const currentSpeed = player.isDashing ? player.dashSpeed : player.speed;
        player.x += (moveX / length) * currentSpeed;
        player.y += (moveY / length) * currentSpeed;
        
        // Dash trail
        if (player.isDashing) {
            particles.push(new Particle(player.x, player.y, '#4a90e2'));
        }
        
        // Keep player in bounds with proper margin
        const margin = player.size / 2 + 5;
        player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
        player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));
    }
    
    // Update player angle
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    
    // Shooting
    if (mouse.down) {
        shoot();
    }
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].update(canvas)) {
            bullets.splice(i, 1);
        }
    }
    
    // Check bullet-enemy collisions BEFORE updating enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < bullet.radius + enemy.radius) {
                // Hit!
                const killed = enemy.hit(bullet.damage);
                
                if (killed) {
                    // Enemy killed
                    soundManager.play('enemyDeath');
                    soundManager.play('scorePoint');
                    game.kills++;
                    game.score += enemy.scoreValue;
                    enemies.splice(j, 1);
                    
                    // Blood splatter
                    bloodSplatters.push(new BloodSplatter(enemy.x, enemy.y));
                    
                    // Particles
                    for (let k = 0; k < 15; k++) {
                        particles.push(new Particle(enemy.x, enemy.y, '#8b0000'));
                    }
                    
                    // Combo text effect
                    showFloatingText(enemy.x, enemy.y, `+${enemy.scoreValue}`, '#ffff00');
                } else {
                    // Just hit, not killed
                    soundManager.play('enemyHit');
                }
                
                // Remove bullet unless it has piercing
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
    
    // Update enemies AFTER collision checks
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i]) {
            enemies[i].update(canvas, updateHUD, gameOver);
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
            particles.splice(i, 1);
        }
    }
    
    // Update blood splatters
    for (let i = bloodSplatters.length - 1; i >= 0; i--) {
        if (!bloodSplatters[i].update()) {
            bloodSplatters.splice(i, 1);
        }
    }
    
    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        if (!floatingTexts[i].update()) {
            floatingTexts.splice(i, 1);
        }
    }
    
    // Check if wave is complete (only once per wave)
    // Make sure all enemies have been spawned before checking for wave completion
    const allEnemiesSpawned = game.spawnedEnemies >= game.expectedEnemies;
    if (enemies.length === 0 && game.waveInProgress && !game.waitingForNextWave && 
        allEnemiesSpawned && (game.state === 'playing' || game.state === 'tutorial')) {
        
        // Immediately set flags to prevent re-triggering
        game.waveInProgress = false;
        game.waitingForNextWave = true;
        
        // Full heal between waves
        player.health = player.maxHealth;
        updateHUD();
        
        // Wave completion bonus
        soundManager.play('waveComplete');
        const bonus = 50 * DIFFICULTY[game.difficulty].scoreMultiplier;
        if (bonus > 0) {
            game.score += bonus;
            updateHUD();
            showFloatingText(canvas.width / 2, canvas.height / 2, `Wave Complete! +${bonus}`, '#4CAF50');
        } else {
            showFloatingText(canvas.width / 2, canvas.height / 2, `Wave Complete!`, '#4CAF50');
        }
        
        // Show upgrade screen every 3 waves
        if (game.wave % 3 === 0 && game.state === 'playing') {
            showUpgradeScreen();
        } else {
            // Wait before starting next wave
            setTimeout(() => {
                // Double check game is still active
                if ((game.state === 'playing' || game.state === 'tutorial') && game.waitingForNextWave) {
                    game.wave++;
                    game.waitingForNextWave = false; // Clear the flag before spawning
                    updateHUD();
                    
                    if (game.state === 'tutorial') {
                        nextTutorialStep(game, player, updateHUD, spawnWave);
                    } else {
                        spawnWave();
                    }
                }
            }, 2000);
        }
    }
    
    // Update WASD visual feedback
    updateWASDHighlighting();
}

function showUpgradeScreen() {
    const upgradeScreen = document.getElementById('upgrade-screen');
    const upgradeOptions = document.getElementById('upgrade-options');
    
    // Get random upgrades
    const upgrades = getRandomUpgrades(player.upgrades, 3);
    
    // Clear previous options
    upgradeOptions.innerHTML = '';
    
    // Create upgrade cards
    upgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="upgrade-icon">${upgrade.name.split(' ')[0]}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-level">Level ${upgrade.currentLevel} → ${upgrade.currentLevel + 1}</div>
        `;
        card.onclick = () => selectUpgrade(upgrade.key);
    });
    
    upgradeScreen.style.display = 'flex';
}

function selectUpgrade(upgradeKey) {
    // Apply the upgrade
    applyUpgrade(player, player.upgrades, upgradeKey);
    
    // Hide upgrade screen
    document.getElementById('upgrade-screen').style.display = 'none';
    
    // Continue to next wave
    setTimeout(() => {
        game.wave++;
        updateHUD();
        spawnWave();
    }, 500);
}

function gameOver() {
    game.state = 'gameOver';
    soundManager.play('gameOver');
    soundManager.stopMusic();
    
    // Update final stats
    document.getElementById('final-difficulty').textContent = 
        game.difficulty.toUpperCase();
    document.getElementById('final-wave').textContent = game.wave;
    document.getElementById('final-kills').textContent = game.kills;
    document.getElementById('final-score').textContent = game.score;
    
    // Show game over screen
    document.getElementById('game-over').style.display = 'flex';
}

function initGame() {
    // Reset game state
    game.state = 'playing';
    game.wave = 1;
    game.kills = 0;
    game.score = 0;
    game.waveInProgress = false;
    game.waitingForNextWave = false;
    game.expectedEnemies = 0;
    game.spawnedEnemies = 0;

    // Reset player
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
    player.dashEnergy = player.maxDashEnergy; // Reset energy to full
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    // Clear arrays
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    bloodSplatters.length = 0;
    floatingTexts.length = 0;

    // Show energy bar
    document.getElementById('energy-bar').style.display = 'block';

    // Update HUD
    updateHUD();

    // Start first wave
    spawnWave();
}

// Draw function
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (game.state === 'playing' || game.state === 'tutorial') {
        // Draw aim line (faint line from player to mouse)
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

        // Draw player
        if (images.player.complete) {
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.rotate(player.angle);
            ctx.drawImage(images.player, -player.size/2, -player.size/2, player.size, player.size);
            ctx.restore();
        } else {
            // Fallback player drawing
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw bullets
        bullets.forEach(bullet => bullet.draw(ctx));

        // Draw enemies
        enemies.forEach(enemy => enemy.draw(ctx));

        // Draw particles
        particles.forEach(particle => particle.draw(ctx));

        // Draw blood splatters
        bloodSplatters.forEach(splatter => splatter.draw(ctx));

        // Draw floating texts
        floatingTexts.forEach(text => text.draw(ctx));
    }
}

// Main game loop
let lastTime = 0;
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// UI Event Handlers
function setupEventListeners() {
    // Difficulty selection
    document.getElementById('tutorial-btn').addEventListener('click', () => {
        soundManager.play('uiClick');
        startTutorial(game, initGame);
    });
    
    document.getElementById('easy-btn').addEventListener('click', () => {
        soundManager.play('uiClick');
        game.difficulty = 'easy';
        document.getElementById('start-screen').style.display = 'none';
        initGame();
        soundManager.playMusic();
    });
    
    document.getElementById('normal-btn').addEventListener('click', () => {
        soundManager.play('uiClick');
        game.difficulty = 'normal';
        document.getElementById('start-screen').style.display = 'none';
        initGame();
        soundManager.playMusic();
    });
    
    document.getElementById('hard-btn').addEventListener('click', () => {
        soundManager.play('uiClick');
        game.difficulty = 'hard';
        document.getElementById('start-screen').style.display = 'none';
        initGame();
        soundManager.playMusic();
    });
    
    // Game over buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        soundManager.play('uiClick');
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        soundManager.play('uiClick');
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    });
    
    // Tutorial next button
    document.getElementById('tutorial-next').addEventListener('click', () => {
        soundManager.play('uiClick');
        nextTutorialStep(game, player, updateHUD, spawnWave);
    });
    
    // Mute button
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.addEventListener('click', () => {
        const isMuted = soundManager.toggle();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        muteBtn.classList.toggle('muted', isMuted);
    });
}

// Initialize everything when page loads
window.addEventListener('load', () => {
    // Wait for images to load
    const checkImagesLoaded = () => {
        if (imagesLoaded >= totalImages) {
            setupEventListeners();
            
            // Show start screen
            document.getElementById('start-screen').style.display = 'flex';
            
            // Start game loop
            gameLoop();
        } else {
            setTimeout(checkImagesLoaded, 100);
        }
    };
    
    checkImagesLoaded();
});

// Handle visibility change (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.paused = true;
    } else {
        game.paused = false;
    }
});
