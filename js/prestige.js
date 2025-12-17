// MODULE: Prestige System - Reality Collapse
// ============================================
const PrestigeManager = (() => {
    const FRAGMENT_BASE = 1000000; // 1M energy = 1 fragment base
    
    function isUnlocked() {
        // Prestige UI is unlocked if:
        // 1. Player has bought realityAwareness upgrade
        // 2. OR player has fragments (has collapsed before)
        // 3. OR player has reality level > 0 (has collapsed before)
        // 4. OR player has 500k+ total energy (show progress toward 1M)
        const totalEnergy = StateManager.get('resources.energy.total') || 0;
        return UpgradeManager.isPurchased('realityAwareness') ||
               (ResourceManager.get('fragments') || 0) > 0 ||
               (StateManager.get('stats.realityLevel') || 0) > 0 ||
               totalEnergy >= 500000;
    }
    
    function getFragmentsOnCollapse() {
        // Need realityAwareness purchased to actually collapse
        if (!UpgradeManager.isPurchased('realityAwareness')) return 0;
        
        const totalEnergy = StateManager.get('resources.energy.total') || 0;
        // Logarithmic scaling: more energy = more fragments, but diminishing
        // 1M = 1, 10M = ~3, 100M = ~7, 1B = ~10
        if (totalEnergy < FRAGMENT_BASE) return 0;
        
        const baseFragments = Math.floor(Math.log10(totalEnergy / FRAGMENT_BASE) * 3) + 1;
        
        // Bonus for first collapse per reality level
        const realityLevel = StateManager.get('stats.realityLevel') || 0;
        const newPlayerBonus = realityLevel === 0 ? 2 : 0;
        
        return baseFragments + newPlayerBonus;
    }
    
    function canCollapse() {
        return isUnlocked() && getFragmentsOnCollapse() > 0;
    }
    
    function collapse() {
        if (!canCollapse()) return false;
        
        const fragmentsGained = getFragmentsOnCollapse();
        const currentFragments = ResourceManager.get('fragments') || 0;
        
        // Save persistent upgrades
        const persistentUpgrades = [];
        Object.entries(GameData.upgrades).forEach(([id, data]) => {
            if (data.persistent && UpgradeManager.isPurchased(id)) {
                persistentUpgrades.push(id);
            }
        });
        
        // Calculate retained resources from persistent upgrades
        let retainedTime = 0;
        if (UpgradeManager.isPurchased('fragmentBoost3')) {
            retainedTime = Math.floor(ResourceManager.get('time') * 0.1);
        }
        
        // Save stats that persist
        const currentLevel = StateManager.get('stats.realityLevel') || 0;
        const totalCollapses = StateManager.get('stats.totalCollapses') || 0;
        const achievements = StateManager.get('achievements');
        const playTime = StateManager.get('stats.playTime');
        const lastCollapsePlayTime = StateManager.get('stats.lastCollapsePlayTime') || 0;
        
        // Check if this is a fast collapse (within 30 minutes of the last collapse)
        const timeSinceLastCollapse = playTime - lastCollapsePlayTime;
        const isFastCollapse = totalCollapses > 0 && timeSinceLastCollapse < 1800; // 30 minutes
        
        // Grant fragments BEFORE reset
        const newFragmentTotal = currentFragments + fragmentsGained;
        
        // Perform the collapse!
        window.quantumGardenResetting = true;
        
        // Reset state but keep certain things
        const newState = Utils.deepClone(GameData.initialState);
        
        // Restore persistent data
        newState.resources.fragments = { amount: newFragmentTotal, total: newFragmentTotal, rate: 0 };
        newState.stats.realityLevel = currentLevel + 1;
        newState.stats.totalCollapses = totalCollapses + 1;
        newState.stats.playTime = playTime;
        newState.stats.lastCollapsePlayTime = playTime; // Track when this collapse happened
        newState.stats.fastCollapse = isFastCollapse || StateManager.get('stats.fastCollapse'); // Keep if achieved
        newState.achievements = achievements;
        
        // Restore persistent upgrades
        persistentUpgrades.forEach(id => {
            newState.upgrades[id] = { purchased: true };
        });
        
        // Apply starting bonuses from persistent upgrades
        if (persistentUpgrades.includes('fragmentBoost2')) {
            newState.resources.energy.amount = 100;
            newState.resources.seeds.amount = 10;
            newState.resources.seeds.unlocked = true;
        }
        
        if (retainedTime > 0) {
            newState.resources.time.amount = retainedTime;
            newState.resources.time.unlocked = retainedTime > 0;
        }
        
        // Initialize generators and other upgrades
        Object.keys(GameData.generators).forEach(id => {
            newState.generators[id] = { owned: 0 };
        });
        Object.keys(GameData.upgrades).forEach(id => {
            if (!newState.upgrades[id]) {
                newState.upgrades[id] = { purchased: false };
            }
        });
        Object.keys(GameData.achievements).forEach(id => {
            if (!newState.achievements[id]) {
                newState.achievements[id] = false;
            }
        });
        
        // Initialize garden
        for (let i = 0; i < newState.garden.size; i++) {
            newState.garden.plots.push({ plant: null, progress: 0, plantedAt: null });
        }
        
        // Apply the new state
        StateManager.setState(newState);
        StateManager.save();
        
        window.quantumGardenResetting = false;
        
        // Refresh UI
        UI.renderAll();
        
        // Log the collapse
        UI.addLogEntry(`💠 Reality Collapsed! Gained ${fragmentsGained} Reality Fragments.`, 'highlight');
        UI.addLogEntry(`🔮 Welcome to Reality Level ${currentLevel + 1}`, 'highlight');
        
        return true;
    }
    
    function getProductionMultiplier() {
        // Each fragment gives bonus production if fragmentBoost1 is purchased
        if (!UpgradeManager.isPurchased('fragmentBoost1')) return 1;
        
        const fragments = ResourceManager.get('fragments') || 0;
        return 1 + (fragments * 0.05); // 5% per fragment
    }
    
    function getRealityLevel() {
        return StateManager.get('stats.realityLevel') || 0;
    }
    
    return {
        isUnlocked,
        getFragmentsOnCollapse,
        canCollapse,
        collapse,
        getProductionMultiplier,
        getRealityLevel
    };
})();

// ============================================
