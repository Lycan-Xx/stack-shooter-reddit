import { redis } from '@devvit/web/server';
import { MatchState, PlayerState, GameAction } from '../../shared/types/api';

const MATCH_TIMEOUT = 15000; // 15 seconds
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 12;
const MESSAGE_RETENTION = 60000; // 1 minute

export class MatchmakingService {
  /**
   * Join or create a match for a post
   */
  static async joinMatch(
    postId: string,
    username: string
  ): Promise<{ matchId: string; playerId: string; queuePosition: number }> {
    const playerId = `${username}_${Date.now()}`;
    const queueKey = `match:${postId}:queue`;
    const matchKey = `match:${postId}:current`;

    // Check if there's an active match
    const activeMatchData = await redis.get(matchKey);
    if (activeMatchData) {
      const match: MatchState = JSON.parse(activeMatchData);
      
      // If match is waiting and not full, allow join
      if (match.status === 'waiting' && match.players.length < MAX_PLAYERS) {
        const newPlayer: PlayerState = {
          id: playerId,
          username,
          x: 400,
          y: 300,
          angle: 0,
          health: 100,
          maxHealth: 100,
          isDashing: false,
          kills: 0,
          vampireKills: 0,
          score: 0,
          isDead: false,
          powerUps: [],
        };

        match.players.push(newPlayer);
        
        // Only start countdown if we have MIN_PLAYERS (2+) and not already counting down
        if (match.players.length >= MIN_PLAYERS && match.status === 'waiting') {
          match.status = 'countdown';
          match.startTime = Date.now() + MATCH_TIMEOUT; // 15 seconds from now
        }
        
        await redis.set(matchKey, JSON.stringify(match));

        return { matchId: match.matchId, playerId, queuePosition: 0 };
      }
    }

    // Add to queue
    await redis.zAdd(queueKey, { member: playerId, score: Date.now() });
    await redis.hSet(`player:${playerId}`, { username, postId });

    // Try to form a new match
    const queueSize = await redis.zCard(queueKey);
    
    if (queueSize >= MIN_PLAYERS) {
      const matchId = await this.createMatch(postId);
      return { matchId, playerId, queuePosition: 0 };
    }

    return { matchId: '', playerId, queuePosition: queueSize };
  }

  /**
   * Create a new match from queue
   */
  static async createMatch(postId: string): Promise<string> {
    const queueKey = `match:${postId}:queue`;
    const matchKey = `match:${postId}:current`;
    const matchId = `match_${postId}_${Date.now()}`;

    // Get players from queue
    const queuedPlayersData = await redis.zRange(queueKey, 0, MAX_PLAYERS - 1);
    const queuedPlayers = queuedPlayersData.map((item) =>
      typeof item === 'string' ? item : item.member
    );
    
    if (queuedPlayers.length < MIN_PLAYERS) {
      return '';
    }

    // Remove players from queue
    for (const playerId of queuedPlayers) {
      await redis.zRem(queueKey, [playerId]);
    }

    // Create player states
    const players: PlayerState[] = [];
    for (const playerId of queuedPlayers) {
      const playerData = await redis.hGetAll(`player:${playerId}`);
      players.push({
        id: playerId,
        username: playerData.username || 'Player',
        x: 400 + Math.random() * 200 - 100,
        y: 300 + Math.random() * 200 - 100,
        angle: 0,
        health: 100,
        maxHealth: 100,
        isDashing: false,
        kills: 0,
        vampireKills: 0,
        score: 0,
        isDead: false,
        powerUps: [],
      });
    }

    // Create match
    const match: MatchState = {
      matchId,
      postId,
      players,
      vampires: [],
      bullets: [],
      powerUps: [],
      status: 'waiting',
      matchDuration: 5 * 60 * 1000,
      timeRemaining: 5 * 60 * 1000,
    };

    await redis.set(matchKey, JSON.stringify(match));
    await redis.expire(matchKey, 3600); // 1 hour expiry

    // Start countdown
    await this.startMatchCountdown(postId, matchId);

    return matchId;
  }

  /**
   * Start match countdown
   */
  static async startMatchCountdown(postId: string, _matchId: string): Promise<void> {
    const matchKey = `match:${postId}:current`;
    const matchData = await redis.get(matchKey);
    
    if (!matchData) return;

    const match: MatchState = JSON.parse(matchData);
    match.status = 'countdown';
    match.startTime = Date.now() + MATCH_TIMEOUT;
    
    await redis.set(matchKey, JSON.stringify(match));

    // Note: In production, you'd use a scheduler or cron job
    // For now, the client will handle the countdown
  }

  /**
   * Start the match
   */
  static async startMatch(postId: string): Promise<boolean> {
    const matchKey = `match:${postId}:current`;
    const matchData = await redis.get(matchKey);
    
    if (!matchData) return false;

    const match: MatchState = JSON.parse(matchData);
    match.status = 'playing';
    match.startTime = Date.now();
    match.matchDuration = 5 * 60 * 1000; // 5 minutes
    match.timeRemaining = match.matchDuration;
    match.vampires = [];
    match.bullets = [];
    match.powerUps = [];
    
    await redis.set(matchKey, JSON.stringify(match));
    return true;
  }

  /**
   * Get current match state
   */
  static async getMatch(postId: string): Promise<MatchState | null> {
    const matchKey = `match:${postId}:current`;
    const matchData = await redis.get(matchKey);
    
    if (!matchData) return null;
    
    return JSON.parse(matchData);
  }

  /**
   * Update player state
   */
  static async updatePlayerState(
    postId: string,
    playerId: string,
    updates: Partial<PlayerState>
  ): Promise<boolean> {
    const matchKey = `match:${postId}:current`;
    const matchData = await redis.get(matchKey);
    
    if (!matchData) return false;

    const match: MatchState = JSON.parse(matchData);
    const playerIndex = match.players.findIndex((p) => p.id === playerId);
    
    if (playerIndex === -1) return false;

    const currentPlayer = match.players[playerIndex];
    if (!currentPlayer) return false;
    
    // Update player with spread to preserve all properties
    match.players[playerIndex] = {
      ...currentPlayer,
      ...updates,
    };
    await redis.set(matchKey, JSON.stringify(match));
    
    return true;
  }

  /**
   * Broadcast game action
   */
  static async broadcastAction(postId: string, action: GameAction): Promise<void> {
    const actionsKey = `match:${postId}:actions`;
    const actionData = JSON.stringify(action);
    
    // Store in a hash with timestamp as key for easy retrieval
    await redis.hSet(actionsKey, { [action.timestamp.toString()]: actionData });
    await redis.expire(actionsKey, MESSAGE_RETENTION / 1000);
  }

  /**
   * Get recent actions
   */
  static async getActions(postId: string, since: number): Promise<GameAction[]> {
    const actionsKey = `match:${postId}:actions`;
    const actionsData = await redis.hGetAll(actionsKey);
    
    const actions: GameAction[] = Object.entries(actionsData)
      .map(([_timestamp, data]: [string, string]) => JSON.parse(data))
      .filter((action: GameAction) => action.timestamp > since)
      .sort((a: GameAction, b: GameAction) => a.timestamp - b.timestamp);
    
    return actions;
  }

  /**
   * Leave match
   */
  static async leaveMatch(postId: string, playerId: string): Promise<boolean> {
    const matchKey = `match:${postId}:current`;
    const queueKey = `match:${postId}:queue`;
    
    // Remove from queue if present
    await redis.zRem(queueKey, [playerId] as string[]);
    
    // Remove from active match
    const matchData = await redis.get(matchKey);
    if (!matchData) return false;

    const match: MatchState = JSON.parse(matchData);
    match.players = match.players.filter((p) => p.id !== playerId);
    
    if (match.players.length === 0) {
      // Delete match if empty
      await redis.del(matchKey);
    } else {
      await redis.set(matchKey, JSON.stringify(match));
    }

    // Broadcast disconnect
    await this.broadcastAction(postId, {
      type: 'hit',
      playerId,
      data: { disconnected: true },
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Clean up old matches and queues
   */
  static async cleanup(postId: string): Promise<void> {
    const matchKey = `match:${postId}:current`;
    const queueKey = `match:${postId}:queue`;
    const actionsKey = `match:${postId}:actions`;
    
    await redis.del(matchKey);
    await redis.del(queueKey);
    await redis.del(actionsKey);
  }
}
