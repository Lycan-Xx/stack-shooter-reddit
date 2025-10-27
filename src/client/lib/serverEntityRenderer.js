/**
 * Renders server-managed entities for multiplayer mode
 */

export function renderServerBullets(ctx, bullets) {
  if (!bullets) return;

  bullets.forEach((bullet) => {
    ctx.save();
    ctx.fillStyle = '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffaa00';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

export function renderServerVampires(ctx, vampires, vampireImage) {
  if (!vampires) return;

  vampires.forEach((vampire) => {
    ctx.save();

    // Draw vampire sprite
    if (vampireImage && vampireImage.complete) {
      ctx.drawImage(vampireImage, vampire.x - 25, vampire.y - 25, 50, 50);
    } else {
      // Fallback circle
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.arc(vampire.x, vampire.y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw health bar
    const healthBarWidth = 50;
    const healthBarHeight = 5;
    const healthPercent = vampire.health / vampire.maxHealth;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(vampire.x - 25, vampire.y - 35, healthBarWidth, healthBarHeight);

    ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
    ctx.fillRect(vampire.x - 25, vampire.y - 35, healthBarWidth * healthPercent, healthBarHeight);

    ctx.restore();
  });
}

export function renderPowerUps(ctx, powerUps) {
  if (!powerUps) return;

  powerUps.forEach((powerUp) => {
    ctx.save();

    // Get color based on type
    const colors = {
      speed: '#667eea',
      shield: '#f093fb',
      fireRate: '#fa709a',
      health: '#4caf50',
    };

    const icons = {
      speed: '⚡',
      shield: '🛡️',
      fireRate: '🔥',
      health: '❤️',
    };

    // Draw circle
    ctx.fillStyle = colors[powerUp.type] || '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors[powerUp.type] || '#ffffff';
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw icon
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[powerUp.type] || '?', powerUp.x, powerUp.y);

    ctx.restore();
  });
}

export function renderDeathOverlay(ctx, canvas, respawnTime) {
  const timeLeft = Math.ceil((respawnTime - Date.now()) / 1000);

  if (timeLeft <= 0) return;

  ctx.save();

  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // "You Died!" text
  ctx.fillStyle = '#f44336';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(244, 67, 54, 0.8)';
  ctx.fillText('You Died!', canvas.width / 2, canvas.height / 2 - 50);

  // Respawn timer
  ctx.fillStyle = 'white';
  ctx.font = 'bold 72px Arial';
  ctx.shadowBlur = 30;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(timeLeft.toString(), canvas.width / 2, canvas.height / 2 + 30);

  ctx.restore();
}

export function renderSpawnProtection(ctx, canvas, player) {
  ctx.save();

  // Glowing outline
  ctx.strokeStyle = '#4caf50';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(76, 175, 80, 0.8)';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius + 10, 0, Math.PI * 2);
  ctx.stroke();

  // Text indicator
  ctx.fillStyle = '#4caf50';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⭐ PROTECTED ⭐', player.x, player.y - player.size / 2 - 40);

  ctx.restore();
}
