## 🧛 Vampire Siege

An intense top-down shooter game built for Reddit's Devvit platform. Defend against endless waves of vampires, collect powerful upgrades, and hold your ground as long as you can in this fast-paced survival shooter.

### What Makes This Game Unique

- **Vampire Survivors-Style Progression**: Unlock powerful upgrades every 3 waves to customize your playstyle
- **Dynamic Difficulty System**: Choose from 4 difficulty modes (Easy, Normal, Hard, Nightmare) that dramatically change gameplay
- **Mobile-First Design**: Fully optimized for both desktop and mobile with touch controls and virtual joystick
- **Progressive Wave System**: Enemies get stronger and more numerous as you advance through waves
- **Dash Mechanic**: Strategic dash ability with energy management adds depth to combat
- **Visual Polish**: Particle effects, blood splatters, floating damage numbers, and smooth animations
- **Built-in Tutorial**: Interactive tutorial mode teaches new players the mechanics step-by-step
- **Reddit Integration**: Runs natively within Reddit posts using Devvit's web platform

### How to Play

**Objective**: Survive as many waves as possible while racking up kills and points. Complete waves to unlock upgrades and become stronger.

**Controls**:

- Desktop: WASD or Arrow Keys to move, Mouse to aim, Click to shoot, Spacebar to dash
- Mobile: Virtual joystick to move, Tap anywhere to shoot, Dash button for quick escapes

**Gameplay Loop**:

1. Start by selecting your difficulty or playing the tutorial
2. Vampires spawn from the edges of the screen and chase you
3. Shoot them down before they reach you and drain your health
4. Clear all enemies to complete the wave and restore your health
5. Every 3 waves, choose from 3 random upgrades to enhance your abilities
6. Survive as long as possible and achieve the highest score

**Upgrades Available**:

- ❤️ Vitality: Increase max health (5 levels)
- 💥 Firepower: Increase bullet damage (5 levels)
- ⚡ Rapid Fire: Shoot faster (5 levels)
- 🏃 Agility: Move faster (5 levels)
- 💨 Quick Dash: Reduce dash cooldown (5 levels)
- 🎯 Piercing Shots: Bullets pierce through enemies (3 levels)

**Difficulty Modes**:

- 😊 Easy: More health, faster movement, fewer enemies
- 😐 Normal: Balanced gameplay for standard challenge
- 😰 Hard: Less health, tougher enemies, higher rewards
- 💀 Nightmare: Extreme challenge for veteran players

**Tips**:

- Use dash strategically to escape when surrounded
- Keep moving to avoid getting cornered
- Aim for groups of enemies if you have piercing shots
- Balance offensive and defensive upgrades
- Watch your dash energy - it regenerates over time

### Technology Stack

- [Devvit](https://developers.reddit.com/): A way to build and deploy immersive games on Reddit
- [Vite](https://vite.dev/): For compiling the webView
- [React](https://react.dev/): For UI
- [Express](https://expressjs.com/): For backend logic
- [Typescript](https://www.typescriptlang.org/): For type safety

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
