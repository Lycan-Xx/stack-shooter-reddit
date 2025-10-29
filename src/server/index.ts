import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { LeaderboardService } from './core/leaderboard';
import { ChallengeService } from './core/challenges';

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

// Submit score to leaderboard
router.post('/api/score/submit', async (req, res): Promise<void> => {
  const { subredditName } = context;
  const { score, wave, kills, difficulty } = req.body as {
    score: number;
    wave: number;
    kills: number;
    difficulty: string;
  };
  
  if (!subredditName) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      res.status(400).json({ success: false });
      return;
    }

    // Log game completion for analytics
    console.log(`Game completed: ${username} - Wave ${wave}, ${kills} kills, ${difficulty} difficulty, Score: ${score}`);

    await LeaderboardService.saveMatchResult(
      username,
      subredditName,
      score,
      kills,
      kills,
      false
    );

    const rank = await LeaderboardService.getPlayerRank(username);
    
    res.json({ success: true, rank });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ success: false });
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

// Daily Challenge endpoints
router.get('/api/challenge/daily', async (_req, res): Promise<void> => {
  try {
    const challenge = await ChallengeService.getDailyChallenge();
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    res.status(500).json({ success: false, challenge: null });
  }
});

router.post('/api/challenge/submit', async (req, res): Promise<void> => {
  const { score, wave, kills, date } = req.body as {
    score: number;
    wave: number;
    kills: number;
    date: string;
  };

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      res.status(400).json({ success: false, rank: 0 });
      return;
    }

    const rank = await ChallengeService.submitChallengeScore(username, date, score, wave, kills);

    res.json({ success: true, rank });
  } catch (error) {
    console.error('Error submitting challenge score:', error);
    res.status(500).json({ success: false, rank: 0 });
  }
});

router.get('/api/challenge/leaderboard', async (req, res): Promise<void> => {
  const date = (req.query.date as string | undefined) || new Date().toISOString().split('T')[0];

  try {
    const leaderboard = await ChallengeService.getChallengeLeaderboard(date);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting challenge leaderboard:', error);
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

router.get('/api/challenge/stats', async (req, res): Promise<void> => {
  const date = (req.query.date as string | undefined) || new Date().toISOString().split('T')[0];

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      res.status(400).json({ success: false, stats: null });
      return;
    }

    const stats = await ChallengeService.getPlayerChallengeStats(username, date);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting challenge stats:', error);
    res.status(500).json({ success: false, stats: null });
  }
});

// Daily Challenge endpoints
router.get('/api/challenge/daily', async (_req, res): Promise<void> => {
  try {
    const challenge = await ChallengeService.getDailyChallenge();
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    res.status(500).json({ success: false, challenge: null });
  }
});

router.post('/api/challenge/submit', async (req, res): Promise<void> => {
  const { score, wave, kills, date } = req.body as {
    score: number;
    wave: number;
    kills: number;
    date: string;
  };

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      res.status(400).json({ success: false, rank: 0 });
      return;
    }

    const rank = await ChallengeService.submitChallengeScore(username, date, score, wave, kills);
    res.json({ success: true, rank });
  } catch (error) {
    console.error('Error submitting challenge score:', error);
    res.status(500).json({ success: false, rank: 0 });
  }
});

router.get('/api/challenge/leaderboard', async (req, res): Promise<void> => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  try {
    const leaderboard = await ChallengeService.getChallengeLeaderboard(date);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting challenge leaderboard:', error);
    res.status(500).json({ success: false, leaderboard: [] });
  }
});

router.get('/api/challenge/stats', async (req, res): Promise<void> => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      res.status(400).json({ success: false, stats: null });
      return;
    }

    const stats = await ChallengeService.getPlayerChallengeStats(username, date);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting challenge stats:', error);
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
