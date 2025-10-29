# Firefox Console Log Streamer

Stream Firefox console logs directly to your Kiro terminal.

## Quick Start (Recommended)

**One command to start Firefox and stream logs:**
```bash
npm run firefox-watch -- --url=https://www.reddit.com/r/stack_shooter_dev/?playtest=stack-shooter
```

This will:
1. Start Firefox with debugging enabled
2. Wait for you to navigate to the URL
3. Automatically connect and stream console logs

## Manual Setup (Alternative)

1. **Start Firefox with remote debugging:**
   ```bash
   npm run firefox-debug
   ```

2. **Open your app in Firefox:**
   Navigate to the page you want to monitor

3. **Run the log streamer:**
   ```bash
   npm run firefox-logs -- --url=http://localhost:5173
   ```

## Configuration

Edit `tools/firefox-debug-config.json` to customize:
```json
{
  "port": 6000,
  "firefoxPath": "C:\\Program Files\\Mozilla Firefox\\firefox.exe"
}
```

## Examples

### Watch your Devvit app:
```bash
npm run firefox-watch -- --url=https://www.reddit.com/r/stack_shooter_dev/?playtest=stack-shooter
```

### Watch local development:
```bash
npm run firefox-watch -- --url=http://localhost:5173
```

### Manual workflow:
```bash
# Terminal 1: Start Firefox
npm run firefox-debug

# Terminal 2: Stream logs
npm run firefox-logs -- --url=http://localhost:5173
```

## Features

- 📄 Streams all console.log, console.info, console.warn, console.error
- 🕐 Shows timestamps for each log
- 🎨 Color-coded log levels with icons
- 🔌 Auto-detects the correct Firefox tab
- ⌨️ Graceful exit with Ctrl+C

## Troubleshooting

**"No Firefox tab found"**
- Make sure Firefox is open with the target URL
- Check that the URL matches exactly (including protocol)

**"Connection refused"**
- Ensure Firefox was started with `--start-debugger-server`
- Check that port 6000 is not blocked

**"WebSocket error"**
- Restart Firefox with debugging enabled
- Try closing other Firefox debugging sessions
