// World State Manager - Tracks all interactive objects and their states

class WorldState {
    constructor() {
        this.objects = new Map();
        this.inventory = new Map();
        this.variables = new Map();
        this.triggers = new Map();
    }
    
    // Object management
    addObject(object) {
        this.objects.set(object.id, {
            ...object,
            originalX: object.x,
            originalY: object.y,
            visualOffset: { x: 0, y: 0 },
            opacity: 1
        });
    }
    
    removeObject(id) {
        this.objects.delete(id);
    }
    
    getObjectAt(x, y) {
        for (const [id, object] of this.objects) {
            if (Math.floor(object.x) === x && Math.floor(object.y) === y) {
                return object;
            }
        }
        return null;
    }
    
    getObjectsInArea(x1, y1, x2, y2) {
        const objectsInArea = [];
        for (const [id, object] of this.objects) {
            if (object.x >= x1 && object.x <= x2 && 
                object.y >= y1 && object.y <= y2) {
                objectsInArea.push(object);
            }
        }
        return objectsInArea;
    }
    
    updateObject(id, updates) {
        const object = this.objects.get(id);
        if (object) {
            this.objects.set(id, { ...object, ...updates });
        }
    }
    
    updateObjectPosition(id, x, y, temporary = false) {
        const object = this.objects.get(id);
        if (object) {
            if (temporary) {
                // For animations - don't update the logical position
                object.visualOffset = {
                    x: (x - object.originalX) * TILE_SIZE,
                    y: (y - object.originalY) * TILE_SIZE
                };
            } else {
                // Permanent position update
                object.x = x;
                object.y = y;
                object.originalX = x;
                object.originalY = y;
                object.visualOffset = { x: 0, y: 0 };
            }
        }
    }
    
    moveObject(id, x, y) {
        this.updateObjectPosition(id, x, y, false);
    }
    
    // Inventory management
    addToInventory(item) {
        const count = this.inventory.get(item.type) || 0;
        this.inventory.set(item.type, count + 1);
        
        // Trigger inventory UI update if it exists
        if (window.updateInventoryUI) {
            window.updateInventoryUI(this.inventory);
        }
    }
    
    removeFromInventory(itemType, count = 1) {
        const current = this.inventory.get(itemType) || 0;
        const newCount = Math.max(0, current - count);
        
        if (newCount === 0) {
            this.inventory.delete(itemType);
        } else {
            this.inventory.set(itemType, newCount);
        }
        
        // Update UI
        if (window.updateInventoryUI) {
            window.updateInventoryUI(this.inventory);
        }
    }
    
    hasItem(itemType, count = 1) {
        const current = this.inventory.get(itemType) || 0;
        return current >= count;
    }
    
    hasResources(requirements) {
        for (const [resource, amount] of Object.entries(requirements)) {
            if (!this.hasItem(resource, amount)) {
                return false;
            }
        }
        return true;
    }
    
    consumeResources(requirements) {
        for (const [resource, amount] of Object.entries(requirements)) {
            this.removeFromInventory(resource, amount);
        }
    }
    
    // Variable management for puzzles
    setVariable(name, value) {
        this.variables.set(name, value);
        
        // Check if this triggers any conditions
        this.checkTriggers();
    }
    
    getVariable(name) {
        return this.variables.get(name);
    }
    
    // Trigger system for chain reactions
    registerTrigger(condition, action) {
        const id = `trigger_${Date.now()}`;
        this.triggers.set(id, { condition, action });
        return id;
    }
    
    removeTrigger(id) {
        this.triggers.delete(id);
    }
    
    checkTriggers() {
        for (const [id, trigger] of this.triggers) {
            if (trigger.condition(this)) {
                trigger.action(this);
                
                // One-time triggers remove themselves
                if (trigger.once) {
                    this.removeTrigger(id);
                }
            }
        }
    }
    
    // State serialization for save/load
    serialize() {
        return {
            objects: Array.from(this.objects.entries()),
            inventory: Array.from(this.inventory.entries()),
            variables: Array.from(this.variables.entries())
        };
    }
    
    deserialize(data) {
        this.objects = new Map(data.objects);
        this.inventory = new Map(data.inventory);
        this.variables = new Map(data.variables);
    }
    
    // Helper methods for common queries
    getAllDoors() {
        const doors = [];
        for (const [id, object] of this.objects) {
            if (object.type === 'door') {
                doors.push(object);
            }
        }
        return doors;
    }
    
    getAllCollectibles() {
        const collectibles = [];
        for (const [id, object] of this.objects) {
            if (object.collectable) {
                collectibles.push(object);
            }
        }
        return collectibles;
    }
    
    getAllPushables() {
        const pushables = [];
        for (const [id, object] of this.objects) {
            if (object.pushable) {
                pushables.push(object);
            }
        }
        return pushables;
    }
    
    // Reset world to initial state
    reset() {
        this.objects.clear();
        this.inventory.clear();
        this.variables.clear();
        this.triggers.clear();
    }
    
    // Debug helpers
    debugPrint() {
        console.log('World State:');
        console.log('  Objects:', this.objects.size);
        for (const [id, obj] of this.objects) {
            console.log(`    ${id}: ${obj.type} at (${obj.x}, ${obj.y})`);
        }
        console.log('  Inventory:', this.inventory.size);
        for (const [item, count] of this.inventory) {
            console.log(`    ${item}: ${count}`);
        }
        console.log('  Variables:', this.variables.size);
        for (const [name, value] of this.variables) {
            console.log(`    ${name}: ${value}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldState;
}