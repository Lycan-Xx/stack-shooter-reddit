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

// Game submission for leaderboard
export type GameSubmission = {
  username: string;
  score: number;
  wave: number;
  kills: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  timestamp: number;
  subreddit: string;
};

export type StatsResponse = {
  playerStats: PlayerStats | null;
  communityStats: CommunityStats;
  playerRank: number;
};
