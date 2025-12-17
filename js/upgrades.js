// MODULE: Upgrade Manager
// ============================================
const UpgradeManager = (() => {
    const events = Utils.createEventEmitter();
    
    function isPurchased(upgradeId) {
        return StateManager.get(`upgrades.${upgradeId}.purchased`) || false;
    }
    
    function isUnlocked(upgradeId) {
        const data = GameData.upgrades[upgradeId];
        if (!data) return false;
        if (isPurchased(upgradeId)) return true;
        if (data.unlocked) return true;
        
        // Check unlock condition
        if (data.unlockAt) {
            const checkAmount = StateManager.get(`resources.${data.unlockAt.resource}.total`) || 0;
            if (checkAmount >= data.unlockAt.amount) {
                return true;
            }
        }
        
        // Check requirements
        if (data.requires) {
            for (const reqId of data.requires) {
                if (!isPurchased(reqId)) return false;
            }
            return true;
        }
        
        return data.unlocked;
    }
    
    function canBuy(upgradeId) {
        if (isPurchased(upgradeId)) return false;
        if (!isUnlocked(upgradeId)) return false;
        
        const data = GameData.upgrades[upgradeId];
        return ResourceManager.canAfford(data.cost);
    }
    
    function buy(upgradeId) {
        if (!canBuy(upgradeId)) return false;
        
        const data = GameData.upgrades[upgradeId];
        if (!ResourceManager.spendMultiple(data.cost)) return false;
        
        StateManager.set(`upgrades.${upgradeId}.purchased`, true);
        applyEffect(upgradeId);
        
        events.emit('purchased', upgradeId);
        return true;
    }
    
    function applyEffect(upgradeId) {
        const data = GameData.upgrades[upgradeId];
        if (!data.effect) return;
        
        const effect = data.effect;
        
        // Handle unlock seeds
        if (effect.unlockSeeds) {
            GameData.resources.seeds.unlocked = true;
        }
        
        // Handle grant seeds
        if (effect.grantSeeds) {
            ResourceManager.add('seeds', effect.grantSeeds);
        }
        
        // Handle garden size
        if (effect.gardenSize) {
            GardenManager.expandTo(effect.gardenSize);
        }
        
        // Handle resource unlocks
        if (effect.unlockResource) {
            GameData.resources[effect.unlockResource].unlocked = true;
        }
        
        // Recalculate production for multiplier effects
        GeneratorManager.calculateProduction();
    }
    
    function getClickPower() {
        let power = 1;
        let bonus = 0;
        
        Object.values(GameData.upgrades).forEach(upgrade => {
            if (StateManager.get(`upgrades.${upgrade.id}.purchased`)) {
                if (upgrade.effect?.clickPowerMultiplier) {
                    power *= upgrade.effect.clickPowerMultiplier;
                }
                if (upgrade.effect?.clickPowerBonus) {
                    bonus += upgrade.effect.clickPowerBonus;
                }
            }
        });
        
        return power + bonus;
    }
    
    function getGrowthMultiplier() {
        let mult = 1;
        
        Object.values(GameData.upgrades).forEach(upgrade => {
            if (StateManager.get(`upgrades.${upgrade.id}.purchased`) && upgrade.effect?.growthSpeedMultiplier) {
                mult *= upgrade.effect.growthSpeedMultiplier;
            }
        });
        
        return mult;
    }
    
    return {
        isPurchased,
        isUnlocked,
        canBuy,
        buy,
        getClickPower,
        getGrowthMultiplier,
        on: events.on
    };
})();

