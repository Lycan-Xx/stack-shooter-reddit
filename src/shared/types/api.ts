export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// Multiplayer Types
export type PlayerState = {
  id: string;
  username: string;
  x: number;
  y: number;
  angle: number;
  health: number;
  maxHealth: number;
  isDashing: boolean;
  kills: number;
  vampireKills: number;
  score: number;
  isDead: boolean;
  respawnTime?: number;
  spawnProtection?: number;
  powerUps: PowerUp[];
};

export type PowerUp = {
  type: 'speed' | 'shield' | 'fireRate' | 'health';
  duration: number;
  value: number;
  startTime: number;
};

export type Vampire = {
  id: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  targetPlayerId?: string;
};

export type PowerUpDrop = {
  id: string;
  type: 'speed' | 'shield' | 'fireRate' | 'health';
  x: number;
  y: number;
  spawnTime: number;
};

export type Bullet = {
  id: string;
  playerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  piercing: number;
};

export type GameAction = {
  type: 'move' | 'shoot' | 'dash' | 'hit' | 'kill' | 'damage' | 'respawn' | 'powerup';
  playerId: string;
  data: any;
  timestamp: number;
};

export type MatchState = {
  matchId: string;
  postId: string;
  players: PlayerState[];
  vampires: Vampire[];
  bullets: Bullet[];
  powerUps: PowerUpDrop[];
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  matchDuration: number; // 5 minutes in ms
  timeRemaining: number;
  winner?: string;
};

export type JoinMatchResponse = {
  success: boolean;
  matchId: string;
  playerId: string;
  username: string;
  queuePosition?: number;
  estimatedWait?: number;
};

export type MatchUpdateResponse = {
  match: MatchState;
  actions: GameAction[];
};

export type LeaveMatchResponse = {
  success: boolean;
};
