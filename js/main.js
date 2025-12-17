// MODULE: Game Loop
// ============================================
const GameLoop = (() => {
    let lastTime = Date.now();
    let running = false;
    let saveTimer = 0;
    let uiTimer = 0;
    let statsTimer = 0;
    
    function start() {
        running = true;
        lastTime = Date.now();
        requestAnimationFrame(tick);
    }
    
    function stop() {
        running = false;
    }
    
    function tick() {
        if (!running) return;
        
        const now = Date.now();
        const deltaTime = Math.min((now - lastTime) / 1000, 1); // Cap at 1 second
        lastTime = now;
        
        // Update game state
        update(deltaTime);
        
        // UI updates (throttled)
        uiTimer += deltaTime;
        if (uiTimer >= 0.1) { // 10 FPS for UI
            GeneratorManager.calculateProduction(); // Recalc rates (coherence affects these)
            UI.renderResources();
            UI.updateGardenProgress(); // Only update progress bars, not full re-render
            UI.updateAutoProgress(); // Update auto-harvest/plant progress bars
            UI.updateBuyButtons(); // Check if buttons should enable/disable
            UI.updateClickPowerDisplay(); // Update click power with coherence bonus
            UI.updateCoherenceBar(); // Update coherence bar
            UI.updateNextUnlock(); // Update next unlock indicator
            uiTimer = 0;
        }
        
        // Stats updates (slower - once per second is fine)
        statsTimer += deltaTime;
        if (statsTimer >= 1) {
            UI.renderStats();
            statsTimer = 0;
        }
        
        // Autosave
        const saveInterval = StateManager.get('settings.autosaveInterval') || 30;
        saveTimer += deltaTime;
        if (saveTimer >= saveInterval) {
            StateManager.save();
            saveTimer = 0;
        }
        
        requestAnimationFrame(tick);
    }
    
    function update(deltaTime) {
        // Generator production
        Object.keys(GameData.generators).forEach(id => {
            const prod = GeneratorManager.getProduction(id);
            for (const [resource, rate] of Object.entries(prod)) {
                ResourceManager.add(resource, rate * deltaTime);
            }
        });
        
        // Garden growth
        GardenManager.update(deltaTime);
        
        // Quantum mechanics (observer effect, events, coherence)
        QuantumMechanics.update(deltaTime);
        
        // Achievement checking
        AchievementManager.update(deltaTime);
        
        // Update play time
        const playTime = StateManager.get('stats.playTime') || 0;
        StateManager.set('stats.playTime', playTime + deltaTime);
        
        // Track high coherence time (for achievement)
        const coherence = ResourceManager.get('coherence') || 0;
        const generators = Object.keys(GameData.generators).reduce((sum, id) => 
            sum + GeneratorManager.getOwned(id), 0);
        if (coherence >= 90 && generators >= 50) {
            const highTime = StateManager.get('stats.highCoherenceTime') || 0;
            StateManager.set('stats.highCoherenceTime', highTime + deltaTime);
        } else {
            // Reset if conditions not met
            StateManager.set('stats.highCoherenceTime', 0);
        }
        
        // Check unlocks (throttled - every 0.5s worth of updates is fine)
        checkUnlocks();
    }
    
    function checkUnlocks() {
        // Check generator unlocks
        let changed = false;
        Object.entries(GameData.generators).forEach(([id, data]) => {
            if (!data.unlocked && GeneratorManager.isUnlocked(id)) {
                data.unlocked = true;
                UI.addLogEntry('Unlocked: ' + data.name + '!', 'highlight');
                changed = true;
            }
        });
        
        // Check upgrade unlocks
        Object.entries(GameData.upgrades).forEach(([id, data]) => {
            if (!data.unlocked && !UpgradeManager.isPurchased(id) && UpgradeManager.isUnlocked(id)) {
                data.unlocked = true;
                UI.addLogEntry('New upgrade available: ' + data.name, 'highlight');
                changed = true;
            }
        });
        
        if (changed) {
            UI.renderGenerators();
            UI.renderUpgrades();
        }
    }
    
    return { start, stop };
})();

// ============================================
// INITIALIZATION
// ============================================
(function init() {
    // Initialize tooltip system
    TooltipManager.init();
    
    // Initialize state
    const wasLoaded = StateManager.initialize();
    
    // Initialize UI
    UI.initialize();
    
    // Initialize Narrative System
    NarrativeSystem.initialize();
    
    // Calculate initial production
    GeneratorManager.calculateProduction();
    
    // Initialize next unlock display
    UI.updateNextUnlock();
    
    // Start game loop
    GameLoop.start();
    
    // Log startup
    if (wasLoaded) {
        UI.addLogEntry('Welcome back to your Quantum Garden!');
        
        // Calculate and show offline progress
        const offlineProgress = StateManager.calculateOfflineProgress();
        if (offlineProgress && offlineProgress.seconds >= 60) {
            setTimeout(() => {
                showOfflineProgressModal(offlineProgress);
            }, 500);
        }
    } else {
        UI.addLogEntry('Welcome to Quantum Garden! Click the quantum core to begin.');
        UI.addLogEntry('Tip: Gather 30 energy to unlock seeds and start planting!', 'highlight');
    }
    
    function showOfflineProgressModal(progress) {
        let gainsHtml = '';
        for (const [resource, amount] of Object.entries(progress.gains)) {
            if (amount > 0 && GameData.resources[resource]) {
                const data = GameData.resources[resource];
                gainsHtml += `<div class="offline-gain">${data.icon} +${Utils.formatNumber(amount)} ${data.name}</div>`;
            }
        }
        
        if (!gainsHtml) return; // No gains to show
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'offline-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h3>🌙 Welcome Back!</h3>
                <p style="color: var(--text-dim); margin-bottom: 1rem;">
                    While you were away for <strong>${progress.formattedTime}</strong>, 
                    your generators kept working at 50% efficiency.
                </p>
                <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    ${gainsHtml}
                </div>
                <button class="action-btn" onclick="document.getElementById('offline-modal').remove()">
                    Collect & Continue
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        UI.addLogEntry(`Offline progress: ${progress.formattedTime} of production collected!`, 'success');
    }
    
    // Setup window events
    window.addEventListener('beforeunload', () => {
        if (StateManager.canSave() && !window.quantumGardenResetting) {
            StateManager.save();
        }
    });
    
    // Handle window resize - update garden and entanglement lines
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            UI.renderGarden();
        }, 100);
    });
    
    // Attach coherence bar tooltip
    const coherenceBar = document.getElementById('coherence-bar-container');
    if (coherenceBar) {
        TooltipManager.attach(coherenceBar, {
            title: '🌀 Quantum Coherence',
            description: 'Affects harvest yield variance. High coherence = unpredictable but potentially higher yields. Low coherence = predictable, consistent yields.'
        }, () => {
            const generators = Object.keys(GameData.generators).reduce((sum, id) => {
                return sum + GeneratorManager.getOwned(id);
            }, 0);
            let decayRate = 0.01 + (generators * 0.002);
            const hasStabilizer = UpgradeManager.isPurchased('coherenceStabilizer');
            if (hasStabilizer) decayRate *= 0.5;
            
            let detail = `Decay: -${Utils.formatNumber(decayRate, 3)}/s`;
            detail += `<br>From: ${generators} generators`;
            if (hasStabilizer) detail += `<br>Stabilizer: -50% decay`;
            return detail;
        });
    }
    
    // Attach quantum core tooltip
    const quantumCore = document.getElementById('quantum-core');
    if (quantumCore) {
        TooltipManager.attach(quantumCore, {
            title: '⚛️ Quantum Core',
            description: 'Click to gather Quantum Energy!'
        }, () => {
            const power = UpgradeManager.getClickPower();
            let detail = `Click power: ${Utils.formatNumber(power)}`;
            
            // Show breakdown
            let multiplier = 1;
            let bonus = 0;
            const sources = [];
            
            if (UpgradeManager.isPurchased('efficientClicking')) {
                sources.push('Quantum Resonance: ×2');
                multiplier *= 2;
            }
            if (UpgradeManager.isPurchased('improvedClicking')) {
                sources.push('Harmonic Amplification: ×3');
                multiplier *= 3;
            }
            if (UpgradeManager.isPurchased('quantumClicking')) {
                sources.push('Superposition Click: +5');
                bonus += 5;
            }
            
            if (sources.length > 0) {
                detail += '<br><br>' + sources.join('<br>');
            }
            
            return detail;
        });
    }
    
    console.log('🌸 Quantum Garden initialized');
})();
</script>
