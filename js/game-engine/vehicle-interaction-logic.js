// ============================================
// VEHICLE INTERACTION LOGIC
// Handles boarding and disembarking vehicles (boats, etc.)
// ============================================

(function() {
    'use strict';

    const VehicleInteractionManager = {
        vehicleSprites: {},
        
        async init() {
            console.log('[VehicleInteraction] Initialized');
        },

        async loadVehicleSprite(vehicleType) {
            if (this.vehicleSprites[vehicleType]) {
                return this.vehicleSprites[vehicleType];
            }
            
            const manifest = window.ElementInteractionManager?.manifest;
            if (!manifest || !manifest.elements) return null;
            
            const vehicleDef = manifest.elements[vehicleType];
            if (!vehicleDef || !vehicleDef.spritePath) return null;
            
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.vehicleSprites[vehicleType] = img;
                    resolve(img);
                };
                img.onerror = () => {
                    console.warn('[VehicleInteraction] Failed to load sprite:', vehicleDef.spritePath);
                    resolve(null);
                };
                img.src = '/assets/map/' + vehicleDef.spritePath;
            });
        },

        getVehicleSprite(vehicleType) {
            return this.vehicleSprites[vehicleType] || null;
        },

        board(vehicleElement, gameState) {
            if (gameState.characterType !== 'player') {
                return { 
                    success: false, 
                    message: 'Already in a vehicle. Use interact() to disembark first.' 
                };
            }
            
            const vehicleType = vehicleElement.vehicleType || vehicleElement.type;
            
            gameState.originalSpriteImage = gameState.spriteImage;
            gameState.characterType = vehicleType;
            gameState.activeVehicle = vehicleElement;
            
            const sprite = this.getVehicleSprite(vehicleElement.type);
            if (sprite) {
                gameState.spriteImage = sprite;
                gameState.spriteFrameWidth = sprite.width / 6;
                gameState.spriteFrameHeight = sprite.height / 2;
            }
            
            console.log('[VehicleInteraction] Boarded', vehicleType, 'at', vehicleElement.x, vehicleElement.y);
            
            return { 
                success: true, 
                action: 'boarded',
                message: `Boarded ${vehicleElement.type}` 
            };
        },

        disembark(gameState, tileManifest) {
            if (gameState.characterType === 'player') {
                return { 
                    success: false, 
                    message: 'Not in a vehicle.' 
                };
            }
            
            const px = Math.floor(gameState.playerPos.x);
            const py = Math.floor(gameState.playerPos.y);
            
            const landCheck = this.findAdjacentLandTile(px, py, gameState, tileManifest);
            if (!landCheck.found) {
                return { 
                    success: false, 
                    message: 'No accessible land nearby to disembark.' 
                };
            }
            
            if (gameState.originalSpriteImage) {
                gameState.spriteImage = gameState.originalSpriteImage;
                const img = gameState.originalSpriteImage;
                gameState.spriteFrameWidth = img.width / 6;
                gameState.spriteFrameHeight = img.height / 2;
                gameState.originalSpriteImage = null;
            }
            
            const vehicleType = gameState.characterType;
            gameState.characterType = 'player';
            gameState.activeVehicle = null;
            
            console.log('[VehicleInteraction] Disembarked from', vehicleType);
            
            return { 
                success: true, 
                action: 'disembarked',
                message: `Disembarked from ${vehicleType}` 
            };
        },

        findAdjacentLandTile(x, y, gameState, tileManifest) {
            const directions = [
                { dx: 0, dy: -1 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }
            ];
            
            for (const dir of directions) {
                const nx = x + dir.dx;
                const ny = y + dir.dy;
                
                if (nx < 0 || nx >= gameState.mapWidth || ny < 0 || ny >= gameState.mapHeight) {
                    continue;
                }
                
                if (this.isLandTile(nx, ny, gameState, tileManifest)) {
                    return { found: true, x: nx, y: ny };
                }
            }
            
            return { found: false };
        },

        isLandTile(x, y, gameState, tileManifest) {
            if (x < 0 || x >= gameState.mapWidth || y < 0 || y >= gameState.mapHeight) {
                return false;
            }
            
            if (window.MegaElementManager && MegaElementManager.isTileBlocked(x, y)) {
                return false;
            }
            
            const tileName = gameState.mapData[y][x];
            const tileInfo = tileManifest?.tiles?.[tileName];
            
            if (!tileInfo) return true;
            if (!tileInfo.access) return true;
            if (tileInfo.access === 'blocked') return false;
            
            if (Array.isArray(tileInfo.access)) {
                return tileInfo.access.includes('player');
            }
            
            return true;
        },

        isPlayerInVehicle(gameState) {
            return gameState.characterType !== 'player';
        },

        getActiveVehicle(gameState) {
            return gameState.activeVehicle;
        }
    };

    window.VehicleInteractionManager = VehicleInteractionManager;

    console.log('[VehicleInteraction] Module loaded');
})();
