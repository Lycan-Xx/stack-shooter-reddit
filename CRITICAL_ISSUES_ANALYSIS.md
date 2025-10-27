# Critical Issues Analysis - From Console Errors

## Issue 1: CSP Blocking Audio Files 🔴 CRITICAL
**Error:** `Content-Security-Policy: The page's settings blocked the loading of a resource (media-src)`

**Root Cause:**
- All sound files are hosted on `https://play.rosebud.ai/`
- Reddit's CSP only allows audio from Reddit domains
- External audio URLs are blocked

**Impact:**
- No sound effects work
- Trying to play sounds causes errors
- May contribute to performance issues

**Solution:**
- Disable sound manager in multiplayer
- Or use data URIs for sounds
- Or host sounds on Reddit-approved domains

---

## Issue 2: 503 Server Errors 🔴 CRITICAL
**Error:** `POST /api/match/action [HTTP/2 503]` and `POST /api/match/tick [HTTP/2 503]`

**Root Cause:**
- Server endpoints returning 503 (Service Unavailable)
- Likely Redis connection issues or server overload
- Happens during gameplay

**Impact:**
- Match state not updating
- Bullets not registering
- Position not syncing
- Game unplayable

**Solution:**
- Add error handling
- Reduce request frequency
- Add retry logic
- Check Redis connection

---

## Issue 3: Flickering 🔴 CRITICAL
**Root Cause:**
- The `ctx.clip()` operation I added for circular avatars
- Clip state not being restored properly
- Affects entire canvas rendering

**Code Problem:**
```javascript
ctx.beginPath();
ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
ctx.clip(); // This affects ALL subsequent drawing!
ctx.drawImage(...);
ctx.restore(); // Restore doesn't fully reset clip
```

**Solution:**
- Remove clip() operation
- Use different method for circular avatars
- Or save/restore properly around clip

---

## Issue 4: Character Orientation
**Problem:** Characters don't have definitive orientation

**Root Cause:**
- Circular Snoo avatars don't show direction
- No visual indicator of where player is facing

**Solution:**
- Add direction arrow/indicator
- Keep rotation but add visual cue
- Or use asymmetric sprite

---

## Immediate Fixes Needed

### Priority 1: Remove Clip (Stop Flickering)
```javascript
// REMOVE THIS:
ctx.beginPath();
ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
ctx.clip();

// JUST DRAW:
ctx.drawImage(playerImage, -player.size/2, -player.size/2, player.size, player.size);
```

### Priority 2: Disable Sounds in Multiplayer
```javascript
// In sound.js or where sounds are played
if (isMultiplayer) {
  // Don't play sounds - they're blocked by CSP anyway
  return;
}
```

### Priority 3: Handle 503 Errors
```javascript
// Add retry logic
try {
  await fetch('/api/match/tick', { method: 'POST' });
} catch (error) {
  console.error('Server error, retrying...');
  // Don't spam - wait before retry
}
```

### Priority 4: Add Direction Indicator
```javascript
// Draw arrow showing direction
ctx.beginPath();
ctx.moveTo(player.x + Math.cos(player.angle) * 20, player.y + Math.sin(player.angle) * 20);
ctx.lineTo(...);
ctx.stroke();
```
