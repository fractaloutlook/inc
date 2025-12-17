// MODULE: Generator Manager
// ============================================
const GeneratorManager = (() => {
    const events = Utils.createEventEmitter();
    
    function getOwned(generatorId) {
        return StateManager.get(`generators.${generatorId}.owned`) || 0;
    }
    
    function getCost(generatorId, count = 1) {
        const data = GameData.generators[generatorId];
        const owned = getOwned(generatorId);
        const costs = {};
        
        // Calculate total cost for 'count' generators
        for (const [resource, baseCost] of Object.entries(data.baseCost)) {
            let total = 0;
            for (let i = 0; i < count; i++) {
                total += Math.floor(baseCost * Math.pow(data.costMultiplier, owned + i));
            }
            costs[resource] = total;
        }
        
        return costs;
    }
    
    function getMaxAffordable(generatorId) {
        const data = GameData.generators[generatorId];
        const owned = getOwned(generatorId);
        let count = 0;
        let totalCosts = {};
        
        // Initialize total costs
        for (const resource of Object.keys(data.baseCost)) {
            totalCosts[resource] = 0;
        }
        
        // Keep adding until we can't afford more
        while (count < 1000) { // Safety limit
            const nextCost = {};
            let canAfford = true;
            
            for (const [resource, baseCost] of Object.entries(data.baseCost)) {
                const cost = Math.floor(baseCost * Math.pow(data.costMultiplier, owned + count));
                const newTotal = totalCosts[resource] + cost;
                nextCost[resource] = newTotal;
                
                if (newTotal > ResourceManager.get(resource)) {
                    canAfford = false;
                    break;
                }
            }
            
            if (!canAfford) break;
            
            totalCosts = nextCost;
            count++;
        }
        
        return count;
    }
    
    function buy(generatorId, count = 1) {
        if (count === 'max') {
            count = getMaxAffordable(generatorId);
        }
        if (count <= 0) return false;
        
        const costs = getCost(generatorId, count);
        
        if (!ResourceManager.spendMultiple(costs)) {
            return false;
        }
        
        const owned = getOwned(generatorId);
        StateManager.set(`generators.${generatorId}.owned`, owned + count);
        
        events.emit('bought', { generatorId, owned: owned + count, count });
        calculateProduction();
        return true;
    }
    
    function isUnlocked(generatorId) {
        const data = GameData.generators[generatorId];
        if (!data) return false;
        if (data.unlocked) return true;
        
        if (data.unlockAt) {
            const checkAmount = StateManager.get(`resources.${data.unlockAt.resource}.total`) || 0;
            if (checkAmount >= data.unlockAt.amount) {
                data.unlocked = true;
                return true;
            }
        }
        return false;
    }
    
    function getProduction(generatorId) {
        const data = GameData.generators[generatorId];
        const owned = getOwned(generatorId);
        if (owned === 0) return {};
        
        const production = {};
        for (const [resource, baseRate] of Object.entries(data.production)) {
            let rate = baseRate * owned;
            
            // Apply upgrade boosts
            Object.values(GameData.upgrades).forEach(upgrade => {
                if (StateManager.get(`upgrades.${upgrade.id}.purchased`) && upgrade.effect?.generatorBoost?.[generatorId]) {
                    rate *= upgrade.effect.generatorBoost[generatorId];
                }
            });
            
            // Apply global production multiplier
            if (StateManager.get('upgrades.quantumResonance.purchased')) {
                rate *= 1.5;
            }
            
            // Apply Reality Fragment bonus (from prestige)
            if (typeof PrestigeManager !== 'undefined') {
                rate *= PrestigeManager.getProductionMultiplier();
            }
            
            // COHERENCE EFFECT: Low coherence reduces generator output
            // At 100% coherence: full production
            // At 50% coherence: 65% production  
            // At 0% coherence: 30% production (more punishing for idling)
            const coherence = ResourceManager.get('coherence') || 0;
            const coherenceMultiplier = 0.3 + (coherence / 100) * 0.7;
            rate *= coherenceMultiplier;
            
            production[resource] = rate;
        }
        
        return production;
    }
    
    function calculateProduction() {
        // Reset rates
        Object.keys(GameData.resources).forEach(id => {
            ResourceManager.setRate(id, 0);
        });
        
        // Calculate from generators
        Object.keys(GameData.generators).forEach(id => {
            const prod = getProduction(id);
            for (const [resource, rate] of Object.entries(prod)) {
                const current = ResourceManager.getRate(resource);
                ResourceManager.setRate(resource, current + rate);
            }
        });
        
        events.emit('productionUpdated');
    }
    
    return {
        getOwned,
        getCost,
        getMaxAffordable,
        buy,
        isUnlocked,
        getProduction,
        calculateProduction,
        on: events.on
    };
})();

