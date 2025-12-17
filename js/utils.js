// MODULE: Utility Functions
// ============================================
const Utils = {
    // Format large numbers nicely
    formatNumber(num, decimals = 0) {
        if (num === undefined || num === null || isNaN(num)) return '0';
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        
        if (num < 1000) {
            return decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
        }
        
        let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
        if (tier >= suffixes.length) tier = suffixes.length - 1;
        
        const scaled = num / Math.pow(1000, tier);
        const precision = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        
        return scaled.toFixed(precision) + suffixes[tier];
    },
    
    // Format time (seconds to human readable)
    formatTime(seconds) {
        if (seconds < 60) return Math.ceil(seconds) + 's';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + (seconds % 60).toFixed(0) + 's';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hours + 'h ' + mins + 'm';
    },
    
    // Deep clone an object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Simple event emitter
    createEventEmitter() {
        const listeners = {};
        return {
            on(event, callback) {
                if (!listeners[event]) listeners[event] = [];
                listeners[event].push(callback);
            },
            off(event, callback) {
                if (!listeners[event]) return;
                listeners[event] = listeners[event].filter(cb => cb !== callback);
            },
            emit(event, data) {
                if (!listeners[event]) return;
                listeners[event].forEach(callback => callback(data));
            }
        };
    },
    
    // Generate unique ID
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
