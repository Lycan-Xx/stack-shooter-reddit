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
  score: number;
};

export type GameAction = {
  type: 'move' | 'shoot' | 'dash' | 'hit' | 'kill';
  playerId: string;
  data: any;
  timestamp: number;
};

export type MatchState = {
  matchId: string;
  postId: string;
  players: PlayerState[];
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: number;
  wave: number;
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
