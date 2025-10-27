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
  avatarUrl?: string;
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

// Leaderboard Types
export type PlayerStats = {
  username: string;
  totalKills: number;
  totalDeaths: number;
  totalWins: number;
  totalMatches: number;
  bestScore: number;
  vampireKills: number;
  playerKills: number;
  kdRatio: number;
  lastPlayed: number;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  kills?: number;
  vampireKills?: number;
};

export type CommunityStats = {
  subredditName: string;
  totalVampiresKilled: number;
  totalMatches: number;
  totalPlayers: number;
  weeklyVampires: number;
  weeklyMatches: number;
};

export type LeaderboardResponse = {
  global: LeaderboardEntry[];
  subreddit: LeaderboardEntry[];
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
};

export type StatsResponse = {
  playerStats: PlayerStats | null;
  communityStats: CommunityStats;
  playerRank: number;
};
