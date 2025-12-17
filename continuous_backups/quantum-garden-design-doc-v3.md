# Quantum Garden - Design Document Addendum
## Version 3.0 | Future Ideas & Planned Features

This document extends the main design doc with new ideas discussed during development.

---

## 🎨 FUTURE FEATURE: Pixel Art Reality Shift

### Concept
The game starts with the current CSS/emoji aesthetic, but after the player's first "Reality Collapse" prestige, the visual style can shift between different "reality layers":

1. **Default Reality** - Current CSS styling with emoji plants
2. **Pixel Art Reality** - Retro pixel art aesthetic with sprite-based animations
3. **Anime Reality** - (Future) Illustrated anime-style art
4. **Photorealistic Reality** - (Future) "CCTV feed" aesthetic with realistic plant photos

### Technical Implementation Ideas

**Sprite Sheets:**
- Each plant type needs a growth animation (seed → sprout → growing → budding → bloom)
- Recommended: 16-25 frames per plant, 64x64 or 128x128 pixels
- Use CSS `background-position` animation or canvas-based rendering

**9-Slice UI:**
- CSS `border-image` with 9-slice for pixel-perfect button/panel borders
- Pixel fonts (e.g., Press Start 2P, VT323) for text
- Maintain same layout but swap visual assets

**Reality Shift Effect:**
- When transitioning between realities:
  - Screen shake / camera wobble
  - Scanline overlay flickers
  - Individual UI elements "glitch" to new style one at a time
  - Brief static/noise overlay
  - Audio distortion (if audio added)

**Progressive Reveal:**
- First collapse: Brief flash of pixel art during transition
- Subsequent collapses: Longer glimpses
- Eventually: Player can choose reality style in settings
- Each reality has slightly different ambient effects

### Sprite Sheet Specifications
Based on test images:
- **Format:** 7x7 or 6x6 grid per plant type
- **Frame size:** 128x128 or 64x64 pixels
- **Background:** Transparent or match game background (#1a1625)
- **Growth stages:** Seed (1-5) → Sprout (6-10) → Leaves (11-20) → Bud (21-30) → Bloom (31-42)
- **Colors:** Distinct palette per plant, with golden/rainbow variants for mutations

---

## 🎥 FUTURE FEATURE: ARG Webcam Integration

### Concept
After 2-3 days of cumulative playtime, a mysterious webcam button appears in the header. This creates an unsettling ARG moment.

### Implementation

**Appearance:**
- Button shows: 📹 with a red "crossed out" line (🚫 overlay)
- Fades in slowly over ~30 seconds
- No announcement or fanfare - just... appears

**Tooltip Text (story-flavored):**
```
"Something wants to see you."
"The garden has been watching. It wants to return the favor."
"Observation goes both ways."
```

**Click Behavior:**
1. Custom modal appears (NOT browser's default permission dialog)
2. Story-flavored text:
   ```
   "The garden requests visual observation access.
   
   Your image will help calibrate the quantum state.
   Nothing will be stored. Nothing will be shared.
   
   The flowers want to see who tends them."
   
   [Allow Observation]  [Deny]
   ```

3. If allowed:
   - Brief webcam access (capture single frame, then close)
   - "Thank you. The garden knows your face now."
   - Unlock secret achievement: "Observed Observer" 👁️
   - Subtle effect: Plants occasionally "turn toward" cursor more directly
   - New narrative messages reference "seeing you"

4. If denied:
   - "The garden understands. Observation requires consent."
   - Button remains but becomes more subtle
   - Alternative achievement available later

**Privacy Notes:**
- MUST actually be privacy-respecting (no storage, no transmission)
- Clear in code that image data is immediately discarded
- Player can verify in browser dev tools

---

## 📜 Narrative System Expansion (v3.0)

### Currently Implemented

**Narrative Elements:**
- 60+ milestone-based log messages (50 energy → 100B energy)
- 6 story modal moments at major thresholds
- Scrolling ticker with quantum physics references
- Ambient messages (appear randomly during gameplay)
- Feynman diagrams in log
- Low-coherence text glitching
- Reality fracture overlay at very low coherence

**Ticker Messages Include:**
- Quantum physics quotes (Feynman, real physics concepts)
- Ominous warnings ("Reality integrity: DEGRADING")
- References to "other gardeners" in parallel realities
- QED/QCD references, Planck length, renormalization, etc.

### Planned Additions

**Inter-Reality Communication:**
- After prestige, occasionally receive "messages" from your past self
- Messages reference decisions you made (plants you favored, upgrades purchased)
- Creates illusion of continuity across collapses

**Community ARG Elements:**
- Hidden coordinates in glitched text
- Binary/hex messages that decode to URLs
- Cross-player "discoveries" that affect all players
- Seasonal events with hidden lore

**Audio Design (Future):**
- Ambient drone that shifts with coherence
- Harvest sounds with subtle quantum weirdness
- Low coherence: Audio distortion, reversed samples
- Story moments: Whispered narration

---

## 🔧 Technical Debt & Known Issues

### Recently Fixed
- Auto-harvest animation: Plants now disappear individually with entangled pairs
- Entanglement lines: Update during harvest animation
- Prestige text: Clearer messaging about collapse requirements
- PrestigeSystem → PrestigeManager naming consistency

### To Monitor
- Performance with many entanglement lines (SVG)
- Mobile touch support for tooltips and hover effects
- Very long play sessions (memory leaks, timer drift)

---

## 📊 Content Summary

### Current Counts (v3.0)
- **Lines of Code:** ~8,500
- **Plant Types:** 6 (Quantum Lily, Time Tulip, Energy Rose, Void Orchid, Prismatic Peony, Cosmic Chrysanthemum)
- **Mutations:** 6 (Golden, Prismatic, Temporal, Void, Crystalline, Echoing)
- **Quantum Events:** 25+
- **Achievements:** 32+
- **Upgrades:** 20+
- **Narrative Messages:** 60+ milestone, 6 story modals, 40+ ticker, 30+ ambient

---

## 🗺️ Roadmap

### Phase 1: Polish (Current)
- [x] Auto-harvest animation fix
- [x] Narrative system
- [x] Text glitch effects
- [ ] Mobile responsiveness
- [ ] Sound effects (optional)

### Phase 2: Pixel Art Reality
- [ ] Commission/create sprite sheets for all plants
- [ ] 9-slice pixel UI borders
- [ ] Pixel font integration
- [ ] Reality shift transition effect
- [ ] Player reality selection

### Phase 3: ARG Elements
- [ ] Webcam feature
- [ ] Hidden messages/coordinates
- [ ] Cross-player discovery system
- [ ] Community puzzle elements

### Phase 4: Advanced Mechanics
- [ ] More mutation types
- [ ] Plant breeding system
- [ ] Quantum entanglement puzzles
- [ ] Alternative prestige paths

---

*Document Version: 3.0*  
*Last Updated: December 2024*  
*Lines of Code: ~8,500*
