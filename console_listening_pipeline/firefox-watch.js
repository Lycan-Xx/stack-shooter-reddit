#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read config
const config = JSON.parse(readFileSync(join(__dirname, 'firefox-debug-config.json'), 'utf8'));

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find((arg) => arg.startsWith('--url='));
const targetUrl = urlArg ? urlArg.split('=')[1] : null;

console.log('🦊 Firefox Debug & Log Watcher');
console.log('================================\n');

if (!targetUrl) {
  console.log('Usage: npm run firefox-watch -- --url=<page-url>');
  console.log('\nExample:');
  console.log('  npm run firefox-watch -- --url=http://localhost:5173\n');
  process.exit(1);
}

console.log(`🚀 Starting Firefox with debugging on port ${config.port}...`);
console.log(`📍 Target URL: ${targetUrl}\n`);

// Start Firefox with debugging
const firefox = spawn(config.firefoxPath, ['--start-debugger-server', config.port.toString()], {
  detached: true,
  stdio: 'ignore',
});

firefox.unref();

console.log('⏳ Waiting for Firefox to start (5 seconds)...\n');

// Wait for Firefox to start, then connect
setTimeout(() => {
  console.log('🔌 Attempting to connect to debugger...\n');
  connectToFirefox();
}, 5000);

async function connectToFirefox() {
  try {
    const ws = new WebSocket(`ws://localhost:${config.port}`);
    let tabActor = null;
    let consoleActor = null;

    ws.on('open', () => {
      console.log('✅ Connected to Firefox debugger');
      ws.send(
        JSON.stringify({
          to: 'root',
          type: 'getRoot',
        })
      );
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        // Got root actor
        if (msg.from === 'root' && msg.tabs) {
          console.log(`📋 Found ${msg.tabs.length} tab(s)`);

          const matchingTab = msg.tabs.find((tab) => tab.url && tab.url.includes(targetUrl));

          if (!matchingTab) {
            console.log(`⏳ Waiting for tab with URL: ${targetUrl}`);
            console.log('   Please navigate to your app in Firefox...\n');

            // Retry every 2 seconds
            setTimeout(() => {
              ws.send(
                JSON.stringify({
                  to: 'root',
                  type: 'getRoot',
                })
              );
            }, 2000);
            return;
          }

          tabActor = matchingTab.actor;
          console.log(`✅ Found tab: ${matchingTab.title || matchingTab.url}`);
          console.log('🔌 Attaching to tab...\n');

          ws.send(
            JSON.stringify({
              to: tabActor,
              type: 'attach',
            })
          );
        }

        // Tab attached
        if (msg.from === tabActor && msg.type === 'tabAttached') {
          consoleActor = msg.consoleActor;
          console.log('📝 Console log stream started!\n');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

          ws.send(
            JSON.stringify({
              to: consoleActor,
              type: 'startListeners',
              listeners: ['ConsoleAPI', 'PageError'],
            })
          );
        }

        // Console message
        if (msg.type === 'consoleAPICall') {
          const { level, arguments: msgArgs, timeStamp } = msg.message;
          const time = new Date(timeStamp).toLocaleTimeString();

          const icon =
            {
              log: '📄',
              info: 'ℹ️',
              warn: '⚠️',
              error: '❌',
              debug: '🐛',
              trace: '🔍',
            }[level] || '📄';

          const values =
            msgArgs
              ?.map((arg) => {
                if (typeof arg === 'object' && arg.type === 'longString') {
                  return arg.initial || arg.actor;
                }
                return arg;
              })
              .join(' ') || '';

          console.log(`[${time}] ${icon} ${level.toUpperCase()}: ${values}`);
        }

        // Page error
        if (msg.type === 'pageError') {
          const { errorMessage, timeStamp, level } = msg.pageError;
          const time = new Date(timeStamp).toLocaleTimeString();
          const icon = level === 'error' ? '❌' : '⚠️';

          console.log(`[${time}] ${icon} ${level?.toUpperCase() || 'ERROR'}: ${errorMessage}`);
        }
      } catch (e) {
        // Ignore parse errors
      }
    });

    ws.on('error', (error) => {
      console.error('❌ Connection failed:', error.message);
      console.log('\n💡 Make sure Firefox started correctly');
      console.log('   Try running: npm run firefox-debug\n');
      process.exit(1);
    });

    ws.on('close', () => {
      console.log('\n🔌 Connection closed');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping log stream...');
      ws.close();
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
