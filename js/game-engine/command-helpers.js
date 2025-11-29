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

        updateInventoryDisplay: function() {
            var inventoryPanel = document.getElementById('inventory-panel');
            if (inventoryPanel && gameState.inventory) {
                inventoryPanel.innerHTML = '<strong>Inventory:</strong><br>';
                for (var item in gameState.inventory) {
                    var itemDiv = document.createElement('div');
                    itemDiv.textContent = item + ': ' + gameState.inventory[item];
                    inventoryPanel.appendChild(itemDiv);
                }
            }
        },
        
        updateBackpackDisplay: function() {
            if (window.LevelLoader && LevelLoader.updateBackpackUI) {
                LevelLoader.updateBackpackUI();
            }
        },

        getTargetPosition: function() {
            var pos = gameState.playerPos;
            var px = Math.floor(pos.x);
            var py = Math.floor(pos.y);
            var targetX = px, targetY = py;
            
            switch (gameState.playerDirection) {
                case 'up': targetY--; break;
                case 'down': targetY++; break;
                case 'left': targetX--; break;
                case 'right': targetX++; break;
            }
            return { px: px, py: py, targetX: targetX, targetY: targetY };
        },

        getAnimationDuration: function(fraction) {
            fraction = fraction || 1;
            return SPEED_SETTINGS[currentSpeed].duration * fraction;
        }
    };

    window.CommandHelpers = CommandHelpers;
    
    console.log('[CommandHelpers] Module loaded');
})();
