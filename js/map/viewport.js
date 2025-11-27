// ============================================
// VIEWPORT MANAGEMENT
// Handles canvas positioning, player following, and zoom transforms
// ============================================

(function() {
    'use strict';
    
    function updateViewport() {
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        const cam = window.camera || { zoom: 1, panX: 0, panY: 0, isManualPan: false };
        const zoom = cam.zoom;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const gameState = window.gameState;
        if (!gameState) return;
        
        const viewportWidth = viewport.clientWidth;
        const viewportHeight = viewport.clientHeight;
        
        const canvasWidth = gameState.mapWidth * TILE_SIZE * zoom;
        const canvasHeight = gameState.mapHeight * TILE_SIZE * zoom;
        
        const playerPixelX = (gameState.playerPos.x * TILE_SIZE + TILE_SIZE/2) * zoom;
        const playerPixelY = (gameState.playerPos.y * TILE_SIZE + TILE_SIZE/2) * zoom;
        
        let offsetX, offsetY;
        
        if (cam.isManualPan) {
            offsetX = cam.panX;
            offsetY = cam.panY;
        } else {
            if (viewportWidth >= canvasWidth) {
                offsetX = (viewportWidth - canvasWidth) / 2;
            } else {
                offsetX = viewportWidth/2 - playerPixelX;
                const minOffsetX = Math.min(0, viewportWidth - canvasWidth);
                offsetX = Math.max(minOffsetX, Math.min(0, offsetX));
            }
            
            if (viewportHeight >= canvasHeight) {
                offsetY = (viewportHeight - canvasHeight) / 2;
            } else {
                offsetY = viewportHeight/2 - playerPixelY;
                const minOffsetY = Math.min(0, viewportHeight - canvasHeight);
                offsetY = Math.max(minOffsetY, Math.min(0, offsetY));
            }
            
            cam.panX = offsetX;
            cam.panY = offsetY;
        }
        
        canvas.style.transformOrigin = '0 0';
        canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
    }
    
    window.updateViewport = updateViewport;
    
    console.log('[Viewport] Module loaded');
})();
