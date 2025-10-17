// Action Registry - Central definition of all game actions

class ActionRegistry {
    constructor() {
        this.actions = new Map();
        this.initializeActions();
    }
    
    initializeActions() {
        // Movement actions (existing)
        this.register('move_forward', {
            category: 'movement',
            validate: (state, params) => {
                const { x, y } = this.getNextPosition(state);
                return canMoveTo(x, y);
            },
            execute: async (state, params) => {
                const steps = params.steps || 1;
                for (let i = 0; i < steps; i++) {
                    await moveForward();
                }
            },
            description: 'Move character forward'
        });
        
        this.register('turn_left', {
            category: 'movement',
            validate: () => true,
            execute: async () => await turnLeft(),
            description: 'Turn character left'
        });
        
        this.register('turn_right', {
            category: 'movement',
            validate: () => true,
            execute: async () => await turnRight(),
            description: 'Turn character right'
        });
        
        // Object interaction actions
        this.register('push', {
            category: 'interaction',
            validate: (state, params) => {
                const frontTile = this.getFrontTile(state);
                if (!frontTile) return false;
                
                const object = state.getObjectAt(frontTile.x, frontTile.y);
                if (!object || !object.pushable) return false;
                
                const behindObject = this.getPositionBehindObject(state, frontTile);
                return canMoveTo(behindObject.x, behindObject.y);
            },
            execute: async (state, params) => {
                const frontTile = this.getFrontTile(state);
                const object = state.getObjectAt(frontTile.x, frontTile.y);
                const newPos = this.getPositionBehindObject(state, frontTile);
                
                await this.animatePush(object, frontTile, newPos);
                state.moveObject(object.id, newPos.x, newPos.y);
            },
            description: 'Push object in front of character'
        });
        
        this.register('open', {
            category: 'interaction',
            validate: (state, params) => {
                const frontTile = this.getFrontTile(state);
                if (!frontTile) return false;
                
                const object = state.getObjectAt(frontTile.x, frontTile.y);
                return object && object.type === 'door' && !object.isOpen;
            },
            execute: async (state, params) => {
                const frontTile = this.getFrontTile(state);
                const door = state.getObjectAt(frontTile.x, frontTile.y);
                
                // Check if door requires a key
                if (door.requiresKey) {
                    const hasKey = state.inventory.has(door.keyId);
                    if (!hasKey) {
                        await this.showMessage("You need a key to open this door");
                        return false;
                    }
                }
                
                await this.animateDoorOpen(door);
                door.isOpen = true;
                state.updateObject(door.id, { isOpen: true });
                
                return true;
            },
            description: 'Open a door or container'
        });
        
        this.register('close', {
            category: 'interaction',
            validate: (state, params) => {
                const frontTile = this.getFrontTile(state);
                if (!frontTile) return false;
                
                const object = state.getObjectAt(frontTile.x, frontTile.y);
                return object && object.type === 'door' && object.isOpen;
            },
            execute: async (state, params) => {
                const frontTile = this.getFrontTile(state);
                const door = state.getObjectAt(frontTile.x, frontTile.y);
                
                await this.animateDoorClose(door);
                door.isOpen = false;
                state.updateObject(door.id, { isOpen: false });
                
                return true;
            },
            description: 'Close a door or container'
        });
        
        this.register('collect', {
            category: 'interaction',
            validate: (state, params) => {
                const currentTile = { 
                    x: Math.floor(gameState.playerPos.x), 
                    y: Math.floor(gameState.playerPos.y) 
                };
                
                const object = state.getObjectAt(currentTile.x, currentTile.y);
                return object && object.collectable;
            },
            execute: async (state, params) => {
                const currentTile = { 
                    x: Math.floor(gameState.playerPos.x), 
                    y: Math.floor(gameState.playerPos.y) 
                };
                
                const item = state.getObjectAt(currentTile.x, currentTile.y);
                
                await this.animateCollect(item);
                state.addToInventory(item);
                state.removeObject(item.id);
                
                // Play collect sound
                playCollectSound();
                
                return true;
            },
            description: 'Collect an item'
        });
        
        this.register('build', {
            category: 'construction',
            validate: (state, params) => {
                const frontTile = this.getFrontTile(state);
                if (!frontTile) return false;
                
                const objectType = params.object;
                const requirements = this.getBuildRequirements(objectType);
                
                // Check if location is valid for building
                const tile = gameState.mapData[frontTile.y][frontTile.x];
                
                if (objectType === 'bridge') {
                    // Can only build bridges on water
                    return tile === TILES.WATER && state.hasResources(requirements);
                } else if (objectType === 'road') {
                    // Can build roads on grass
                    return tile === TILES.GRASS && state.hasResources(requirements);
                }
                
                return false;
            },
            execute: async (state, params) => {
                const frontTile = this.getFrontTile(state);
                const objectType = params.object;
                const requirements = this.getBuildRequirements(objectType);
                
                // Consume resources
                state.consumeResources(requirements);
                
                // Build animation
                await this.animateBuild(frontTile, objectType);
                
                // Update map
                if (objectType === 'bridge' || objectType === 'road') {
                    gameState.mapData[frontTile.y][frontTile.x] = TILES.PATH;
                }
                
                // Add constructed object to world
                state.addObject({
                    id: `${objectType}_${Date.now()}`,
                    type: objectType,
                    x: frontTile.x,
                    y: frontTile.y,
                    built: true
                });
                
                return true;
            },
            description: 'Build a structure'
        });
        
        this.register('speak', {
            category: 'communication',
            validate: () => true,
            execute: async (state, params) => {
                const message = params.message || "...";
                await this.showSpeechBubble(message);
                return true;
            },
            description: 'Display message above character'
        });
    }
    
    register(name, action) {
        this.actions.set(name, action);
    }
    
    get(name) {
        return this.actions.get(name);
    }
    
    getAll() {
        return Array.from(this.actions.entries());
    }
    
    // Helper methods
    getNextPosition(state) {
        const { x, y } = gameState.playerPos;
        let newX = Math.floor(x);
        let newY = Math.floor(y);
        
        switch (gameState.playerDirection) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        return { x: newX, y: newY };
    }
    
    getFrontTile(state) {
        return this.getNextPosition(state);
    }
    
    getPositionBehindObject(state, objectPos) {
        const dx = objectPos.x - Math.floor(gameState.playerPos.x);
        const dy = objectPos.y - Math.floor(gameState.playerPos.y);
        
        return {
            x: objectPos.x + dx,
            y: objectPos.y + dy
        };
    }
    
    getBuildRequirements(objectType) {
        const requirements = {
            'bridge': { wood: 3, nails: 5 },
            'road': { stone: 2 },
            'house': { wood: 10, stone: 5, nails: 20 },
            'fence': { wood: 2, nails: 3 }
        };
        
        return requirements[objectType] || {};
    }
    
    // Animation methods
    async animatePush(object, from, to) {
        return new Promise(resolve => {
            const startTime = Date.now();
            const duration = 400;
            
            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                // Update object position smoothly
                const currentX = from.x + (to.x - from.x) * easeProgress;
                const currentY = from.y + (to.y - from.y) * easeProgress;
                
                // Trigger re-render with object at new position
                if (window.gameActionsEngine) {
                    window.gameActionsEngine.worldState.updateObjectPosition(
                        object.id, currentX, currentY, true // temporary position
                    );
                }
                
                render();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            animate();
        });
    }
    
    async animateDoorOpen(door) {
        return new Promise(resolve => {
            // Simple fade out animation for door
            let opacity = 1;
            const fadeStep = 0.05;
            
            const fade = setInterval(() => {
                opacity -= fadeStep;
                if (opacity <= 0) {
                    clearInterval(fade);
                    resolve();
                }
                
                // Update door opacity in world state
                if (window.gameActionsEngine) {
                    window.gameActionsEngine.worldState.updateObject(door.id, {
                        opacity: opacity
                    });
                }
                
                render();
            }, 20);
        });
    }
    
    async animateDoorClose(door) {
        return new Promise(resolve => {
            // Fade in animation for door
            let opacity = 0;
            const fadeStep = 0.05;
            
            const fade = setInterval(() => {
                opacity += fadeStep;
                if (opacity >= 1) {
                    clearInterval(fade);
                    resolve();
                }
                
                // Update door opacity in world state
                if (window.gameActionsEngine) {
                    window.gameActionsEngine.worldState.updateObject(door.id, {
                        opacity: opacity
                    });
                }
                
                render();
            }, 20);
        });
    }
    
    async animateCollect(item) {
        return new Promise(resolve => {
            // Float up and fade out animation
            let offsetY = 0;
            let opacity = 1;
            
            const animate = setInterval(() => {
                offsetY -= 2;
                opacity -= 0.05;
                
                if (opacity <= 0) {
                    clearInterval(animate);
                    resolve();
                }
                
                // Update item visual state
                if (window.gameActionsEngine) {
                    window.gameActionsEngine.worldState.updateObject(item.id, {
                        visualOffset: { x: 0, y: offsetY },
                        opacity: opacity
                    });
                }
                
                render();
            }, 20);
        });
    }
    
    async animateBuild(position, objectType) {
        // Show building particles or construction animation
        return new Promise(resolve => {
            let frame = 0;
            const maxFrames = 30;
            
            const animate = setInterval(() => {
                frame++;
                
                if (frame >= maxFrames) {
                    clearInterval(animate);
                    resolve();
                }
                
                // Draw construction particles
                if (window.gameActionsEngine) {
                    window.gameActionsEngine.particleSystem.emit(
                        'construction',
                        position.x * TILE_SIZE + TILE_SIZE/2,
                        position.y * TILE_SIZE + TILE_SIZE/2
                    );
                }
                
                render();
            }, 33);
        });
    }
    
    async showMessage(text) {
        // Display message to player
        const messageDiv = document.createElement('div');
        messageDiv.className = 'game-message';
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 1000;
        `;
        
        document.body.appendChild(messageDiv);
        
        return new Promise(resolve => {
            setTimeout(() => {
                messageDiv.remove();
                resolve();
            }, 2000);
        });
    }
    
    async showSpeechBubble(text) {
        // Display speech bubble above character
        const bubble = document.createElement('div');
        bubble.className = 'speech-bubble';
        bubble.textContent = text;
        
        // Position above character
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        const charX = gameState.playerPos.x * TILE_SIZE + TILE_SIZE/2;
        const charY = gameState.playerPos.y * TILE_SIZE;
        
        bubble.style.cssText = `
            position: absolute;
            left: ${rect.left + charX}px;
            top: ${rect.top + charY - 40}px;
            background: white;
            border: 2px solid black;
            border-radius: 10px;
            padding: 5px 10px;
            font-size: 14px;
            z-index: 100;
            transform: translateX(-50%);
        `;
        
        // Add speech bubble tail
        const tail = document.createElement('div');
        tail.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid white;
        `;
        bubble.appendChild(tail);
        
        document.body.appendChild(bubble);
        
        return new Promise(resolve => {
            setTimeout(() => {
                bubble.remove();
                resolve();
            }, 3000);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActionRegistry;
}