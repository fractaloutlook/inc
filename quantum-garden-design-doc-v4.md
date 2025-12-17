# Quantum Garden - Design Document Addendum
## Version 4.0 | Future Ideas & Planned Features

This document extends the main design doc with new ideas discussed during development.

---

## 🎮 CURRENT IMPLEMENTATION STATUS (v4.0)

### Recently Implemented
- ✅ Quantum events container (fixed visibility issue)
- ✅ Real-time production rate updates (coherence affects displayed +X/s)
- ✅ Stats update in real-time (1-second refresh)
- ✅ Garden centering on wide monitors
- ✅ Coherence 100→99 flicker fix (450ms grace period)
- ✅ Achievement notification hover-to-pause
- ✅ Eye cursor (zoom-in) for observer effect
- ✅ Hide locked currency floaty numbers
- ✅ LED glow effect on auto-harvest/plant toggle buttons
- ✅ Coherence floor lowered (60% → 30% minimum production)
- ✅ Reality Collapse section visible earlier (at 500k energy)
- ✅ Improved upgrade description clarity

### In Progress / Planned
- ⬜ Click rate averaging (fast clicking temporarily boosts displayed /s)
- ⬜ Auto-button progress bars
- ⬜ Entangle chain follows cursor during selection
- ⬜ Hoverclicker upgrade family
- ⬜ Multiple entanglements per plant
- ⬜ Automated entangler upgrade
- ⬜ Pattern/constellation achievements
- ⬜ Load button (currently only Save exists)
- ⬜ Stats/Collapse tracking investigation (post-prestige bugs)

---

## 🔗 ENTANGLEMENT SYSTEM EXPANSION

### Current State
- Two plants can be linked with entanglement threads
- Entangled pairs harvest together
- Observer effect spreads to entangled partner (at 50% strength)
- Visual SVG lines connect entangled plants

### Planned: Multiple Entanglements
**Upgrade: "Quantum Web"**
- Each plant can have 2+ entanglement links
- Creates web/network effects across the garden
- Harvest cascades through connected networks
- Visual complexity increases (need performance testing)

### Planned: Crossed Entanglement Lines
**Mechanic: Line Intersection Detection**
- When entanglement lines cross, special effects occur
- **Positive outcomes:**
  - Rare bonus: "Quantum Interference" - boosted yields
  - Achievement: "Tangled Web" for first crossing
  - Special mutation chance at intersection points
- **Negative outcomes:**
  - "Short Circuit" - energy drain while lines crossed
  - Risk of spontaneous de-entanglement
  - Coherence decay acceleration
- **Gameplay:** Players must strategize to avoid/create crossings
- **Visual:** Crossed lines could spark/glow differently

### Planned: Entanglement Bonuses
**Same-Type Bonus:**
- Entangling two of the same plant type: +25% yield
- Same mutation type: +50% yield
- Same plant AND mutation: +100% yield

**Sequential Chain Bonus:**
- Linking plants in order (Lily→Tulip→Rose→Orchid→Peony→Chrysanthemum)
- Each link in sequence adds stacking bonus
- Full chain achievement: "Quantum Ladder"

### Planned: Automated Entangler
**Upgrade: "Quantum Matchmaker"**
- Automatically connects unentangled plants
- Prefers high-time to low-time pairings (sync harvests)
- Visual: Fuzzy/blurry connection forms over 3-4 seconds, then solidifies
- Can be toggled on/off
- Later upgrade: "Smart Entangler" - prioritizes same-type pairings

---

## 🎯 PATTERN & CONSTELLATION SYSTEM

### Concept
Recognize specific entanglement patterns and reward players with achievements, bonuses, and collectibles.

### Pattern Categories

**Basic Shapes:**
- Vertical line (full column) - "Quantum Pillar"
- Horizontal line (full row) - "Event Horizon"
- Diagonal line - "Planck Slope"
- Square (4 corners connected) - "Stable State"
- Triangle - "Three-Body Solution"

**Advanced Shapes:**
- X-shape - "Crossroads"
- T-shape - "Junction"
- L-shape - "Right Angle Reality"
- Full border - "Containment Field"
- Spiral (requires 4x4+) - "Golden Ratio"
- Star pattern - "Stellar Configuration"

**Complex Patterns (5x5, 6x6 grids):**
- Concentric squares - "Nested Realities"
- Grid pattern - "Quantum Lattice"
- Figure-8 / infinity - "Eternal Loop"
- Letters/numbers (player creativity) - "Quantum Calligraphy"

### Pattern Catalog UI
- Dedicated sub-tab under Stats or new "Catalog" tab
- Silhouettes of undiscovered patterns
- Discovered patterns shown with date/reality level achieved
- Completion percentage
- Rare patterns highlighted

### Mutation BINGO System
**New Mechanic:**
- Full row of matching mutations triggers bonus
- Full column of matching mutations triggers bonus
- Diagonal of matching mutations triggers bonus
- **Rewards:**
  - Instant resource burst
  - Temporary production multiplier
  - Rare achievement
  - Mutation upgrade chance

**Mutations for BINGO:**
- Golden (yellow glow)
- Prismatic (rainbow shimmer)
- Temporal (clock particles)
- Void (dark aura)
- Crystalline (sparkle)
- Echoing (duplicate visual)

---

## 🖱️ CLICK SYSTEM EXPANSION

### Planned: Hoverclicker Upgrade Family

**Tier 1: "Passive Observation"**
- While hovering quantum core, auto-click 2/s
- Cost: 10K energy, 500 time crystals

**Tier 2: "Active Surveillance"**
- Hover auto-click increased to 5/s
- Cost: 100K energy, 2K time crystals
- Requires: Passive Observation

**Tier 3: "Constant Monitoring"**
- Hover auto-click increased to 15/s
- Cost: 1M energy, 10K time crystals
- Requires: Active Surveillance

**Tier 4: "Clicklock"**
- Toggle: Keep hoverclicker active even without hovering
- Effectively becomes an auto-clicker
- Cost: 10M energy, 50K time crystals, 100 knowledge
- Requires: Constant Monitoring

### Click Rate Display
- Show rolling 1-second average of clicks/second
- Fast clicking temporarily boosts displayed energy/s
- Visual feedback when click rate is high

---

## 💾 SAVE/LOAD SYSTEM

### Current State
- Auto-save every 30 seconds
- Manual save button
- LocalStorage-based persistence
- Export save as base64 string

### Planned Improvements

**Load Button:**
- Add 📂 Load button next to Save
- File picker for .json save files
- Validation before applying
- Confirmation modal showing save info

**Robust Features:**
- Auto-backup before loading new save
- Save versioning for future migrations
- Corruption detection
- Multiple save slots (stretch goal)

**Export/Import:**
- Download save as .json file
- Copy-to-clipboard option
- QR code for mobile transfer (stretch goal)

---

## 🎨 FUTURE FEATURE: Pixel Art Reality Shift

### Concept
After first Reality Collapse, visual style can shift between "reality layers":

1. **Default Reality** - Current CSS/emoji aesthetic
2. **Pixel Art Reality** - Retro sprite-based visuals
3. **Anime Reality** - Illustrated style (future)
4. **Photorealistic Reality** - "CCTV feed" aesthetic (future)

### Technical Implementation
- Sprite sheets: 16-25 frames per plant, 64x64 or 128x128 pixels
- 9-slice CSS borders for pixel-perfect UI
- Reality shift effect: screen shake, scanlines, glitch transitions
- Progressive reveal across multiple collapses

---

## 🎥 FUTURE FEATURE: ARG Webcam Integration

### Concept
After 2-3 days of cumulative playtime, mysterious webcam button appears.

### Implementation
- Slow fade-in (no announcement)
- Story-flavored permission dialog
- If allowed: Secret achievement, plants "notice" player
- If denied: Graceful alternative path
- MUST be privacy-respecting (no storage/transmission)

---

## 📜 Narrative System

### Currently Implemented
- 60+ milestone-based log messages
- 6 story modal moments
- Scrolling ticker with quantum physics references
- Ambient messages, Feynman diagrams
- Low-coherence text glitching (Zalgo-style)
- Reality fracture overlay

### Planned Additions
- Inter-reality communication (messages from past self)
- Hidden ARG elements (coordinates, encoded URLs)
- Community puzzle elements
- Audio design (ambient drone, harvest sounds)

---

## 📁 FILE ORGANIZATION

### Current State
- Single monolithic HTML file (~8,500+ lines)
- All CSS, JS, and HTML in one file

### Proposed Split (When Needed)
Consider splitting when:
- File exceeds 10,000 lines
- Multiple developers working simultaneously
- Performance issues with single-file loading

**Potential Structure:**
```
quantum-garden/
├── index.html           # Shell HTML only
├── css/
│   ├── main.css         # Core styles
│   ├── garden.css       # Garden-specific
│   └── modals.css       # Modal styles
├── js/
│   ├── game-data.js     # GameData definitions
│   ├── state.js         # StateManager
│   ├── resources.js     # ResourceManager
│   ├── generators.js    # GeneratorManager
│   ├── garden.js        # GardenManager
│   ├── quantum.js       # QuantumMechanics
│   ├── narrative.js     # NarrativeSystem (large!)
│   ├── ui.js            # UI module
│   └── main.js          # Initialization
├── data/
│   ├── shapes.json      # Pattern definitions
│   ├── narrative.json   # All story text
│   └── achievements.json # Achievement definitions
└── assets/
    └── sprites/         # Future pixel art
```

**First Split Candidates:**
1. `narrative.js` - All ticker messages, story moments, glitch text
2. `shapes.json` - Pattern definitions (can grow very large)
3. `game-data.js` - Static data definitions

---

## 📊 Content Summary

### Current Counts (v4.0)
- **Lines of Code:** ~8,550+
- **Plant Types:** 6
- **Mutations:** 6
- **Quantum Events:** 25+
- **Achievements:** 32+
- **Upgrades:** 20+
- **Narrative Messages:** 60+ milestone, 6 story modals, 40+ ticker, 30+ ambient

### Planned Additions
- **New Upgrades:** 4+ (hoverclicker family)
- **New Achievements:** 20+ (patterns, BINGO, entanglement)
- **Pattern Types:** 15+ basic, unlimited complex

---

## 🗺️ Roadmap

### Phase 1: Polish ✅ (Mostly Complete)
- [x] Auto-harvest animation fix
- [x] Narrative system
- [x] Text glitch effects
- [x] Production rate display fixes
- [x] UI polish (LED buttons, cursors, notifications)
- [ ] Mobile responsiveness
- [ ] Sound effects (optional)

### Phase 2: Entanglement Expansion
- [ ] Multiple entanglements per plant
- [ ] Crossed line detection
- [ ] Entanglement bonuses (same-type, sequential)
- [ ] Automated entangler
- [ ] Chain-follows-cursor visual

### Phase 3: Patterns & BINGO
- [ ] Pattern detection system
- [ ] Pattern catalog UI
- [ ] Mutation BINGO mechanics
- [ ] 20+ pattern achievements

### Phase 4: Click & QoL
- [ ] Hoverclicker upgrade family
- [ ] Click rate averaging display
- [ ] Load button & robust save system
- [ ] Auto-button progress bars

### Phase 5: Pixel Art Reality
- [ ] Sprite sheets for all plants
- [ ] 9-slice pixel UI
- [ ] Reality shift transitions
- [ ] Player reality selection

### Phase 6: ARG Elements
- [ ] Webcam feature
- [ ] Hidden messages/coordinates
- [ ] Community puzzle system

---

*Document Version: 4.0*  
*Last Updated: December 2024*  
*Lines of Code: ~8,550+*
