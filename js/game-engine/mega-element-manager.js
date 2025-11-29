// ============================================
// MEGA ELEMENT MANAGER
// Handles multi-tile elements (houses, mountains, etc.)
// Placed by upper-left corner, extends right and down
// Now uses unified elements.json via ElementInteractionManager
// ============================================

(function() {
    'use strict';

    const MegaElementManager = {
        elements: [],
        blockedTileCache: new Map(),
        
        async init() {
            console.log('[MegaElement] Initialized (using unified elements.json)');
        },

        getDefinition(type) {
            if (window.ElementInteractionManager && ElementInteractionManager.manifest && ElementInteractionManager.getElementDefinition) {
                return ElementInteractionManager.getElementDefinition(type);
            }
            return null;
        },
        
        async ensureManifestLoaded() {
            if (window.ElementInteractionManager) {
                if (!ElementInteractionManager.manifest) {
                    await ElementInteractionManager.loadManifest();
                }
            }
        },

        parseMegaElements(megaElementsData) {
            const parsed = [];
            
            if (!megaElementsData || !Array.isArray(megaElementsData)) return parsed;

            for (const item of megaElementsData) {
                if (!Array.isArray(item) || item.length < 2) continue;

                const elementType = item[0];
                if (typeof elementType !== 'string') continue;

                const definition = this.getDefinition(elementType);
                if (!definition) {
                    console.warn('[MegaElement] Unknown type:', elementType);
                    continue;
                }

                const coordsData = item[1];
                const expandedCoords = window.CoordUtils 
                    ? CoordUtils.expandCoordinates(coordsData) 
                    : this._fallbackExpandCoordinates(coordsData);
                
                for (const coord of expandedCoords) {
                    parsed.push(this._createMegaElement(elementType, definition, coord.x, coord.y));
                }
            }

            return parsed;
        },
        
        _fallbackExpandCoordinates(coords) {
            if (!Array.isArray(coords)) return [];
            if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                return [{ x: coords[0], y: coords[1] }];
            }
            return coords.filter(c => Array.isArray(c) && c.length >= 2).map(c => ({ x: c[0], y: c[1] }));
        },

        _createMegaElement(type, definition, x, y) {
            return {
                type: type,
                x: x,
                y: y,
                width: definition.width || 1,
                height: definition.height || 1,
                path: definition.path,
                fallbackColor: definition.fallbackColor,
                blockedTiles: definition.blockedTiles,
                id: this._generateId(type, x, y)
            };
        },

        _generateId(type, x, y) {
            return `mega_${type}_${x}_${y}`;
        },

        async loadLevelMegaElements(levelData) {
            this.elements = [];
            this.blockedTileCache.clear();
            
            await this.ensureManifestLoaded();
            
            if (levelData.map && levelData.map.megaElements) {
                this.elements = this.parseMegaElements(levelData.map.megaElements);
                this._buildBlockedTileCache();
            }
            
            console.log('[Element] Loaded', this.elements.length, 'elements for level');
            return this.elements;
        },

        _buildBlockedTileCache() {
            this.blockedTileCache.clear();
            
            for (const element of this.elements) {
                const blockedPositions = this._getBlockedPositions(element);
                for (const pos of blockedPositions) {
                    const key = `${pos.x},${pos.y}`;
                    this.blockedTileCache.set(key, element);
                }
            }
        },

        _getBlockedPositions(element) {
            const positions = [];
            
            if (element.blockedTiles === 'all') {
                for (let dy = 0; dy < element.height; dy++) {
                    for (let dx = 0; dx < element.width; dx++) {
                        positions.push({ x: element.x + dx, y: element.y + dy });
                    }
                }
            } else if (Array.isArray(element.blockedTiles)) {
                for (const offset of element.blockedTiles) {
                    if (Array.isArray(offset) && offset.length >= 2) {
                        positions.push({ x: element.x + offset[0], y: element.y + offset[1] });
                    }
                }
            }
            
            return positions;
        },

        isTileBlocked(x, y) {
            const key = `${x},${y}`;
            return this.blockedTileCache.has(key);
        },

        getMegaElementAt(x, y) {
            const key = `${x},${y}`;
            return this.blockedTileCache.get(key) || null;
        },

        getElementsForRender() {
            return this.elements;
        },

        reset() {
            this.elements = [];
            this.blockedTileCache.clear();
        }
    };

    window.MegaElementManager = MegaElementManager;

    console.log('[MegaElement] Module loaded');
})();
