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
        currentLevelData: null,
        
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
                    } else if (typeof data === 'object' && data.at) {
                        const options = {
                            trigger: data.trigger || null,
                            emit: data.emit || data.on_collect || data.on_step || data.on_interact || null,
                            spawn: data.spawn || null,
                            remove: data.remove || null,
                            on: data.on || null
                        };
                        const elements = this._parseCoordArray(elementType, replacement, data.at, sectionName, options);
                        parsed.push(...elements);
                    }
                }
            }

            return parsed;
        },

        _parseCoordArray(elementType, replacement, coords, sectionName, options = null) {
            const elements = [];
            const defaultTrigger = this._getDefaultTrigger(sectionName);
            const opts = (typeof options === 'object' && options !== null) ? options : { trigger: options };
            
            const expandedCoords = window.CoordUtils 
                ? CoordUtils.expandCoordinates(coords) 
                : this._fallbackExpandCoordinates(coords);
            
            for (const coord of expandedCoords) {
                elements.push({
                    type: elementType,
                    x: coord.x,
                    y: coord.y,
                    trigger: opts.trigger || defaultTrigger,
                    section: sectionName,
                    replacement: replacement,
                    id: this._generateId(elementType, coord.x, coord.y),
                    emit: opts.emit || null,
                    spawn: opts.spawn || null,
                    remove: opts.remove || null,
                    on: opts.on || null
                });
            }

            return elements;
        },
        
        _fallbackExpandCoordinates(coords) {
            if (!Array.isArray(coords)) return [];
            if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                return [{ x: coords[0], y: coords[1] }];
            }
            return coords.filter(c => Array.isArray(c) && c.length >= 2).map(c => ({ x: c[0], y: c[1] }));
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
            this.currentLevelData = levelData;
            this.elements = [];
            this.elementStates = {};
            
            this._parseElementsFromLevelData(levelData);

            if (window.VehicleInteractionManager) {
                VehicleInteractionManager.loadLevelVehicles(levelData);
            }

            this._registerSignalListeners();

            this.restoreStates();
            
            console.log('[ElementInteraction] Loaded', this.elements.length, 'elements for level');
            return this.elements;
        },
        
        _parseElementsFromLevelData(levelData) {
            this.elements = [];
            
            if (levelData.map && levelData.map.collectibles) {
                const parsed = this.parseElementSection('collectibles', levelData.map.collectibles);
                this.elements.push(...parsed);
            }

            if (levelData.map && levelData.map.transforms) {
                const parsed = this.parseElementSection('transforms', levelData.map.transforms);
                this.elements.push(...parsed);
            }
        },
        
        _registerSignalListeners() {
            if (!window.SignalManager) return;
            
            for (const element of this.elements) {
                if (element.spawn) {
                    this.elementStates[element.id] = { ...(this.elementStates[element.id] || {}), hidden: true };
                    
                    SignalManager.subscribe(element.spawn, () => {
                        console.log('[ElementInteraction] Spawn triggered for:', element.type, 'at', element.x, element.y);
                        const state = this.elementStates[element.id] || {};
                        this.elementStates[element.id] = { ...state, hidden: false };
                        this.persistStates();
                    });
                }
                
                if (element.remove) {
                    SignalManager.subscribe(element.remove, () => {
                        console.log('[ElementInteraction] Remove triggered for:', element.type, 'at', element.x, element.y);
                        this.elementStates[element.id] = { removed: true };
                        this.persistStates();
                    });
                }
                
                if (element.on && element.section === 'transforms') {
                    SignalManager.subscribe(element.on, () => {
                        console.log('[ElementInteraction] Transform triggered for:', element.type, 'at', element.x, element.y);
                        if (element.replacement) {
                            this.elementStates[element.id] = { 
                                removed: false, 
                                transformed: true,
                                newType: element.replacement 
                            };
                            element.type = element.replacement;
                            element.replacement = null;
                            
                            if (element.emit && window.SignalManager) {
                                SignalManager.emit(element.emit);
                            }
                        } else {
                            this.elementStates[element.id] = { removed: true };
                        }
                        this.persistStates();
                    });
                }
            }
        },

        getElementAt(x, y) {
            return this.elements.find(e => 
                e.x === x && e.y === y && !this.isElementRemoved(e.id) && !this.isElementHidden(e.id)
            );
        },

        getElementsForRender() {
            return this.elements.filter(e => !this.isElementRemoved(e.id) && !this.isElementHidden(e.id));
        },

        isElementRemoved(elementId) {
            const state = this.elementStates[elementId];
            return state && state.removed;
        },
        
        isElementHidden(elementId) {
            const state = this.elementStates[elementId];
            return state && state.hidden === true;
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

            if (element.emit && window.SignalManager) {
                console.log('[ElementInteraction] Emitting signal:', element.emit);
                SignalManager.emit(element.emit);
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
        
        reregisterSignalListeners() {
            this._registerSignalListeners();
        },

        resetStates() {
            if (this.currentLevelData) {
                this._parseElementsFromLevelData(this.currentLevelData);
                console.log('[ElementInteraction] Reloaded', this.elements.length, 'elements from level data');
            }
            
            this.elementStates = {};
            
            this._registerSignalListeners();
            console.log('[ElementInteraction] Re-registered signal listeners (set hidden defaults)');
            
            if (window.levelEntrySnapshot && window.levelEntrySnapshot.missionState && 
                window.levelEntrySnapshot.missionState.elementStates) {
                const snapshotStates = window.levelEntrySnapshot.missionState.elementStates;
                for (const key in snapshotStates) {
                    this.elementStates[key] = { ...(this.elementStates[key] || {}), ...snapshotStates[key] };
                }
                console.log('[ElementInteraction] Applied elementStates from snapshot');
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
