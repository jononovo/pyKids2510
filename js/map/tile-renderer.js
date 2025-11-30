// ============================================
// TILE RENDERER
// Handles SVG loading, tile drawing, and tile-related rendering
// ============================================

(function() {
    'use strict';
    
    let TILES = {};
    let tileDataById = {};
    let tileManifest = null;
    let COLLECTIBLE_SVGS = {};
    
    const svgTileCache = new Map();
    const svgLoadPromises = new Map();
    const svgFailedLoads = new Set();
    let svgFailureWarned = false;
    
    async function loadTilesManifest() {
        try {
            const response = await fetch('/assets/map/tiles.json');
            tileManifest = await response.json();
            
            TILES = {};
            tileDataById = {};
            for (const [name, data] of Object.entries(tileManifest.tiles)) {
                TILES[name] = data.id;
                tileDataById[data.id] = data;
            }
            
            window.TILES = TILES;
            window.tileDataById = tileDataById;
            window.tileManifest = tileManifest;
            
            console.log('Tiles manifest loaded:', Object.keys(tileManifest.tiles).length, 'tiles');
            console.log('Tile constants built:', TILES);
        } catch (error) {
            console.error('Failed to load tiles manifest:', error);
            throw error;
        }
    }
    
    async function loadCollectiblesManifest() {
        try {
            const response = await fetch('/collectibles.json');
            COLLECTIBLE_SVGS = await response.json();
            window.COLLECTIBLE_SVGS = COLLECTIBLE_SVGS;
            console.log('Collectibles loaded:', Object.keys(COLLECTIBLE_SVGS));
        } catch (error) {
            console.warn('Could not load collectibles manifest, using defaults');
            COLLECTIBLE_SVGS = {
                gem: 'assets/map/elements/collectible-gem.svg',
                coin: 'assets/map/elements/collectible-coin.svg'
            };
            window.COLLECTIBLE_SVGS = COLLECTIBLE_SVGS;
        }
    }
    
    async function loadSVGImage(path) {
        if (svgTileCache.has(path)) {
            return svgTileCache.get(path);
        }
        
        if (svgFailedLoads.has(path)) {
            return null;
        }
        
        if (svgLoadPromises.has(path)) {
            return svgLoadPromises.get(path);
        }
        
        const loadPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                svgTileCache.set(path, img);
                svgLoadPromises.delete(path);
                resolve(img);
            };
            img.onerror = () => {
                svgFailedLoads.add(path);
                svgTileCache.set(path, null);
                svgLoadPromises.delete(path);
                
                if (!svgFailureWarned) {
                    console.warn('Some SVG tiles failed to load, using fallback rendering');
                    svgFailureWarned = true;
                }
                
                resolve(null);
            };
            img.src = path;
        });
        
        svgLoadPromises.set(path, loadPromise);
        return loadPromise;
    }
    
    async function preloadSVGTiles() {
        await loadTilesManifest();
        await loadCollectiblesManifest();
        
        const basePath = 'assets/map/';
        const tilesToLoad = [
            ...Object.values(tileManifest.tiles).map(t => basePath + t.path),
            basePath + tileManifest.special.star,
            ...Object.values(COLLECTIBLE_SVGS)
        ];
        
        await Promise.all(tilesToLoad.map(path => loadSVGImage(path)));
        console.log('SVG tiles preloaded');
    }
    
    function getTilePath(tileId) {
        const tile = tileDataById[tileId];
        return tile ? 'assets/map/' + tile.path : null;
    }
    
    function getTileFallbackColor(tileId) {
        const tile = tileDataById[tileId];
        return tile ? tile.fallbackColor : '#333';
    }
    
    function getTileOverlay(tileId) {
        const tile = tileDataById[tileId];
        return tile ? tile.overlay : null;
    }
    
    function getBaseTileId(overlayType) {
        if (overlayType === 'grass') return TILES.GRASS;
        if (overlayType === 'water') return TILES.WATER;
        return TILES.GRASS;
    }
    
    async function drawTile(x, y, type) {
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        
        const overlay = getTileOverlay(type);
        if (overlay) {
            const baseTileId = getBaseTileId(overlay);
            const baseImg = await loadSVGImage(getTilePath(baseTileId));
            if (baseImg) {
                ctx.drawImage(baseImg, px, py, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = getTileFallbackColor(baseTileId);
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
            
            const overlayPath = getTilePath(type);
            if (overlayPath) {
                const overlayImg = await loadSVGImage(overlayPath);
                if (overlayImg) {
                    ctx.drawImage(overlayImg, px, py, TILE_SIZE, TILE_SIZE);
                } else {
                    ctx.fillStyle = getTileFallbackColor(type);
                    ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
                }
            }
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            return;
        }
        
        const svgPath = getTilePath(type);
        if (svgPath) {
            const img = await loadSVGImage(svgPath);
            if (img) {
                ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
                return;
            }
        }
        
        ctx.fillStyle = getTileFallbackColor(type);
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
    }
    
    async function drawStar(x, y) {
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        if (tileManifest && tileManifest.special) {
            const starPath = 'assets/map/' + tileManifest.special.star;
            const img = await loadSVGImage(starPath);
            if (img) {
                ctx.drawImage(img, x - TILE_SIZE/2, y - TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
                return;
            }
        }
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x - 2, y - 8, 4, 16);
        ctx.fillRect(x - 8, y - 2, 16, 4);
        ctx.fillRect(x - 6, y - 6, 12, 12);
    }
    
    function drawTileHover(x, y) {
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const cornerLength = 4;
        const thickness = 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        ctx.fillRect(px, py, cornerLength, thickness);
        ctx.fillRect(px, py, thickness, cornerLength);
        
        ctx.fillRect(px + TILE_SIZE - cornerLength, py, cornerLength, thickness);
        ctx.fillRect(px + TILE_SIZE - thickness, py, thickness, cornerLength);
        
        ctx.fillRect(px, py + TILE_SIZE - thickness, cornerLength, thickness);
        ctx.fillRect(px, py + TILE_SIZE - cornerLength, thickness, cornerLength);
        
        ctx.fillRect(px + TILE_SIZE - cornerLength, py + TILE_SIZE - thickness, cornerLength, thickness);
        ctx.fillRect(px + TILE_SIZE - thickness, py + TILE_SIZE - cornerLength, thickness, cornerLength);
    }
    
    window.loadTilesManifest = loadTilesManifest;
    window.loadCollectiblesManifest = loadCollectiblesManifest;
    window.loadSVGImage = loadSVGImage;
    window.preloadSVGTiles = preloadSVGTiles;
    window.getTilePath = getTilePath;
    window.getTileFallbackColor = getTileFallbackColor;
    window.getTileOverlay = getTileOverlay;
    window.drawTile = drawTile;
    window.drawStar = drawStar;
    window.drawTileHover = drawTileHover;
    
    console.log('[TileRenderer] Module loaded');
})();
