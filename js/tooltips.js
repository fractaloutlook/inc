// MODULE: Tooltip Manager
// ============================================
const TooltipManager = (() => {
    let tooltipEl = null;
    let currentTarget = null;
    let checkInterval = null;
    
    function init() {
        tooltipEl = document.getElementById('tooltip');
        
        // Periodically check if tooltip should be hidden
        // This catches cases where mouseleave doesn't fire (e.g., element removed)
        checkInterval = setInterval(() => {
            if (currentTarget && tooltipEl?.classList.contains('visible')) {
                // Check if mouse is still over the target
                const rect = currentTarget.getBoundingClientRect();
                const mouseX = lastMouseX;
                const mouseY = lastMouseY;
                
                // If target is no longer in DOM or mouse is far from it, hide tooltip
                if (!document.body.contains(currentTarget) ||
                    mouseX < rect.left - 50 || mouseX > rect.right + 50 ||
                    mouseY < rect.top - 50 || mouseY > rect.bottom + 50) {
                    hide();
                }
            }
        }, 500);
        
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });
    }
    
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    function show(target, content, detail = null) {
        if (!tooltipEl) return;
        
        currentTarget = target;
        
        let html = '';
        if (typeof content === 'object') {
            html = `<div class="tooltip-title">${content.title || ''}</div>`;
            html += `<div>${content.description || ''}</div>`;
            if (content.detail) {
                html += `<div class="tooltip-detail">${content.detail}</div>`;
            }
        } else {
            html = content;
            if (detail) {
                html += `<div class="tooltip-detail">${detail}</div>`;
            }
        }
        
        tooltipEl.innerHTML = html;
        tooltipEl.classList.add('visible');
        
        // Position to the right of the target element
        positionTooltip(target);
    }
    
    function hide() {
        if (tooltipEl) {
            tooltipEl.classList.remove('visible');
        }
        currentTarget = null;
    }
    
    function positionTooltip(target) {
        if (!tooltipEl || !target) return;
        
        const padding = 10;
        const rect = target.getBoundingClientRect();
        
        // First render to get tooltip dimensions
        tooltipEl.style.left = '-9999px';
        tooltipEl.style.top = '-9999px';
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        // Default: position to the right of target, vertically centered
        let left = rect.right + padding;
        let top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        
        // If tooltip would go off right edge, position to the left instead
        if (left + tooltipRect.width > window.innerWidth - padding) {
            left = rect.left - tooltipRect.width - padding;
        }
        
        // Keep tooltip on screen vertically
        if (top + tooltipRect.height > window.innerHeight - padding) {
            top = window.innerHeight - tooltipRect.height - padding;
        }
        if (top < padding) {
            top = padding;
        }
        
        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = top + 'px';
    }
    
    // Helper to attach tooltip to elements
    function attach(element, content, detailFn = null) {
        element.addEventListener('mouseenter', () => {
            const detail = detailFn ? detailFn() : null;
            show(element, content, detail);
        });
        element.addEventListener('mouseleave', hide);
    }
    
    return { init, show, hide, attach };
})();

