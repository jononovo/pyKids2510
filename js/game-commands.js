// ============================================
// GAME COMMANDS - Single Source of Truth
// All game commands are defined here once.
// Skulpt wrappers are auto-generated.
// ============================================

(function() {
    'use strict';

    // ========== HELPER FUNCTIONS ==========
    
    function findObjectAt(x, y, type) {
        if (!gameState.objects) return null;
        return gameState.objects.find(obj => obj.x === x && obj.y === y && obj.type === type);
    }

    function updateInventoryDisplay() {
        const inventoryPanel = document.getElementById('inventory-panel');
        if (inventoryPanel && gameState.inventory) {
            inventoryPanel.innerHTML = '<strong>Inventory:</strong><br>';
            for (const [item, count] of Object.entries(gameState.inventory)) {
                const itemDiv = document.createElement('div');
                itemDiv.textContent = `${item}: ${count}`;
                inventoryPanel.appendChild(itemDiv);
            }
        }
    }

    function getTargetPosition() {
        const { x, y } = gameState.playerPos;
        const px = Math.floor(x);
        const py = Math.floor(y);
        let targetX = px, targetY = py;
        
        switch (gameState.playerDirection) {
            case 'up': targetY--; break;
            case 'down': targetY++; break;
            case 'left': targetX--; break;
            case 'right': targetX++; break;
        }
        return { px, py, targetX, targetY };
    }

    function getAnimationDuration(fraction = 1) {
        return SPEED_SETTINGS[currentSpeed].duration * fraction;
    }

    // ========== COMMAND DEFINITIONS ==========
    // Add new commands here - they will automatically be available in Python
    
    const GameCommands = {
        move_forward: {
            args: ['steps'],
            defaults: { steps: 1 },
            countsAsMultiple: true,
            execute: async function(steps) {
                steps = parseInt(steps) || 1;
                let moved = 0;
                
                for (let i = 0; i < steps; i++) {
                    const { x, y } = gameState.playerPos;
                    let newX = Math.floor(x);
                    let newY = Math.floor(y);
                    
                    switch (gameState.playerDirection) {
                        case 'up': newY--; break;
                        case 'down': newY++; break;
                        case 'left': newX--; break;
                        case 'right': newX++; break;
                    }
                    
                    if (canMoveTo(newX, newY)) {
                        await animateMove(x, y, newX, newY, gameState.playerDirection);
                        moved++;
                    } else {
                        break;
                    }
                }
                
                checkWinCondition();
                return moved;
            }
        },

        turn_left: {
            execute: async function() {
                const directions = ['up', 'left', 'down', 'right'];
                const currentIndex = directions.indexOf(gameState.playerDirection);
                gameState.playerDirection = directions[(currentIndex + 1) % 4];
                
                await new Promise(resolve => {
                    setTimeout(() => { render(); resolve(); }, getAnimationDuration(0.5));
                });
            }
        },

        turn_right: {
            execute: async function() {
                const directions = ['up', 'right', 'down', 'left'];
                const currentIndex = directions.indexOf(gameState.playerDirection);
                gameState.playerDirection = directions[(currentIndex + 1) % 4];
                
                await new Promise(resolve => {
                    setTimeout(() => { render(); resolve(); }, getAnimationDuration(0.5));
                });
            }
        },

        push: {
            execute: async function() {
                const { targetX, targetY } = getTargetPosition();
                const object = findObjectAt(targetX, targetY, 'pushable');
                
                if (object) {
                    let newX = targetX, newY = targetY;
                    switch (gameState.playerDirection) {
                        case 'up': newY--; break;
                        case 'down': newY++; break;
                        case 'left': newX--; break;
                        case 'right': newX++; break;
                    }
                    
                    if (canMoveTo(newX, newY)) {
                        object.x = newX;
                        object.y = newY;
                        await render();
                    }
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration(0.5)));
            }
        },

        speak: {
            args: ['message'],
            defaults: { message: '' },
            execute: async function(message) {
                if (!message) return;
                message = String(message).replace(/^["']|["']$/g, '');
                
                if (!gameState.messageLog) gameState.messageLog = [];
                gameState.messageLog.push(message);
                
                const messagePanel = document.getElementById('message-panel');
                if (messagePanel) {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message-item';
                    msgDiv.textContent = message;
                    messagePanel.appendChild(msgDiv);
                    messagePanel.scrollTop = messagePanel.scrollHeight;
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration()));
            }
        },

        collect: {
            args: ['resource'],
            defaults: { resource: 'item' },
            execute: async function(resource) {
                const { px, py } = getTargetPosition();
                const collectibleIndex = gameState.collectibles.findIndex(
                    c => c.x === px && c.y === py && !c.collected
                );
                
                if (collectibleIndex >= 0) {
                    gameState.collectibles[collectibleIndex].collected = true;
                    if (!gameState.inventory) gameState.inventory = {};
                    const resourceType = resource || 'item';
                    gameState.inventory[resourceType] = (gameState.inventory[resourceType] || 0) + 1;
                    updateInventoryDisplay();
                    await render();
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration(0.5)));
            }
        },

        water: {
            execute: async function() {
                const { px, py } = getTargetPosition();
                const crop = findObjectAt(px, py, 'crop');
                
                if (crop && !crop.watered) {
                    crop.watered = true;
                    await render();
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration(0.5)));
            }
        },

        open: {
            execute: async function() {
                const { targetX, targetY } = getTargetPosition();
                const door = findObjectAt(targetX, targetY, 'door');
                
                if (door) {
                    door.open = true;
                    await render();
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration(0.5)));
            }
        },

        close: {
            execute: async function() {
                const { targetX, targetY } = getTargetPosition();
                const door = findObjectAt(targetX, targetY, 'door');
                
                if (door) {
                    door.open = false;
                    await render();
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration(0.5)));
            }
        },

        place: {
            args: ['item'],
            defaults: { item: null },
            execute: async function(item) {
                if (!item) return;
                const { targetX, targetY } = getTargetPosition();
                const chest = findObjectAt(targetX, targetY, 'chest');
                
                if (chest) {
                    if (!chest.contents) chest.contents = [];
                    chest.contents.push(item);
                    await render();
                }
                
                await new Promise(r => setTimeout(r, getAnimationDuration(0.5)));
            }
        },

        build: {
            args: ['objectName'],
            defaults: { objectName: null },
            execute: async function(objectName) {
                if (!objectName) return;
                const { targetX, targetY } = getTargetPosition();
                
                if (!gameState.objects) gameState.objects = [];
                gameState.objects.push({ type: objectName, x: targetX, y: targetY, built: true });
                
                if (objectName === 'bridge' && gameState.mapData[targetY]) {
                    gameState.mapData[targetY][targetX] = TILES.PATH;
                }
                
                await render();
                await new Promise(r => setTimeout(r, getAnimationDuration()));
            }
        }
    };

    // ========== SKULPT WRAPPER GENERATOR ==========
    
    var commandCounter = 0;

    window.incrementSkulptCommandCounter = function() {
        commandCounter++;
    };

    function createSkulptWrapper(cmdName, cmdDef) {
        return new Sk.builtin.func(function() {
            var args = Array.prototype.slice.call(arguments);
            var jsArgs = {};
            
            if (cmdDef.args) {
                cmdDef.args.forEach(function(argName, i) {
                    if (args[i] !== undefined) {
                        jsArgs[argName] = Sk.ffi.remapToJs(args[i]);
                    } else if (cmdDef.defaults && cmdDef.defaults[argName] !== undefined) {
                        jsArgs[argName] = cmdDef.defaults[argName];
                    }
                });
            }
            
            return Sk.misceval.promiseToSuspension(
                (async function() {
                    var firstArg = cmdDef.args ? jsArgs[cmdDef.args[0]] : undefined;
                    var result = await cmdDef.execute(firstArg);
                    
                    if (cmdDef.countsAsMultiple && typeof result === 'number') {
                        commandCounter += result;
                    } else {
                        commandCounter++;
                    }
                    return Sk.builtin.none.none$;
                })()
            );
        });
    }

    window.playerBuiltinModule = function(name) {
        var mod = {};
        for (var cmdName in GameCommands) {
            mod[cmdName] = createSkulptWrapper(cmdName, GameCommands[cmdName]);
        }
        return mod;
    };

    // ========== GAME CONTROL FUNCTIONS ==========
    
    window.runCode = async function() {
        if (window.SkulptRuntime) {
            await window.SkulptRuntime.runCode();
        } else {
            console.error('Skulpt runtime not loaded');
        }
    };

    window.resetGame = function() {
        gameState.playerPos = {...gameState.startPos};
        gameState.playerDirection = 'right';
        gameState.isRunning = false;
        document.getElementById('run-btn').disabled = false;
        
        if (gameState.collectibles) {
            gameState.collectibles.forEach(c => c.collected = false);
        }
        
        gameState.messageLog = [];
        const messagePanel = document.getElementById('message-panel');
        if (messagePanel) {
            messagePanel.innerHTML = '';
        }
        
        render();
        updateViewport();
    };

    // ========== EXPORTS ==========
    
    window.GameCommands = GameCommands;
    window.getCommandCount = function() { return commandCounter; };
    window.resetCommandCounter = function() { commandCounter = 0; };

    console.log('[Game Commands] Loaded successfully');
})();
