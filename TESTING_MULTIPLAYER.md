# Testing Multiplayer Features

## Quick Start

### 1. Start Development Server
```bash
npm run dev
```

This will:
- Start the Devvit playtest server
- Provide a test URL (e.g., `https://www.reddit.com/r/stack_shooter_dev?playtest=stack-shooter`)
- Create a test subreddit automatically

### 2. Test with Multiple Players

**Option A: Multiple Browsers**
1. Open the playtest URL in Chrome
2. Open the same URL in Firefox or Edge
3. Click "Multiplayer" on both
4. Wait for matchmaking

**Option B: Incognito Mode**
1. Open playtest URL in normal browser
2. Open same URL in incognito/private window
3. Both should join the same match

**Option C: Multiple Devices**
1. Open playtest URL on desktop
2. Open same URL on mobile
3. Test cross-device multiplayer

## Test Checklist

### Authentication & Session
- [ ] Username displays correctly above player
- [ ] Each player gets unique ID
- [ ] Session persists during gameplay
- [ ] Username shown in HUD

### Matchmaking
- [ ] Queue shows correct position
- [ ] Countdown starts with 2+ players
- [ ] Match starts after 15 seconds
- [ ] Can cancel matchmaking
- [ ] Returns to main menu on cancel

### Real-Time Sync
- [ ] Players see each other immediately
- [ ] Movement is smooth (interpolated)
- [ ] Position updates in real-time
- [ ] Angle/rotation syncs correctly
- [ ] Dash animation shows for remote players

### Gameplay
- [ ] Both players can shoot
- [ ] Both players can dash
- [ ] Health bars display for all players
- [ ] Enemies spawn for both players
- [ ] Kills count separately
- [ ] Scores track independently

### Network Features
- [ ] No visible lag with good connection
- [ ] Graceful degradation with poor connection
- [ ] Player disappears when disconnecting
- [ ] Can rejoin after disconnect
- [ ] Multiple matches per post work

### UI/UX
- [ ] Player count shows in HUD
- [ ] Multiplayer badge displays
- [ ] Remote player usernames visible
- [ ] Health bars render correctly
- [ ] No UI overlap or glitches

## Common Issues

### Players Not Seeing Each Other

**Symptoms**: Joined match but no other players visible

**Solutions**:
1. Check browser console for errors
2. Verify both players in same post
3. Refresh both browsers
4. Check Redis connection in server logs

### Lag or Stuttering

**Symptoms**: Choppy movement, delayed actions

**Solutions**:
1. Check network connection
2. Reduce polling frequency in code
3. Increase interpolation delta
4. Test on faster connection

### Match Not Starting

**Symptoms**: Stuck in matchmaking

**Solutions**:
1. Ensure 2+ players joined
2. Check countdown timer
3. Verify server logs
4. Restart dev server

### Disconnect Issues

**Symptoms**: Player stuck after leaving

**Solutions**:
1. Clear Redis data: `redis.del(matchKey)`
2. Restart dev server
3. Use different browser
4. Check leave match endpoint

## Performance Testing

### Recommended Tests

1. **2 Players** (Minimum)
   - Basic functionality
   - Smooth gameplay
   - No lag

2. **4 Players** (Optimal)
   - Good balance
   - Test coordination
   - Verify sync

3. **8 Players** (Stress Test)
   - Performance check
   - Network load
   - Redis capacity

4. **12 Players** (Maximum)
   - Extreme test
   - Identify bottlenecks
   - Optimize if needed

### Metrics to Monitor

- **Latency**: < 100ms ideal
- **FPS**: 60fps target
- **Network**: < 1MB/min per player
- **Redis**: < 100ms query time

## Debugging

### Enable Console Logging

Add to `src/client/lib/multiplayer.js`:
```javascript
console.log('Position sync:', { x, y, angle });
console.log('Remote players:', remotePlayers);
console.log('Actions received:', actions);
```

### Check Redis State

In server code:
```typescript
const match = await redis.get(`match:${postId}:current`);
console.log('Current match:', JSON.parse(match));
```

### Network Tab

1. Open browser DevTools
2. Go to Network tab
3. Filter by "api"
4. Check request/response times
5. Verify payload sizes

## Production Testing

### Before Launch

1. Test with real Reddit accounts
2. Verify on mobile devices
3. Check different network speeds
4. Test with 10+ players
5. Monitor server logs
6. Check Redis memory usage

### After Launch

1. Monitor error rates
2. Track player counts
3. Check match completion rates
4. Gather user feedback
5. Optimize based on data

## Automated Testing (Future)

### Unit Tests
- Matchmaking logic
- Position interpolation
- Action broadcasting
- State management

### Integration Tests
- API endpoints
- Redis operations
- Client-server sync
- Match lifecycle

### E2E Tests
- Full multiplayer flow
- Multiple players
- Disconnect handling
- Performance benchmarks

## Support

If you encounter issues:

1. Check `MULTIPLAYER.md` for architecture details
2. Review server logs for errors
3. Test with `npm run dev` locally
4. Check Redis connection
5. Verify Devvit configuration

## Next Steps

After successful testing:

1. Deploy with `npm run launch`
2. Test in production subreddit
3. Gather user feedback
4. Iterate on features
5. Add enhancements from roadmap
