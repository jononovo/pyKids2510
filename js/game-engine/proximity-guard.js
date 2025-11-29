// ============================================
// PROXIMITY GUARD - Unified Position Validation
// ============================================
// Centralizes all proximity/position checks for game commands.
// Provides consistent error messages and element lookup.

(function() {
    'use strict';

    // ========== ERROR MESSAGES ==========
    const Messages = {
        NO_MANAGER: 'Cannot access items right now. Try again.',
        NOTHING_HERE: 'Nothing to collect here! Move to an item first.',
        WRONG_TYPE: 'This is a {actual}, not a {expected}!',
        CANNOT_COLLECT: 'This cannot be collected!',
        NO_VEHICLE: 'No vehicle here to board.',
        ALREADY_BOARDED: 'You are already in a vehicle!',
        NO_LAND_NEARBY: 'No suitable land nearby to disembark.',
        CANNOT_PUSH: 'Nothing to push here.',
        CANNOT_OPEN: 'Nothing to open here.',
        TILE_BLOCKED: 'The way is blocked.'
    };

    // ========== POSITION HELPERS ==========
    
    function getPlayerPosition() {
        if (typeof gameState === 'undefined') return null;
        return {
            x: Math.floor(gameState.playerPos.x),
            y: Math.floor(gameState.playerPos.y)
        };
    }

    function getForwardPosition() {
        if (typeof gameState === 'undefined') return null;
        const pos = getPlayerPosition();
        if (!pos) return null;
        
        let targetX = pos.x;
        let targetY = pos.y;
        
        switch (gameState.playerDirection) {
            case 'up': targetY--; break;
            case 'down': targetY++; break;
            case 'left': targetX--; break;
            case 'right': targetX++; break;
        }
        
        return { x: targetX, y: targetY };
    }

    function getAdjacentPositions() {
        const pos = getPlayerPosition();
        if (!pos) return [];
        
        return [
            { x: pos.x + 1, y: pos.y },
            { x: pos.x - 1, y: pos.y },
            { x: pos.x, y: pos.y + 1 },
            { x: pos.x, y: pos.y - 1 }
        ];
    }

    function getPositionsForMode(mode) {
        if (mode === 'self') {
            const pos = getPlayerPosition();
            return pos ? [pos] : [];
        }
        
        if (mode === 'forward') {
            const pos = getForwardPosition();
            return pos ? [pos] : [];
        }
        
        if (mode === 'adjacent') {
            return getAdjacentPositions();
        }
        
        if (typeof mode === 'object' && mode.radius) {
            const pos = getPlayerPosition();
            if (!pos) return [];
            
            const positions = [];
            const r = mode.radius;
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    positions.push({ x: pos.x + dx, y: pos.y + dy });
                }
            }
            return positions;
        }
        
        return [];
    }

    // ========== LOOKUP HELPERS ==========

    function findElementAt(x, y, sections, typeMatch) {
        if (!window.ElementInteractionManager) return null;
        
        const element = ElementInteractionManager.getElementAt(x, y);
        if (!element) return null;
        
        if (sections && sections.length > 0) {
            if (!sections.includes(element.section)) return null;
        }
        
        if (typeMatch && element.type !== typeMatch) {
            return { element, mismatch: true, actualType: element.type };
        }
        
        return { element, mismatch: false };
    }

    function findVehicleAt(x, y) {
        if (!window.VehicleInteractionManager) return null;
        return VehicleInteractionManager.getVehicleAt(x, y);
    }

    // ========== ERROR FORMATTING ==========

    function formatMessage(template, context) {
        let msg = template;
        for (const key in context) {
            msg = msg.replace('{' + key + '}', context[key]);
        }
        return msg;
    }

    // ========== MAIN API ==========

    function check(config) {
        const {
            mode = 'self',
            sections = ['collectibles'],
            typeMatch = null,
            includeVehicles = false
        } = config;

        const result = {
            success: false,
            element: null,
            vehicle: null,
            position: null,
            message: null,
            errorCode: null
        };

        if (sections.includes('collectibles') || sections.includes('transforms')) {
            if (!window.ElementInteractionManager) {
                result.message = Messages.NO_MANAGER;
                result.errorCode = 'NO_MANAGER';
                return result;
            }
        }

        if (includeVehicles && !window.VehicleInteractionManager) {
            result.message = Messages.NO_MANAGER;
            result.errorCode = 'NO_MANAGER';
            return result;
        }

        const positions = getPositionsForMode(mode);
        
        for (const pos of positions) {
            if (sections.length > 0) {
                const elementResult = findElementAt(pos.x, pos.y, sections, typeMatch);
                
                if (elementResult) {
                    if (elementResult.mismatch) {
                        result.message = formatMessage(Messages.WRONG_TYPE, {
                            actual: elementResult.actualType,
                            expected: typeMatch
                        });
                        result.errorCode = 'WRONG_TYPE';
                        result.element = elementResult.element;
                        result.position = pos;
                        return result;
                    }
                    
                    result.success = true;
                    result.element = elementResult.element;
                    result.position = pos;
                    return result;
                }
            }
            
            if (includeVehicles) {
                const vehicle = findVehicleAt(pos.x, pos.y);
                if (vehicle) {
                    result.success = true;
                    result.vehicle = vehicle;
                    result.position = pos;
                    return result;
                }
            }
        }

        result.message = Messages.NOTHING_HERE;
        result.errorCode = 'NOTHING_HERE';
        return result;
    }

    function require(config) {
        const result = check(config);
        
        if (!result.success) {
            const errorMsg = config.errorMessage || result.message || Messages.NOTHING_HERE;
            if (window.showGameMessage) window.showGameMessage(errorMsg, 'error');
            throw new Error(errorMsg);
        }
        
        return result;
    }

    function consume(element, gs) {
        if (!element) return { success: false, message: 'No element to consume' };
        
        if (!window.ElementInteractionManager) {
            return { success: false, message: Messages.NO_MANAGER };
        }
        
        gs = gs || (typeof gameState !== 'undefined' ? gameState : null);
        if (!gs) {
            return { success: false, message: 'Game state not available' };
        }
        
        console.log('[ProximityGuard] Consuming element:', element.type, 'at', element.x, element.y);
        return ElementInteractionManager.activateElement(element, gs);
    }

    // ========== EXPORTS ==========

    window.ProximityGuard = {
        check: check,
        require: require,
        consume: consume,
        Messages: Messages,
        
        getPlayerPosition: getPlayerPosition,
        getForwardPosition: getForwardPosition,
        getAdjacentPositions: getAdjacentPositions
    };

    console.log('[ProximityGuard] Module loaded');
})();
