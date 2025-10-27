import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  JoinMatchResponse,
  MatchUpdateResponse,
  LeaveMatchResponse,
  GameAction,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { MatchmakingService } from './core/matchmaking';
import { GameEngine } from './core/gameEngine';
import { LeaderboardService } from './core/leaderboard';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Multiplayer endpoints
router.post<unknown, JoinMatchResponse>('/api/match/join', async (_req, res): Promise<void> => {
  const { postId } = context;
  
  if (!postId) {
    res.status(400).json({
      success: false,
      matchId: '',
      playerId: '',
      username: '',
      queuePosition: 0,
    });
    return;
  }

  try {
    const username = (await reddit.getCurrentUsername()) ?? 'Player';
    const result = await MatchmakingService.joinMatch(postId, username);
    
    res.json({
      success: true,
      matchId: result.matchId,
      playerId: result.playerId,
      username,
      queuePosition: result.queuePosition,
      estimatedWait: result.queuePosition > 0 ? 15 : 0,
    });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(500).json({
      success: false,
      matchId: '',
      playerId: '',
      username: '',
    });
  }
});

router.get<unknown, MatchUpdateResponse>('/api/match/state', async (req, res): Promise<void> => {
  const { postId } = context;
  const since = parseInt((req.query.since as string) || '0');
  
  if (!postId) {
    res.status(400).json({
      match: null as any,
      actions: [],
    });
    return;
  }

  try {
    const match = await MatchmakingService.getMatch(postId);
    const actions = await MatchmakingService.getActions(postId, since);
    
    res.json({
      match: match as any,
      actions,
    });
  } catch (error) {
    console.error('Error getting match state:', error);
    res.status(500).json({
      match: null as any,
      actions: [],
    });
  }
});

router.post('/api/match/action', async (req, res): Promise<void> => {
  const { postId } = context;
  
  if (!postId) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    const action: GameAction = req.body;
    action.timestamp = Date.now();
    
    await MatchmakingService.broadcastAction(postId, action);
    
    // Update player state if it's a move action
    if (action.type === 'move' && action.data) {
      await MatchmakingService.updatePlayerState(postId, action.playerId, {
        x: action.data.x,
        y: action.data.y,
        angle: action.data.angle,
        isDashing: action.data.isDashing,
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting action:', error);
    res.status(500).json({ success: false });
  }
});

router.post<unknown, LeaveMatchResponse>('/api/match/leave', async (req, res): Promise<void> => {
  const { postId } = context;
  const { playerId } = req.body as { playerId: string };
  
  if (!postId || !playerId) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    const success = await MatchmakingService.leaveMatch(postId, playerId);
    res.json({ success });
  } catch (error) {
    console.error('Error leaving match:', error);
    res.status(500).json({ success: false });
  }
});

router.post('/api/match/start', async (_req, res): Promise<void> => {
  const { postId } = context;
  
  if (!postId) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    const success = await MatchmakingService.startMatch(postId);
    res.json({ success });
  } catch (error) {
    console.error('Error starting match:', error);
    res.status(500).json({ success: false });
  }
});

router.post('/api/match/tick', async (_req, res): Promise<void> => {
  const { postId, subredditName } = context;
  
  if (!postId) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    const match = await MatchmakingService.getMatch(postId);
    if (!match || match.status !== 'playing') {
      res.json({ success: false });
      return;
    }

    // Create game engine and tick with 50ms delta time
    const engine = new GameEngine(match.matchId, postId, match, subredditName || 'unknown');
    const updatedState = engine.tick(50); // 50ms tick for 20 ticks/second

    // Save updated state
    const matchKey = `match:${postId}:current`;
    await redis.set(matchKey, JSON.stringify(updatedState));

    res.json({ success: true, state: updatedState });
  } catch (error) {
    console.error('Error ticking match:', error);
    res.status(500).json({ success: false });
  }
});

router.post('/api/match/shoot', async (req, res): Promise<void> => {
  const { postId, subredditName } = context;
  const { playerId, x, y, angle, damage, piercing } = req.body as {
    playerId: string;
    x: number;
    y: number;
    angle: number;
    damage: number;
    piercing: number;
  };
  
  if (!postId || !playerId) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    const matchKey = `match:${postId}:current`;
    const matchData = await redis.get(matchKey);
    
    if (!matchData) {
      res.json({ success: false, error: 'No match found' });
      return;
    }

    const match = JSON.parse(matchData);
    
    if (match.status !== 'playing') {
      res.json({ success: false, error: 'Match not playing' });
      return;
    }

    // Add bullet directly to match state
    const bullet = {
      id: `bullet_${Date.now()}_${Math.random()}`,
      playerId,
      x,
      y,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      damage,
      piercing,
    };

    if (!match.bullets) {
      match.bullets = [];
    }
    
    match.bullets.push(bullet);

    // Save updated state immediately
    await redis.set(matchKey, JSON.stringify(match));

    console.log(`Bullet added: ${bullet.id}, total bullets: ${match.bullets.length}`);
    res.json({ success: true, bulletId: bullet.id });
  } catch (error) {
    console.error('Error adding bullet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Leaderboard endpoints
router.get('/api/leaderboard/global', async (_req, res): Promise<void> => {
  try {
    const leaderboard = await LeaderboardService.getGlobalLeaderboard();
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

router.get('/api/leaderboard/subreddit', async (_req, res): Promise<void> => {
  const { subredditName } = context;
  
  if (!subredditName) {
    res.status(400).json({ success: false, leaderboard: [] });
    return;
  }

  try {
    const leaderboard = await LeaderboardService.getSubredditLeaderboard(subredditName);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting subreddit leaderboard:', error);
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

router.get('/api/leaderboard/daily', async (_req, res): Promise<void> => {
  try {
    const leaderboard = await LeaderboardService.getDailyLeaderboard();
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting daily leaderboard:', error);
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

router.get('/api/leaderboard/weekly', async (_req, res): Promise<void> => {
  try {
    const leaderboard = await LeaderboardService.getWeeklyLeaderboard();
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting weekly leaderboard:', error);
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

router.get('/api/stats/player', async (_req, res): Promise<void> => {
  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      res.status(400).json({ success: false, stats: null });
      return;
    }

    const stats = await LeaderboardService.getPlayerStats(username);
    const rank = await LeaderboardService.getPlayerRank(username);
    
    res.json({ success: true, stats, rank });
  } catch (error) {
    console.error('Error getting player stats:', error);
    res.status(500).json({ success: false, stats: null });
  }
});

router.get('/api/stats/community', async (_req, res): Promise<void> => {
  const { subredditName } = context;
  
  if (!subredditName) {
    res.status(400).json({ success: false, stats: null });
    return;
  }

  try {
    const stats = await LeaderboardService.getCommunityStats(subredditName);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting community stats:', error);
    res.status(500).json({ success: false, stats: null });
  }
});

// User avatar endpoint
router.get('/api/user/avatar', async (req, res): Promise<void> => {
  try {
    const username = (req.query.username as string) || await reddit.getCurrentUsername();
    
    if (!username) {
      res.status(400).json({ success: false, avatarUrl: null });
      return;
    }

    const user = await reddit.getUserByUsername(username);
    let avatarUrl = null;
    
    // Try to get Snoo avatar URL
    if (user) {
      try {
        avatarUrl = await user.getSnoovatarUrl();
      } catch (e) {
        console.debug('Could not get Snoo avatar');
      }
    }
    
    res.json({ success: true, avatarUrl, username });
  } catch (error) {
    console.error('Error getting user avatar:', error);
    res.status(500).json({ success: false, avatarUrl: null });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
