// ============================================
// COORDINATE UTILITIES
// Shared parsing for [[x,y], [x2,y2]] format
// Used by ElementInteractionManager and MegaElementManager
// ============================================

(function() {
    'use strict';

    const CoordUtils = {
        expandCoordinates(coordsData) {
            if (!Array.isArray(coordsData)) return [];
            
            if (coordsData.length === 2 && 
                typeof coordsData[0] === 'number' && 
                typeof coordsData[1] === 'number') {
                return [{ x: coordsData[0], y: coordsData[1] }];
            }
            
            return coordsData
                .filter(coord => Array.isArray(coord) && coord.length >= 2)
                .map(coord => ({ x: coord[0], y: coord[1] }));
        },

        generateId(prefix, type, x, y) {
            if (prefix) {
                return `${prefix}_${type}_${x}_${y}`;
            }
            return `${type}_${x}_${y}`;
        }
    };

    window.CoordUtils = CoordUtils;

    console.log('[CoordUtils] Module loaded');
})();
