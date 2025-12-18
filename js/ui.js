// MODULE: UI Renderer
// ============================================
const UI = (() => {
    let selectedPlotIndex = null;
    let cursorLineHandler = null;
    let entanglementCursorLine = null;
    
    function initialize() {
        setupEventListeners();
        renderAll();
    }
    
    function setupEventListeners() {
        // Quantum Core click
        document.getElementById('quantum-core').addEventListener('click', handleCoreClick);
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        
        // Header buttons
        document.getElementById('save-btn').addEventListener('click', () => {
            StateManager.save();
            showNotification('Game Saved', 'Your progress has been saved.', 'success');
        });
        
        // Export button - download save as file
        document.getElementById('export-btn').addEventListener('click', () => {
            StateManager.save(); // Ensure latest state
            const state = JSON.parse(atob(StateManager.exportSave()));
            const dataStr = JSON.stringify(state, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0, 10);
            const realityLevel = state.prestige?.realityLevel || 1;
            a.download = `quantum-garden-r${realityLevel}-${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Save Exported', 'Download started!', 'success');
        });
        
        // Helper to apply loaded save
        function applyLoadedSave(saveData) {
            // Backup current save first
            const backup = StateManager.exportSave();
            localStorage.setItem('quantumGarden_backup', backup);
            
            // Stop game loop during load
            GameLoop.stop();
            
            // Apply the new state
            StateManager.setState(saveData);
            StateManager.save();
            
            // Reset GameData unlocks based on new state
            Object.values(GameData.generators).forEach(g => {
                if (g.unlockAt) g.unlocked = false;
            });
            Object.values(GameData.upgrades).forEach(u => {
                if (u.requires || u.unlockAt) u.unlocked = false;
            });
            Object.values(GameData.resources).forEach(r => {
                if (r.unlockAt) r.unlocked = false;
            });
            
            // Recalculate everything
            GeneratorManager.calculateProduction();
            
            // Re-render
            UI.renderAll();
            
            // Restart
            GameLoop.start();
            
            showNotification('Save Loaded', 'Your progress has been restored. Backup saved.', 'success');
            UI.addLogEntry('📂 Save file loaded successfully.', 'highlight');
        }
        
        // Load button - handles both file picker and confirmation
        document.getElementById('load-btn').addEventListener('click', () => {
            const loadBtn = document.getElementById('load-btn');
            
            // If we have a pending save to confirm, apply it
            if (loadBtn.dataset.confirmPending === 'true' && loadBtn.dataset.pendingSave) {
                try {
                    const saveData = JSON.parse(loadBtn.dataset.pendingSave);
                    applyLoadedSave(saveData);
                } catch (err) {
                    showNotification('Load Failed', 'Could not apply save.', 'error');
                }
                loadBtn.dataset.confirmPending = 'false';
                loadBtn.dataset.pendingSave = '';
                loadBtn.textContent = '📂 Load';
                loadBtn.style.background = '';
                loadBtn.style.color = '';
                return;
            }
            
            // Otherwise, open file picker
            document.getElementById('load-file-input').click();
        });
        
        // File input handler for loading saves
        document.getElementById('load-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    let saveData;
                    const content = event.target.result.trim();
                    
                    // Try to parse as JSON first (new format)
                    try {
                        saveData = JSON.parse(content);
                    } catch {
                        // Try base64 decode (old format)
                        try {
                            saveData = JSON.parse(atob(content));
                        } catch {
                            throw new Error('Invalid save file format');
                        }
                    }
                    
                    // Validate save structure
                    if (!saveData.resources || !saveData.garden || !saveData.meta) {
                        throw new Error('Save file is missing required data');
                    }
                    
                    // Show confirmation with save info
                    const energy = saveData.resources?.energy?.amount || 0;
                    const realityLevel = saveData.prestige?.realityLevel || 1;
                    const playTime = saveData.stats?.playTime || 0;
                    const hours = Math.floor(playTime / 3600);
                    const mins = Math.floor((playTime % 3600) / 60);
                    
                    const loadBtn = document.getElementById('load-btn');
                    
                    // Store save and show confirmation
                    loadBtn.dataset.pendingSave = JSON.stringify(saveData);
                    loadBtn.dataset.confirmPending = 'true';
                    loadBtn.textContent = '✓ Confirm';
                    loadBtn.style.background = 'var(--quantum-green)';
                    loadBtn.style.color = 'white';
                    
                    showNotification(
                        'Load Save?',
                        `Reality ${realityLevel} | ${formatNumber(energy)} energy | ${hours}h ${mins}m\nClick Load again to confirm.`,
                        'info',
                        5000
                    );
                    
                    // Reset button after 5 seconds
                    setTimeout(() => {
                        if (loadBtn.dataset.confirmPending === 'true') {
                            loadBtn.dataset.confirmPending = 'false';
                            loadBtn.dataset.pendingSave = '';
                            loadBtn.textContent = '📂 Load';
                            loadBtn.style.background = '';
                            loadBtn.style.color = '';
                        }
                    }, 5000);
                    
                } catch (err) {
                    showNotification('Load Failed', err.message, 'error');
                    console.error('Load error:', err);
                }
            };
            reader.readAsText(file);
            // Reset input so same file can be selected again
            e.target.value = '';
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            // Show custom confirmation since confirm() is blocked in sandbox
            const resetBtn = document.getElementById('reset-btn');
            if (resetBtn.dataset.confirmPending === 'true') {
                // Second click - actually reset
                // Stop game loop
                GameLoop.stop();
                // Clear localStorage
                localStorage.removeItem('quantumGarden_save');
                // Reset all game data unlocks
                Object.values(GameData.generators).forEach(g => {
                    if (g.unlockAt) g.unlocked = false;
                });
                Object.values(GameData.upgrades).forEach(u => {
                    if (u.requires || u.unlockAt) u.unlocked = false;
                });
                Object.values(GameData.resources).forEach(r => {
                    if (r.unlockAt) r.unlocked = false;
                });
                // Reset narrative messages
                if (typeof QuantumMechanics !== 'undefined') {
                    // Narrative messages are inside the module, we'll just reinit
                }
                // Reinitialize state
                StateManager.initialize();
                // Recalculate production
                GeneratorManager.calculateProduction();
                // Re-render everything
                UI.renderAll();
                // Restart game loop
                GameLoop.start();
                // Reset button state
                resetBtn.dataset.confirmPending = 'false';
                resetBtn.textContent = '🗑️ Reset';
                resetBtn.style.background = '';
                resetBtn.style.color = 'var(--quantum-red)';
                // Log it
                UI.addLogEntry('Game reset! Welcome back to your Quantum Garden.', 'highlight');
            } else {
                // First click - ask for confirmation
                resetBtn.dataset.confirmPending = 'true';
                resetBtn.textContent = '⚠️ Click again to confirm!';
                resetBtn.style.background = 'var(--quantum-red)';
                resetBtn.style.color = 'white';
                
                // Reset button state after 3 seconds
                setTimeout(() => {
                    resetBtn.dataset.confirmPending = 'false';
                    resetBtn.textContent = '🗑️ Reset';
                    resetBtn.style.background = '';
                    resetBtn.style.color = 'var(--quantum-red)';
                }, 3000);
            }
        });
        
        // Plant modal
        document.getElementById('close-plant-modal').addEventListener('click', closePlantModal);
        document.getElementById('plant-modal').addEventListener('click', (e) => {
            if (e.target.id === 'plant-modal') closePlantModal();
        });
        
        // Event delegation for generator buy buttons (survives re-renders)
        document.getElementById('generators-list').addEventListener('click', (e) => {
            const btn = e.target.closest('.generator-buy-btn');
            if (!btn || btn.disabled) return;
            
            const id = btn.dataset.generator;
            const amount = btn.dataset.amount;
            
            let buyAmount = 1;
            if (amount === 'max') {
                buyAmount = 'max';
            } else if (amount === '10') {
                buyAmount = 10;
            }
            
            if (id && GeneratorManager.buy(id, buyAmount)) {
                renderGenerators();
                renderResources();
                const actualBought = typeof buyAmount === 'number' ? buyAmount : GeneratorManager.getOwned(id);
                const msg = buyAmount === 1 ? 
                    `Purchased ${GameData.generators[id].name}` :
                    `Purchased ${buyAmount === 'max' ? 'max' : buyAmount} ${GameData.generators[id].name}`;
                addLogEntry(msg, 'success');
            }
        });
        
        // Event delegation for upgrade items (survives re-renders)
        document.getElementById('upgrades-list').addEventListener('click', (e) => {
            const item = e.target.closest('.upgrade-item');
            if (!item || item.classList.contains('purchased') || item.classList.contains('locked')) return;
            
            const id = item.dataset.upgrade;
            if (id && UpgradeManager.buy(id)) {
                renderUpgrades();
                renderResources();
                renderGarden();
                updateClickPowerDisplay();
                addLogEntry('Purchased upgrade: ' + GameData.upgrades[id].name, 'success');
            }
        });
        
        // Event delegation for stats tab (collapse reality button)
        document.getElementById('stats-content').addEventListener('click', (e) => {
            const collapseBtn = e.target.closest('#collapse-reality-btn');
            if (collapseBtn && !collapseBtn.disabled) {
                // Confirm collapse with similar pattern to reset
                if (collapseBtn.dataset.confirmPending === 'true') {
                    // Actually collapse
                    if (PrestigeManager.collapse()) {
                        collapseBtn.dataset.confirmPending = 'false';
                        renderStats();
                    }
                } else {
                    // First click - confirm
                    collapseBtn.dataset.confirmPending = 'true';
                    collapseBtn.textContent = '⚠️ Click again to collapse reality!';
                    collapseBtn.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        if (collapseBtn.dataset.confirmPending === 'true') {
                            collapseBtn.dataset.confirmPending = 'false';
                            collapseBtn.textContent = '🌌 Collapse Reality';
                            collapseBtn.style.background = '';
                        }
                    }, 3000);
                }
            }
        });
        
        // Event delegation for plant modal options
        document.getElementById('plant-options').addEventListener('click', (e) => {
            const opt = e.target.closest('.plant-option');
            if (!opt || opt.classList.contains('locked')) return;
            
            const genId = opt.dataset.generator;
            const isPreference = opt.dataset.preference === 'true';
            
            if (isPreference) {
                // Setting auto-plant preference
                if (genId === '__clear__') {
                    StateManager.set(`garden.plots.${selectedPlotIndex}.autoPlantType`, null);
                    addLogEntry(`Cleared auto-plant preference for plot`, '');
                } else {
                    StateManager.set(`garden.plots.${selectedPlotIndex}.autoPlantType`, genId);
                    addLogEntry(`Set plot to auto-plant ${GameData.generators[genId].name}`, 'highlight');
                }
                closePlantModal();
                renderGarden();
            } else {
                // Actually planting
                if (genId && GardenManager.plant(selectedPlotIndex, genId)) {
                    closePlantModal();
                    
                    // Check if mutation occurred
                    const plot = GardenManager.getPlot(selectedPlotIndex);
                    if (plot && plot.mutation) {
                        const mutInfo = GardenManager.getMutationInfo(plot.mutation);
                        addLogEntry(`✨ MUTATION! ${mutInfo.icon} ${mutInfo.name} ${GameData.generators[genId].name}!`, 'success');
                        showNotification(`${mutInfo.icon} Mutation!`, `${mutInfo.name}: ${mutInfo.description}`, 'success');
                    } else {
                        addLogEntry('Planted ' + GameData.generators[genId].name, 'highlight');
                    }
                    
                    renderGarden();
                    renderResources();
                }
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const key = e.key.toLowerCase();
            
            switch (key) {
                case 'e':
                    // Toggle entangle mode
                    const entangleBtn = document.getElementById('entangle-btn');
                    if (entangleBtn && !entangleBtn.disabled) {
                        entangleBtn.click();
                    }
                    break;
                    
                case 'h':
                    // Toggle auto-harvest
                    if (UpgradeManager.isPurchased('autoHarvest')) {
                        const current = StateManager.get('settings.autoHarvestEnabled');
                        StateManager.set('settings.autoHarvestEnabled', !current);
                        addLogEntry(`Auto-harvest: ${!current ? 'ON' : 'OFF'}`, 'highlight');
                        updateGardenControls();
                    }
                    break;
                    
                case 'p':
                    // Toggle auto-plant
                    if (UpgradeManager.isPurchased('autoPlant')) {
                        const current = StateManager.get('settings.autoPlantEnabled');
                        StateManager.set('settings.autoPlantEnabled', !current);
                        addLogEntry(`Auto-plant: ${!current ? 'ON' : 'OFF'}`, 'highlight');
                        updateGardenControls();
                    }
                    break;
                    
                case '1':
                case '2':
                case '3':
                    // Tab shortcuts
                    const tabs = ['generators', 'upgrades', 'stats'];
                    const tabIndex = parseInt(key) - 1;
                    if (tabs[tabIndex]) {
                        switchTab(tabs[tabIndex]);
                    }
                    break;
                    
                case ' ':
                    // Space - click quantum core
                    e.preventDefault();
                    const core = document.getElementById('quantum-core');
                    if (core) {
                        handleCoreClick({ target: core });
                    }
                    break;
                    
                case 'r':
                    // R - harvest all ready plants
                    const plots = StateManager.get('garden.plots') || [];
                    let harvestedCount = 0;
                    plots.forEach((plot, index) => {
                        if (plot.plant && plot.progress >= 1) {
                            const result = GardenManager.harvest(index);
                            if (result && result.yield) {
                                ResourceGainTracker.showHarvestFloat(index, result.yield);
                                harvestedCount++;
                            }
                        }
                    });
                    if (harvestedCount > 0) {
                        addLogEntry(`🌾 Harvested ${harvestedCount} plants with hotkey`, 'success');
                        renderGarden();
                        renderResources();
                    }
                    break;
                    
                case 'escape':
                    // Escape - close modals
                    const modal = document.getElementById('plant-modal');
                    if (modal && modal.classList.contains('active')) {
                        modal.classList.remove('active');
                        selectedPlotIndex = null;
                    }
                    const settingsModal = document.getElementById('settings-modal');
                    if (settingsModal && settingsModal.classList.contains('active')) {
                        settingsModal.classList.remove('active');
                    }
                    // Cancel entanglement mode
                    if (GardenManager.getEntanglementMode().active) {
                        GardenManager.setEntanglementMode(false);
                        removeCursorEntanglementLine();
                        updateGardenControls();
                        renderGarden();
                    }
                    break;
                    
                case '?':
                    // Show keyboard shortcuts help
                    showKeyboardHelp();
                    break;
            }
        });
    }
    
    function showKeyboardHelp() {
        // Remove existing help modal if present
        const existing = document.getElementById('keyboard-help-modal');
        if (existing) {
            existing.remove();
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'keyboard-help-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3>⌨️¸ Keyboard Shortcuts</h3>
                <div style="display: grid; gap: 8px; margin-top: 16px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">Space</span>
                        <span>Click quantum core</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">R</span>
                        <span>Harvest all ready plants</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">E</span>
                        <span>Toggle entanglement mode</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">H</span>
                        <span>Toggle auto-harvest</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">P</span>
                        <span>Toggle auto-plant</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">1 / 2 / 3</span>
                        <span>Switch tabs</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">Esc</span>
                        <span>Close modal / cancel</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-dim);">?</span>
                        <span>Toggle this help</span>
                    </div>
                </div>
                <button class="action-btn" style="width: 100%; margin-top: 16px;" 
                        onclick="document.getElementById('keyboard-help-modal').remove()">
                    Got it!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // Quantum burst charge (builds up with clicks)
    let quantumBurstCharge = 0;
    const BURST_THRESHOLD = 100;
    
    // Click combo system
    let clickCombo = 0;
    let lastClickTime = 0;
    const COMBO_TIMEOUT = 500; // ms between clicks to maintain combo
    let clickTimestamps = []; // For click rate averaging
    
    // Calculate clicks per second (rolling 1-second window)
    function getClickRate() {
        const now = Date.now();
        // Remove clicks older than 1 second
        clickTimestamps = clickTimestamps.filter(t => now - t < 1000);
        return clickTimestamps.length;
    }
    
    function handleCoreClick(e) {
        const now = Date.now();
        const power = UpgradeManager.getClickPower();
        const coherence = ResourceManager.get('coherence') || 0;
        
        // Record click for rate averaging
        clickTimestamps.push(now);
        
        // Update click combo
        if (now - lastClickTime < COMBO_TIMEOUT) {
            clickCombo = Math.min(50, clickCombo + 1); // Max 50x combo
        } else {
            clickCombo = 1;
        }
        lastClickTime = now;
        
        // Click power is boosted by coherence!
        // At 100% coherence: 150% click power
        // At 0% coherence: 100% click power (base)
        const coherenceBonus = 1 + (coherence / 100) * 0.5;
        
        // Combo bonus: up to 2x at 50 combo
        const comboBonus = 1 + (clickCombo / 50);
        
        const actualPower = Math.floor(power * coherenceBonus * comboBonus);
        
        ResourceManager.add('energy', actualPower);
        
        // CLICKING RESTORES COHERENCE!
        // Each click restores 0.5-2% coherence based on click power
        // Combo also helps restore coherence faster
        const coherenceRestore = Math.min(3, 0.5 + Math.log10(power + 1) * 0.3 + clickCombo * 0.02);
        const currentCoherence = ResourceManager.get('coherence') || 0;
        const newCoherence = Math.min(100, currentCoherence + coherenceRestore);
        StateManager.set('resources.coherence.amount', newCoherence);
        
        // Visual feedback when hitting 100% coherence
        if (currentCoherence < 100 && newCoherence >= 100) {
            const coherenceBar = document.getElementById('coherence-bar-container');
            if (coherenceBar) {
                coherenceBar.classList.add('coherence-maxed');
                setTimeout(() => coherenceBar.classList.remove('coherence-maxed'), 500);
            }
            // Also add log message first time
            if (currentCoherence < 95) {
                addLogEntry('🌀 Coherence fully restored!', 'success');
            }
        }
        
        // Build quantum burst charge (combo speeds it up!)
        quantumBurstCharge += 1 + (coherence / 50) + (clickCombo / 25);
        
        if (quantumBurstCharge >= BURST_THRESHOLD) {
            triggerQuantumBurst();
            quantumBurstCharge = 0;
        }
        
        // Update quantum burst indicator
        updateBurstIndicator();
        
        // Update combo display
        updateComboDisplay();
        
        // Update stats
        const clicks = StateManager.get('stats.totalClicks') || 0;
        StateManager.set('stats.totalClicks', clicks + 1);
        
        // Track clicks with many generators (for achievement)
        const generators = Object.keys(GameData.generators).reduce((sum, id) => 
            sum + GeneratorManager.getOwned(id), 0);
        if (generators >= 100) {
            const clicksWithManyGens = StateManager.get('stats.clicksWithManyGens') || 0;
            StateManager.set('stats.clicksWithManyGens', clicksWithManyGens + 1);
        }
        
        // Particle effect - show combo bonus
        if (StateManager.get('settings.particlesEnabled')) {
            createClickParticle(e.clientX, e.clientY, actualPower, clickCombo >= 10);
        }
        
        // Quick render of resources only
        renderResources();
        updateCoherenceBar();
    }
    
    function updateComboDisplay() {
        const comboEl = document.getElementById('combo-display');
        const comboValue = document.getElementById('combo-value');
        
        if (!comboEl || !comboValue) return;
        
        if (clickCombo >= 3) {
            comboEl.classList.remove('hidden');
            comboValue.textContent = clickCombo;
            
            // Color based on combo level
            if (clickCombo >= 25) {
                comboValue.style.color = 'var(--quantum-gold)';
            } else if (clickCombo >= 10) {
                comboValue.style.color = 'var(--quantum-cyan)';
            } else {
                comboValue.style.color = 'var(--quantum-orange)';
            }
            
            // Re-trigger animation
            comboEl.style.animation = 'none';
            comboEl.offsetHeight; // Force reflow
            comboEl.style.animation = 'combo-pulse 0.3s ease-out';
            
            // Fade out if no more clicks
            clearTimeout(comboEl._fadeTimer);
            comboEl._fadeTimer = setTimeout(() => {
                comboEl.classList.add('hidden');
                clickCombo = 0;
            }, COMBO_TIMEOUT + 200);
        } else {
            comboEl.classList.add('hidden');
        }
    }
    
    function triggerQuantumBurst() {
        // Quantum burst: Boost all growing plants by 20% instantly!
        const plots = StateManager.get('garden.plots') || [];
        let boosted = 0;
        
        plots.forEach((plot, index) => {
            if (plot.plant && plot.progress < 1) {
                const newProgress = Math.min(1, plot.progress + 0.2);
                StateManager.set(`garden.plots.${index}.progress`, newProgress);
                boosted++;
            }
        });
        
        // Track stat
        const bursts = StateManager.get('stats.quantumBursts') || 0;
        StateManager.set('stats.quantumBursts', bursts + 1);
        
        // Visual feedback
        document.getElementById('quantum-core').classList.add('burst');
        setTimeout(() => {
            document.getElementById('quantum-core').classList.remove('burst');
        }, 500);
        
        // Restore significant coherence
        const currentCoherence = ResourceManager.get('coherence') || 0;
        StateManager.set('resources.coherence.amount', Math.min(100, currentCoherence + 10));
        
        if (boosted > 0) {
            addLogEntry(`⚡ Quantum Burst! ${boosted} plants boosted by 20%!`, 'highlight');
        } else {
            addLogEntry(`⚡ Quantum Burst! +10% coherence restored!`, 'highlight');
        }
        
        showNotification('⚡ QUANTUM BURST!');
        renderGarden();
    }
    
    function updateBurstIndicator() {
        const fill = document.getElementById('burst-fill');
        if (fill) {
            const percent = (quantumBurstCharge / BURST_THRESHOLD * 100);
            fill.style.width = percent + '%';
            
            // Add charged class when near full
            if (percent >= 90) {
                fill.classList.add('charged');
            } else {
                fill.classList.remove('charged');
            }
        }
    }
    
    function createClickParticle(x, y, value, isCoherenceBoosted = false) {
        const particle = document.createElement('div');
        particle.className = 'click-particle' + (isCoherenceBoosted ? ' coherence-boosted' : '');
        particle.textContent = '+' + Utils.formatNumber(value);
        particle.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
        particle.style.top = (y - 20) + 'px';
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
    
    function switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId + '-tab');
        });
    }
    
    function renderAll() {
        renderResources();
        renderGarden();
        renderGenerators();
        renderUpgrades();
        renderStats();
        updateClickPowerDisplay();
    }
    
    function renderResources() {
        const container = document.getElementById('resources-section');
        let html = '';
        
        // Calculate harvest rates from garden
        const harvestRates = calculateHarvestRates();
        
        // Tooltip descriptions
        const tooltipData = {
            energy: {
                title: '⚡ Quantum Energy',
                description: 'Primary currency. Earned by clicking, generators, and harvesting.',
            },
            seeds: {
                title: '🌱 Seeds',
                description: 'Required to plant (1 per plant). Earned back when harvesting.',
            },
            time: {
                title: '⏳ Time Crystals',
                description: 'Secondary currency for mid-tier upgrades.',
            },
            knowledge: {
                title: '📚 Quantum Knowledge',
                description: 'Advanced currency for quantum upgrades.',
            },
            coherence: {
                title: '🌀 Coherence',
                description: 'Quantum stability. Affects generator production and click power. Click the quantum core to restore!',
            },
            entanglement: {
                title: '🔗 Entanglement Threads',
                description: 'Used to link plants. Entangled plants share growth and harvest together.',
            },
            fragments: {
                title: '💠 Reality Fragments',
                description: 'Permanent shards of collapsed realities. Used for powerful persistent upgrades.',
            }
        };
        
        Object.entries(GameData.resources).forEach(([id, data]) => {
            if (!ResourceManager.isUnlocked(id)) return;
            
            const amount = ResourceManager.get(id);
            const generatorRate = ResourceManager.getRate(id);
            const harvestRate = harvestRates[id] || 0;
            const totalRate = generatorRate + harvestRate;
            const maxAmount = data.maxAmount;
            
            // Special display for coherence (show as percentage)
            let displayAmount = Utils.formatNumber(amount, 1);
            if (id === 'coherence') {
                displayAmount = Math.floor(amount) + '%';
            }
            
            // Rate display
            let rateHtml = '';
            if (totalRate > 0) {
                rateHtml = `<div class="resource-rate positive">+${Utils.formatNumber(totalRate, 1)}/s</div>`;
            } else if (totalRate < 0) {
                rateHtml = `<div class="resource-rate negative">${Utils.formatNumber(totalRate, 1)}/s</div>`;
            }
            
            html += `
                <div class="resource-item" data-resource="${id}">
                    <div class="resource-info">
                        <span class="resource-icon">${data.icon}</span>
                        <span class="resource-name">${data.name}</span>
                    </div>
                    <div class="resource-values">
                        <div class="resource-amount ${data.color}">${displayAmount}${maxAmount ? '/' + maxAmount : ''}</div>
                        ${rateHtml}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Attach tooltips
        container.querySelectorAll('.resource-item').forEach(el => {
            const id = el.dataset.resource;
            const data = tooltipData[id];
            if (data) {
                TooltipManager.attach(el, data, () => getResourceDetail(id));
            }
        });
    }
    
    function getResourceDetail(resourceId) {
        const generatorRate = ResourceManager.getRate(resourceId);
        const harvestRates = calculateHarvestRates();
        const harvestRate = harvestRates[resourceId] || 0;
        
        let details = [];
        
        if (generatorRate > 0) {
            details.push(`Generators: +${Utils.formatNumber(generatorRate, 2)}/s`);
        }
        
        if (harvestRate > 0) {
            details.push(`Garden (avg): +${Utils.formatNumber(harvestRate, 2)}/s`);
        }
        
        // Show coherence effect on energy production
        if (resourceId === 'energy' && ResourceManager.isUnlocked('coherence')) {
            const coherence = ResourceManager.get('coherence') || 0;
            const coherenceMultiplier = 0.3 + (coherence / 100) * 0.7;
            const percent = Math.round(coherenceMultiplier * 100);
            if (percent < 100) {
                details.push(`<span style="color: var(--quantum-red)">Coherence: ${percent}% production</span>`);
            } else {
                details.push(`<span style="color: var(--quantum-green)">Coherence: ${percent}% production</span>`);
            }
        }
        
        if (resourceId === 'coherence') {
            const generators = Object.keys(GameData.generators).reduce((sum, id) => {
                return sum + GeneratorManager.getOwned(id);
            }, 0);
            const decayRate = 0.01 + (generators * 0.002);
            const stabilizer = UpgradeManager.isPurchased('coherenceStabilizer') ? 0.5 : 1;
            const finalDecay = decayRate * stabilizer;
            details.push(`Decay: -${Utils.formatNumber(finalDecay, 3)}/s`);
            details.push(`(${generators} generators)`);
            if (stabilizer < 1) {
                details.push(`Stabilizer: -50% decay`);
            }
            details.push(`<br>💡 Click quantum core to restore!`);
        }
        
        return details.length > 0 ? details.join('<br>') : null;
    }
    
    function calculateHarvestRates() {
        // Only calculate if auto-harvest is on
        if (!UpgradeManager.isPurchased('autoHarvest')) return {};
        if (!StateManager.get('settings.autoHarvestEnabled')) return {};
        
        const plots = StateManager.get('garden.plots') || [];
        const growthMult = UpgradeManager.getGrowthMultiplier();
        const rates = {};
        
        plots.forEach(plot => {
            if (!plot.plant) return;
            
            const data = GameData.generators[plot.plant];
            if (!data || !data.harvestYield) return;
            
            // Calculate harvests per second
            const growTime = data.growthTime / growthMult;
            const harvestsPerSecond = 1 / growTime;
            
            // Add expected yield per second
            for (const [resource, amount] of Object.entries(data.harvestYield)) {
                if (!rates[resource]) rates[resource] = 0;
                rates[resource] += amount * harvestsPerSecond;
            }
        });
        
        return rates;
    }
    
    function renderGarden() {
        const grid = document.getElementById('garden-grid');
        const size = GardenManager.getSize();
        const cols = Math.ceil(Math.sqrt(size));
        const rows = Math.ceil(size / cols);
        
        // Calculate optimal plot size based on available space
        const container = grid.parentElement;
        const containerWidth = container.clientWidth - 32; // Subtract padding
        const containerHeight = container.clientHeight - 100; // Subtract header space
        
        // Calculate max plot size that fits, maintaining square aspect
        const gapSize = 8; // matches --spacing-sm
        const maxPlotWidth = (containerWidth - (cols - 1) * gapSize) / cols;
        const maxPlotHeight = (containerHeight - (rows - 1) * gapSize) / rows;
        
        // Use the smaller dimension to keep plots square, with 180px max and 50px min
        const plotSize = Math.min(maxPlotWidth, maxPlotHeight, 180);
        const finalSize = Math.max(Math.floor(plotSize), 50);
        
        grid.style.gridTemplateColumns = `repeat(${cols}, ${finalSize}px)`;
        grid.style.gridTemplateRows = `repeat(${rows}, ${finalSize}px)`;
        
        let html = '';
        const plots = StateManager.get('garden.plots') || [];
        const entangleMode = GardenManager.getEntanglementMode();
        
        for (let i = 0; i < size; i++) {
            const plot = plots[i] || { plant: null, progress: 0, entangledWith: null };
            const hasPlant = plot.plant !== null;
            const isReady = hasPlant && plot.progress >= 1;
            const plantData = hasPlant ? GameData.generators[plot.plant] : null;
            const isEntangled = plot.entangledWith !== null;
            const isEntangleSource = entangleMode.active && entangleMode.source === i;
            const canEntangle = entangleMode.active && entangleMode.source !== i && hasPlant && !isEntangled;
            const mutation = plot.mutation ? GardenManager.getMutationInfo(plot.mutation) : null;
            
            let plotClass = 'garden-plot';
            if (!hasPlant) plotClass += ' empty';
            else if (isReady) plotClass += ' ready';
            else plotClass += ' planted';
            if (isEntangled) plotClass += ' entangled';
            if (isEntangleSource) plotClass += ' entangle-source';
            if (canEntangle) plotClass += ' entangle-target';
            if (mutation) plotClass += ' mutated';
            
            html += `
                <div class="${plotClass}" data-index="${i}" ${mutation ? `style="--mutation-color: ${mutation.color}"` : ''}>
                    ${hasPlant ? `
                        <div class="plot-plant">${plantData.icon}</div>
                        ${mutation ? `<div class="mutation-indicator" title="${mutation.name}: ${mutation.description}">${mutation.icon}</div>` : ''}
                        ${!isReady ? `<div class="plot-progress" style="width: ${plot.progress * 100}%"></div>` : ''}
                        ${!isReady ? `<div class="plot-timer">${Utils.formatTime(plantData.growthTime * (1 - plot.progress))}</div>` : ''}
                    ` : ''}
                    ${plot.autoPlantType && UpgradeManager.isPurchased('autoPlant') ? `
                        <div class="plot-preference" title="Auto-plants: ${GameData.generators[plot.autoPlantType]?.name || '?'}">
                            ${GameData.generators[plot.autoPlantType]?.icon || '?'}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        grid.innerHTML = html;
        
        // Add click listeners and observer effect tracking
        grid.querySelectorAll('.garden-plot').forEach(plotEl => {
            const index = parseInt(plotEl.dataset.index);
            
            plotEl.addEventListener('click', () => handlePlotClick(index));
            
            // Observer effect - track when mouse is over a growing plant
            plotEl.addEventListener('mouseenter', () => {
                const plot = GardenManager.getPlot(index);
                if (plot && plot.plant && plot.progress < 1) {
                    QuantumMechanics.setObservedPlot(index);
                    plotEl.classList.add('observed');
                }
            });
            
            plotEl.addEventListener('mouseleave', () => {
                QuantumMechanics.clearObservedPlot();
                plotEl.classList.remove('observed');
            });
        });
        
        // Update plot info
        const used = plots.filter(p => p.plant).length;
        document.getElementById('plots-used').textContent = used;
        document.getElementById('plots-total').textContent = size;
        
        // Show/hide entangle button
        updateEntangleButton();
        
        // Draw entanglement connections
        updateEntanglementLines();
    }
    
    // Update a single plot without full re-render (for animations)
    function updateSinglePlot(plotIndex) {
        const plotEl = document.querySelector(`.garden-plot[data-index="${plotIndex}"]`);
        if (!plotEl) return;
        
        const plot = GardenManager.getPlot(plotIndex);
        const hasPlant = plot && plot.plant !== null;
        const isReady = hasPlant && plot.progress >= 1;
        const plantData = hasPlant ? GameData.generators[plot.plant] : null;
        const mutation = plot?.mutation ? GardenManager.getMutationInfo(plot.mutation) : null;
        
        // Update classes (match renderGarden: empty, planted, ready)
        plotEl.classList.toggle('empty', !hasPlant);
        plotEl.classList.toggle('planted', hasPlant && !isReady);
        plotEl.classList.toggle('ready', isReady);
        
        // Update content (class is 'plot-plant', not 'plant-emoji')
        const plantEl = plotEl.querySelector('.plot-plant');
        const progressEl = plotEl.querySelector('.plot-progress');
        const timerEl = plotEl.querySelector('.plot-timer');
        
        if (hasPlant) {
            if (plantEl) {
                plantEl.textContent = plantData.icon;
                plantEl.style.filter = mutation ? `drop-shadow(0 0 4px ${mutation.color})` : '';
            }
            if (progressEl) {
                progressEl.style.width = `${Math.min(100, plot.progress * 100)}%`;
            }
            if (timerEl && plot.progress < 1) {
                const remaining = plantData.growthTime * (1 - plot.progress);
                timerEl.textContent = Utils.formatTime(remaining);
            }
        } else {
            // Plant was harvested - show empty state with fade effect
            if (plantEl) {
                plantEl.style.opacity = '0';
                plantEl.style.transform = 'scale(0.5)';
                setTimeout(() => {
                    plantEl.textContent = '';
                    plantEl.style.opacity = '';
                    plantEl.style.transform = '';
                }, 200);
            }
            if (progressEl) progressEl.style.width = '0%';
            if (timerEl) timerEl.textContent = '';
            plotEl.classList.remove('planted', 'ready');
            plotEl.classList.add('empty');
        }
    }
    
    function updateCursorEntanglementLine(event) {
        const svg = document.getElementById('entanglement-lines');
        if (!svg || !entanglementCursorLine) return;

        const mode = GardenManager.getEntanglementMode();
        if (!mode.active || mode.source === null) {
            removeCursorEntanglementLine();
            return;
        }

        const grid = document.getElementById('garden-grid');
        const sourcePlotEl = document.querySelector(`.garden-plot[data-index="${mode.source}"]`);
        if (!sourcePlotEl) return;

        // Get source plot center
        const x1 = sourcePlotEl.offsetLeft + sourcePlotEl.offsetWidth / 2;
        const y1 = sourcePlotEl.offsetTop + sourcePlotEl.offsetHeight / 2;

        // Get mouse position relative to grid
        const gridRect = grid.getBoundingClientRect();
        const x2 = event.clientX - gridRect.left;
        const y2 = event.clientY - gridRect.top;

        // Update the cursor line
        entanglementCursorLine.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
    }

    function addCursorEntanglementLine() {
        const svg = document.getElementById('entanglement-lines');
        if (!svg) return;

        // Create the cursor line element if it doesn't exist
        if (!entanglementCursorLine) {
            entanglementCursorLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            entanglementCursorLine.setAttribute('class', 'entanglement-line');
            entanglementCursorLine.setAttribute('style', 'stroke: var(--quantum-cyan); opacity: 0.6;');
            svg.appendChild(entanglementCursorLine);
        }

        // Add mousemove listener
        const centerPanel = document.getElementById('center-panel');
        if (centerPanel && !cursorLineHandler) {
            cursorLineHandler = (e) => updateCursorEntanglementLine(e);
            centerPanel.addEventListener('mousemove', cursorLineHandler);
        }
    }

    function removeCursorEntanglementLine() {
        // Remove the line element
        if (entanglementCursorLine && entanglementCursorLine.parentNode) {
            entanglementCursorLine.parentNode.removeChild(entanglementCursorLine);
            entanglementCursorLine = null;
        }

        // Remove the mousemove listener
        const centerPanel = document.getElementById('center-panel');
        if (centerPanel && cursorLineHandler) {
            centerPanel.removeEventListener('mousemove', cursorLineHandler);
            cursorLineHandler = null;
        }
    }

    function updateEntanglementLines() {
        const svg = document.getElementById('entanglement-lines');
        if (!svg) return;

        const grid = document.getElementById('garden-grid');
        const section = document.getElementById('garden-section');

        // Position SVG to cover the grid
        svg.style.left = grid.offsetLeft + 'px';
        svg.style.top = grid.offsetTop + 'px';
        svg.setAttribute('width', grid.offsetWidth);
        svg.setAttribute('height', grid.offsetHeight);

        let svgContent = '';
        const plots = StateManager.get('garden.plots') || [];
        const drawnPairs = new Set();

        plots.forEach((plot, index) => {
            if (plot.entangledWith !== null && !drawnPairs.has(`${Math.min(index, plot.entangledWith)}-${Math.max(index, plot.entangledWith)}`)) {
                const plot1El = document.querySelector(`.garden-plot[data-index="${index}"]`);
                const plot2El = document.querySelector(`.garden-plot[data-index="${plot.entangledWith}"]`);

                if (plot1El && plot2El) {
                    // Use offsetLeft/offsetTop relative to grid (since grid is position:relative)
                    const x1 = plot1El.offsetLeft + plot1El.offsetWidth / 2;
                    const y1 = plot1El.offsetTop + plot1El.offsetHeight / 2;
                    const x2 = plot2El.offsetLeft + plot2El.offsetWidth / 2;
                    const y2 = plot2El.offsetTop + plot2El.offsetHeight / 2;

                    // Draw curved line between centers
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    // Perpendicular offset for curve
                    const curveFactor = 0.15;
                    const ctrlX = midX - dy * curveFactor;
                    const ctrlY = midY + dx * curveFactor;

                    svgContent += `<path class="entanglement-line" d="M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}" />`;

                    // Add pulsing particles at each end
                    svgContent += `<circle class="entanglement-particle" cx="${x1}" cy="${y1}" r="4">
                        <animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                    </circle>`;
                    svgContent += `<circle class="entanglement-particle" cx="${x2}" cy="${y2}" r="4">
                        <animate attributeName="r" values="3;6;3" dur="1s" repeatCount="indefinite" begin="0.5s" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" begin="0.5s" />
                    </circle>`;

                    drawnPairs.add(`${Math.min(index, plot.entangledWith)}-${Math.max(index, plot.entangledWith)}`);
                }
            }
        });

        svg.innerHTML = svgContent;
    }
    
    function updateGardenControls() {
        const container = document.getElementById('garden-controls');
        let html = '';
        
        // Auto-Harvest toggle
        if (UpgradeManager.isPurchased('autoHarvest')) {
            const enabled = StateManager.get('settings.autoHarvestEnabled');
            html += `
                <div class="auto-toggle ${enabled ? 'active' : ''}" id="toggle-autoharvest" title="Auto-harvest mature plants every 10s (H)">
                    <span class="toggle-indicator"></span>
                    <span>🤖 (H)arvest</span>
                    <div class="auto-progress-bar"><div class="auto-progress-fill" id="autoharvest-progress"></div></div>
                </div>
            `;
        }
        
        // Auto-Plant toggle
        if (UpgradeManager.isPurchased('autoPlant')) {
            const enabled = StateManager.get('settings.autoPlantEnabled');
            html += `
                <div class="auto-toggle ${enabled ? 'active' : ''}" id="toggle-autoplant" title="Auto-plant in empty plots every 5s (P)">
                    <span class="toggle-indicator"></span>
                    <span>🌱 (P)lant</span>
                    <div class="auto-progress-bar"><div class="auto-progress-fill" id="autoplant-progress"></div></div>
                </div>
            `;
        }
        
        // Entangle button
        if (GardenManager.isEntanglementUnlocked()) {
            const mode = GardenManager.getEntanglementMode();
            const threads = ResourceManager.get('entanglement');
            
            if (mode.active) {
                html += `<button class="header-btn" id="entangle-btn" style="background: var(--quantum-red); color: white;">❌ Cancel (E)</button>`;
            } else {
                const disabled = threads < 1 ? 'disabled' : '';
                html += `<button class="header-btn" id="entangle-btn" ${disabled}>🔗 (E)ntangle (${Math.floor(threads)})</button>`;
            }
        }
        
        container.innerHTML = html;
        
        // Attach event listeners
        const autoHarvestBtn = document.getElementById('toggle-autoharvest');
        if (autoHarvestBtn) {
            autoHarvestBtn.addEventListener('click', () => {
                const current = StateManager.get('settings.autoHarvestEnabled');
                StateManager.set('settings.autoHarvestEnabled', !current);
                updateGardenControls();
                addLogEntry(`Auto-harvest ${!current ? 'enabled' : 'disabled'}`, '');
            });
        }
        
        const autoPlantBtn = document.getElementById('toggle-autoplant');
        if (autoPlantBtn) {
            autoPlantBtn.addEventListener('click', () => {
                const current = StateManager.get('settings.autoPlantEnabled');
                StateManager.set('settings.autoPlantEnabled', !current);
                updateGardenControls();
                addLogEntry(`Auto-plant ${!current ? 'enabled' : 'disabled'}`, '');
            });
        }
        
        const entangleBtn = document.getElementById('entangle-btn');
        if (entangleBtn) {
            entangleBtn.addEventListener('click', toggleEntangleMode);
        }
    }
    
    // Keep old function name for compatibility
    function updateEntangleButton() {
        updateGardenControls();
    }
    
    function toggleEntangleMode() {
        const mode = GardenManager.getEntanglementMode();
        if (mode.active) {
            GardenManager.setEntanglementMode(false, null);
            removeCursorEntanglementLine();
            addLogEntry('Entanglement cancelled', '');
        } else {
            GardenManager.setEntanglementMode(true, null);
            addLogEntry('Select first plant to entangle...', 'highlight');
        }
        renderGarden();
    }
    
    function handlePlotClick(index) {
        const plot = GardenManager.getPlot(index);
        const entangleMode = GardenManager.getEntanglementMode();
        
        // Handle entanglement mode
        if (entangleMode.active) {
            if (entangleMode.source === null) {
                // Selecting first plant
                if (plot.plant && !plot.entangledWith) {
                    GardenManager.setEntanglementMode(true, index);
                    addLogEntry('Now select second plant to entangle with...', 'highlight');
                    addCursorEntanglementLine();
                    renderGarden();
                }
            } else if (entangleMode.source !== index) {
                // Selecting second plant
                if (plot.plant && !plot.entangledWith) {
                    if (GardenManager.entangle(entangleMode.source, index)) {
                        addLogEntry('🔗 Plants entangled! They now share fate.', 'success');
                        GardenManager.setEntanglementMode(false, null);
                        removeCursorEntanglementLine();
                        renderGarden();
                        renderResources();
                    } else {
                        addLogEntry('Cannot entangle these plants!', 'warning');
                    }
                }
            }
            return;
        }
        
        if (plot.plant && plot.progress >= 1) {
            // Harvest ready plant - get quantum yield
            const plantData = GameData.generators[plot.plant];
            const harvestResult = GardenManager.harvest(index);
            
            if (harvestResult && harvestResult.yield) {
                // Show floating harvest numbers for main plant
                ResourceGainTracker.showHarvestFloat(index, harvestResult.yield);
                
                // Format yield for log
                const yieldText = Object.entries(harvestResult.yield)
                    .map(([r, a]) => `${GameData.resources[r].icon}${a}`)
                    .join(' ');
                    
                addLogEntry(`Harvested ${plantData.name}: ${yieldText}`, 'success');
                
                // Log partner harvest if there was an entangled plant
                if (harvestResult.partnerYield && harvestResult.partnerPlant) {
                    // Show floating numbers for partner too
                    if (harvestResult.partnerId !== null && harvestResult.partnerId !== undefined) {
                        ResourceGainTracker.showHarvestFloat(harvestResult.partnerId, harvestResult.partnerYield);
                    }
                    
                    const partnerData = GameData.generators[harvestResult.partnerPlant];
                    const partnerYieldText = Object.entries(harvestResult.partnerYield)
                        .map(([r, a]) => `${GameData.resources[r].icon}${a}`)
                        .join(' ');
                    addLogEntry(`🔗 Entangled ${partnerData.name}: ${partnerYieldText}`, 'success');
                }
                
                renderGarden();
                renderResources();
            }
        } else if (plot.plant && plot.progress < 1) {
            // Click on growing plant - if auto-plant is unlocked, allow setting preference
            if (UpgradeManager.isPurchased('autoPlant')) {
                selectedPlotIndex = index;
                openPlantModal(true); // true = setting preference
            }
        } else if (!plot.plant) {
            // Open plant selector
            selectedPlotIndex = index;
            openPlantModal(false);
        }
    }
    
    function openPlantModal(settingPreference = false) {
        const modal = document.getElementById('plant-modal');
        const optionsContainer = document.getElementById('plant-options');
        const modalTitle = document.querySelector('#plant-modal-content h3');
        
        if (settingPreference) {
            modalTitle.textContent = '🔄 Set Auto-Plant Type';
        } else {
            modalTitle.textContent = '🌱 Select a Plant';
        }
        
        let html = '';
        const seeds = ResourceManager.get('seeds');
        const plot = GardenManager.getPlot(selectedPlotIndex);
        const currentPreference = plot?.autoPlantType || null;
        
        // Add clear option when setting preference
        if (settingPreference) {
            html += `
                <div class="plant-option clear-option" data-generator="__clear__" data-preference="true">
                    <div class="plant-option-icon">🚫</div>
                    <div class="plant-option-info">
                        <div class="plant-option-name">Clear Preference</div>
                        <div class="plant-option-desc">Use default auto-plant behavior for this plot</div>
                    </div>
                </div>
            `;
        }
        
        Object.entries(GameData.generators).forEach(([id, data]) => {
            if (!data.gardenPlantable) return;
            if (!GeneratorManager.isUnlocked(id)) return;
            
            const canPlant = settingPreference || seeds >= 1;
            const isCurrentPref = currentPreference === id;
            
            // Format harvest yield
            const yieldText = Object.entries(data.harvestYield).map(([r, a]) => 
                `${GameData.resources[r]?.icon || '?'}${a}`
            ).join(' ');
            
            html += `
                <div class="plant-option ${!canPlant ? 'locked' : ''} ${isCurrentPref ? 'selected' : ''}" 
                     data-generator="${id}" 
                     data-preference="${settingPreference}">
                    <div class="plant-option-icon">${data.icon}</div>
                    <div class="plant-option-info">
                        <div class="plant-option-name">${data.name} ${isCurrentPref ? '✓' : ''}</div>
                        <div class="plant-option-desc">${data.description}</div>
                        <div class="plant-option-cost">⏱️ ${Utils.formatTime(data.growthTime)} → ${yieldText}</div>
                    </div>
                </div>
            `;
        });
        
        if (!html) {
            html = '<p style="color: var(--text-secondary);">No plants available yet. Buy some generators first!</p>';
        }
        
        optionsContainer.innerHTML = html;
        // Note: Click handling via event delegation set up in setupEventListeners
        
        modal.classList.add('active');
    }
    
    function closePlantModal() {
        document.getElementById('plant-modal').classList.remove('active');
        selectedPlotIndex = null;
    }
    
    function getSelectedPlotIndex() {
        return selectedPlotIndex;
    }
    
    function renderGenerators() {
        const container = document.getElementById('generators-list');
        let html = '';
        
        Object.entries(GameData.generators).forEach(([id, data]) => {
            const isUnlocked = GeneratorManager.isUnlocked(id);
            if (!isUnlocked && !data.unlockAt) return;
            
            const owned = GeneratorManager.getOwned(id);
            const cost = GeneratorManager.getCost(id);
            const canAfford = ResourceManager.canAfford(cost);
            const production = GeneratorManager.getProduction(id);
            
            // Calculate max affordable
            const maxAffordable = GeneratorManager.getMaxAffordable(id);
            const cost10 = GeneratorManager.getCost(id, 10);
            const canAfford10 = ResourceManager.canAfford(cost10);
            
            let costText = Object.entries(cost).map(([r, a]) => 
                `${GameData.resources[r].icon} ${Utils.formatNumber(a)}`
            ).join(' ');
            
            let prodText = Object.entries(data.production).map(([r, a]) => 
                `+${Utils.formatNumber(a * (owned || 1), 2)} ${GameData.resources[r].icon}/s`
            ).join(', ');
            
            // Harvest yield info
            let harvestInfo = '';
            if (data.gardenPlantable && data.harvestYield) {
                const harvestText = Object.entries(data.harvestYield).map(([r, a]) => 
                    `${GameData.resources[r]?.icon || '?'}${a}`
                ).join(' ');
                harvestInfo = `<div class="generator-harvest">🌱 ${Utils.formatTime(data.growthTime)} → ${harvestText}</div>`;
            }
            
            html += `
                <div class="generator-item ${!isUnlocked ? 'locked' : ''}" data-generator-id="${id}">
                    <div class="generator-header">
                        <span class="generator-icon">${data.icon}</span>
                        <div class="generator-title">
                            <div class="generator-name">${data.name}</div>
                            <div class="generator-owned">${owned} owned</div>
                        </div>
                    </div>
                    <div class="generator-desc">${data.description}</div>
                    <div class="generator-stats">
                        <span>Produces: ${prodText}</span>
                    </div>
                    ${harvestInfo}
                    <div class="generator-buttons">
                        <button class="generator-buy-btn" 
                                data-generator="${id}" 
                                data-amount="1"
                                ${!isUnlocked || !canAfford ? 'disabled' : ''}>
                            ${isUnlocked ? `Buy 1 (${costText})` : 'Locked'}
                        </button>
                        <button class="generator-buy-btn small" 
                                data-generator="${id}" 
                                data-amount="10"
                                ${!isUnlocked || !canAfford10 ? 'disabled' : ''}>
                            ×10
                        </button>
                        <button class="generator-buy-btn max-btn" 
                                data-generator="${id}" 
                                data-amount="max"
                                ${!isUnlocked || maxAffordable === 0 ? 'disabled' : ''}>
                            Max${maxAffordable > 0 ? `<br>(${maxAffordable})` : ''}
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        // Note: No individual click listeners here - we use event delegation
    }
    
    function renderUpgrades() {
        const container = document.getElementById('upgrades-list');
        let html = '';
        
        Object.entries(GameData.upgrades).forEach(([id, data]) => {
            const isPurchased = UpgradeManager.isPurchased(id);
            const isUnlocked = UpgradeManager.isUnlocked(id);
            
            if (!isUnlocked && !isPurchased) return;
            
            const canBuy = UpgradeManager.canBuy(id);
            
            let costText = Object.entries(data.cost).map(([r, a]) => 
                `${GameData.resources[r].icon} ${Utils.formatNumber(a)}`
            ).join(' ');
            
            html += `
                <div class="upgrade-item ${isPurchased ? 'purchased' : ''} ${!isUnlocked ? 'locked' : ''}" 
                     data-upgrade="${id}">
                    <div class="upgrade-header">
                        <span class="upgrade-icon">${data.icon}</span>
                        <span class="upgrade-name">${data.name}</span>
                        <span class="upgrade-cost">${isPurchased ? '✓' : costText}</span>
                    </div>
                    <div class="upgrade-desc">${data.description}</div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p style="color: var(--text-secondary);">No upgrades available yet.</p>';
        // Note: No individual click listeners here - we use event delegation
    }
    
    function renderStats() {
        const container = document.getElementById('stats-content');
        const stats = StateManager.get('stats') || {};
        
        const playTime = ((Date.now() - (stats.startDate || Date.now())) / 1000);
        
        // Get achievements
        const achievements = AchievementManager.getAll();
        const unlockedAchievements = achievements.filter(a => a.unlocked);
        const lockedAchievements = achievements.filter(a => !a.unlocked && !a.secret);
        
        // Check prestige status
        const prestigeUnlocked = PrestigeManager.isUnlocked();
        const realityLevel = PrestigeManager.getRealityLevel();
        const fragments = ResourceManager.get('fragments') || 0;
        const fragmentsOnCollapse = PrestigeManager.getFragmentsOnCollapse();
        const canCollapse = PrestigeManager.canCollapse();
        const productionBonus = PrestigeManager.getProductionMultiplier();
        const totalEnergy = StateManager.get('resources.energy.total') || 0;
        
        // Calculate next fragment threshold
        const FRAGMENT_BASE = 1000000;
        let nextThresholdText = '';
        if (totalEnergy < FRAGMENT_BASE) {
            nextThresholdText = `First fragment at ${Utils.formatNumber(FRAGMENT_BASE)} total energy`;
        } else {
            // Current fragments from formula (without first-time bonus)
            const currentFromFormula = Math.floor(Math.log10(totalEnergy / FRAGMENT_BASE) * 3) + 1;
            // Next threshold
            const nextThreshold = Math.pow(10, currentFromFormula / 3) * FRAGMENT_BASE;
            if (totalEnergy < nextThreshold) {
                const progress = ((totalEnergy - (Math.pow(10, (currentFromFormula - 1) / 3) * FRAGMENT_BASE)) / 
                                 (nextThreshold - Math.pow(10, (currentFromFormula - 1) / 3) * FRAGMENT_BASE) * 100).toFixed(0);
                nextThresholdText = `Next: ${Utils.formatNumber(nextThreshold)} (${progress}%)`;
            } else {
                nextThresholdText = `Keep earning for more fragments!`;
            }
        }
        
        // Build prestige section HTML
        let prestigeHtml = '';
        if (prestigeUnlocked) {
            const needsRealityAwareness = !UpgradeManager.isPurchased('realityAwareness');
            const totalEnergy = StateManager.get('resources.energy.total') || 0;
            const needsMoreEnergy = !needsRealityAwareness && fragmentsOnCollapse === 0;
            
            // Determine the warning/info text
            let warningText;
            if (needsRealityAwareness) {
                warningText = '🔮 Purchase Reality Awareness upgrade to unlock collapse';
            } else if (needsMoreEnergy) {
                warningText = '⏳ Accumulate 1M+ total energy to earn fragments';
            } else if (canCollapse) {
                warningText = '⚠️ Resets progress but keeps fragments, achievements & persistent upgrades';
            } else {
                warningText = '💠 Ready to transcend when you are';
            }
            
            prestigeHtml = `
                <div class="prestige-section">
                    <h4>💠 Reality Collapse</h4>
                    <div class="prestige-info">
                        <div class="prestige-stat">
                            <span class="label">Reality Level</span>
                            <span class="value">${realityLevel}</span>
                        </div>
                        <div class="prestige-stat">
                            <span class="label">Reality Fragments</span>
                            <span class="value">${Utils.formatNumber(fragments)}</span>
                        </div>
                        ${productionBonus > 1 ? `
                            <div class="prestige-stat">
                                <span class="label">Production Bonus</span>
                                <span class="value highlight">+${Math.round((productionBonus - 1) * 100)}%</span>
                            </div>
                        ` : ''}
                        <div class="prestige-stat">
                            <span class="label">Fragments on Collapse</span>
                            <span class="value ${fragmentsOnCollapse > 0 ? 'highlight' : ''}">${fragmentsOnCollapse > 0 ? '+' + fragmentsOnCollapse : (needsRealityAwareness ? 'Locked' : '0')}</span>
                        </div>
                        <div class="prestige-stat">
                            <span class="label">Progress</span>
                            <span class="value" style="font-size: 0.75rem; color: var(--text-dim);">${nextThresholdText}</span>
                        </div>
                    </div>
                    <button class="collapse-btn" id="collapse-reality-btn" ${!canCollapse ? 'disabled' : ''}>
                        🌌 Collapse Reality
                    </button>
                    <p class="collapse-warning">
                        ${warningText}
                    </p>
                </div>
            `;
        }
        
        container.innerHTML = `
            ${prestigeHtml}
            <div class="stat-group">
                <h4>🏆 Achievements (${unlockedAchievements.length}/${achievements.length})</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                    ${unlockedAchievements.map(a => `
                        <div class="achievement-badge unlocked" title="${a.name}: ${a.description}">
                            ${a.icon}
                        </div>
                    `).join('')}
                    ${lockedAchievements.map(a => `
                        <div class="achievement-badge locked" title="???">
                            ❜
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="stat-group">
                <h4>General</h4>
                <div class="stat-row">
                    <span class="stat-label">Total Clicks</span>
                    <span class="stat-value">${Utils.formatNumber(stats.totalClicks || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Plants Harvested</span>
                    <span class="stat-value">${Utils.formatNumber(stats.totalPlantsHarvested || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Quantum Events</span>
                    <span class="stat-value">${Utils.formatNumber(stats.quantumEventsWitnessed || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Quantum Bursts</span>
                    <span class="stat-value">${Utils.formatNumber(stats.quantumBursts || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Plants Entangled</span>
                    <span class="stat-value">${Utils.formatNumber(stats.plantsEntangled || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Mutations Witnessed</span>
                    <span class="stat-value">${Utils.formatNumber(stats.mutationsWitnessed || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Play Time</span>
                    <span class="stat-value">${Utils.formatTime(playTime)}</span>
                </div>
            </div>
            <div class="stat-group">
                <h4>Resources Earned (All Time)</h4>
                ${Object.entries(GameData.resources).map(([id, data]) => {
                    if (!ResourceManager.isUnlocked(id)) return '';
                    const total = StateManager.get(`resources.${id}.total`) || 0;
                    return `
                        <div class="stat-row">
                            <span class="stat-label">${data.icon} ${data.name}</span>
                            <span class="stat-value">${Utils.formatNumber(total)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="stat-group">
                <h4>Generators Owned</h4>
                ${Object.entries(GameData.generators).map(([id, data]) => {
                    const owned = GeneratorManager.getOwned(id);
                    if (owned === 0) return '';
                    return `
                        <div class="stat-row">
                            <span class="stat-label">${data.icon} ${data.name}</span>
                            <span class="stat-value">${owned}</span>
                        </div>
                    `;
                }).join('') || '<p style="color: var(--text-dim);">None yet</p>'}
            </div>
        `;
    }
    
    function updateClickPowerDisplay() {
        const power = UpgradeManager.getClickPower();
        const coherence = ResourceManager.get('coherence') || 0;
        const coherenceBonus = 1 + (coherence / 100) * 0.5;
        const actualPower = power * coherenceBonus;
        
        const display = document.getElementById('click-power-value');
        display.textContent = Utils.formatNumber(actualPower, 1);
        
        // Show click rate (energy/s from clicking)
        const clickRate = getClickRate();
        const rateDisplay = document.getElementById('click-rate-value');
        if (clickRate > 0) {
            const energyFromClicks = actualPower * clickRate;
            rateDisplay.textContent = `+${Utils.formatNumber(energyFromClicks)}/s from clicks`;
            rateDisplay.style.color = clickRate >= 5 ? 'var(--quantum-cyan)' : 'var(--quantum-green)';
        } else {
            rateDisplay.textContent = '';
        }
        
        // Color based on coherence bonus
        if (coherenceBonus >= 1.4) {
            display.style.color = 'var(--quantum-cyan)';
        } else if (coherenceBonus >= 1.2) {
            display.style.color = 'var(--quantum-green)';
        } else if (coherenceBonus < 1.1) {
            display.style.color = 'var(--quantum-red)';
        } else {
            display.style.color = '';
        }
    }
    
    function updateGardenProgress() {
        // Update progress bars and timers in-place without re-rendering
        const plots = StateManager.get('garden.plots') || [];
        const growthMult = UpgradeManager.getGrowthMultiplier();
        
        plots.forEach((plot, index) => {
            const plotEl = document.querySelector(`.garden-plot[data-index="${index}"]`);
            if (!plotEl) return;
            
            if (plot.plant) {
                const data = GameData.generators[plot.plant];
                const progressBar = plotEl.querySelector('.plot-progress');
                const timer = plotEl.querySelector('.plot-timer');
                
                if (plot.progress >= 1) {
                    // Plant is ready - update class if needed
                    if (!plotEl.classList.contains('ready')) {
                        plotEl.classList.remove('planted');
                        plotEl.classList.add('ready');
                        if (progressBar) progressBar.remove();
                        if (timer) timer.remove();
                    }
                } else {
                    // Update progress bar and timer
                    if (progressBar) {
                        progressBar.style.width = (plot.progress * 100) + '%';
                    }
                    if (timer) {
                        const remainingTime = data.growthTime * (1 - plot.progress) / growthMult;
                        timer.textContent = Utils.formatTime(remainingTime);
                    }
                }
            }
        });
        
        // Update plot counter
        const used = plots.filter(p => p.plant).length;
        document.getElementById('plots-used').textContent = used;
    }
    
    function updateAutoProgress() {
        // Update auto-harvest and auto-plant progress bars
        const timers = GardenManager.getAutoTimerProgress();
        
        const harvestBar = document.getElementById('autoharvest-progress');
        if (harvestBar) {
            if (timers.harvest.enabled) {
                harvestBar.style.width = (timers.harvest.progress * 100) + '%';
            } else {
                harvestBar.style.width = '0%';
            }
        }
        
        const plantBar = document.getElementById('autoplant-progress');
        if (plantBar) {
            if (timers.plant.enabled) {
                plantBar.style.width = (timers.plant.progress * 100) + '%';
            } else {
                plantBar.style.width = '0%';
            }
        }
    }
    
    function updateBuyButtons() {
        // Update generator buy buttons
        document.querySelectorAll('.generator-buy-btn').forEach(btn => {
            const id = btn.dataset.generator;
            const amount = btn.dataset.amount;
            if (!id) return;
            
            const isUnlocked = GeneratorManager.isUnlocked(id);
            
            if (amount === '1') {
                // Buy 1 button - show cost
                const cost = GeneratorManager.getCost(id, 1);
                const canAfford = ResourceManager.canAfford(cost);
                btn.disabled = !isUnlocked || !canAfford;
                
                if (isUnlocked) {
                    let costText = Object.entries(cost).map(([r, a]) => 
                        `${GameData.resources[r].icon} ${Utils.formatNumber(a)}`
                    ).join(' ');
                    btn.textContent = `Buy 1 (${costText})`;
                }
            } else if (amount === '10') {
                // Buy 10 button
                const cost10 = GeneratorManager.getCost(id, 10);
                const canAfford10 = ResourceManager.canAfford(cost10);
                btn.disabled = !isUnlocked || !canAfford10;
                btn.textContent = '×10';
            } else if (amount === 'max') {
                // Buy Max button
                const maxAffordable = GeneratorManager.getMaxAffordable(id);
                btn.disabled = !isUnlocked || maxAffordable === 0;
                btn.innerHTML = maxAffordable > 0 ? `Max<br>(${maxAffordable})` : 'Max';
            }
        });
        
        // Update upgrade items
        document.querySelectorAll('.upgrade-item:not(.purchased)').forEach(item => {
            const id = item.dataset.upgrade;
            if (!id) return;
            
            const canBuy = UpgradeManager.canBuy(id);
            const isUnlocked = UpgradeManager.isUnlocked(id);
            
            item.classList.toggle('locked', !isUnlocked);
            
            // Visual feedback for affordability
            if (isUnlocked && canBuy) {
                item.style.borderColor = 'var(--quantum-gold)';
            } else if (isUnlocked) {
                item.style.borderColor = 'var(--border-dim)';
            }
        });
        
        // Update coherence bar
        updateCoherenceBar();
    }
    
    function updateCoherenceBar() {
        const container = document.getElementById('coherence-bar-container');
        const fill = document.getElementById('coherence-fill');
        const value = document.getElementById('coherence-value');
        const quantumCore = document.getElementById('quantum-core');
        const efficiencyValue = document.getElementById('efficiency-value');
        
        if (ResourceManager.isUnlocked('coherence')) {
            container.classList.remove('hidden');
            const coherence = ResourceManager.get('coherence');
            fill.style.width = coherence + '%';
            value.textContent = Math.floor(coherence) + '%';
            
            // Calculate and display production efficiency
            const efficiency = Math.round((0.3 + (coherence / 100) * 0.7) * 100);
            efficiencyValue.textContent = efficiency + '%';
            
            // Color the efficiency value
            efficiencyValue.classList.remove('high', 'medium', 'low');
            if (efficiency >= 90) {
                efficiencyValue.classList.add('high');
            } else if (efficiency >= 75) {
                efficiencyValue.classList.add('medium');
            } else {
                efficiencyValue.classList.add('low');
            }
            
            // Color changes based on level
            if (coherence > 50) {
                fill.style.background = 'linear-gradient(90deg, var(--quantum-green), var(--quantum-cyan))';
            } else if (coherence > 25) {
                fill.style.background = 'linear-gradient(90deg, var(--quantum-gold), var(--quantum-green))';
            } else {
                fill.style.background = 'linear-gradient(90deg, var(--quantum-red), var(--quantum-gold))';
            }
            
            // Pulse quantum core when coherence is low (encourage clicking!)
            if (coherence < 30) {
                quantumCore.classList.add('low-coherence');
            } else {
                quantumCore.classList.remove('low-coherence');
            }
        } else {
            container.classList.add('hidden');
            quantumCore.classList.remove('low-coherence');
        }
    }
    
    function addLogEntry(message, type = '') {
        const container = document.getElementById('log-container');
        const entry = document.createElement('div');
        entry.className = 'log-entry' + (type ? ' ' + type : '');
        entry.textContent = message;
        
        container.insertBefore(entry, container.firstChild);
        
        // Keep only last 20 entries
        while (container.children.length > 20) {
            container.removeChild(container.lastChild);
        }
    }
    
    function showNotification(title, message = '', type = '') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = 'notification' + (type ? ' ' + type : '');
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            ${message ? `<div class="notification-message">${message}</div>` : ''}
        `;
        
        container.appendChild(notification);
        
        // Store timeout so we can pause on hover
        let dismissTimeout;
        
        function startDismissTimer(delay = 3000) {
            dismissTimeout = setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100px)';
                setTimeout(() => notification.remove(), 300);
            }, delay);
        }
        
        // Pause dismiss on hover
        notification.addEventListener('mouseenter', () => {
            clearTimeout(dismissTimeout);
        });
        
        // Resume dismiss on mouse leave (shorter delay)
        notification.addEventListener('mouseleave', () => {
            startDismissTimer(1500);
        });
        
        // Start initial timer
        startDismissTimer();
    }
    
    function updateNextUnlock() {
        const container = document.getElementById('next-unlock-indicator');
        const nameEl = document.getElementById('next-unlock-name');
        const fillEl = document.getElementById('next-unlock-fill');
        const percentEl = document.getElementById('next-unlock-percent');
        
        if (!container || !nameEl || !fillEl || !percentEl) return;
        
        // Find the next unlock (prioritize upgrades, then generators)
        let bestUnlock = null;
        let bestProgress = -1;
        
        // Check unlockable upgrades
        Object.entries(GameData.upgrades).forEach(([id, data]) => {
            if (UpgradeManager.isPurchased(id)) return;
            if (data.unlocked || UpgradeManager.isUnlocked(id)) {
                // Already unlocked but not purchased - show cost progress
                const cost = Object.entries(data.cost)[0];
                if (cost) {
                    const [resource, amount] = cost;
                    const current = ResourceManager.get(resource);
                    const progress = Math.min(1, current / amount);
                    if (progress > bestProgress && progress < 1) {
                        bestProgress = progress;
                        bestUnlock = {
                            name: data.name,
                            icon: data.icon,
                            target: amount,
                            current: current,
                            resourceName: GameData.resources[resource]?.name || resource,
                            resourceIcon: GameData.resources[resource]?.icon || '⚡',
                            type: 'purchase'
                        };
                    }
                }
            } else if (data.unlockAt) {
                // Check unlock progress
                const current = StateManager.get(`resources.${data.unlockAt.resource}.total`) || 0;
                const progress = Math.min(1, current / data.unlockAt.amount);
                if (progress > bestProgress && progress < 1) {
                    bestProgress = progress;
                    bestUnlock = {
                        name: data.name,
                        icon: data.icon,
                        target: data.unlockAt.amount,
                        current: current,
                        resourceName: GameData.resources[data.unlockAt.resource]?.name || data.unlockAt.resource,
                        resourceIcon: GameData.resources[data.unlockAt.resource]?.icon || '⚡',
                        type: 'unlock'
                    };
                }
            }
        });
        
        // Check unlockable generators
        Object.entries(GameData.generators).forEach(([id, data]) => {
            if (data.unlocked) return;
            if (data.unlockAt) {
                const current = StateManager.get(`resources.${data.unlockAt.resource}.total`) || 0;
                const progress = Math.min(1, current / data.unlockAt.amount);
                if (progress > bestProgress && progress < 1) {
                    bestProgress = progress;
                    bestUnlock = {
                        name: data.name,
                        icon: data.icon,
                        target: data.unlockAt.amount,
                        current: current,
                        resourceName: GameData.resources[data.unlockAt.resource]?.name || data.unlockAt.resource,
                        resourceIcon: GameData.resources[data.unlockAt.resource]?.icon || '⚡',
                        type: 'unlock'
                    };
                }
            }
        });
        
        if (bestUnlock) {
            container.classList.remove('hidden');
            const percent = Math.floor(bestProgress * 100);
            const verb = bestUnlock.type === 'purchase' ? 'Buy' : 'Unlock';
            nameEl.innerHTML = `${bestUnlock.icon} ${bestUnlock.name}`;
            fillEl.style.width = percent + '%';
            percentEl.textContent = percent + '%';
            
            // Add pulse animation when close to unlock
            if (percent >= 80) {
                container.classList.add('near-unlock');
            } else {
                container.classList.remove('near-unlock');
            }
        } else {
            // No more unlocks to show - hide or show completion message
            const totalUnlocks = Object.keys(GameData.upgrades).length + Object.keys(GameData.generators).length;
            const purchased = Object.keys(GameData.upgrades).filter(id => UpgradeManager.isPurchased(id)).length;
            const unlocked = Object.keys(GameData.generators).filter(id => GameData.generators[id].unlocked).length;
            
            if (purchased + unlocked >= totalUnlocks) {
                container.classList.add('hidden');
            } else {
                // There's something but we can't reach it yet
                nameEl.innerHTML = '🔮 Keep exploring...';
                fillEl.style.width = '100%';
                percentEl.textContent = '??';
                container.classList.remove('near-unlock');
            }
        }
    }
    
    return {
        initialize,
        renderAll,
        renderResources,
        renderGarden,
        renderGenerators,
        renderUpgrades,
        renderStats,
        updateGardenProgress,
        updateBuyButtons,
        updateClickPowerDisplay,
        updateCoherenceBar,
        updateNextUnlock,
        updateSinglePlot,
        updateEntanglementLines,
        updateAutoProgress,
        addLogEntry,
        showNotification,
        getSelectedPlotIndex
    };
})();

// ============================================
