/**
 * @typedef {Object} PlayerState
 * @property {string} id
 * @property {string} username
 * @property {number} x
 * @property {number} y
 * @property {number} angle
 * @property {number} health
 * @property {number} maxHealth
 * @property {boolean} isDashing
 * @property {number} kills
 * @property {number} score
 */

/**
 * @typedef {Object} GameAction
 * @property {string} type
 * @property {string} playerId
 * @property {any} data
 * @property {number} timestamp
 */

/**
 * @typedef {Object} MatchState
 * @property {string} matchId
 * @property {string} postId
 * @property {PlayerState[]} players
 * @property {string} status
 * @property {number} [startTime]
 * @property {number} wave
 */

export class MultiplayerClient {
  constructor() {
    this.matchId = null;
    this.playerId = null;
    this.username = null;
    this.lastSync = 0;
    this.syncInterval = null;
    this.isConnected = false;
    this.remotePlayers = new Map();
    this.pendingActions = [];
  }

  /**
   * Join a match
   */
  async joinMatch() {
    try {
      const response = await fetch('/api/match/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        this.matchId = data.matchId;
        this.playerId = data.playerId;
        this.username = data.username;
        this.isConnected = true;
        this.lastSync = Date.now();

        // Start syncing
        this.startSync();

        return {
          success: true,
          matchId: data.matchId,
          playerId: data.playerId,
          username: data.username,
          queuePosition: data.queuePosition,
          estimatedWait: data.estimatedWait,
        };
      }

      return { success: false };
    } catch (error) {
      console.error('Error joining match:', error);
      return { success: false };
    }
  }

  /**
   * Start syncing with server
   */
  startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Poll every 100ms for smooth multiplayer
    this.syncInterval = setInterval(() => {
      this.sync();
    }, 100);
  }

  /**
   * Stop syncing
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync with server
   */
  async sync() {
    if (!this.isConnected) return;

    try {
      // Tick the server game state
      await fetch('/api/match/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Get updated state
      const response = await fetch(`/api/match/state?since=${this.lastSync}`);
      const data = await response.json();

      if (data.match) {
        this.processMatchUpdate(data.match);
      }

      if (data.actions && data.actions.length > 0) {
        this.processActions(data.actions);
        this.lastSync = data.actions[data.actions.length - 1].timestamp;
      }
    } catch (error) {
      console.error('Error syncing:', error);
    }
  }

  /**
   * Process match state update
   */
  processMatchUpdate(match) {
    // Update remote players
    this.remotePlayers.clear();
    
    for (const player of match.players) {
      if (player.id !== this.playerId) {
        this.remotePlayers.set(player.id, player);
      }
    }

    return match;
  }

  /**
   * Process game actions
   */
  processActions(actions) {
    for (const action of actions) {
      // Skip own actions
      if (action.playerId === this.playerId) continue;

      // Update remote player based on action
      const player = this.remotePlayers.get(action.playerId);
      if (!player) continue;

      switch (action.type) {
        case 'move':
          player.x = action.data.x;
          player.y = action.data.y;
          player.angle = action.data.angle;
          player.isDashing = action.data.isDashing;
          break;
        case 'shoot':
          // Handle remote shooting
          break;
        case 'hit':
          if (action.data.disconnected) {
            this.remotePlayers.delete(action.playerId);
          }
          break;
      }
    }

    return actions;
  }

  /**
   * Send player action
   */
  async sendAction(type, data) {
    if (!this.isConnected) return;

    const action = {
      type,
      playerId: this.playerId,
      data,
      timestamp: Date.now(),
    };

    try {
      await fetch('/api/match/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
    } catch (error) {
      console.error('Error sending action:', error);
    }
  }

  /**
   * Send player position update
   */
  sendPosition(x, y, angle, isDashing) {
    this.sendAction('move', { x, y, angle, isDashing });
  }

  /**
   * Send shoot action
   */
  async sendShoot(x, y, angle, damage, piercing) {
    if (!this.isConnected) return;

    try {
      await fetch('/api/match/shoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: this.playerId,
          x,
          y,
          angle,
          damage,
          piercing,
        }),
      });
    } catch (error) {
      console.error('Error sending shoot:', error);
    }
  }

  /**
   * Send dash action
   */
  sendDash() {
    this.sendAction('dash', {});
  }

  /**
   * Send kill action
   */
  sendKill(enemyId) {
    this.sendAction('kill', { enemyId });
  }

  /**
   * Get remote players
   */
  getRemotePlayers() {
    return Array.from(this.remotePlayers.values());
  }

  /**
   * Get current match state
   */
  getMatchState() {
    return this.currentMatch;
  }

  /**
   * Store current match for access
   */
  processMatchUpdate(match) {
    this.currentMatch = match;
    
    // Update remote players
    this.remotePlayers.clear();
    
    for (const player of match.players) {
      if (player.id !== this.playerId) {
        this.remotePlayers.set(player.id, player);
      }
    }

    return match;
  }

  /**
   * Leave match
   */
  async leaveMatch() {
    if (!this.isConnected) return;

    this.stopSync();

    try {
      await fetch('/api/match/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: this.playerId }),
      });
    } catch (error) {
      console.error('Error leaving match:', error);
    }

    this.isConnected = false;
    this.matchId = null;
    this.playerId = null;
    this.remotePlayers.clear();
  }

  /**
   * Interpolate remote player position for smooth movement
   */
  interpolatePlayer(player, targetX, targetY, targetAngle, delta = 0.2) {
    if (!player.lastX) player.lastX = player.x;
    if (!player.lastY) player.lastY = player.y;
    if (!player.lastAngle) player.lastAngle = player.angle;

    player.lastX += (targetX - player.lastX) * delta;
    player.lastY += (targetY - player.lastY) * delta;
    
    // Handle angle wrapping
    let angleDiff = targetAngle - player.lastAngle;
    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    player.lastAngle += angleDiff * delta;

    return {
      x: player.lastX,
      y: player.lastY,
      angle: player.lastAngle,
    };
  }
}

// Singleton instance
export const multiplayerClient = new MultiplayerClient();
