// MODULE: Achievement Manager
// ============================================
const AchievementManager = (() => {
    const events = Utils.createEventEmitter();
    let checkTimer = 0;
    
    function isUnlocked(achievementId) {
        return StateManager.get(`achievements.${achievementId}`) === true;
    }
    
    function unlock(achievementId) {
        if (isUnlocked(achievementId)) return false;
        
        StateManager.set(`achievements.${achievementId}`, true);
        
        const data = GameData.achievements[achievementId];
        if (data) {
            events.emit('unlocked', data);
            
            // Show notification
            UI.showNotification(
                `🏆 Achievement Unlocked!`,
                `${data.icon} ${data.name}: ${data.description}`,
                'success'
            );
            
            UI.addLogEntry(`🏆 Achievement: ${data.name}`, 'highlight');
            
            // Re-render stats tab if it's visible
            UI.renderStats();
        }
        
        return true;
    }
    
    function checkAll() {
        Object.entries(GameData.achievements).forEach(([id, data]) => {
            if (!isUnlocked(id) && data.check()) {
                unlock(id);
            }
        });
    }
    
    function update(deltaTime) {
        // Check achievements every second
        checkTimer += deltaTime;
        if (checkTimer >= 1) {
            checkAll();
            checkTimer = 0;
        }
    }
    
    function getUnlockedCount() {
        return Object.keys(GameData.achievements).filter(id => isUnlocked(id)).length;
    }
    
    function getTotalCount() {
        return Object.keys(GameData.achievements).length;
    }
    
    function getAll() {
        return Object.entries(GameData.achievements).map(([id, data]) => ({
            ...data,
            unlocked: isUnlocked(id)
        }));
    }
    
    return {
        isUnlocked,
        unlock,
        checkAll,
        update,
        getUnlockedCount,
        getTotalCount,
        getAll,
        on: events.on
    };
})();

// ============================================
