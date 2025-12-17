# Quantum Garden - Complete Design Document
## Version 2.6 | ~5,360 Lines

---

## 🎮 Game Overview

**Quantum Garden** is a quantum-physics-themed incremental/idle game where players cultivate a mysterious garden that operates on quantum mechanical principles. Unlike typical clicker games that use "quantum" as mere flavor text, Quantum Garden implements actual quantum concepts as core gameplay mechanics.

### Core Theme
- A garden exists at the boundary between quantum and classical reality
- The player acts as an observer whose attention literally affects the garden
- Mysterious narrative hints at something deeper watching from beyond

### Target Experience
- **Early game**: Traditional clicker/idle feel with quantum flavor
- **Mid game**: Introduce quantum mechanics that change how you play
- **Late game**: Active management of coherence, entanglement, and reality itself
- **End game**: (Planned) Reality collapse prestige system

---

## 📊 Resources (7 Total)

### Primary Resources
| Resource | Icon | Description | Unlock Condition |
|----------|------|-------------|------------------|
| **Quantum Energy** | ⚡ | Primary currency, used for everything | Start |
| **Seeds** | 🌱 | Required to plant in garden | 50 Energy |
| **Time Crystals** | ⏳ | Mid-game currency, unlocks better plants | 500 Energy |
| **Quantum Knowledge** | 📚 | Late-game currency, unlocks quantum features | 100 Time |

### Quantum Resources
| Resource | Icon | Description | Unlock Condition |
|----------|------|-------------|------------------|
| **Coherence** | 🌀 | 0-100% stability meter. Affects production & events | 50 Knowledge |
| **Entanglement Threads** | 🔗 | Used to link plants together | 100 Knowledge |
| **Reality Fragments** | 💠 | Prestige currency (survives reality collapse) | (Planned) |

---

## 🌸 Generators/Plants (5 Types)

All plants can be both:
1. **Purchased as generators** - Produce resources passively per second
2. **Planted in garden** - Grow over time, then harvested for lump-sum yields

| Plant | Icon | Base Cost | Production/s | Growth Time | Harvest Yield |
|-------|------|-----------|--------------|-------------|---------------|
| **Quantum Lily** | 🌸 | 15⚡ | 0.5⚡ | 10s | 5⚡, 1🌱 |
| **Time Tulip** | 🌷 | 100⚡, 5🌱 | 2⚡, 0.1⏳ | 30s | 20⚡, 3⏳, 2🌱 |
| **Energy Rose** | 🌹 | 500⚡, 15🌱 | 10⚡ | 60s | 100⚡, 3🌱 |
| **Dimension Daisy** | 🌼 | 2000⚡, 50⏳ | 25⚡, 0.1📚 | 120s | 200⚡, 10📚, 1🔗, 5🌱 |
| **Void Violet** | 💜 | 10000⚡, 25📚 | 100⚡, 1⏳, 0.05🔗 | 300s | 1000⚡, 50⏳, 2🔗, 10🌱 |

### Generator Mechanics
- **Cost Scaling**: Each purchase increases cost by 15-25% (varies by plant)
- **Coherence Effect**: Production multiplied by `0.6 + (coherence/100) * 0.4`
  - At 100% coherence: 100% production
  - At 0% coherence: 60% production

---

## 🌿 Garden System

### Grid Sizes
- **Starting**: 9 plots (3×3)
- **Expansion I**: 16 plots (4×4)
- **Expansion II**: 25 plots (5×5)  
- **Expansion III**: 36 plots (6×6)

### Garden Mechanics

#### Planting & Harvesting
- Click empty plot → Select plant type → Costs 1 seed (any type)
- Plants grow over time (progress bar fills)
- Click mature plant to harvest → Receive yield → Plot becomes empty

#### Superposition Yields
Harvest yields aren't fixed! They vary based on coherence:
- **High Coherence (100%)**: High variance, chance for excellent yields
- **Low Coherence (0%)**: Predictable, average yields
- Formula uses power curve: `baseYield * (varianceFactor ^ (1 - random))`

#### Observer Effect 👁️
When you hover over a growing plant:
- Plant visually scales up (130%) with cyan glow
- Growth speed increases up to **+50%** (or +75% with upgrade)
- Floating "+X%" text appears showing current boost
- Bonus builds over time while hovering (0.1 per second, caps at 0.5)

### Entanglement System 🔗

#### How It Works
1. Purchase "Quantum Entanglement" upgrade
2. Click "Entangle" button when you have Entanglement Threads
3. Select two plants to link them
4. Connected plants shown with animated orange dashed line + pulsing particles

#### Entanglement Effects
- **Shared Growth**: Both plants progress together (averaged growth rate)
- **Shared Harvest**: Harvesting one harvests both simultaneously
- **Observer Propagation**: Hovering over one boosts BOTH (partner gets 50% of bonus)
- **Deep Entanglement Upgrade**: +25% yield bonus for entangled plants
- **Instability**: At <10% coherence, entanglement links can spontaneously break!

### Automation

#### Auto-Harvest (Upgrade)
- Automatically harvests mature plants every 10 seconds
- Toggle on/off in garden controls
- Shows expected harvest rates in resource tooltips

#### Auto-Plant (Upgrade)
- Automatically plants in empty plots every 5 seconds
- Default: Plants most energy-efficient seed type
- **Per-Plot Preferences**: Click growing plant to set preferred type for that plot
- Won't plant while you have plant selection modal open
- "Clear Preference" option to revert to default behavior

---

## 🌀 Coherence System

### What Is Coherence?
A 0-100% meter representing quantum stability. It's the key late-game mechanic.

### Coherence Effects
| Level | Generator Output | Click Power Bonus | Quantum Events | Entanglement |
|-------|-----------------|-------------------|----------------|--------------|
| 100% | 100% | +50% | Full rate | Stable |
| 75% | 90% | +37.5% | Full rate | Stable |
| 50% | 80% | +25% | 50% rate | Stable |
| 25% | 70% | +12.5% | 25% rate | Stable |
| 20% | 68% | +10% | **STOPPED** | Stable |
| 10% | 64% | +5% | Stopped | **UNSTABLE** |
| 0% | **60%** | +0% | Stopped | Breaking |

### Coherence Decay
- Base decay: 0.01/second
- Additional decay: +0.002/second per generator owned
- Example: 100 generators = 0.21/second decay (empty in ~8 minutes)
- **Coherence Stabilizer Upgrade**: 50% slower decay

### Restoring Coherence
1. **Clicking the Quantum Core**: Each click restores 0.5-2% (scales with click power)
2. **Quantum Burst**: Restores +10% when triggered
3. **Coherence Drift Event**: Random event that restores up to 20%

### Visual Indicators
- **Coherence Bar**: Color changes (green → yellow → red) based on level
- **Quantum Core**: Pulses red when coherence < 30%
- **Click Power Display**: Color indicates current bonus (cyan/green/red)

---

## ⚡ Quantum Burst System

### How It Works
- Every click builds charge (1 + coherence/50 points per click)
- At 100 charge: **Quantum Burst** triggers automatically

### Burst Effects
1. All growing plants instantly jump +20% progress
2. +10% coherence restored
3. Visual flash effect on quantum core
4. Log notification

### Burst Indicator
- Progress bar displayed below click power
- Fills faster at high coherence (incentive to maintain it)

---

## 🎲 Quantum Events (8 Types)

Random events occur every 30-90 seconds (requires coherence > 20%):

| Event | Weight | Min Energy | Effect |
|-------|--------|------------|--------|
| **Quantum Tunneling** | 30 | 100 | +10% of current energy |
| **Quantum Superbloom** | 15 | 500 | All plants +50% progress |
| **Entanglement Surge** | 20 | 1000 | +3 Entanglement Threads |
| **Temporal Echo** | 25 | 750 | +20% of current time crystals |
| **Observer Paradox** | 10 | 2000 | +15 Knowledge, +5 Seeds |
| **Coherence Drift** | 20 | 3000 | Restore up to 20% coherence |
| **Schrödinger's Seed** | 25 | 200 | 50/50: +8 or -3 seeds |
| **Reality Glitch** | 5 | 5000 | Screen shake + 50-150% random resource |

### Event Requirements
- Coherence must be > 20% for events to occur
- Higher coherence = higher event frequency
- Some events require specific resources unlocked

---

## ⬆️ Upgrades (18 Total)

### Click Power
| Upgrade | Cost | Effect |
|---------|------|--------|
| Quantum Resonance | 50⚡ | 2× click power |
| Harmonic Amplification | 500⚡ | 3× click power |
| Quantum Superposition Click | 2000⚡, 20⏳ | +5 base click power |

### Garden & Growth
| Upgrade | Cost | Effect |
|---------|------|--------|
| Seed Synthesis | 30⚡ | Unlock seeds, +5 starting |
| Garden Expansion | 200⚡, 20🌱 | 16 plots |
| Garden Expansion II | 5000⚡, 50🌱, 50⏳ | 25 plots |
| Infinite Garden | 25000⚡, 100🌱, 150⏳ | 36 plots |
| Temporal Growth | 1000⚡, 15⏳ | +25% growth speed |

### Generator Boosts
| Upgrade | Cost | Effect |
|---------|------|--------|
| Lily Enhancement | 100⚡ | Lilies +50% |
| Temporal Bloom | 750⚡, 10⏳ | Tulips 2× time |
| Quantum Resonance Field | 50000⚡, 200📚 | All generators +50% |

### Quantum Mechanics
| Upgrade | Cost | Effect |
|---------|------|--------|
| Temporal Awareness | 250⚡ | Unlock Time Crystals |
| Keen Observer | 300⚡, 10📚 | +50% observer effect |
| Superposition Mastery | 1500⚡, 30📚 | Better harvest variance |
| Coherence Stabilizer | 5000⚡, 100⏳ | 50% slower decay |
| Quantum Entanglement | 2000⚡, 50📚 | Unlock entanglement |
| Deep Entanglement | 10000⚡, 10🔗 | +25% entangled yield |

### Automation
| Upgrade | Cost | Effect |
|---------|------|--------|
| Quantum Auto-Harvester | 15000⚡, 200⏳, 100📚 | Auto-harvest mature plants |
| Quantum Auto-Planter | 25000⚡, 300⏳, 150📚 | Auto-plant empty plots |

---

## 🏆 Achievements (23 Total)

### Click Achievements
- 👆 **Quantum Awakening** - First click
- ✋ **Probability Manipulator** - 100 clicks
- 🖐️ **Wave Function Collapser** - 1,000 clicks

### Energy Achievements
- ⚡ **Spark of Creation** - 100 total energy
- 💫 **Power Surge** - 10,000 total energy
- 🌟 **Supernova** - 1,000,000 total energy
- 🌌 **Cosmic Power** - 100,000,000 total energy

### Garden Achievements
- 🌸 **First Bloom** - Harvest 1 plant
- 🌿 **Green Thumb** - Harvest 10 plants
- 👨‍🌾 **Master Gardener** - Harvest 100 plants
- 🏆 **Legendary Farmer** - Harvest 1,000 plants
- 🏡 **No Empty Plots** - Fill every plot

### Generator Achievements
- ⚙️ **Automation Begins** - Buy first generator
- 🌸 **Lily Pad** - Own 10 Quantum Lilies
- 🌈 **Biodiversity** - Own 1+ of every type

### Quantum Achievements
- 👁️ **Quantum Observer** - Witness first event
- 🔮 **Reality Bender** - Witness 10 events
- ⚠️ **Edge of Classical** - Coherence < 10%
- 📉 **Completely Classical** - Coherence = 0%
- 🌀 **Coherence Master** - 90%+ coherence for 5 min with 50+ generators

### Quantum Burst Achievements
- ⚡ **Quantum Surge** - First burst
- 💥 **Chain Reaction** - 10 bursts

### Entanglement Achievements
- 🔗 **Spooky Action** - Entangle 2 plants
- 🕸️ **Quantum Network** - 5 entangled pairs simultaneously

### Secret Achievements
- 🏃 **Speedrunner** - 1000 energy in under 5 minutes
- ⏰ **Patience of a Physicist** - Play for 1 hour
- 🦉 **Night Owl** - Play between midnight and 4 AM
- 🔄 **Return to Basics** - 100 clicks with 100+ generators

---

## 📜 Narrative System

Mysterious messages appear at energy milestones, hinting at deeper lore:

| Energy Threshold | Message |
|-----------------|---------|
| 100 | "The garden remembers..." |
| 500 | "You feel something watching back." |
| 1,000 | "The flowers whisper in frequencies you almost understand." |
| 2,500 | "Reality feels... thin here." |
| 5,000 | "W̷h̷o̷ ̷p̷l̷a̷n̷t̷e̷d̷ ̷t̷h̷e̷ ̷f̷i̷r̷s̷t̷ ̷s̷e̷e̷d̷?̷" |
| 10,000 | "The quantum state is YOU." |
| 25,000 | "Every click echoes across infinite gardens." |
| 50,000 | "They're beautiful when they bloom in other dimensions too." |
| 100,000 | "You've been here before. You'll be here again." |

---

## 🎨 Visual Feedback Systems

### Tooltips
- Hover over any resource to see detailed breakdown
- Shows generator production + garden harvest rates
- Coherence tooltip shows decay rate and tip to click

### Floating Numbers
- **Harvest Float**: Icons + numbers float up from harvested plant
- **Resource Gain Tracker**: "+X" appears next to resources on left panel, stacks over 3s
- **Observer Effect Float**: "+X%" appears on plants being boosted
- **Click Particles**: "+X" floats up from quantum core on click

### Entanglement Visualization
- Curved orange dashed lines connect entangled plants
- Animated dash flow effect
- Pulsing particles at connection points

### Status Indicators
- Coherence bar color coding (green → yellow → red)
- Quantum core red pulse at low coherence
- Plant glow + scale on observer effect
- Burst charge bar under click power

---

## 💾 Technical Features

### Save System
- Auto-save every 30 seconds (configurable)
- Manual save in settings
- Import/Export save strings
- Hard reset option

### Settings
- Toggle notifications
- Toggle particle effects
- Toggle auto-harvest (when purchased)
- Toggle auto-plant (when purchased)
- Adjust autosave interval

### Stats Tracking
- Total clicks
- Plants harvested
- Quantum events witnessed
- Quantum bursts triggered
- Plants entangled
- Play time
- All-time resource totals
- Generator counts

---

## 🔮 Planned Features

### Reality Collapse (Prestige System)
- Reset most progress for Reality Fragments
- Fragments provide permanent bonuses
- Unlock new plant types, upgrades, and mechanics
- Multiple collapse tiers with increasing rewards

### Advanced Quantum Mechanics
- **Quantum Tunneling Plants**: Can "tunnel" between non-adjacent plots
- **Superposition Planting**: Plant exists in multiple states until observed
- **Wavefunction Collapse**: Strategic timing mechanic for harvests
- **Decoherence Events**: Major random events that reshape the garden

### Garden Features
- **Biomes**: Different sections with different rules
- **Mutations**: Rare plant variants with unique properties
- **Seasons**: Cycling bonuses that favor different strategies
- **Garden Decorations**: Cosmetic unlocks from achievements

### Quality of Life
- Offline progress calculation
- Buy max / buy X buttons
- Keyboard shortcuts
- Mobile responsive layout improvements
- Achievement reward bonuses

### ARG Integration (Long-term)
- Hidden cursors showing other players (secretly multiplayer)
- Plants that can be placed on other website elements
- Cross-site mysteries and discoveries
- Community puzzle elements

---

## 📁 File Structure

Currently single-file HTML (~5,360 lines):
```
quantum-garden.html
├── CSS (~1,600 lines)
│   ├── Variables & Reset
│   ├── Layout & Grid
│   ├── Components (buttons, cards, tooltips)
│   ├── Garden & Plots
│   ├── Animations & Effects
│   └── Responsive Queries
├── HTML (~100 lines)
│   ├── Left Panel (resources, core, coherence)
│   ├── Center (garden, log)
│   └── Right Panel (tabs, generators, upgrades, stats)
└── JavaScript (~3,600 lines)
    ├── Utils Module
    ├── TooltipManager Module
    ├── ResourceGainTracker Module
    ├── GameData (resources, generators, upgrades, achievements)
    ├── StateManager Module
    ├── ResourceManager Module
    ├── GeneratorManager Module
    ├── UpgradeManager Module
    ├── GardenManager Module
    ├── QuantumMechanics Module
    ├── AchievementManager Module
    ├── UI Module
    └── GameLoop Module
```

---

## 🎯 Design Philosophy

### Quantum Mechanics as Gameplay
Every quantum concept should affect how you play, not just be flavor text:
- Observer effect → Hovering matters
- Superposition → Yields vary based on system state
- Entanglement → Non-local plant connections
- Coherence/Decoherence → Active resource management
- Tunneling → Random resource gains
- Collapse → (Planned) Prestige mechanic

### Active vs Idle Balance
- Early game: Click-focused, learning mechanics
- Mid game: Garden automation, strategic planting
- Late game: Coherence management forces periodic attention
- Idle players: Still progress, but slower
- Active players: Significantly faster through burst/coherence

### Progression Clarity
- Clear unlock chains visible in upgrade tab
- Resources unlock in logical sequence
- Each mechanic introduced gradually
- Narrative breadcrumbs hint at deeper systems

### Mystery & Discovery
- Secret achievements reward exploration
- Glitched text hints at unrevealed lore
- Random events feel like discoveries
- ARG elements create community engagement (future)

---

*Document Version: 2.6*
*Last Updated: November 2024*
*Lines of Code: ~5,360*
