# Multiplayer Implementation Guide

## Overview

This game now supports real-time multiplayer for 2-12 players using Reddit's Devvit platform. Players can join matches, see each other in real-time, and compete together against vampire hordes.

## Architecture

### Server-Side (`src/server/`)

**Matchmaking Service** (`core/matchmaking.ts`)
- Session-based matchmaking per Reddit post
- Queue system for waiting players
- 15-second countdown before match starts
- Redis-based state management
- Support for 2-12 players per match

**API Endpoints** (`index.ts`)
- `POST /api/match/join` - Join or create a match
- `GET /api/match/state` - Get current match state and player positions
- `POST /api/match/action` - Broadcast player actions (move, shoot, dash)
- `POST /api/match/leave` - Leave current match
- `POST /api/match/start` - Start the match

### Client-Side (`src/client/`)

**Multiplayer Client** (`lib/multiplayer.js`)
- WebSocket-like polling system (100ms intervals)
- Position synchronization
- Action broadcasting
- Network interpolation for smooth movement
- Automatic reconnection handling

**UI Components**
- `MatchmakingScreen.jsx` - Queue and countdown UI
- Updated `StartScreen.jsx` - Multiplayer button
- Updated `HUD.jsx` - Player count display
- Updated `Game.jsx` - Multiplayer integration

**Game Loop** (`hooks/useGameLoop.js`)
- Multiplayer state management
- Remote player rendering
- Position syncing every 50ms
- Action broadcasting (shoot, dash, move)

## Features Implemented

### ✅ Reddit Authentication
- Automatic username retrieval via Devvit context
- Session management per player
- Username display above players

### ✅ Real-Time Messaging
- Position updates every 50ms
- Action broadcasting (shoot, dash, kill)
- State synchronization every 100ms
- Message retention for 60 seconds

### ✅ Multiplayer Sync
- Player position broadcasting
- Remote player rendering with interpolation
- Health bar display for all players
- Username labels above players
- Smooth movement prediction

### ✅ Matchmaking System
- Queue-based matchmaking
- 2-12 player support
- 15-second countdown timer
- Match ID generation per post
- Automatic match formation

### ✅ Network Features
- Position interpolation for smooth movement
- Angle wrapping for proper rotation
- Delta-based state updates
- Efficient Redis storage

## How It Works

### Joining a Match

1. Player clicks "Multiplayer" button
2. Client calls `/api/match/join`
3. Server adds player to queue or existing match
4. If 2+ players ready, countdown starts
5. After 15 seconds, match begins

### During Gameplay

1. **Position Sync** (every 50ms)
   - Client sends position, angle, isDashing
   - Server updates match state
   - Other clients receive updates

2. **Action Broadcasting**
   - Shoot, dash, kill actions sent immediately
   - Stored in Redis with timestamp
   - Retrieved by other clients on next poll

3. **State Polling** (every 100ms)
   - Client requests match state
   - Receives player positions and recent actions
   - Interpolates movement for smooth rendering

### Leaving a Match

1. Player leaves or disconnects
2. Client calls `/api/match/leave`
3. Server removes player from match
4. Broadcasts disconnect action
5. Other players see them disappear

## Technical Details

### Redis Data Structure

```
match:{postId}:queue          - Sorted set of waiting players
match:{postId}:current        - Current match state (JSON)
match:{postId}:actions        - Hash of recent actions
player:{playerId}             - Player metadata (username, postId)
```

### Network Protocol

**Position Update**
```javascript
{
  type: 'move',
  playerId: 'username_timestamp',
  data: { x, y, angle, isDashing },
  timestamp: Date.now()
}
```

**Action Broadcast**
```javascript
{
  type: 'shoot' | 'dash' | 'kill',
  playerId: 'username_timestamp',
  data: { ... },
  timestamp: Date.now()
}
```

### Interpolation

Remote players use linear interpolation (lerp) with 20% delta for smooth movement:
```javascript
player.x += (targetX - player.x) * 0.2
player.y += (targetY - player.y) * 0.2
```

## Testing

### Local Testing

1. Run `npm run dev`
2. Open playtest URL in browser
3. Open same URL in incognito/another browser
4. Both players should see each other

### Production Testing

1. Deploy with `npm run launch`
2. Create post in subreddit
3. Multiple users can join from Reddit

## Performance Considerations

- **Polling Rate**: 100ms (10 updates/second)
- **Position Sync**: 50ms (20 updates/second)
- **Message Retention**: 60 seconds
- **Max Players**: 12 (configurable)
- **Redis Expiry**: 1 hour for matches

## Future Enhancements

### Potential Improvements
- WebSocket support (when Devvit adds it)
- Server-side enemy synchronization
- Shared wave progression
- Team-based gameplay
- Voice chat integration
- Spectator mode
- Replay system
- Leaderboards per match

### Known Limitations
- No WebSocket support (using polling)
- Client-side enemy spawning (not synced)
- No server-side hit detection
- Limited to 30-second request timeout
- 4MB request / 10MB response limits

## Troubleshooting

### Players Not Seeing Each Other
- Check Redis connection
- Verify postId is consistent
- Check browser console for errors
- Ensure both players in same match

### Lag or Stuttering
- Reduce polling frequency
- Increase interpolation delta
- Check network latency
- Verify Redis performance

### Match Not Starting
- Ensure minimum 2 players
- Check countdown timer
- Verify match state in Redis
- Check server logs

## Code References

- **Matchmaking**: `src/server/core/matchmaking.ts`
- **Client**: `src/client/lib/multiplayer.js`
- **API**: `src/server/index.ts`
- **Types**: `src/shared/types/api.ts`
- **Game Loop**: `src/client/hooks/useGameLoop.js`
- **UI**: `src/client/components/MatchmakingScreen.jsx`
