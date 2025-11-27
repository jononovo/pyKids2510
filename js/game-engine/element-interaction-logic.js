// ============================================
// ELEMENT INTERACTION LOGIC
// Handles interactive elements placed over tiles
// ============================================

(function() {
    'use strict';

    const ElementInteractionManager = {
        manifest: null,
        elements: [],
        elementStates: {},
        
        async init() {
            await this.loadManifest();
            console.log('[ElementInteraction] Initialized');
        },

        async loadManifest() {
            try {
                const response = await fetch('/assets/map/elements.json');
                this.manifest = await response.json();
                console.log('[ElementInteraction] Manifest loaded:', 
                    Object.keys(this.manifest.elements || {}).length, 'elements');
            } catch (error) {
                console.warn('[ElementInteraction] Could not load elements manifest, using defaults');
                this.manifest = { elements: {} };
            }
        },

        getElementDefinition(type) {
            if (!this.manifest || !this.manifest.elements) return null;
            return this.manifest.elements[type] || null;
        },

        parseElementSection(sectionName, sectionData) {
            const parsed = [];
            
            if (!sectionData || !Array.isArray(sectionData)) return parsed;

            for (const item of sectionData) {
                if (!Array.isArray(item)) continue;

                const elementType = item[0];
                if (typeof elementType !== 'string') continue;

                let replacement = null;
                let coordsData = null;
                let startIndex = 1;

                if (sectionName === 'transforms' && item.length >= 2) {
                    if (typeof item[1] === 'string') {
                        replacement = item[1];
                        startIndex = 2;
                    }
                }

                for (let i = startIndex; i < item.length; i++) {
                    const data = item[i];
                    
                    if (Array.isArray(data)) {
                        const elements = this._parseCoordArray(elementType, replacement, data, sectionName);
                        parsed.push(...elements);
                    } else if (typeof data === 'object' && data.trigger && data.at) {
                        const elements = this._parseCoordArray(elementType, replacement, data.at, sectionName, data.trigger);
                        parsed.push(...elements);
                    }
                }
            }

            return parsed;
        },

        _parseCoordArray(elementType, replacement, coords, sectionName, triggerOverride = null) {
            const elements = [];
            const defaultTrigger = this._getDefaultTrigger(sectionName);
            
            if (!Array.isArray(coords)) return elements;

            if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                elements.push({
                    type: elementType,
                    x: coords[0],
                    y: coords[1],
                    trigger: triggerOverride || defaultTrigger,
                    section: sectionName,
                    replacement: replacement,
                    id: this._generateId(elementType, coords[0], coords[1])
                });
            } else {
                for (const coord of coords) {
                    if (Array.isArray(coord) && coord.length >= 2) {
                        elements.push({
                            type: elementType,
                            x: coord[0],
                            y: coord[1],
                            trigger: triggerOverride || defaultTrigger,
                            section: sectionName,
                            replacement: replacement,
                            id: this._generateId(elementType, coord[0], coord[1])
                        });
                    }
                }
            }

            return elements;
        },

        _getDefaultTrigger(sectionName) {
            const defaults = {
                'collectibles': 'on_collect',
                'transforms': 'on_interact',
                'vehicles': 'on_interact'
            };
            return defaults[sectionName] || 'on_interact';
        },

        _generateId(type, x, y) {
            return `${type}_${x}_${y}`;
        },

        _getTargetX(x, direction) {
            if (direction === 'left') return x - 1;
            if (direction === 'right') return x + 1;
            return x;
        },

        _getTargetY(y, direction) {
            if (direction === 'up') return y - 1;
            if (direction === 'down') return y + 1;
            return y;
        },

        loadLevelElements(levelData) {
            this.elements = [];
            
            if (levelData.map && levelData.map.collectibles) {
                const parsed = this.parseElementSection('collectibles', levelData.map.collectibles);
                this.elements.push(...parsed);
            }

            if (levelData.map && levelData.map.transforms) {
                const parsed = this.parseElementSection('transforms', levelData.map.transforms);
                this.elements.push(...parsed);
            }

            if (window.VehicleInteractionManager) {
                VehicleInteractionManager.loadLevelVehicles(levelData);
            }

            this.restoreStates();
            
            console.log('[ElementInteraction] Loaded', this.elements.length, 'elements for level');
            return this.elements;
        },

        getElementAt(x, y) {
            return this.elements.find(e => 
                e.x === x && e.y === y && !this.isElementRemoved(e.id)
            );
        },

        getElementsForRender() {
            return this.elements.filter(e => !this.isElementRemoved(e.id));
        },

        isElementRemoved(elementId) {
            const state = this.elementStates[elementId];
            return state && state.removed;
        },

        getElementState(elementId) {
            return this.elementStates[elementId] || null;
        },

        handlePlayerStep(x, y, gameState) {
            const element = this.getElementAt(x, y);
            if (!element) return null;
            
            if (element.trigger === 'on_step') {
                return this.activateElement(element, gameState);
            }
            
            return null;
        },

        handleCollect(x, y, gameState) {
            const element = this.getElementAt(x, y);
            if (!element) return { success: false, message: 'Nothing to collect here' };
            
            if (element.section !== 'collectibles') {
                return { success: false, message: 'This cannot be collected' };
            }
            
            if (element.trigger === 'on_collect' || element.trigger === 'on_step') {
                return this.activateElement(element, gameState);
            }
            
            return { success: false, message: 'Cannot collect this' };
        },

        handleInteract(x, y, gameState) {
            if (window.VehicleInteractionManager) {
                if (VehicleInteractionManager.isBoarded()) {
                    return VehicleInteractionManager.handleInteract(x, y, gameState);
                }
                
                const targetX = this._getTargetX(x, gameState.playerDirection);
                const targetY = this._getTargetY(y, gameState.playerDirection);
                const vehicle = VehicleInteractionManager.getVehicleAt(targetX, targetY);
                if (vehicle) {
                    return VehicleInteractionManager.handleBoard(vehicle, gameState);
                }
            }
            
            const element = this.getElementAt(x, y);
            if (!element) return { success: false, message: 'Nothing to interact with here' };
            
            if (element.section === 'collectibles') {
                return { success: false, message: 'Use collect() for this item' };
            }
            
            if (element.trigger === 'on_interact' || element.trigger === 'on_step') {
                return this.activateElement(element, gameState);
            }
            
            return { success: false, message: 'Cannot interact with this' };
        },

        activateElement(element, gameState) {
            const result = {
                success: true,
                element: element,
                action: null,
                message: ''
            };

            if (element.section === 'collectibles') {
                result.action = 'collected';
                result.message = `Collected ${element.type}`;
                
                this.elementStates[element.id] = { removed: true };
                
                if (!gameState.inventory) gameState.inventory = {};
                gameState.inventory[element.type] = (gameState.inventory[element.type] || 0) + 1;
                
                if (window.MissionState && window.MissionState.isMissionLevel) {
                    window.MissionState.addToInventory(element.type, 1);
                    window.MissionState.markItemCollected(element.x, element.y, element.type);
                }
            } else if (element.section === 'transforms') {
                if (element.replacement) {
                    result.action = 'transformed';
                    result.message = `${element.type} transformed to ${element.replacement}`;
                    
                    this.elementStates[element.id] = { 
                        removed: false, 
                        transformed: true,
                        newType: element.replacement 
                    };
                    
                    element.type = element.replacement;
                    element.replacement = null;
                } else {
                    result.action = 'removed';
                    result.message = `${element.type} disappeared`;
                    
                    this.elementStates[element.id] = { removed: true };
                }
            }

            this.persistStates();
            
            return result;
        },

        persistStates() {
            if (window.MissionState && window.MissionState.isMissionLevel) {
                window.MissionState.setElementStates(this.elementStates);
            }
        },

        restoreStates() {
            if (window.MissionState && window.MissionState.isMissionLevel) {
                const savedStates = window.MissionState.getElementStates();
                if (savedStates) {
                    this.elementStates = { ...savedStates };
                    
                    for (const [id, state] of Object.entries(this.elementStates)) {
                        if (state.transformed && state.newType) {
                            const element = this.elements.find(e => e.id === id);
                            if (element) {
                                element.type = state.newType;
                                element.replacement = null;
                            }
                        }
                    }
                }
            }
        },

        reset(gameState) {
            this.elements = [];
            this.elementStates = {};
            
            if (window.VehicleInteractionManager) {
                VehicleInteractionManager.reset(gameState);
            }
        },

        resetToSnapshot(snapshot) {
            if (snapshot && snapshot.elementStates) {
                this.elementStates = JSON.parse(JSON.stringify(snapshot.elementStates));
            } else {
                this.elementStates = {};
            }
        },

        getSnapshot() {
            return {
                elementStates: JSON.parse(JSON.stringify(this.elementStates))
            };
        }
    };

    window.ElementInteractionManager = ElementInteractionManager;

    console.log('[ElementInteraction] Module loaded');
})();
