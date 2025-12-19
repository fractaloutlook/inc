// MODULE: Pattern Detection
// ============================================
const PatternDetector = (() => {

    // Check if two plots are entangled (in either direction)
    function areEntangled(plots, idx1, idx2) {
        const plot1 = plots[idx1];
        const plot2 = plots[idx2];
        if (!plot1 || !plot2) return false;

        const entangled1 = Array.isArray(plot1.entangledWith) ? plot1.entangledWith : [];
        const entangled2 = Array.isArray(plot2.entangledWith) ? plot2.entangledWith : [];

        return entangled1.includes(idx2) || entangled2.includes(idx1);
    }

    // Check if all pairs in a set are entangled
    function allConnected(plots, indices) {
        for (let i = 0; i < indices.length; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                if (!areEntangled(plots, indices[i], indices[j])) {
                    return false;
                }
            }
        }
        return true;
    }

    // Check if indices form a path (each connected to next)
    function formPath(plots, indices) {
        for (let i = 0; i < indices.length - 1; i++) {
            if (!areEntangled(plots, indices[i], indices[i + 1])) {
                return false;
            }
        }
        return true;
    }

    // Pattern detection functions
    function detectHorizontalLine(plots) {
        const rows = [[0,1,2], [3,4,5], [6,7,8]];
        for (const row of rows) {
            if (formPath(plots, row)) {
                return { pattern: 'horizontalLine', indices: row };
            }
        }
        return null;
    }

    function detectVerticalLine(plots) {
        const cols = [[0,3,6], [1,4,7], [2,5,8]];
        for (const col of cols) {
            if (formPath(plots, col)) {
                return { pattern: 'verticalLine', indices: col };
            }
        }
        return null;
    }

    function detectDiagonal(plots) {
        if (formPath(plots, [0,4,8])) {
            return { pattern: 'diagonal', indices: [0,4,8], direction: 'main' };
        }
        if (formPath(plots, [2,4,6])) {
            return { pattern: 'diagonal', indices: [2,4,6], direction: 'anti' };
        }
        return null;
    }

    function detectSquare(plots) {
        const corners = [0,2,6,8];
        if (allConnected(plots, corners)) {
            return { pattern: 'square', indices: corners };
        }
        return null;
    }

    function detectTriangle(plots) {
        const triangles = [
            [0,2,4], [2,4,8], [4,6,8], [0,4,6],  // corner triangles
            [0,1,3], [1,2,5], [5,7,8], [3,6,7]   // edge triangles
        ];

        for (const tri of triangles) {
            if (allConnected(plots, tri)) {
                return { pattern: 'triangle', indices: tri };
            }
        }
        return null;
    }

    function detectXShape(plots) {
        if (formPath(plots, [0,4,8]) && formPath(plots, [2,4,6])) {
            return { pattern: 'xShape', indices: [0,2,4,6,8] };
        }
        return null;
    }

    function detectPlus(plots) {
        if (formPath(plots, [1,4,7]) && formPath(plots, [3,4,5])) {
            return { pattern: 'plus', indices: [1,3,4,5,7] };
        }
        return null;
    }

    function detectBorder(plots) {
        const border = [0,1,2,5,8,7,6,3]; // clockwise around edge
        if (formPath(plots, border)) {
            return { pattern: 'border', indices: border };
        }
        return null;
    }

    // Detect all patterns
    function detectPatterns() {
        const plots = StateManager.get('garden.plots') || [];
        const patterns = [];

        // Check each pattern type
        const detectors = [
            detectHorizontalLine,
            detectVerticalLine,
            detectDiagonal,
            detectSquare,
            detectTriangle,
            detectXShape,
            detectPlus,
            detectBorder
        ];

        for (const detector of detectors) {
            const result = detector(plots);
            if (result) {
                patterns.push(result);
            }
        }

        return patterns;
    }

    return {
        detectPatterns,
        areEntangled
    };
})();

// ============================================
