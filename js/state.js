// MODULE: Game State Manager
// ============================================
const StateManager = (() => {
    let state = null;
    const events = Utils.createEventEmitter();
    
    function initialize() {
        // Try to load saved game
        const saved = localStorage.getItem('quantumGarden_save');
        if (saved) {
            try {
                state = JSON.parse(saved);
                // Migrate if needed
                migrateState();
                events.emit('loaded', state);
                return true;
            } catch (e) {
                console.error('Failed to load save:', e);
            }
        }
        
        // Create new game
        state = Utils.deepClone(GameData.initialState);
        
        // Initialize generators owned count
        Object.keys(GameData.generators).forEach(id => {
            state.generators[id] = { owned: 0 };
        });
        
        // Initialize upgrades purchased state
        Object.keys(GameData.upgrades).forEach(id => {
            state.upgrades[id] = { purchased: false };
        });
        
        // Initialize achievements
        Object.keys(GameData.achievements).forEach(id => {
            state.achievements[id] = false;
        });
        
        // Initialize garden plots
        for (let i = 0; i < state.garden.size; i++) {
            state.garden.plots.push({ plant: null, progress: 0, plantedAt: null, entangledWith: [], autoPlantType: null, mutation: null });
        }
        
        // Set initial coherence
        state.resources.coherence = { amount: 100, total: 100, rate: 0 };
        
        events.emit('initialized', state);
        return false;
    }
    
    function migrateState() {
        // Handle version migrations here
        const currentVersion = '1.0.0';
        if (!state.meta) state.meta = { version: currentVersion };
        
        // Ensure all expected properties exist
        if (!state.settings) state.settings = GameData.initialState.settings;
        if (!state.stats) state.stats = Utils.deepClone(GameData.initialState.stats);
        if (!state.achievements) state.achievements = {};
        
        // Ensure core stats exist (even if stats object exists but is incomplete)
        if (state.stats.totalClicks === undefined) state.stats.totalClicks = 0;
        if (state.stats.totalPlantsHarvested === undefined) state.stats.totalPlantsHarvested = 0;
        if (state.stats.quantumEventsWitnessed === undefined) state.stats.quantumEventsWitnessed = 0;
        if (state.stats.startDate === undefined) state.stats.startDate = Date.now();
        if (state.stats.playTime === undefined) state.stats.playTime = 0;
        
        // Ensure new settings exist for existing saves
        if (state.settings.autoHarvestEnabled === undefined) {
            state.settings.autoHarvestEnabled = true;
        }
        if (state.settings.autoPlantEnabled === undefined) {
            state.settings.autoPlantEnabled = true;
        }
        
        // Ensure new resources exist
        if (!state.resources.coherence) {
            state.resources.coherence = { amount: 100, total: 100, rate: 0 };
        }
        if (!state.resources.entanglement) {
            state.resources.entanglement = { amount: 0, total: 0, rate: 0 };
        }
        if (!state.resources.fragments) {
            state.resources.fragments = { amount: 0, total: 0, rate: 0 };
        }
        
        // Ensure new stats exist
        if (!state.stats.quantumBursts) state.stats.quantumBursts = 0;
        if (!state.stats.plantsEntangled) state.stats.plantsEntangled = 0;
        if (!state.stats.highCoherenceTime) state.stats.highCoherenceTime = 0;
        if (!state.stats.clicksWithManyGens) state.stats.clicksWithManyGens = 0;
        if (!state.stats.mutationsWitnessed) state.stats.mutationsWitnessed = 0;

        // Migrate old single entanglement to array format
        const plots = state.garden?.plots || [];
        plots.forEach((plot, index) => {
            if (plot.entangledWith !== null && !Array.isArray(plot.entangledWith)) {
                state.garden.plots[index].entangledWith = [plot.entangledWith];
            } else if (plot.entangledWith === null) {
                state.garden.plots[index].entangledWith = [];
            }
        });
    }
    
    function calculateOfflineProgress() {
        if (!state.meta.lastSave) return null;
        
        const now = Date.now();
        const lastSave = state.meta.lastSave;
        const offlineSeconds = Math.min((now - lastSave) / 1000, 86400); // Cap at 24 hours
        
        if (offlineSeconds < 60) return null; // Less than 1 minute, don't bother
        
        const gains = {};
        let totalEnergyGained = 0;
        
        // Calculate generator production
        Object.keys(GameData.generators).forEach(id => {
            const owned = state.generators[id]?.owned || 0;
            if (owned === 0) return;
            
            const data = GameData.generators[id];
            for (const [resource, baseRate] of Object.entries(data.production)) {
                let rate = baseRate * owned;
                
                // Apply upgrade boosts (simplified - use base rate since we can't compute dynamic coherence)
                if (state.upgrades.quantumResonance?.purchased) {
                    rate *= 1.5;
                }
                
                // Offline penalty - only 50% efficiency
                rate *= 0.5;
                
                const gain = rate * offlineSeconds;
                if (!gains[resource]) gains[resource] = 0;
                gains[resource] += gain;
                
                if (resource === 'energy') totalEnergyGained += gain;
            }
        });
        
        // Apply gains
        for (const [resource, amount] of Object.entries(gains)) {
            if (state.resources[resource]) {
                state.resources[resource].amount += amount;
                state.resources[resource].total += amount;
            }
        }
        
        // Update play time
        state.stats.playTime += offlineSeconds;
        
        return {
            seconds: offlineSeconds,
            gains: gains,
            formattedTime: Utils.formatTime(offlineSeconds)
        };
    }
    
    function get(path) {
        if (!path) return state;
        const parts = path.split('.');
        let current = state;
        for (const part of parts) {
            if (current === undefined) return undefined;
            current = current[part];
        }
        return current;
    }
    
    function set(path, value) {
        const parts = path.split('.');
        let current = state;
        for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] === undefined) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        events.emit('changed', { path, value });
    }
    
    function save() {
        state.meta.lastSave = Date.now();
        localStorage.setItem('quantumGarden_save', JSON.stringify(state));
        events.emit('saved');
        return true;
    }
    
    let isResetting = false;
    
    function reset() {
        isResetting = true;
        localStorage.removeItem('quantumGarden_save');
        initialize();
        events.emit('reset');
    }
    
    function canSave() {
        return !isResetting;
    }
    
    function exportSave() {
        return btoa(JSON.stringify(state));
    }
    
    function importSave(data) {
        try {
            state = JSON.parse(atob(data));
            migrateState();
            save();
            events.emit('imported', state);
            return true;
        } catch (e) {
            console.error('Failed to import save:', e);
            return false;
        }
    }
    
    function setState(newState) {
        state = newState;
        events.emit('stateChanged', state);
    }
    
    return {
        initialize,
        get,
        set,
        setState,
        save,
        reset,
        canSave,
        exportSave,
        importSave,
        calculateOfflineProgress,
        on: events.on,
        off: events.off,
        emit: events.emit
    };
})();

