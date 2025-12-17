// MODULE: Resource Gain Tracker (floating +X on left panel)
// ============================================
const ResourceGainTracker = (() => {
    const pendingGains = {}; // { resourceId: { amount: X, timer: Y, element: Z } }
    const DISPLAY_TIME = 3000; // 3 seconds before fade
    
    function addGain(resourceId, amount) {
        if (!pendingGains[resourceId]) {
            pendingGains[resourceId] = { amount: 0, timer: null, element: null };
        }
        
        const gain = pendingGains[resourceId];
        gain.amount += amount;
        
        // Clear existing fade timer
        if (gain.timer) {
            clearTimeout(gain.timer);
        }
        
        // Update or create the display element
        updateDisplay(resourceId);
        
        // Set new fade timer
        gain.timer = setTimeout(() => fadeOut(resourceId), DISPLAY_TIME);
    }
    
    function updateDisplay(resourceId) {
        const gain = pendingGains[resourceId];
        const resourceItem = document.querySelector(`.resource-item[data-resource="${resourceId}"]`);
        
        if (!resourceItem) return;
        
        // Create element if needed
        if (!gain.element) {
            gain.element = document.createElement('div');
            gain.element.className = 'resource-gain';
            resourceItem.appendChild(gain.element);
        }
        
        // Remove fading class if re-triggered
        gain.element.classList.remove('fading');
        
        // Update text
        const sign = gain.amount >= 0 ? '+' : '';
        gain.element.textContent = sign + Utils.formatNumber(gain.amount, 0);
        
        // Re-trigger animation
        gain.element.style.animation = 'none';
        gain.element.offsetHeight; // Force reflow
        gain.element.style.animation = '';
    }
    
    function fadeOut(resourceId) {
        const gain = pendingGains[resourceId];
        if (!gain || !gain.element) return;
        
        gain.element.classList.add('fading');
        
        // Remove after fade animation
        setTimeout(() => {
            if (gain.element && gain.element.parentNode) {
                gain.element.remove();
            }
            gain.element = null;
            gain.amount = 0;
            gain.timer = null;
        }, 500);
    }
    
    // Show floating harvest numbers at a position
    function showHarvestFloat(plotIndex, yields) {
        const plotEl = document.querySelector(`.garden-plot[data-index="${plotIndex}"]`);
        const container = document.getElementById('harvest-effects-container');
        if (!plotEl || !container) return;
        
        // Get plot position relative to center panel
        const centerPanel = document.getElementById('center-panel');
        const panelRect = centerPanel.getBoundingClientRect();
        const plotRect = plotEl.getBoundingClientRect();
        
        const centerX = plotRect.left - panelRect.left + plotRect.width / 2;
        const startY = plotRect.top - panelRect.top + plotRect.height / 3;
        
        let yOffset = 0;
        
        Object.entries(yields).forEach(([resourceId, amount], i) => {
            const data = GameData.resources[resourceId];
            if (!data) return;
            
            // Don't show floaty numbers for resources the player hasn't unlocked yet
            if (!ResourceManager.isUnlocked(resourceId)) return;
            
            const floater = document.createElement('div');
            floater.className = 'harvest-float';
            floater.textContent = `${data.icon}+${Utils.formatNumber(amount, 0)}`;
            floater.style.left = centerX + 'px';
            floater.style.top = (startY + yOffset) + 'px';
            floater.style.transform = 'translateX(-50%)';
            floater.style.animationDelay = (i * 0.1) + 's';
            
            container.appendChild(floater);
            
            yOffset += 20;
            
            // Also add to left panel tracker
            addGain(resourceId, amount);
            
            // Remove after animation
            setTimeout(() => floater.remove(), 1500 + i * 100);
        });
    }
    
    return { addGain, showHarvestFloat };
})();

