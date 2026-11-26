// ============================================
// COMMAND HELPERS - Shared utility functions for game commands
// ============================================

(function() {
    'use strict';

    var CommandHelpers = {
        findObjectAt: function(x, y, type) {
            if (!gameState.objects) return null;
            return gameState.objects.find(function(obj) { 
                return obj.x === x && obj.y === y && obj.type === type; 
            });
        },

        getAnimationDuration: function(fraction) {
            fraction = fraction || 1;
            return SPEED_SETTINGS[currentSpeed].duration * fraction;
        }
    };

    window.CommandHelpers = CommandHelpers;
    
    console.log('[CommandHelpers] Module loaded');
})();
