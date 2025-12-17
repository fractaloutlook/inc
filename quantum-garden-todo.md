# Quantum Garden Implementation Plan

## Priority Order & Implementation Notes

---

## 🔴 PHASE 1: CRITICAL BUGS (Game-Breaking)

### 1.1 Stats Not Updating / Collapse Tracking Broken (HIGHEST PRIORITY)
**Issue:** Stats don't update in realtime. After Reality Collapse, tracking completely breaks - no energy collected, no generators purchased shown, collapse button never re-enables.

**Root Cause Analysis:**
- Stats are only updating on page refresh (line 24)
- After collapse, `StateManager.setState(newState)` is called but stats like `resources.energy.total` get reset
- The `isUnlocked()` and `canCollapse()` checks depend on `resources.energy.total` which is wiped
- Need to investigate the prestige/collapse flow around lines 5800-5875

**Implementation:**
1. Check `ResourceManager.add()` - verify it's incrementing `.total` properly on every add
2. In `PrestigeManager.collapse()`, ensure we're NOT resetting the tracking accumulators we need
3. Add real-time stat updates to the game loop (currently stats are only rendered, not recalculated)
4. Specifically track: `resources.energy.total` must persist properly across collapses for `isUnlocked()` check

**Files/Lines:** 
- `ResourceManager.add()` ~line 3750
- `PrestigeManager.collapse()` lines 5774-5875
- `GameLoop.update()` lines 8286-8322
- `UI.renderStats()` lines 7820-7905

---

### 1.2 Quantum Events Not Showing
**Issue:** The quantum events that used to pop up in the center (now moved to resources panel) don't appear at all.

**Root Cause Analysis:**
- Events are being generated (`triggerRandomEvent()` at line 5392)
- The popup is appended to `#resources-section` (line 5446)
- CSS positioning may be off OR the events aren't triggering due to coherence requirements
- Check if `checkForRandomEvent()` is being called and if events pass the coherence > 20 check

**Implementation:**
1. Add console.log to `checkForRandomEvent()` to verify it's running
2. Verify coherence level isn't blocking events (needs > 20%)
3. Check CSS for `.quantum-event` - may need `position: absolute` and proper z-index
4. The popup styling might be broken when appended to resources-section

**Files/Lines:**
- `checkForRandomEvent()` line 5372
- `showQuantumEvent()` line 5427
- CSS for `.quantum-event` (need to locate)

---

### 1.3 +X/s Rates Not Reflecting Coherence/Prestige Multipliers
**Issue:** The displayed rates don't show coherence penalty, and don't update when coherence is refilled. Also not showing reality collapse production bonus.

**Root Cause Analysis:**
- `renderResources()` calls `ResourceManager.getRate()` which comes from `GeneratorManager.calculateProduction()`
- The generator production DOES apply coherence multiplier (line 3935-3937)
- BUT `calculateProduction()` is only called once at init (line 8370) and on upgrade purchase
- It's not being recalculated as coherence changes!

**Implementation:**
1. Call `GeneratorManager.calculateProduction()` in the game loop every tick (or throttled)
2. This will update the cached rates based on current coherence
3. Also verify `PrestigeManager.getProductionMultiplier()` is being applied (line 3927-3929)

**Files/Lines:**
- `GeneratorManager.calculateProduction()` line 3945
- `GeneratorManager.getProduction()` line 3905 (where coherence is applied)
- `GameLoop.tick()` line 8253 (needs to call calculateProduction)

---

### 1.4 Garden 3x3 Centering Issue
**Issue:** 3x3 garden not filling/centering properly on wide monitors.

**Root Cause Analysis:**
- `renderGarden()` calculates plot size based on container dimensions (line 7191-7202)
- The grid is set with fixed `px` sizing: `grid.style.gridTemplateColumns = repeat(${cols}, ${finalSize}px)`
- Center panel has `align-items: center` but the grid itself may not be constrained properly

**Implementation:**
1. Check `#center-panel` CSS - may need `justify-content: center` for horizontal centering
2. The grid container `#garden-grid` may need `margin: auto` or similar
3. Verify the container size calculation isn't giving weird values on wide screens

**Files/Lines:**
- `renderGarden()` lines 7184-7279
- CSS for `#center-panel` lines 158-168
- CSS for `#garden-grid` (need to locate)

---

### 1.5 100->99 Coherence Flicker
**Issue:** Still flickering at 100->99 transition. Need ~25% longer delay.

**Root Cause Analysis:**
- Current grace period is 0.35s (350ms) at line 5513
- Easing at 99-100 is at 30% speed (line 5538)
- May need to increase grace period to 0.45s or increase the easing threshold

**Implementation:**
1. Increase grace period from 0.35 to 0.45 (line 5513)
2. Alternatively, extend the 30% decay speed range from `current > 99` to `current > 98.5`

**Files/Lines:**
- `updateCoherence()` lines 5492-5572, specifically 5513 and 5537-5543

---

## 🟡 PHASE 2: UX ISSUES (Important)

### 2.1 +X/s Click Rate Averaging
**Issue:** Click contribution to /s rate should be averaged over ~1 second so fast clicking shows in the rate display temporarily.

**Implementation:**
1. Create a click rate tracker that stores last N clicks with timestamps
2. Calculate clicks-per-second over a 1-second rolling window
3. Add this to the displayed rate in `renderResources()`
4. Decay when clicking stops

**New Code Needed:**
```javascript
const ClickRateTracker = {
    clicks: [],
    getRate() {
        const now = Date.now();
        this.clicks = this.clicks.filter(t => now - t < 1000);
        return this.clicks.length; // clicks in last second
    },
    addClick(power) {
        this.clicks.push({ time: Date.now(), power });
    }
};
```

---

### 2.2 Reality Collapse Requirements Clarity
**Issue:** No indication that 1M total energy is required for collapse. Section doesn't even show until you hit the threshold.

**Implementation:**
1. Show the Reality Collapse section in stats earlier (maybe at 100k energy)
2. Add a progress bar showing "X/1,000,000 energy to unlock"
3. Update the upgrade description for `realityAwareness` to mention the requirement

**Files/Lines:**
- `renderStats()` prestige section (around line 7800+)
- `GameData.upgrades.realityAwareness` definition

---

### 2.3 Achievement Popup Hover-to-Pause
**Issue:** Achievement notifications disappear too fast; should pause on hover.

**Implementation:**
1. Add mouseenter/mouseleave events to notification element
2. On mouseenter: clear the removal timeout
3. On mouseleave: start a new 1.5s timeout

**Files/Lines:**
- `showNotification()` lines 8088-8104

---

### 2.4 Eye Cursor for Observer Effect
**Issue:** No visual cursor feedback when observing a non-harvestable plant for the keen observer boost.

**Implementation:**
1. Add `cursor: url('eye-cursor.svg'), pointer` or use CSS `cursor: crosshair` / `cursor: zoom-in`
2. Apply to `.garden-plot.planted.observed` selector
3. Could also add a subtle glow or eye icon overlay

**Files/Lines:**
- CSS for `.garden-plot.observed`
- `renderGarden()` mouseenter handler ~line 7256

---

### 2.5 Hide Floaty Numbers for Locked Currencies
**Issue:** Harvest shows floaty numbers for currencies you haven't unlocked yet.

**Implementation:**
1. In `ResourceGainTracker.showHarvestFloat()`, filter out resources where `!ResourceManager.isUnlocked(resource)`
2. Only show floaters for unlocked resources

**Files/Lines:**
- `ResourceGainTracker.showHarvestFloat()` (need to locate)

---

## 🟢 PHASE 3: POLISH

### 3.1 LED Glow Effect for H/P Buttons
**Issue:** The (H)arvest and (P)lant toggle buttons have black circles that should glow red when active.

**Implementation:**
1. Add a pseudo-element `:after` for the red glow
2. Animate opacity in/out when `.active` class is toggled
3. Add box-shadow for outer glow

```css
.control-btn.active .key-hint::after {
    content: '';
    position: absolute;
    inset: 2px;
    background: radial-gradient(circle, #ff0000 0%, transparent 70%);
    opacity: 0.8;
    animation: led-pulse 1s ease-in-out infinite;
}
```

---

### 3.2 Progress Bars for Auto Buttons
**Issue:** Add thin progress bars under autoharvest/autoplant buttons showing time until next action.

**Implementation:**
1. Track time since last auto-action in `GardenManager`
2. Add a thin `<div class="auto-progress">` under each button
3. Update width based on time elapsed / interval

---

### 3.3 Lower Coherence Floor (Optional/Upgradeable)
**Issue:** At 0% coherence, production only drops to 60%. Could go to 30%, possibly with upgrades to soften it.

**Implementation:**
1. Change `coherenceMultiplier = 0.6 + (coherence / 100) * 0.4` to `0.3 + (coherence / 100) * 0.7`
2. Add upgrade: "Quantum Dampener" - increases minimum production from 30% to 50%

---

### 3.4 Entangle Chain Follows Cursor (Hard)
**Issue:** When selecting first plant to entangle, show a visual chain following the cursor until second plant is selected.

**Implementation:**
1. On entangle mode start, add mousemove listener
2. Draw an SVG line from source plant center to mouse position
3. Use same styling as existing entanglement lines
4. Clear on entangle complete or cancel

---

## 🔵 PHASE 4: NEW FEATURES

### 4.1 Hoverclicker Upgrade Family
**Upgrades to add:**
- Hoverclicker I: While hovering quantum core, auto-click 2/s
- Hoverclicker II: 5/s
- Hoverclicker III: 15/s
- Clicklock: Toggle to keep hoverclicker active even when not hovering

**Implementation:**
1. Add hover detection on quantum core
2. Start interval that calls click handler
3. Each upgrade multiplies the rate
4. Clicklock adds a state flag that bypasses the hover requirement

---

### 4.2 Multiple Entanglements Per Flower
**Upgrade:** "Quantum Web" - Each plant can have 2 entanglement links

**Implementation:**
1. Change `entangledWith` from single index to array
2. Update entanglement drawing to handle multiple lines per plant
3. Update harvest logic to trigger all partners

---

### 4.3 Automated Entangler
**Upgrade:** Auto-connects plants with visual lead-up animation.

**Implementation:**
1. Every N seconds, find two unentangled plants (prefer high-time to low-time)
2. Show a "forming" connection animation over 3-4 seconds
3. On complete, establish the entanglement
4. Fuzzy/blurred line that solidifies

---

### 4.4 Pattern/Constellation Achievements
**Feature:** Recognize entanglement patterns and award achievements.

**Patterns to detect:**
- Vertical line (full column)
- Horizontal line (full row)  
- Diagonal
- Square (4 corners connected)
- Triangle
- X-shape
- T-shape

**Implementation:**
1. Create pattern detection functions
2. Check after each new entanglement
3. Award achievement + log + notification
4. Add a "Pattern Catalog" sub-tab showing discovered patterns

---

## Checklist Status

- ⬜ 1.1 Stats/Collapse tracking fix (partial - stats now update in realtime, collapse issue needs more investigation)
- ✅ 1.2 Quantum events visibility (fixed - moved to separate container)
- ✅ 1.3 +X/s rate coherence reflection (fixed - calculateProduction in game loop)
- ✅ 1.4 Garden centering (fixed - removed width/height 100% from grid)
- ✅ 1.5 Coherence flicker timing (fixed - increased grace to 450ms)
- ✅ 2.1 Click rate averaging (shows +X/s from clicks when actively clicking)
- ✅ 2.2 Collapse requirements clarity (fixed - updated description, show section at 500k)
- ✅ 2.3 Achievement hover pause (fixed - added mouseenter/mouseleave handlers)
- ✅ 2.4 Eye cursor observer effect (fixed - added cursor: zoom-in)
- ✅ 2.5 Hide locked currency floaters (fixed - added ResourceManager.isUnlocked check)
- ✅ 3.1 LED glow buttons (fixed - added red glow animation to toggle indicator)
- ✅ 3.2 Auto-button progress bars (added progress bars showing time until next auto action)
- ✅ 3.3 Lower coherence floor (fixed - changed from 60% to 30%)
- ⬜ 3.4 Entangle chain follows cursor
- ⬜ 4.1 Hoverclicker upgrades
- ⬜ 4.2 Multiple entanglements
- ⬜ 4.3 Automated entangler
- ⬜ 4.4 Pattern achievements
- ✅ 4.5 **LOAD BUTTON** - Added Load, Export buttons with file picker and confirmation

---

## 🆕 PHASE 5: SAVE/LOAD SYSTEM

### 5.1 Add Load Button
**Issue:** Game has Save button but no Load button - players can't restore from backup saves

**Implementation:**
1. Add "📂 Load" button next to Save button in header
2. Create file input (hidden) that accepts .json files
3. On load: validate save data structure, apply via StateManager.importSave()
4. Show confirmation modal with save info (reality level, play time, etc.)
5. Add backup/export functionality (download save as .json file)

**Robust Save/Load Features:**
- Auto-backup before load (in case new save is corrupted)
- Save versioning and migration for future updates
- Cloud save integration prep (localStorage + optional export)
- Multiple save slots? (stretch goal)
