(function() {
    'use strict';

    const ACCESS_TILE_MAP = {
        'water': [5, 8]
    };

    function isTileOfType(tileId, accessType) {
        const allowedTiles = ACCESS_TILE_MAP[accessType.toLowerCase()];
        if (allowedTiles) {
            return allowedTiles.includes(tileId);
        }
        
        if (!window.tileDataById) return false;
        const tileInfo = window.tileDataById[tileId];
        if (!tileInfo) return false;
        
        const tileName = (tileInfo.name || '').toLowerCase();
        return tileName.indexOf(accessType.toLowerCase()) !== -1;
    }

    function isInBounds(x, y, gameState) {
        return x >= 0 && x < gameState.mapWidth && y >= 0 && y < gameState.mapHeight;
    }

    function isBlockedByMegaElement(x, y) {
        return window.MegaElementManager && MegaElementManager.isTileBlocked(x, y);
    }
    
    function isBlockedByBuiltElement(x, y, gameState) {
        if (gameState.builtElements && window.ElementInteractionManager) {
            for (const built of gameState.builtElements) {
                const builtDef = ElementInteractionManager.getElementDefinition(built.type);
                const bw = (builtDef && builtDef.width) || 1;
                const bh = (builtDef && builtDef.height) || 1;
                if (x >= built.x && x < built.x + bw && y >= built.y && y < built.y + bh) {
                    return true;
                }
            }
        }
        return false;
    }

    function checkTileAccess(tileId, actorType) {
        if (!window.tileDataById) return true;
        const tileInfo = window.tileDataById[tileId];
        
        if (!tileInfo) return true;
        if (!tileInfo.access) return true;
        if (tileInfo.access === "blocked") return false;
        
        if (Array.isArray(tileInfo.access)) {
            return tileInfo.access.includes(actorType || 'player');
        }
        
        if (typeof tileInfo.access === "object" && tileInfo.access.requires) {
            return window.checkAccessRequirements ? 
                window.checkAccessRequirements(tileInfo.access.requires) : true;
        }
        
        return true;
    }

    function isTileAvailable(x, y, options) {
        options = options || {};
        const gs = options.gameState || window.gameState;
        const actorType = options.actorType || (gs && gs.characterType) || 'player';
        const forPlacement = options.forPlacement || false;
        
        if (!gs) return { available: false, reason: 'Game not ready' };
        
        if (!isInBounds(x, y, gs)) {
            return { available: false, reason: 'Outside map boundaries' };
        }
        
        if (isBlockedByMegaElement(x, y)) {
            return { available: false, reason: 'Blocked by structure' };
        }
        
        if (forPlacement && isBlockedByBuiltElement(x, y, gs)) {
            return { available: false, reason: 'Something already built here' };
        }
        
        const tileId = gs.mapData[y] ? gs.mapData[y][x] : undefined;
        if (tileId === undefined) {
            return { available: false, reason: 'Invalid tile' };
        }
        
        if (options.requireAccess) {
            if (!isTileOfType(tileId, options.requireAccess)) {
                return { available: false, reason: 'Must be on ' + options.requireAccess };
            }
            return { available: true, tileId: tileId };
        }
        
        if (!checkTileAccess(tileId, actorType)) {
            return { available: false, reason: 'Cannot access this terrain' };
        }
        
        return { available: true, tileId: tileId };
    }

    function canActorMoveTo(x, y, actorType, gameState) {
        const result = isTileAvailable(x, y, { 
            gameState: gameState, 
            actorType: actorType 
        });
        return result.available;
    }

    function canPlaceElement(x, y, width, height, elementAccess, gameState) {
        width = width || 1;
        height = height || 1;
        
        for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
                const result = isTileAvailable(x + dx, y + dy, {
                    gameState: gameState,
                    requireAccess: elementAccess,
                    forPlacement: true
                });
                if (!result.available) {
                    return { valid: false, reason: result.reason };
                }
            }
        }
        
        return { valid: true };
    }

    window.TileAccess = {
        isTileOfType: isTileOfType,
        isInBounds: isInBounds,
        isBlockedByMegaElement: isBlockedByMegaElement,
        isBlockedByBuiltElement: isBlockedByBuiltElement,
        checkTileAccess: checkTileAccess,
        isTileAvailable: isTileAvailable,
        canActorMoveTo: canActorMoveTo,
        canPlaceElement: canPlaceElement
    };

    console.log('[TileAccess] Module loaded');
})();
