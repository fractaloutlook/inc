// MODULE: Tips Manager - Context-Sensitive Guidance
// ============================================
const TipsManager = (() => {
    const shownTips = new Set();
    let tipCooldown = 0;
    const TIP_COOLDOWN = 30; // seconds between tips
    
    const tips = {
        // Early game tips
        firstEnergy: {
            condition: () => ResourceManager.get('energy') >= 10 && ResourceManager.get('energy') < 30,
            message: '💡 Keep clicking! At 30 energy you can buy Seed Synthesis.',
            priority: 10,
            once: true
        },
        buySeedProduction: {
            condition: () => ResourceManager.get('energy') >= 30 && !UpgradeManager.isPurchased('seedProduction'),
            message: '💡 You have enough energy! Check the Upgrades tab for Seed Synthesis.',
            priority: 9,
            once: true
        },
        gotSeeds: {
            condition: () => ResourceManager.get('seeds') > 0 && StateManager.get('stats.totalPlantsHarvested') === 0,
            message: '💡 You have seeds! Click an empty plot (+) in the garden to plant.',
            priority: 8,
            once: true
        },
        firstPlant: {
            condition: () => {
                const plots = StateManager.get('garden.plots') || [];
                return plots.some(p => p.plant) && StateManager.get('stats.totalPlantsHarvested') === 0;
            },
            message: '💡 Great! Watch your plant grow. Hover over it to speed up growth!',
            priority: 7,
            once: true
        },
        firstHarvestReady: {
            condition: () => {
                const plots = StateManager.get('garden.plots') || [];
                return plots.some(p => p.growth >= 100 && p.plant !== null);
            },
            message: '💡 Your plant is ready! Click it to harvest for resources and more seeds.',
            priority: 6,
            once: true
        },
        
        // Mid-game tips
        buyFirstGenerator: {
            condition: () => ResourceManager.get('energy') >= 15 && GeneratorManager.getOwned('quantumLily') === 0,
            message: '💡 You can buy a Quantum Lily in the Plants tab for passive energy!',
            priority: 5,
            once: true
        },
        coherenceIntro: {
            condition: () => {
                const generators = Object.keys(GameData.generators).reduce((sum, id) => 
                    sum + GeneratorManager.getOwned(id), 0);
                return generators >= 3 && !shownTips.has('coherenceIntro');
            },
            message: '💡 Notice the Coherence bar? Clicking maintains it. Low coherence = lower production.',
            priority: 4,
            once: true
        },
        entanglementIntro: {
            condition: () => UpgradeManager.isPurchased('entanglementBasics') && StateManager.get('stats.plantsEntangled') === 0,
            message: '💡 Try the Entangle button! Link two plants for bonus yields.',
            priority: 4,
            once: true
        },
        
        // Recurring tips
        lowCoherence: {
            condition: () => ResourceManager.get('coherence') < 20,
            message: '⚠️ Low coherence! Click the Quantum Core to restore it.',
            priority: 3,
            once: false
        },
        unlockAvailable: {
            condition: () => {
                return Object.entries(GameData.upgrades).some(([id, data]) => {
                    return UpgradeManager.isUnlocked(id) && !UpgradeManager.isPurchased(id) && UpgradeManager.canBuy(id);
                });
            },
            message: '✨ An upgrade is available! Check the Upgrades tab.',
            priority: 2,
            once: false
        }
    };
    
    function update(deltaTime) {
        if (tipCooldown > 0) {
            tipCooldown -= deltaTime;
            return;
        }
        
        // Find highest priority tip that should be shown
        let bestTip = null;
        let bestPriority = -1;
        
        for (const [id, tip] of Object.entries(tips)) {
            if (tip.once && shownTips.has(id)) continue;
            if (!tip.condition()) continue;
            
            if (tip.priority > bestPriority) {
                bestPriority = tip.priority;
                bestTip = { id, ...tip };
            }
        }
        
        if (bestTip) {
            UI.addLogEntry(bestTip.message, 'tip');
            shownTips.add(bestTip.id);
            tipCooldown = TIP_COOLDOWN;
        }
    }
    
    function reset() {
        shownTips.clear();
        tipCooldown = 0;
    }
    
    return { update, reset };
})();

// ============================================
