// ============================================
// CAMERA CONTROLS - Pan, Zoom, and View Management
// ============================================

(function() {
    'use strict';

    // Camera state for pan/zoom controls
    const camera = {
        zoom: 1.0,
        minZoom: 0.25,
        maxZoom: 2.0,
        zoomStep: 0.1,
        panX: 0,
        panY: 0,
        isManualPan: false,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        panStartX: 0,
        panStartY: 0
    };

    // Expose camera globally
    window.camera = camera;

    // ============================================
    // Screen-to-World Coordinate Conversion
    // ============================================

    function screenToWorld(screenX, screenY) {
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return { x: screenX, y: screenY };
        
        const viewportRect = viewport.getBoundingClientRect();
        const cam = window.camera;
        
        const relX = screenX - viewportRect.left;
        const relY = screenY - viewportRect.top;
        
        const worldX = (relX - cam.panX) / cam.zoom;
        const worldY = (relY - cam.panY) / cam.zoom;
        
        return { x: worldX, y: worldY };
    }

    window.screenToWorld = screenToWorld;

    // ============================================
    // Camera UI Display
    // ============================================

    function updateCameraUI() {
        const zoomDisplay = document.getElementById('zoom-level');
        if (zoomDisplay) {
            const cam = window.camera;
            zoomDisplay.textContent = `${Math.round(cam.zoom * 100)}%`;
        }
    }

    // ============================================
    // Camera Control Functions
    // ============================================

    window.resetCamera = function() {
        const cam = window.camera;
        if (!cam) return;
        
        cam.zoom = 1.0;
        cam.panX = 0;
        cam.panY = 0;
        cam.isManualPan = false;
        cam.isDragging = false;
        
        if (typeof updateViewport === 'function') {
            updateViewport();
        }
        updateCameraUI();
    };

    window.zoomIn = function() {
        const cam = window.camera;
        const viewport = document.getElementById('game-viewport');
        const viewportRect = viewport.getBoundingClientRect();
        
        const centerX = viewportRect.width / 2;
        const centerY = viewportRect.height / 2;
        
        const worldX = (centerX - cam.panX) / cam.zoom;
        const worldY = (centerY - cam.panY) / cam.zoom;
        
        const oldZoom = cam.zoom;
        cam.zoom = Math.min(cam.maxZoom, cam.zoom + cam.zoomStep);
        
        if (cam.zoom !== oldZoom) {
            cam.panX = centerX - worldX * cam.zoom;
            cam.panY = centerY - worldY * cam.zoom;
            cam.isManualPan = true;
            
            if (typeof updateViewport === 'function') {
                updateViewport();
            }
            updateCameraUI();
        }
    };

    window.zoomOut = function() {
        const cam = window.camera;
        const viewport = document.getElementById('game-viewport');
        const viewportRect = viewport.getBoundingClientRect();
        
        const centerX = viewportRect.width / 2;
        const centerY = viewportRect.height / 2;
        
        const worldX = (centerX - cam.panX) / cam.zoom;
        const worldY = (centerY - cam.panY) / cam.zoom;
        
        const oldZoom = cam.zoom;
        cam.zoom = Math.max(cam.minZoom, cam.zoom - cam.zoomStep);
        
        if (cam.zoom !== oldZoom) {
            cam.panX = centerX - worldX * cam.zoom;
            cam.panY = centerY - worldY * cam.zoom;
            cam.isManualPan = true;
            
            if (typeof updateViewport === 'function') {
                updateViewport();
            }
            updateCameraUI();
        }
    };

    // ============================================
    // Mouse Wheel Zoom Handler
    // ============================================

    const gameViewport = document.getElementById('game-viewport');

    if (gameViewport) {
        gameViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const cam = window.camera;
            const viewport = document.getElementById('game-viewport');
            const viewportRect = viewport.getBoundingClientRect();
            
            const mouseX = e.clientX - viewportRect.left;
            const mouseY = e.clientY - viewportRect.top;
            
            const worldX = (mouseX - cam.panX) / cam.zoom;
            const worldY = (mouseY - cam.panY) / cam.zoom;
            
            const oldZoom = cam.zoom;
            const zoomDelta = e.deltaY > 0 ? -cam.zoomStep : cam.zoomStep;
            cam.zoom = Math.max(cam.minZoom, Math.min(cam.maxZoom, cam.zoom + zoomDelta));
            
            if (cam.zoom !== oldZoom) {
                cam.panX = mouseX - worldX * cam.zoom;
                cam.panY = mouseY - worldY * cam.zoom;
                cam.isManualPan = true;
                
                if (typeof updateViewport === 'function') {
                    updateViewport();
                }
                updateCameraUI();
            }
        }, { passive: false });

        // ============================================
        // Mouse Drag Pan Handler
        // ============================================

        gameViewport.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            
            const cam = window.camera;
            cam.isDragging = true;
            cam.dragStartX = e.clientX;
            cam.dragStartY = e.clientY;
            cam.panStartX = cam.panX;
            cam.panStartY = cam.panY;
            
            gameViewport.style.cursor = 'grabbing';
        });

        // Set default cursor for viewport
        gameViewport.style.cursor = 'grab';
    }

    document.addEventListener('mousemove', (e) => {
        const cam = window.camera;
        if (!cam.isDragging) return;
        
        const deltaX = e.clientX - cam.dragStartX;
        const deltaY = e.clientY - cam.dragStartY;
        
        cam.panX = cam.panStartX + deltaX;
        cam.panY = cam.panStartY + deltaY;
        cam.isManualPan = true;
        
        if (typeof updateViewport === 'function') {
            updateViewport();
        }
    });

    document.addEventListener('mouseup', (e) => {
        const cam = window.camera;
        if (cam.isDragging) {
            cam.isDragging = false;
            const gameViewport = document.getElementById('game-viewport');
            if (gameViewport) {
                gameViewport.style.cursor = 'grab';
            }
        }
    });

    // ============================================
    // Resize Handlers
    // ============================================

    window.addEventListener('resize', () => {
        if (typeof updateViewport === 'function') {
            updateViewport();
        }
    });

    const viewport = document.getElementById('game-viewport');
    if (viewport && typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(() => {
            if (typeof updateViewport === 'function') {
                updateViewport();
            }
        });
        resizeObserver.observe(viewport);
    }

    console.log('[CameraControls] Module loaded');
})();
