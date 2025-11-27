// ============================================
// TILE HOVER TRACKING
// Handles mouse events for tile hover detection
// ============================================

(function() {
    'use strict';
    
    function initTileHover() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.warn('[TileHover] Canvas not found, will retry');
            setTimeout(initTileHover, 100);
            return;
        }
        
        canvas.addEventListener('mousemove', (e) => {
            const cam = window.camera;
            if (!cam) return;
            
            if (cam.isDragging) return;
            
            if (!window.screenToWorld) return;
            const world = window.screenToWorld(e.clientX, e.clientY);
            
            const TILE_SIZE = window.TILE_SIZE || 32;
            const gameState = window.gameState;
            if (!gameState) return;
            
            const tileX = Math.floor(world.x / TILE_SIZE);
            const tileY = Math.floor(world.y / TILE_SIZE);
            
            if (gameState.hoveredTile.x !== tileX || gameState.hoveredTile.y !== tileY) {
                if (tileX >= 0 && tileX < gameState.mapWidth && 
                    tileY >= 0 && tileY < gameState.mapHeight) {
                    gameState.hoveredTile.x = tileX;
                    gameState.hoveredTile.y = tileY;
                } else {
                    gameState.hoveredTile.x = -1;
                    gameState.hoveredTile.y = -1;
                }
                
                if (window.render) {
                    window.render();
                }
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            const gameState = window.gameState;
            if (!gameState) return;
            
            gameState.hoveredTile.x = -1;
            gameState.hoveredTile.y = -1;
            
            if (window.render) {
                window.render();
            }
        });
        
        console.log('[TileHover] Event handlers attached');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTileHover);
    } else {
        initTileHover();
    }
    
    console.log('[TileHover] Module loaded');
})();
