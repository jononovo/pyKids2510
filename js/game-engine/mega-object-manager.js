// ============================================
// MEGA OBJECT MANAGER
// Handles multi-tile walkable objects (terrain features, decorations)
// Unlike mega-elements, mega-objects do NOT block player movement
// Placed by upper-left corner, extends right and down
// ============================================

(function() {
    'use strict';

    const MegaObjectManager = {
        manifest: null,
        objects: [],
        
        async init() {
            await this.loadManifest();
            console.log('[MegaObject] Initialized');
        },

        async loadManifest() {
            try {
                const response = await fetch('/assets/map/mega-objects.json');
                this.manifest = await response.json();
                console.log('[MegaObject] Manifest loaded:', 
                    Object.keys(this.manifest.megaObjects || {}).length, 'mega-objects');
            } catch (error) {
                console.warn('[MegaObject] Could not load manifest, using defaults');
                this.manifest = { megaObjects: {} };
            }
        },

        getDefinition(type) {
            if (!this.manifest || !this.manifest.megaObjects) return null;
            return this.manifest.megaObjects[type] || null;
        },

        parseMegaObjects(megaObjectsData) {
            const parsed = [];
            
            if (!megaObjectsData || !Array.isArray(megaObjectsData)) return parsed;

            for (const item of megaObjectsData) {
                if (!Array.isArray(item) || item.length < 2) continue;

                const objectType = item[0];
                if (typeof objectType !== 'string') continue;

                const definition = this.getDefinition(objectType);
                if (!definition) {
                    console.warn('[MegaObject] Unknown type:', objectType);
                    continue;
                }

                const coordsData = item[1];
                
                if (Array.isArray(coordsData)) {
                    if (coordsData.length === 2 && 
                        typeof coordsData[0] === 'number' && 
                        typeof coordsData[1] === 'number') {
                        parsed.push(this._createMegaObject(objectType, definition, coordsData[0], coordsData[1]));
                    } else {
                        for (const coord of coordsData) {
                            if (Array.isArray(coord) && coord.length >= 2) {
                                parsed.push(this._createMegaObject(objectType, definition, coord[0], coord[1]));
                            }
                        }
                    }
                }
            }

            return parsed;
        },

        _createMegaObject(type, definition, x, y) {
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
            return `megaobj_${type}_${x}_${y}`;
        },

        async loadLevelMegaObjects(levelData) {
            this.objects = [];
            
            if (!this.manifest) {
                await this.loadManifest();
            }
            
            if (levelData.map && levelData.map.megaObjects) {
                this.objects = this.parseMegaObjects(levelData.map.megaObjects);
            }
            
            console.log('[MegaObject] Loaded', this.objects.length, 'mega-objects for level');
            return this.objects;
        },

        getObjectsForRender() {
            return this.objects;
        },

        getMegaObjectAt(x, y) {
            for (const obj of this.objects) {
                if (x >= obj.x && x < obj.x + obj.width &&
                    y >= obj.y && y < obj.y + obj.height) {
                    return obj;
                }
            }
            return null;
        },

        reset() {
            this.objects = [];
        }
    };

    window.MegaObjectManager = MegaObjectManager;

    console.log('[MegaObject] Module loaded');
})();
