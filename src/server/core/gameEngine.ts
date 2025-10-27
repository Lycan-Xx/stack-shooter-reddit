import { redis } from '@devvit/web/server';
import { MatchState, PlayerState, Vampire, Bullet, PowerUpDrop, GameAction } from '../../shared/types/api';
import { LeaderboardService } from './leaderboard';

const MATCH_DURATION = 5 * 60 * 1000; // 5 minutes
const TICK_RATE = 100; // 100ms per tick
const VAMPIRE_SPAWN_INTERVAL = 5000; // 5 seconds
const VAMPIRE_BASE_HEALTH = 100;
const VAMPIRE_DAMAGE = 25;
const VAMPIRE_SPEED = 2;
const BULLET_SPEED = 10;
const PLAYER_RADIUS = 30;
const VAMPIRE_RADIUS = 25;
const BULLET_RADIUS = 5;
const RESPAWN_COOLDOWN = 3000; // 3 seconds
const SPAWN_PROTECTION_DURATION = 2000; // 2 seconds
const POWER_UP_DURATION = 10000; // 10 seconds
const POWER_UP_LIFETIME = 30000; // 30 seconds before despawn

export class GameEngine {
  private matchId: string;
  private postId: string;
  private subredditName: string;
  private state: MatchState;
  private lastVampireSpawn: number = 0;
  private vampireIdCounter: number = 0;
  private bulletIdCounter: number = 0;
  private powerUpIdCounter: number = 0;

  constructor(matchId: string, postId: string, initialState: MatchState, subredditName: string = 'unknown') {
    this.matchId = matchId;
    this.postId = postId;
    this.subredditName = subredditName;
    this.state = initialState;
  }

  /**
   * Main game tick - updates all game state
   */
  tick(deltaTime: number): MatchState {
    if (this.state.status !== 'playing') {
      return this.state;
    }

    // Update match timer
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaTime);

    // Check for match end
    if (this.state.timeRemaining <= 0 && this.state.status === 'playing') {
      // Mark as finished immediately to prevent multiple calls
      this.state.status = 'finished';
      
      // Find winner (highest score)
      let winner: PlayerState | null = null;
      let highestScore = -1;

      for (const player of this.state.players) {
        if (player.score > highestScore) {
          highestScore = player.score;
          winner = player;
        }
      }

      if (winner) {
        this.state.winner = winner.username;
      }
      
      // Save results asynchronously (don't await to avoid blocking)
      this.saveMatchResults(winner).catch(err => 
        console.error('Error saving match results:', err)
      );
      
      return this.state;
    }

    // Update players
    this.updatePlayers(deltaTime);

    // Update bullets
    this.updateBullets(deltaTime);

    // Update vampires
    this.updateVampires(deltaTime);

    // Spawn vampires
    this.spawnVampires(deltaTime);

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Check collisions
    this.checkCollisions();

    return this.state;
  }

  /**
   * Update player states
   */
  private updatePlayers(deltaTime: number): void {
    const now = Date.now();

    for (const player of this.state.players) {
      // Update spawn protection
      if (player.spawnProtection && player.spawnProtection > 0) {
        player.spawnProtection = Math.max(0, player.spawnProtection - deltaTime);
      }

      // Update respawn timer
      if (player.isDead && player.respawnTime && now >= player.respawnTime) {
        this.respawnPlayer(player);
      }

      // Update power-ups
      player.powerUps = player.powerUps.filter((powerUp) => {
        const elapsed = now - powerUp.startTime;
        return elapsed < powerUp.duration;
      });
    }
  }

  /**
   * Update bullet positions and lifetime
   */
  private updateBullets(deltaTime: number): void {
    const speed = BULLET_SPEED;

    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const bullet = this.state.bullets[i];

      // Update position
      bullet.x += bullet.vx * speed;
      bullet.y += bullet.vy * speed;

      // Remove if out of bounds (assuming 800x600 canvas)
      if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
        this.state.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Update vampire AI and movement
   */
  private updateVampires(deltaTime: number): void {
    for (const vampire of this.state.vampires) {
      // Find nearest alive player
      let nearestPlayer: PlayerState | null = null;
      let nearestDistance = Infinity;

      for (const player of this.state.players) {
        if (player.isDead) continue;

        const dx = player.x - vampire.x;
        const dy = player.y - vampire.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPlayer = player;
        }
      }

      // Move towards nearest player
      if (nearestPlayer) {
        vampire.targetPlayerId = nearestPlayer.id;
        const dx = nearestPlayer.x - vampire.x;
        const dy = nearestPlayer.y - vampire.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          vampire.x += (dx / distance) * vampire.speed;
          vampire.y += (dy / distance) * vampire.speed;
        }
      }
    }
  }

  /**
   * Spawn vampires at edges
   */
  private spawnVampires(deltaTime: number): void {
    this.lastVampireSpawn += deltaTime;

    // Increase spawn rate over time
    const elapsedTime = MATCH_DURATION - this.state.timeRemaining;
    const spawnRate = Math.max(2000, VAMPIRE_SPAWN_INTERVAL - elapsedTime / 60); // Faster over time

    if (this.lastVampireSpawn >= spawnRate) {
      this.lastVampireSpawn = 0;

      // Spawn at random edge
      const edge = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;

      switch (edge) {
        case 0: // Top
          x = Math.random() * 800;
          y = -50;
          break;
        case 1: // Right
          x = 850;
          y = Math.random() * 600;
          break;
        case 2: // Bottom
          x = Math.random() * 800;
          y = 650;
          break;
        case 3: // Left
          x = -50;
          y = Math.random() * 600;
          break;
      }

      const vampire: Vampire = {
        id: `vampire_${this.vampireIdCounter++}`,
        x,
        y,
        health: VAMPIRE_BASE_HEALTH,
        maxHealth: VAMPIRE_BASE_HEALTH,
        speed: VAMPIRE_SPEED,
      };

      this.state.vampires.push(vampire);
    }
  }

  /**
   * Update power-ups (remove expired)
   */
  private updatePowerUps(deltaTime: number): void {
    const now = Date.now();

    this.state.powerUps = this.state.powerUps.filter((powerUp) => {
      const age = now - powerUp.spawnTime;
      return age < POWER_UP_LIFETIME;
    });
  }

  /**
   * Check all collisions
   */
  private checkCollisions(): void {
    // Bullet vs Player
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const bullet = this.state.bullets[i];
      let bulletHit = false;

      for (const player of this.state.players) {
        if (player.isDead || player.id === bullet.playerId) continue;
        if (player.spawnProtection && player.spawnProtection > 0) continue;

        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < PLAYER_RADIUS + BULLET_RADIUS) {
          this.damagePlayer(player, bullet.damage, bullet.playerId);
          bulletHit = true;

          if (bullet.piercing <= 0) {
            this.state.bullets.splice(i, 1);
            break;
          } else {
            bullet.piercing--;
          }
        }
      }
    }

    // Bullet vs Vampire
    for (let i = this.state.bullets.length - 1; i >= 0; i--) {
      const bullet = this.state.bullets[i];

      for (let j = this.state.vampires.length - 1; j >= 0; j--) {
        const vampire = this.state.vampires[j];

        const dx = bullet.x - vampire.x;
        const dy = bullet.y - vampire.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < VAMPIRE_RADIUS + BULLET_RADIUS) {
          vampire.health -= bullet.damage;

          if (vampire.health <= 0) {
            // Vampire killed
            this.state.vampires.splice(j, 1);

            // Award points to shooter
            const shooter = this.state.players.find((p) => p.id === bullet.playerId);
            if (shooter) {
              shooter.vampireKills++;
              shooter.score += 10;
            }

            // Drop power-up (30% chance)
            if (Math.random() < 0.3) {
              this.dropPowerUp(vampire.x, vampire.y);
            }
          }

          if (bullet.piercing <= 0) {
            this.state.bullets.splice(i, 1);
            break;
          } else {
            bullet.piercing--;
          }
        }
      }
    }

    // Vampire vs Player
    for (const vampire of this.state.vampires) {
      for (const player of this.state.players) {
        if (player.isDead) continue;
        if (player.spawnProtection && player.spawnProtection > 0) continue;

        const dx = vampire.x - player.x;
        const dy = vampire.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < VAMPIRE_RADIUS + PLAYER_RADIUS) {
          this.damagePlayer(player, VAMPIRE_DAMAGE, 'vampire');
        }
      }
    }

    // Player vs Power-up
    for (let i = this.state.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.state.powerUps[i];

      for (const player of this.state.players) {
        if (player.isDead) continue;

        const dx = powerUp.x - player.x;
        const dy = powerUp.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < PLAYER_RADIUS + 20) {
          this.applyPowerUp(player, powerUp.type);
          this.state.powerUps.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * Damage a player
   */
  private damagePlayer(player: PlayerState, damage: number, attackerId: string): void {
    // Check for shield
    const shield = player.powerUps.find((p) => p.type === 'shield');
    if (shield) {
      shield.value -= damage;
      if (shield.value <= 0) {
        player.powerUps = player.powerUps.filter((p) => p.type !== 'shield');
      }
      return;
    }

    player.health -= damage;

    if (player.health <= 0) {
      player.health = 0;
      player.isDead = true;
      player.respawnTime = Date.now() + RESPAWN_COOLDOWN;

      // Award kill to attacker
      if (attackerId !== 'vampire') {
        const attacker = this.state.players.find((p) => p.id === attackerId);
        if (attacker) {
          attacker.kills++;
          attacker.score += 100;
        }
      }
    }
  }

  /**
   * Respawn a player
   */
  private respawnPlayer(player: PlayerState): void {
    // Random spawn position (not at edges)
    player.x = 100 + Math.random() * 600;
    player.y = 100 + Math.random() * 400;
    player.health = player.maxHealth;
    player.isDead = false;
    player.respawnTime = undefined;
    player.spawnProtection = SPAWN_PROTECTION_DURATION;
    player.powerUps = [];
  }

  /**
   * Drop a power-up
   */
  private dropPowerUp(x: number, y: number): void {
    const types: Array<'speed' | 'shield' | 'fireRate' | 'health'> = [
      'speed',
      'shield',
      'fireRate',
      'health',
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp: PowerUpDrop = {
      id: `powerup_${this.powerUpIdCounter++}`,
      type,
      x,
      y,
      spawnTime: Date.now(),
    };

    this.state.powerUps.push(powerUp);
  }

  /**
   * Apply power-up to player
   */
  private applyPowerUp(player: PlayerState, type: 'speed' | 'shield' | 'fireRate' | 'health'): void {
    const now = Date.now();

    switch (type) {
      case 'speed':
        player.powerUps.push({
          type: 'speed',
          duration: POWER_UP_DURATION,
          value: 1.3, // 30% speed boost
          startTime: now,
        });
        break;
      case 'shield':
        player.powerUps.push({
          type: 'shield',
          duration: 999999, // Until depleted
          value: 50, // Absorbs 50 damage
          startTime: now,
        });
        break;
      case 'fireRate':
        player.powerUps.push({
          type: 'fireRate',
          duration: POWER_UP_DURATION,
          value: 0.5, // 50% faster fire rate
          startTime: now,
        });
        break;
      case 'health':
        player.health = Math.min(player.maxHealth, player.health + 50);
        player.score += 5;
        break;
    }
  }

  /**
   * Add a bullet to the game
   */
  addBullet(playerId: string, x: number, y: number, angle: number, damage: number, piercing: number): void {
    const bullet: Bullet = {
      id: `bullet_${this.bulletIdCounter++}`,
      playerId,
      x,
      y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      damage,
      piercing,
    };

    this.state.bullets.push(bullet);
  }

  /**
   * Save match results to leaderboard
   */
  private async saveMatchResults(winner: PlayerState | null): Promise<void> {
    try {
      for (const player of this.state.players) {
        const won = winner ? player.id === winner.id : false;
        
        await LeaderboardService.saveMatchResult(
          player.username,
          this.subredditName,
          player.score,
          player.kills,
          player.vampireKills,
          won
        );
      }
    } catch (error) {
      console.error('Error saving match results to leaderboard:', error);
    }
  }

  /**
   * Get current state
   */
  getState(): MatchState {
    return this.state;
  }

  /**
   * Update player position
   */
  updatePlayerPosition(playerId: string, x: number, y: number, angle: number, isDashing: boolean): void {
    const player = this.state.players.find((p) => p.id === playerId);
    if (player && !player.isDead) {
      player.x = x;
      player.y = y;
      player.angle = angle;
      player.isDashing = isDashing;
    }
  }
}
