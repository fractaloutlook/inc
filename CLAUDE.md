# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quantum Garden** is a narrative-driven incremental/idle game with quantum physics theming, built entirely in vanilla JavaScript. The game serves as the frontend for an ARG (Alternate Reality Game) and features cosmic horror elements combined with quantum mechanics concepts.

- **Hosted at:** garden.fractaloutlook.com
- **Repository:** github.com/fractaloutlook/inc
- **Tech Stack:** Pure HTML5, CSS3, JavaScript (ES6+) - No frameworks or build tools
- **Current State:** Single monolithic file (8,807 lines) in `quantum-garden.html`

## Development Workflow

### Testing and Running
```bash
# Open quantum-garden.html directly in browser (no build step required)
# Double-click the file or use:
start quantum-garden.html  # Windows
open quantum-garden.html   # macOS
```

### No Build System
- No npm, no package.json, no build step
- Direct browser execution
- All code is in one self-contained HTML file
- Deploy by uploading the single HTML file

### Git Workflow
```bash
# Batch scripts exist for convenience:
gp.bat          # Likely git push
repubinc.bat    # Repository operations
```

## Critical Files and Documentation

**Read these IN ORDER before making changes:**

1. `quantum-garden-design-doc-v4.md` - Full feature design, roadmap, mechanics
2. `quantum-garden-todo.md` - Current task checklist with ✅/⬜ status
3. `HANDOFF-2024-12-16.md` - Development handoff notes, known issues, recommendations
4. `quantum-garden.html` - The entire game (only read specific sections as needed)

## Architecture Overview

### Modular Monolith Pattern

The entire 8,807-line file uses IIFE (Immediately Invoked Function Expression) modules with public APIs:

```javascript
const ManagerName = (() => {
    // Private state
    let state = {};

    // Public API
    return {
        publicMethod() { /* ... */ },
        anotherMethod() { /* ... */ }
    };
})();
```

### Core Modules (in order of appearance)

| Module | Lines | Purpose | Key Functions |
|--------|-------|---------|---------------|
| `GameData` | ~843 | Static configuration for all game entities | Resources, plants, mutations, upgrades, achievements |
| `Utils` | ~62 | Number formatting utilities | `formatNumber()`, `formatTime()` |
| `TooltipManager` | ~116 | Interactive tooltips | `show()`, `hide()` |
| `ResourceGainTracker` | ~116 | Resource gain animations | `showGain()`, `showHarvestFloat()` |
| `StateManager` | ~232 | Game state persistence | `save()`, `load()`, `exportSave()` |
| `ResourceManager` | ~96 | Resource tracking | `add()`, `spend()`, `isUnlocked()` |
| `GeneratorManager` | ~168 | Production calculations | `calculateProduction()`, `getProduction()` |
| `UpgradeManager` | ~127 | Upgrade system | `purchase()`, `isOwned()` |
| `GardenManager` | ~623 | 3x3 garden mechanics | `plant()`, `harvest()`, `entangle()` |
| `QuantumMechanics` | ~948 | Coherence & quantum events | `updateCoherence()`, `triggerRandomEvent()` |
| `AchievementManager` | ~80 | Achievement tracking | `unlock()`, `checkConditions()` |
| `PrestigeManager` | ~165 | Reality Collapse (prestige) | `collapse()`, `getProductionMultiplier()` |
| `NarrativeSystem` | ~430 | Story & text effects | `addLogMessage()`, `showStoryMoment()`, `applyZalgo()` |
| `TipsManager` | ~125 | Tutorial system | `showTip()` |
| `UI` | ~2,002 | **Largest module** - All rendering | `render()`, `renderGarden()`, `renderResources()` |
| `GameLoop` | ~277 | Main game loop (60 FPS) | `start()`, `tick()`, `update()` |

### State Management Architecture

**Three-Tier System:**

1. **GameData** - Static definitions (never changes during gameplay)
2. **StateManager** - Dynamic game state (persists to LocalStorage)
3. **LocalStorage** - Auto-saves every 30 seconds + manual save/load

Save format: JSON serialization with base64 encoding for export

## Core Game Mechanics

### Resources
- **Energy (⚡)** - Primary currency, gained by clicking quantum core
- **Seeds (🌱)** - Unlocks at 50 energy
- **Time Crystals (⏳)** - Unlocks at 500 energy
- **Knowledge (📚)** - Unlocks at 100 time crystals
- **Coherence (🌀)** - Special mechanic (0-100%), affects production multiplier

### 3x3 Garden System
- 9 plots total
- 6 plant types (Lily, Tulip, Rose, Orchid, Peony, Chrysanthemum)
- Each plant has growth time, base yield, and mutation chance
- 6 mutation types: Golden (×1.25), Prismatic (×1.5), Temporal (×1.75), Void (×2.0), Crystalline (×2.5), Echoing (×3.0)

### Quantum Coherence System
- Starts at 100%, decays constantly
- Click quantum core to refill by 1.5%
- Production multiplier: `0.3 + (coherence / 100) * 0.7`
- At 0% coherence: production drops to 30% minimum
- Low coherence triggers text glitch effects (Zalgo)

### Entanglement System
- Link two plants to harvest simultaneously
- Observer effect spreads to entangled partner (50% strength)
- Visual SVG lines connect entangled plants
- **Planned:** Multiple entanglements, crossed-line detection, pattern bonuses

### Observer Effect
- Hovering over growing plants speeds their growth
- Visual feedback: `cursor: zoom-in`
- Syncs with entangled plants (reduced effect)

### Prestige System (Reality Collapse)
- Requires 1,000,000 total energy gathered
- Resets garden state but grants permanent production multiplier
- Scales with reality level

## Known Issues & Warnings

### UTF-8 Encoding
**CRITICAL:** Using "Copy to project" in Claude.ai corrupts emojis. Always use download→upload instead.

### Current Bugs (from quantum-garden-todo.md)
- Stats tracking may break after Reality Collapse - investigate `PrestigeManager.collapse()` lines 5774-5875
- Production rates need real-time recalculation in game loop

### Performance Considerations
- Many entanglement SVG lines may lag on low-end devices
- Mobile support incomplete (not fully responsive)
- Game loop runs at ~60 FPS via `requestAnimationFrame`

## File Splitting Strategy (Planned)

Current pain point: 8,807 lines in one file = high context load for AI assistance

**Recommended structure when splitting:**
```
quantum-garden/
├── index.html              # Shell only (~100 lines)
├── css/
│   └── styles.css          # All CSS (~800 lines)
├── js/
│   ├── utils.js            # Utils, formatting (~200 lines)
│   ├── state.js            # StateManager (~400 lines)
│   ├── resources.js        # ResourceManager (~200 lines)
│   ├── generators.js       # GeneratorManager (~300 lines)
│   ├── upgrades.js         # UpgradeManager (~400 lines)
│   ├── garden.js           # GardenManager (~600 lines)
│   ├── quantum.js          # QuantumMechanics (~800 lines)
│   ├── prestige.js         # PrestigeManager (~200 lines)
│   ├── narrative.js        # NarrativeSystem (~600 lines)
│   ├── achievements.js     # AchievementManager (~300 lines)
│   ├── tutorial.js         # TipsManager (~200 lines)
│   ├── ui.js               # UI module (~1500 lines) ← LARGEST
│   └── main.js             # Init, game loop (~300 lines)
└── data/
    ├── game-data.js        # All GameData definitions (~800 lines)
    └── narrative-text.js   # All story text (~500 lines)
```

**Migration approach:**
1. Extract CSS first (lowest risk)
2. Extract GameData (pure data, no dependencies)
3. Extract Utils (no dependencies)
4. Extract managers one at a time, testing after each
5. Keep working monolith as backup

## Making Changes to quantum-garden.html

### Best Practices

1. **Never read the entire file** - Use targeted searches and line offsets
2. **Search before editing:**
   ```bash
   # Find a specific module
   grep -n "const GardenManager" quantum-garden.html

   # Find a specific function
   grep -n "updateCoherence" quantum-garden.html
   ```
3. **Read only what you need:**
   - Use `Read` tool with `offset` and `limit` parameters
   - Example: `Read quantum-garden.html offset=5000 limit=100`

4. **Use Edit tool for surgical changes:**
   - Provide sufficient context in `old_string` to make it unique
   - Never include line numbers in edit strings

### Common Edit Locations

- **Game data definitions:** Lines 1-843 (GameData object)
- **CSS styles:** Lines 8-~800 (inside `<style>` tag)
- **State management:** Lines ~3600-3832 (StateManager)
- **Garden mechanics:** Lines ~4200-4823 (GardenManager)
- **Quantum mechanics:** Lines ~5100-6048 (QuantumMechanics)
- **UI rendering:** Lines ~6650-8650 (UI module - LARGEST)
- **Game loop:** Lines ~8528-8805 (GameLoop + initialization)

### Testing Changes

1. Open quantum-garden.html in browser
2. Open browser DevTools console (F12)
3. Check for JavaScript errors
4. Test the specific feature you modified
5. Verify save/load still works
6. Check coherence mechanics haven't broken

## Narrative & ARG Elements

### Cosmic Horror Theme
- Zalgo text effects at low coherence
- Quantum physics references (Schrödinger, Feynman, superposition)
- 60+ milestone-based log messages
- 6 story modal moments at key progression points
- 40+ ticker messages, 30+ ambient messages

### ARG Integration (Planned)
- Webcam integration (mysterious feature)
- SpacetimeDB for MMO elements (leaderboards, discoveries)
- Hidden messages and encoded URLs
- Community puzzle elements

## Future Feature Roadmap

### High Priority
- Entangle chain follows cursor visual
- Hoverclicker upgrade family (auto-click while hovering)
- Multiple entanglements per plant
- Pattern/constellation detection system

### Medium Priority
- Crossed entanglement line detection (bonuses/penalties)
- Mutation BINGO system (matching rows/columns)
- Automated entangler upgrade
- Pixel art reality shift (after first prestige)

### Complex/Future
- SpacetimeDB integration for MMO
- ARG webcam feature
- Multiple save slots
- Mobile optimization

## Design Philosophy

From developer notes:
- "This game WILL be infinitely complex"
- "Trying to NOT cross [entanglement] lines would be a riot"
- "Shorting out... even costing you energy loss(!)"
- Focus on emergent complexity through simple interacting systems
- Cosmic horror vibes are intentional
- The game is frontend for "a very messed up ARG"

## Additional Resources

- **Art directory:** `art/` contains concept art and sprites (15MB of PNGs)
- **Continuous backups:** `continuous_backups/` for documentation versions
- **Developer notes:** `timnotes.txt` for personal development notes
- **SpacetimeDB info:** `spacetimedb_updates.txt` for MMO backend notes
