// ============================================
// SCENERY MANAGER
// Handles walkable scenery objects (terrain features, decorations)
// Includes both single-tile (tree, bush, flower) and multi-tile (mountains)
// Unlike elements, scenery does NOT block player movement
// Multi-tile scenery placed by upper-left corner, extends right and down
// ============================================

(function() {
    'use strict';

    const SceneryManager = {
        manifest: null,
        scenery: [],
        
        async init() {
            await this.loadManifest();
            console.log('[Scenery] Initialized');
        },

        async loadManifest() {
            try {
                const response = await fetch('/assets/map/scenery.json');
                this.manifest = await response.json();
                console.log('[Scenery] Manifest loaded:', 
                    Object.keys(this.manifest.scenery || {}).length, 'scenery items');
            } catch (error) {
                console.warn('[Scenery] Could not load manifest, using defaults');
                this.manifest = { scenery: {} };
            }
        },

        getDefinition(type) {
            if (!this.manifest || !this.manifest.scenery) return null;
            return this.manifest.scenery[type] || null;
        },

        parseScenery(sceneryData) {
            const parsed = [];
            
            if (!sceneryData || !Array.isArray(sceneryData)) return parsed;

            for (const item of sceneryData) {
                if (!Array.isArray(item) || item.length < 2) continue;

                const sceneryType = item[0];
                if (typeof sceneryType !== 'string') continue;

                const definition = this.getDefinition(sceneryType);
                if (!definition) {
                    console.warn('[Scenery] Unknown type:', sceneryType);
                    continue;
                }

                const coordsData = item[1];
                
                if (Array.isArray(coordsData)) {
                    if (coordsData.length === 2 && 
                        typeof coordsData[0] === 'number' && 
                        typeof coordsData[1] === 'number') {
                        parsed.push(this._createScenery(sceneryType, definition, coordsData[0], coordsData[1]));
                    } else {
                        for (const coord of coordsData) {
                            if (Array.isArray(coord) && coord.length >= 2) {
                                parsed.push(this._createScenery(sceneryType, definition, coord[0], coord[1]));
                            }
                        }
                    }
                }
            }

            return parsed;
        },

        _createScenery(type, definition, x, y) {
            return {
                type: type,
                x: x,
                y: y,
                width: definition.width || 1,
                height: definition.height || 1,
                path: definition.path,
                fallbackColor: definition.fallbackColor,
                id: this._generateId(type, x, y)
            };
        },

        _generateId(type, x, y) {
            return `scenery_${type}_${x}_${y}`;
        },

        async loadLevelScenery(levelData) {
            this.scenery = [];
            
            if (!this.manifest) {
                await this.loadManifest();
            }
            
            if (levelData.map && levelData.map.scenery) {
                this.scenery = this.parseScenery(levelData.map.scenery);
            }
            
            console.log('[Scenery] Loaded', this.scenery.length, 'scenery items for level');
            return this.scenery;
        },

        getSceneryForRender() {
            return this.scenery;
        },

        getSceneryAt(x, y) {
            for (const item of this.scenery) {
                if (x >= item.x && x < item.x + item.width &&
                    y >= item.y && y < item.y + item.height) {
                    return item;
                }
            }
            return null;
        },

        reset() {
            this.scenery = [];
        }
    };

    window.SceneryManager = SceneryManager;

    console.log('[Scenery] Module loaded');
})();
