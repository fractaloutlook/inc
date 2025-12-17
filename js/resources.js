// MODULE: Resource Manager
// ============================================
const ResourceManager = (() => {
    const events = Utils.createEventEmitter();
    
    function add(resourceId, amount) {
        const current = StateManager.get(`resources.${resourceId}.amount`) || 0;
        const newAmount = current + amount;
        StateManager.set(`resources.${resourceId}.amount`, newAmount);
        
        if (amount > 0) {
            const total = StateManager.get(`resources.${resourceId}.total`) || 0;
            StateManager.set(`resources.${resourceId}.total`, total + amount);
            
            // Track last significant gain for déjà vu event
            if (amount >= 10) {
                StateManager.set('lastResourceGain', { resource: resourceId, amount: amount });
            }
        }
        
        events.emit('changed', { resourceId, amount: newAmount, delta: amount });
        checkUnlocks();
    }
    
    function spend(resourceId, amount) {
        const current = StateManager.get(`resources.${resourceId}.amount`) || 0;
        if (current < amount) return false;
        StateManager.set(`resources.${resourceId}.amount`, current - amount);
        events.emit('spent', { resourceId, amount });
        return true;
    }
    
    function canAfford(costs) {
        for (const [resourceId, amount] of Object.entries(costs)) {
            const current = StateManager.get(`resources.${resourceId}.amount`) || 0;
            if (current < amount) return false;
        }
        return true;
    }
    
    function spendMultiple(costs) {
        if (!canAfford(costs)) return false;
        for (const [resourceId, amount] of Object.entries(costs)) {
            spend(resourceId, amount);
        }
        return true;
    }
    
    function get(resourceId) {
        return StateManager.get(`resources.${resourceId}.amount`) || 0;
    }
    
    function getRate(resourceId) {
        return StateManager.get(`resources.${resourceId}.rate`) || 0;
    }
    
    function setRate(resourceId, rate) {
        StateManager.set(`resources.${resourceId}.rate`, rate);
    }
    
    function isUnlocked(resourceId) {
        const data = GameData.resources[resourceId];
        if (!data) return false;
        if (data.unlocked) return true;
        
        // Check unlock condition
        if (data.unlockAt) {
            const checkAmount = StateManager.get(`resources.${data.unlockAt.resource}.total`) || 0;
            return checkAmount >= data.unlockAt.amount;
        }
        return false;
    }
    
    function checkUnlocks() {
        Object.keys(GameData.resources).forEach(id => {
            if (!GameData.resources[id].unlocked && isUnlocked(id)) {
                GameData.resources[id].unlocked = true;
                events.emit('unlocked', id);
            }
        });
    }
    
    return {
        add,
        spend,
        canAfford,
        spendMultiple,
        get,
        getRate,
        setRate,
        isUnlocked,
        on: events.on
    };
})();

