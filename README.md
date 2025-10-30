# 🧛 Stack Shooter: Vampire Siege

A community-focused survival shooter built for Reddit's Devvit platform. Defend against endless waves of vampires while competing with your subreddit and squad for glory.

**Built for the Reddit x Kiro Hackathon 2025**

---

## 🎮 What Makes This Different

Most games just post on Reddit and hope for upvotes. Stack Shooter is **designed for Reddit's community structure** - your subreddit membership actually matters.

### Core Gameplay
- **Vampire Survivors-Style Action**: Top-down shooter with wave-based progression
- **4 Difficulty Modes**: Easy, Normal, Hard, Nightmare
- **6 Upgrade Paths**: Vitality, Firepower, Rapid Fire, Agility, Quick Dash, Piercing Shots
- **Mobile-First Design**: Touch controls, virtual joystick, optimized for phones
- **Tutorial Mode**: Interactive onboarding for new players

### Community Features (The Innovation)

**🏆 4 Leaderboard Types**
- **Global**: Compete with everyone worldwide
- **Subreddit**: r/gaming vs r/indiegaming - community pride
- **Daily**: Resets every 24 hours - fresh competition
- **Weekly**: Consistent performance over time

**👥 Squad System**
- Create or join squads (teams within your subreddit)
- Individual scores combine into squad totals
- Squad vs squad competition
- Team leaderboards

**🎯 Daily Challenges**
- Same modifiers for everyone each day
- 8 unique challenge types (Speed Demons, The Horde, Tank Mode, etc.)
- Creates shared experiences to discuss in comments
- Challenge-specific leaderboards

**� CommunDity Stats**
- Track collective achievements
- Total vampires killed across all players
- Total battles fought
- Subreddit vs subreddit competition

### Why This Works on Reddit
- **Async Multiplayer**: Play anytime, score still counts
- **No Lag**: No servers, no battery drain
- **Mobile Perfect**: Works great on phones where Reddit users browse
- **Community Identity**: Subreddit leaderboards create pride and rivalry
- **Emergent Behavior**: Squads form tournaments, subreddits coordinate challenges

---

## 🎯 How to Play

### Controls
- **Desktop**: WASD/Arrows to move, Mouse to aim, Click to shoot, Spacebar to dash
- **Mobile**: Virtual joystick to move, Tap to shoot, Dash button

### Gameplay Loop
1. Select difficulty or try tutorial
2. Survive waves of vampires
3. Unlock upgrades every 3 waves
4. Your score goes to your squad and subreddit
5. Compete on 4 different leaderboards
6. Try daily challenges for shared competition

### Tips
- Use dash strategically when surrounded
- Keep moving to avoid getting cornered
- Balance offensive and defensive upgrades
- Join a squad to compete as a team
- Try daily challenges for variety

---

## 🛠️ Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform
- **[React](https://react.dev/)**: Frontend UI
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Vite](https://vite.dev/)**: Build tool
- **[Express](https://expressjs.com/)**: Backend API
- **Redis**: Data persistence (via Devvit)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ installed
- Reddit account
- Devvit CLI

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Lycan-Xx/stack-shooter-reddit.git
cd stack-shooter-reddit
```

2. **Install dependencies**
```bash
npm install
```

3. **Login to Devvit**
```bash
npm run login
```

4. **Start development server**
```bash
npm run dev
```

This will:
- Build client and server
- Start Devvit playtest
- Provide a Reddit URL to test your app

### Commands

```bash
npm run dev          # Development with live reload
npm run build        # Build for production
npm run deploy       # Upload to Reddit
npm run launch       # Publish for review
npm run check        # Type check, lint, format
npm run login        # Login to Devvit CLI
```

---

## 📁 Project Structure

```
stack-shooter/
├── src/
│   ├── client/          # React frontend
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Game logic
│   │   └── main.jsx     # Entry point
│   ├── server/          # Express backend
│   │   ├── core/        # Business logic
│   │   │   ├── leaderboard.ts
│   │   │   ├── challenges.ts
│   │   │   └── squads.ts
│   │   └── index.ts     # API endpoints
│   └── shared/          # Shared types
│       └── types/
│           └── api.ts   # Type definitions
├── docs/                # Documentation
│   ├── hackathon/       # Hackathon submission docs
│   └── development/     # Development phase docs
├── .kiro/               # Kiro AI configuration
│   ├── hooks/           # Custom automation hooks
│   └── steering/        # Best practice guides
└── devvit.json          # Devvit configuration
```

---

## 🏆 Hackathon Submission

This project was built for the **Reddit x Kiro Hackathon 2025** (October 13-29, 2025).

### Categories
- **Community Play**: Squad system, daily challenges, 4 leaderboard types
- **Best Kiro Developer Experience**: 60+ hours of deliberate development with Kiro

### Key Features for Judging
- ✅ Custom first screen with community stats
- ✅ Subreddit-specific leaderboards (unique!)
- ✅ Squad system for team competition
- ✅ Daily challenges with 8 modifiers
- ✅ Async multiplayer perfect for mobile
- ✅ Clean, type-safe architecture
- ✅ Comprehensive documentation

### Documentation
- **Kiro Development Experience**: `docs/hackathon/KIRO_DEVELOPMENT_EXPERIENCE.md`
- **Hackathon Readiness**: `docs/hackathon/HACKATHON_READINESS.md`
- **Video Script**: `docs/hackathon/FINAL_VIDEO_SCRIPT.md`
- **Phase Documentation**: `docs/development/PHASE*.md`

---

## 🎨 Development with Kiro

This project was built using **Kiro AI** as a conversational development partner over 60+ hours.

### Kiro Integration
- **Custom Hooks**: Auto-commit messages, README updates, splash screen generation
- **Steering Files**: Best practices, API patterns, refactoring checklists
- **Phased Development**: PHASE1 (cleanup), PHASE2 (leaderboards), PHASE3 (challenges)

### Key Learnings
- Used Kiro conversationally to discuss problems and solutions
- Created custom automation for workflow efficiency
- Documented journey in phases for clarity
- Built deliberately, understanding every architectural decision

See `docs/hackathon/KIRO_DEVELOPMENT_EXPERIENCE.md` for full details.

---

## 🎯 Features

### Gameplay
- [x] 4 difficulty modes
- [x] 6 upgrade paths with multiple levels
- [x] Wave-based progression
- [x] Dash mechanic with energy management
- [x] Tutorial mode
- [x] Mobile touch controls
- [x] Particle effects and visual polish

### Community
- [x] Global leaderboard
- [x] Subreddit-specific leaderboards
- [x] Daily leaderboards
- [x] Weekly leaderboards
- [x] Squad creation and management
- [x] Squad leaderboards
- [x] Daily challenges with 8 modifiers
- [x] Community statistics
- [x] Personal statistics

### Technical
- [x] Type-safe client-server communication
- [x] Responsive design (mobile/tablet/desktop)
- [x] Redis data persistence
- [x] Clean, modular architecture
- [x] Zero compilation errors
- [x] Comprehensive documentation

---

## 📝 License

BSD-3-Clause License - See [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

This project was built for a hackathon and is primarily for demonstration purposes. However, if you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🔗 Links

- **Repository**: https://github.com/Lycan-Xx/stack-shooter-reddit.git
- **Devvit Platform**: https://developers.reddit.com/
- **Kiro AI**: https://kiro.ai/

---

## 📧 Contact

Built by **Lycan-Xx** for the Reddit x Kiro Hackathon 2025.

- **Email**: msbello514@gmail.com
- **GitHub**: [@Lycan-Xx](https://github.com/Lycan-Xx)

---

**Stack Shooter: Where your subreddit membership actually matters.** 🧛‍♂️🎮

