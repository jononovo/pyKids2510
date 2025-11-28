// ============================================
// VEHICLE INTERACTION LOGIC
// Handles vehicle boarding, disembarking, and state management
// ============================================

(function() {
    'use strict';

    const VehicleInteractionManager = {
        vehicles: [],
        vehicleStates: {},
        
        currentVehicle: null,
        originalPlayerSprite: null,
        originalSpriteFrameWidth: 0,
        originalSpriteFrameHeight: 0,
        
        isBoarded() {
            return this.currentVehicle !== null;
        },

        getVehicleAt(x, y) {
            return this.vehicles.find(v => 
                v.x === x && v.y === y && !this.isVehicleRemoved(v.id) && !this.isVehicleHidden(v.id)
            );
        },

        isVehicleRemoved(vehicleId) {
            const state = this.vehicleStates[vehicleId];
            return state && state.removed;
        },
        
        isVehicleHidden(vehicleId) {
            const state = this.vehicleStates[vehicleId];
            return state && state.hidden === true;
        },

        loadLevelVehicles(levelData) {
            this.vehicles = [];
            this.vehicleStates = {};
            this.currentVehicle = null;
            this.originalPlayerSprite = null;
            
            if (!levelData.map || !levelData.map.vehicles) {
                return this.vehicles;
            }

            const parsed = this.parseVehicleSection(levelData.map.vehicles);
            this.vehicles.push(...parsed);
            
            this._registerSignalListeners();
            
            console.log('[VehicleInteraction] Loaded', this.vehicles.length, 'vehicles for level');
            return this.vehicles;
        },
        
        _registerSignalListeners() {
            if (!window.SignalManager) return;
            
            for (const vehicle of this.vehicles) {
                if (vehicle.spawn) {
                    this.vehicleStates[vehicle.id] = { ...this.vehicleStates[vehicle.id], hidden: true };
                    
                    SignalManager.subscribe(vehicle.spawn, () => {
                        console.log('[VehicleInteraction] Spawn triggered for:', vehicle.type, 'at', vehicle.x, vehicle.y);
                        const state = this.vehicleStates[vehicle.id] || {};
                        this.vehicleStates[vehicle.id] = { ...state, hidden: false };
                    });
                }
                
                if (vehicle.remove) {
                    SignalManager.subscribe(vehicle.remove, () => {
                        console.log('[VehicleInteraction] Remove triggered for:', vehicle.type, 'at', vehicle.x, vehicle.y);
                        this.vehicleStates[vehicle.id] = { removed: true };
                    });
                }
            }
        },

        parseVehicleSection(sectionData) {
            const parsed = [];
            
            if (!sectionData || !Array.isArray(sectionData)) return parsed;

            for (const item of sectionData) {
                if (!Array.isArray(item)) continue;

                const vehicleType = item[0];
                if (typeof vehicleType !== 'string') continue;

                for (let i = 1; i < item.length; i++) {
                    const data = item[i];
                    
                    if (Array.isArray(data)) {
                        const elements = this._parseCoordArray(vehicleType, data);
                        parsed.push(...elements);
                    } else if (typeof data === 'object' && data.at) {
                        const options = {
                            emit: data.emit || null,
                            spawn: data.spawn || null,
                            remove: data.remove || null
                        };
                        const elements = this._parseCoordArray(vehicleType, data.at, options);
                        parsed.push(...elements);
                    }
                }
            }

            return parsed;
        },

        _parseCoordArray(vehicleType, coords, options = null) {
            const elements = [];
            const opts = options || {};
            
            if (!Array.isArray(coords)) return elements;

            if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                elements.push({
                    type: vehicleType,
                    x: coords[0],
                    y: coords[1],
                    originalX: coords[0],
                    originalY: coords[1],
                    section: 'vehicles',
                    id: this._generateId(vehicleType, coords[0], coords[1]),
                    emit: opts.emit || null,
                    spawn: opts.spawn || null,
                    remove: opts.remove || null
                });
            } else {
                for (const coord of coords) {
                    if (Array.isArray(coord) && coord.length >= 2) {
                        elements.push({
                            type: coord[2] || vehicleType,
                            x: coord[0],
                            y: coord[1],
                            originalX: coord[0],
                            originalY: coord[1],
                            section: 'vehicles',
                            id: this._generateId(vehicleType, coord[0], coord[1]),
                            emit: opts.emit || null,
                            spawn: opts.spawn || null,
                            remove: opts.remove || null
                        });
                    }
                }
            }

            return elements;
        },

        _generateId(type, x, y) {
            return `vehicle_${type}_${x}_${y}`;
        },

        getVehicleDefinition(type) {
            if (!window.ElementInteractionManager || !window.ElementInteractionManager.manifest) {
                return null;
            }
            const elements = window.ElementInteractionManager.manifest.elements;
            if (!elements) return null;
            
            const def = elements[type];
            if (def && def.vehicleType) {
                return def;
            }
            return null;
        },

        handleInteract(x, y, gameState) {
            if (this.isBoarded()) {
                return this.handleDisembark(gameState);
            }
            
            const vehicle = this.getVehicleAt(x, y);
            if (!vehicle) {
                return { success: false, message: 'No vehicle here' };
            }

            return this.handleBoard(vehicle, gameState);
        },

        handleBoard(vehicle, gameState) {
            const vehicleDef = this.getVehicleDefinition(vehicle.type);
            if (!vehicleDef) {
                return { success: false, message: `Unknown vehicle type: ${vehicle.type}` };
            }

            this.originalPlayerSprite = gameState.spriteImage;
            this.originalSpriteFrameWidth = gameState.spriteFrameWidth;
            this.originalSpriteFrameHeight = gameState.spriteFrameHeight;

            this.currentVehicle = vehicle;

            gameState.characterType = vehicleDef.vehicleType || vehicle.type;

            gameState.playerPos.x = vehicle.x;
            gameState.playerPos.y = vehicle.y;

            this.vehicleStates[vehicle.id] = { boarded: true };

            console.log('[VehicleInteraction] Boarded', vehicle.type, 'at', vehicle.x, vehicle.y);
            console.log('[VehicleInteraction] characterType is now:', gameState.characterType);
            
            return { 
                success: true, 
                action: 'boarded',
                message: `Boarded the ${vehicle.type}`,
                vehicle: vehicle
            };
        },

        handleDisembark(gameState) {
            if (!this.currentVehicle) {
                return { success: false, message: 'Not in a vehicle' };
            }

            const px = Math.floor(gameState.playerPos.x);
            const py = Math.floor(gameState.playerPos.y);
            
            const landTile = this.findAdjacentWalkableTile(px, py, gameState);
            
            if (!landTile) {
                return { 
                    success: false, 
                    message: 'No suitable land nearby to disembark'
                };
            }

            const vehicleId = this.currentVehicle.id;
            const vehicleType = this.currentVehicle.type;

            this.currentVehicle.x = px;
            this.currentVehicle.y = py;

            gameState.playerPos.x = landTile.x;
            gameState.playerPos.y = landTile.y;

            gameState.characterType = 'player';

            gameState.spriteImage = this.originalPlayerSprite;
            gameState.spriteFrameWidth = this.originalSpriteFrameWidth;
            gameState.spriteFrameHeight = this.originalSpriteFrameHeight;

            this.vehicleStates[vehicleId] = { boarded: false };
            this.currentVehicle = null;
            this.originalPlayerSprite = null;

            console.log('[VehicleInteraction] Disembarked from', vehicleType, 'onto land at', landTile.x, landTile.y);
            console.log('[VehicleInteraction] characterType is now:', gameState.characterType);
            
            return { 
                success: true, 
                action: 'disembarked',
                message: `Disembarked from the ${vehicleType}`,
                landPosition: landTile
            };
        },

        findAdjacentWalkableTile(x, y, gameState) {
            const directions = [
                { dx: 1, dy: 0 },
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }
            ];

            for (const dir of directions) {
                const checkX = x + dir.dx;
                const checkY = y + dir.dy;
                
                if (this.canPlayerWalkTo(checkX, checkY, gameState)) {
                    return { x: checkX, y: checkY };
                }
            }

            return null;
        },

        canPlayerWalkTo(x, y, gameState) {
            if (x < 0 || x >= gameState.mapWidth || y < 0 || y >= gameState.mapHeight) {
                return false;
            }

            if (window.MegaElementManager && window.MegaElementManager.isTileBlocked(x, y)) {
                return false;
            }

            const tileId = gameState.mapData[y]?.[x];
            if (tileId === undefined) return false;

            const tileInfo = window.tileDataById ? window.tileDataById[tileId] : null;
            if (!tileInfo) return false;

            if (tileInfo.access === "blocked") {
                return false;
            }

            if (Array.isArray(tileInfo.access)) {
                return tileInfo.access.includes('player');
            }

            return true;
        },

        getVehiclesForRender() {
            return this.vehicles.filter(v => {
                if (this.isVehicleRemoved(v.id)) return false;
                if (this.isVehicleHidden(v.id)) return false;
                
                if (this.currentVehicle && this.currentVehicle.id === v.id) {
                    return false;
                }
                
                return true;
            });
        },

        getCurrentVehicle() {
            return this.currentVehicle;
        },

        reset(gameState) {
            if (this.isBoarded() && gameState) {
                gameState.characterType = 'player';
                gameState.spriteImage = this.originalPlayerSprite;
                gameState.spriteFrameWidth = this.originalSpriteFrameWidth;
                gameState.spriteFrameHeight = this.originalSpriteFrameHeight;
            }
            
            this.vehicleStates = {};
            this.currentVehicle = null;
            this.originalPlayerSprite = null;
            this.originalSpriteFrameWidth = 0;
            this.originalSpriteFrameHeight = 0;
            
            for (const vehicle of this.vehicles) {
                if (vehicle.originalX !== undefined && vehicle.originalY !== undefined) {
                    vehicle.x = vehicle.originalX;
                    vehicle.y = vehicle.originalY;
                }
            }
        },

        resetToSnapshot(snapshot, gameState) {
            this.reset(gameState);
            
            if (snapshot && snapshot.vehicleStates) {
                this.vehicleStates = JSON.parse(JSON.stringify(snapshot.vehicleStates));
            }
        },

        getSnapshot() {
            return {
                vehicleStates: JSON.parse(JSON.stringify(this.vehicleStates)),
                currentVehicleId: this.currentVehicle ? this.currentVehicle.id : null
            };
        }
    };

    window.VehicleInteractionManager = VehicleInteractionManager;

    console.log('[VehicleInteraction] Module loaded');
})();
