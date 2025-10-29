#!/usr/bin/env node

import WebSocket from 'ws';
import http from 'http';

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find((arg) => arg.startsWith('--url='));
const targetUrl = urlArg ? urlArg.split('=')[1] : null;
const port = args.find((arg) => arg.startsWith('--port='))?.split('=')[1] || '6000';

console.log('🦊 Firefox Console Log Streamer');
console.log('================================\n');

if (!targetUrl) {
  console.log('Usage: node firefox-log-stream.js --url=<page-url> [--port=6000]');
  console.log('\nExample:');
  console.log('  node firefox-log-stream.js --url=http://localhost:5173\n');
  console.log('Make sure Firefox is running with: npm run firefox-debug\n');
  process.exit(1);
}

async function connectToFirefox() {
  try {
    console.log(`📡 Connecting to Firefox debugger on port ${port}...`);

    // Connect directly to Firefox's debugging WebSocket
    const ws = new WebSocket(`ws://localhost:${port}`);
    let messageId = 1;
    let rootActor = null;
    let consoleActor = null;
    let tabActor = null;

    ws.on('open', () => {
      console.log('✅ Connected to Firefox debugger');
      // Request root actor
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

          // Find matching tab
          const matchingTab = msg.tabs.find((tab) => tab.url && tab.url.includes(targetUrl));

          if (!matchingTab) {
            console.error(`❌ No tab found with URL: ${targetUrl}`);
            console.log('\n📋 Available tabs:');
            msg.tabs.forEach((tab, i) => {
              console.log(`  ${i + 1}. ${tab.url || tab.title || 'Unknown'}`);
            });
            ws.close();
            process.exit(1);
          }

          tabActor = matchingTab.actor;
          console.log(`✅ Found tab: ${matchingTab.title || matchingTab.url}`);
          console.log('🔌 Attaching to tab...\n');

          // Attach to the tab
          ws.send(
            JSON.stringify({
              to: tabActor,
              type: 'attach',
            })
          );
        }

        // Tab attached, get console actor
        if (msg.from === tabActor && msg.type === 'tabAttached') {
          consoleActor = msg.consoleActor;
          console.log('📝 Starting console log stream...\n');

          // Start listening to console messages
          ws.send(
            JSON.stringify({
              to: consoleActor,
              type: 'startListeners',
              listeners: ['ConsoleAPI', 'PageError'],
            })
          );
        }

        // Console message received
        if (msg.type === 'consoleAPICall') {
          const { level, arguments: args } = msg.message;
          const timestamp = new Date().toLocaleTimeString();

          const text = args
            .map((arg) => {
              if (typeof arg === 'string') return arg;
              if (arg && typeof arg === 'object') return JSON.stringify(arg);
              return String(arg);
            })
            .join(' ');

          const icon =
            {
              log: '📄',
              info: 'ℹ️',
              warn: '⚠️',
              error: '❌',
              debug: '🐛',
            }[level] || '📄';

          console.log(`[${timestamp}] ${icon} ${level.toUpperCase()}: ${text}`);
        }

        // Handle Runtime.consoleAPICalled (for console.log, etc.)
        if (msg.method === 'Runtime.consoleAPICalled') {
          const { type, args, timestamp } = msg.params;
          const time = new Date(timestamp).toLocaleTimeString();

          const icon =
            {
              log: '📄',
              info: 'ℹ️',
              warn: '⚠️',
              error: '❌',
              debug: '🐛',
              trace: '🔍',
            }[type] || '📄';

          const values = args
            .map((arg) => {
              if (arg.value !== undefined) return arg.value;
              if (arg.description) return arg.description;
              return arg.type;
            })
            .join(' ');

          console.log(`[${time}] ${icon} ${type.toUpperCase()}: ${values}`);
        }
      } catch (e) {
        // Ignore parse errors
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      process.exit(1);
    });

    ws.on('close', () => {
      console.log('\n🔌 Connection closed');
      process.exit(0);
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping log stream...');
      ws.close();
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure Firefox is running with:');
    console.log('   npm run firefox-debug\n');
    process.exit(1);
  }
}

connectToFirefox();
