# 🧛 Vampire Hunter: Night of the Blood Moon

A thrilling top-down shooter game where you battle hordes of vampires in a dark, atmospheric world. Survive wave after wave of undead enemies, collect upgrades, and become the ultimate vampire hunter!

![Game Screenshot](https://via.placeholder.com/800x400/1a0a1a/c41e3a?text=Vampire+Hunter+Game)

## 🎮 Features

- **Wave-based Survival**: Face increasingly difficult waves of vampires
- **Upgrade System**: Choose powerful upgrades every 3 waves (Vampire Survivors style)
- **Multiple Difficulty Levels**: Easy, Normal, and Hard modes
- **Tutorial Mode**: Learn the basics with guided gameplay
- **Sound Effects & Music**: Immersive audio experience
- **Mobile Support**: Touch controls for mobile devices
- **Desktop Controls**: WASD movement with mouse aiming
- **Particle Effects**: Blood splatters, muzzle flashes, and visual feedback
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Python 3.x** (for running the local server)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **No additional dependencies** - runs entirely in the browser

### Installation & Setup

1. **Clone or download** the project files to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd path/to/shoot-stack
   ```

3. **Start the local development server**:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Or using Python 2
   python -m SimpleHTTPServer 8000
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

5. **Start playing!** Click "📚 Tutorial" to learn the basics or choose a difficulty level.

## 🎯 How to Play

### Objective
Survive as long as possible against waves of vampires. Kill enemies to earn points and progress through increasingly difficult waves.

### Controls

#### Desktop Controls
- **WASD** or **Arrow Keys** - Move your character
- **Mouse** - Aim your weapon
- **Left Click** - Shoot bullets
- **Spacebar** - Dash (temporary invincibility)
- **M** (top-right corner) - Toggle sound on/off

#### Mobile Controls
- **Virtual Joystick** (bottom-left) - Move your character
- **Tap Screen** - Shoot in the direction of your tap
- **Dash Button** (bottom-right) - Perform dash
- **Mute Button** (top-right) - Toggle sound

### Game Mechanics

#### Health System
- Your health is shown in the top-left HUD
- Vampires deal damage on contact (unless you're dashing)
- Full heal between waves

#### Dash Ability
- Press SPACE (desktop) or tap DASH button (mobile)
- Temporary invincibility while dashing
- Has a cooldown period (shown at bottom of screen)

#### Upgrades
- Every 3 waves, choose from 3 random upgrades
- Upgrades include: increased health, damage, fire rate, speed, dash cooldown reduction, and piercing shots
- Each upgrade can be leveled up to 5 times (except piercing shots: max 3)

#### Scoring
- Kill vampires to earn points
- Higher difficulty multipliers give more points
- Wave completion bonuses

### Difficulty Levels

- **😊 Easy**: Reduced enemy health/damage, slower scaling
- **⚔️ Normal**: Balanced gameplay
- **💀 Hard**: Increased enemy health/damage, faster scaling

## 📁 Project Structure

```
shoot-stack/
├── index.html              # Main HTML file with game UI
├── game.js                 # Main game logic and loop
├── js/
│   ├── difficulty.js       # Difficulty configurations
│   ├── entities.js         # Game entities (Vampire, Bullet, Particle, etc.)
│   ├── sound.js           # Sound management system
│   ├── tutorial.js        # Tutorial system
│   └── upgrades.js        # Upgrade system
└── README.md              # This file
```

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** - For rendering the game world
- **Vanilla JavaScript (ES6 Modules)** - No frameworks, pure JS
- **CSS3** - For styling and animations
- **Web Audio API** - For sound effects and music

### Browser Compatibility
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Performance
- 60 FPS gameplay loop
- Optimized particle systems
- Efficient collision detection
- Mobile-responsive design

## 🎵 Audio Assets

The game uses external audio assets hosted on play.rosebud.ai:
- Background music
- Sound effects for shooting, enemy hits, deaths, etc.
- All audio is loaded dynamically

## 📱 Mobile Optimization

- Touch-friendly controls
- Responsive UI that adapts to screen size
- Virtual joystick and buttons
- Optimized for both portrait and landscape orientations

## 🐛 Known Issues & Troubleshooting

### Common Issues

1. **"Loading failed for module" errors**
   - **Solution**: Make sure you're running a local server (not opening index.html directly)
   - The game requires ES6 modules which need HTTP/HTTPS protocol

2. **Audio not playing**
   - **Solution**: Some browsers block autoplay. Click anywhere on the page first, then toggle sound with the mute button

3. **Game not loading on mobile**
   - **Solution**: Ensure you're using a modern mobile browser (Chrome, Safari, etc.)

4. **Performance issues**
   - **Solution**: Close other browser tabs. The game runs best on dedicated hardware

### Development Tips

- Use browser developer tools (F12) to debug
- Check the console for any JavaScript errors
- Network tab shows asset loading status

## 🤝 Contributing

This is a complete, self-contained game project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Submit a pull request

### Ideas for Enhancement
- Additional enemy types
- New weapons/upgrades
- Boss battles
- Multiplayer support
- Level editor
- Achievement system

## 📄 License

This project is open source. Feel free to use, modify, and distribute as you wish.

## 🙏 Credits

- **Game Design**: Inspired by Vampire Survivors and classic top-down shooters
- **Audio Assets**: Provided by play.rosebud.ai
- **Sprites**: Custom character and enemy sprites
- **Development**: Built with modern web technologies

## 🎮 Enjoy the Game!

Survive the night, hunter! The vampires won't defeat themselves. 🧛‍♂️⚔️

---

**Pro Tip**: Start with the Tutorial mode to learn the controls, then try Easy difficulty to get comfortable before tackling Normal or Hard modes!
