// ============================================
// GAME COMMANDS - Single Source of Truth
// All game commands defined here once.
// Skulpt module source is generated at load time.
// ============================================

(function() {
    'use strict';

    // ========== HELPER FUNCTIONS ==========
    
    function findObjectAt(x, y, type) {
        if (!gameState.objects) return null;
        return gameState.objects.find(function(obj) { 
            return obj.x === x && obj.y === y && obj.type === type; 
        });
    }

    function updateInventoryDisplay() {
        var inventoryPanel = document.getElementById('inventory-panel');
        if (inventoryPanel && gameState.inventory) {
            inventoryPanel.innerHTML = '<strong>Inventory:</strong><br>';
            for (var item in gameState.inventory) {
                var itemDiv = document.createElement('div');
                itemDiv.textContent = item + ': ' + gameState.inventory[item];
                inventoryPanel.appendChild(itemDiv);
            }
        }
    }

    function getTargetPosition() {
        var pos = gameState.playerPos;
        var px = Math.floor(pos.x);
        var py = Math.floor(pos.y);
        var targetX = px, targetY = py;
        
        switch (gameState.playerDirection) {
            case 'up': targetY--; break;
            case 'down': targetY++; break;
            case 'left': targetX--; break;
            case 'right': targetX++; break;
        }
        return { px: px, py: py, targetX: targetX, targetY: targetY };
    }

    function getAnimationDuration(fraction) {
        fraction = fraction || 1;
        return SPEED_SETTINGS[currentSpeed].duration * fraction;
    }

    // ========== COMMAND DEFINITIONS ==========
    // Single source of truth: metadata + execute function
    // Both JS callers and Skulpt use these definitions
    
    var GameCommands = {
        move_forward: {
            args: ['steps'],
            defaults: { steps: 1 },
            countsAsMultiple: true,
            execute: async function(steps) {
                steps = parseInt(steps) || 1;
                var moved = 0;
                
                for (var i = 0; i < steps; i++) {
                    var pos = gameState.playerPos;
                    var x = pos.x, y = pos.y;
                    var newX = Math.floor(x);
                    var newY = Math.floor(y);
                    
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
            args: ['times'],
            defaults: { times: 1 },
            countsAsMultiple: true,
            execute: async function(times) {
                times = parseInt(times) || 1;
                var directions = ['up', 'left', 'down', 'right'];
                
                for (var i = 0; i < times; i++) {
                    var currentIndex = directions.indexOf(gameState.playerDirection);
                    gameState.playerDirection = directions[(currentIndex + 1) % 4];
                    
                    await new Promise(function(resolve) {
                        setTimeout(function() { render(); resolve(); }, getAnimationDuration(0.5));
                    });
                }
                
                return times;
            }
        },

        turn_right: {
            args: ['times'],
            defaults: { times: 1 },
            countsAsMultiple: true,
            execute: async function(times) {
                times = parseInt(times) || 1;
                var directions = ['up', 'right', 'down', 'left'];
                
                for (var i = 0; i < times; i++) {
                    var currentIndex = directions.indexOf(gameState.playerDirection);
                    gameState.playerDirection = directions[(currentIndex + 1) % 4];
                    
                    await new Promise(function(resolve) {
                        setTimeout(function() { render(); resolve(); }, getAnimationDuration(0.5));
                    });
                }
                
                return times;
            }
        },

        // ========== SIMPLIFIED ALIASES ==========
        // Short command names for beginners
        
        forward: {
            args: ['steps'],
            defaults: { steps: 1 },
            countsAsMultiple: true,
            aliasOf: 'move_forward'
        },

        left: {
            args: ['times'],
            defaults: { times: 1 },
            countsAsMultiple: true,
            aliasOf: 'turn_left'
        },

        right: {
            args: ['times'],
            defaults: { times: 1 },
            countsAsMultiple: true,
            aliasOf: 'turn_right'
        },

        push: {
            execute: async function() {
                var pos = getTargetPosition();
                var object = findObjectAt(pos.targetX, pos.targetY, 'pushable');
                
                if (object) {
                    var newX = pos.targetX, newY = pos.targetY;
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
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
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
                
                var messagePanel = document.getElementById('message-panel');
                if (messagePanel) {
                    var msgDiv = document.createElement('div');
                    msgDiv.className = 'message-item';
                    msgDiv.textContent = message;
                    messagePanel.appendChild(msgDiv);
                    messagePanel.scrollTop = messagePanel.scrollHeight;
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(1)); });
            }
        },

        collect: {
            args: ['resource'],
            defaults: { resource: 'item' },
            execute: async function(resource) {
                var pos = getTargetPosition();
                
                // Try ElementInteractionManager first (new system)
                if (window.ElementInteractionManager) {
                    var result = ElementInteractionManager.handleCollect(pos.px, pos.py, gameState);
                    if (result.success) {
                        console.log('[collect]', result.message);
                        updateInventoryDisplay();
                        await render();
                        await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
                        return;
                    }
                }
                
                // Fall back to legacy collectibles system
                var collectibleIndex = -1;
                var collectible = null;
                for (var i = 0; i < gameState.collectibles.length; i++) {
                    var c = gameState.collectibles[i];
                    if (c.x === pos.px && c.y === pos.py && !c.collected) {
                        collectibleIndex = i;
                        collectible = c;
                        break;
                    }
                }
                
                if (collectibleIndex >= 0) {
                    gameState.collectibles[collectibleIndex].collected = true;
                    if (!gameState.inventory) gameState.inventory = {};
                    var resourceType = collectible.type || resource || 'item';
                    gameState.inventory[resourceType] = (gameState.inventory[resourceType] || 0) + 1;
                    console.log('[collect] Collected', resourceType, 'at', collectible.x, collectible.y);
                    updateInventoryDisplay();
                    
                    // Record in MissionState if this is a mission level
                    var isMissionLevel = gameState.levelType === 'mission' || gameState.levelType === 'quest';
                    console.log('[collect] Level type:', gameState.levelType, '- isMission:', isMissionLevel);
                    if (isMissionLevel && window.MissionState && MissionState.isInitialized()) {
                        MissionState.recordCollectible(collectible.x, collectible.y, resourceType);
                        MissionState.addToInventory(resourceType, 1);
                    }
                    
                    await render();
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        interact: {
            args: [],
            defaults: {},
            execute: async function() {
                var pos = getTargetPosition();
                
                // Use ElementInteractionManager for transforms
                if (window.ElementInteractionManager) {
                    var result = ElementInteractionManager.handleInteract(pos.px, pos.py, gameState);
                    if (result.success) {
                        console.log('[interact]', result.message);
                        await render();
                        await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
                        return;
                    } else {
                        console.log('[interact]', result.message);
                    }
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        water: {
            execute: async function() {
                var pos = getTargetPosition();
                var crop = findObjectAt(pos.px, pos.py, 'crop');
                
                if (crop && !crop.watered) {
                    crop.watered = true;
                    await render();
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        open: {
            execute: async function() {
                var pos = getTargetPosition();
                var door = findObjectAt(pos.targetX, pos.targetY, 'door');
                
                if (door) {
                    door.open = true;
                    await render();
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        close: {
            execute: async function() {
                var pos = getTargetPosition();
                var door = findObjectAt(pos.targetX, pos.targetY, 'door');
                
                if (door) {
                    door.open = false;
                    await render();
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        place: {
            args: ['item'],
            defaults: { item: null },
            execute: async function(item) {
                if (!item) return;
                var pos = getTargetPosition();
                var chest = findObjectAt(pos.targetX, pos.targetY, 'chest');
                
                if (chest) {
                    if (!chest.contents) chest.contents = [];
                    chest.contents.push(item);
                    await render();
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        build: {
            args: ['objectName'],
            defaults: { objectName: null },
            execute: async function(objectName) {
                if (!objectName) return;
                var pos = getTargetPosition();
                
                if (!gameState.objects) gameState.objects = [];
                gameState.objects.push({ type: objectName, x: pos.targetX, y: pos.targetY, built: true });
                
                if (objectName === 'bridge' && gameState.mapData[pos.targetY]) {
                    gameState.mapData[pos.targetY][pos.targetX] = getTileIdByName('path');
                }
                
                await render();
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(1)); });
            }
        }
    };

    // ========== EXPOSE COMMAND EXECUTORS AS GLOBALS ==========
    // These are called by Skulpt wrappers via window reference
    
    for (var cmdName in GameCommands) {
        (function(name, cmd) {
            var targetCmd = cmd;
            if (cmd.aliasOf) {
                targetCmd = GameCommands[cmd.aliasOf];
            }
            window['gameCommand_' + name] = function() {
                return targetCmd.execute.apply(null, arguments);
            };
        })(cmdName, GameCommands[cmdName]);
    }

    // ========== SKULPT MODULE SOURCE GENERATOR ==========
    // Generates a self-contained module source string at load time
    
    function buildSkulptModuleSource() {
        var lines = [];
        lines.push('var $builtinmodule = function(name) {');
        lines.push('    var mod = {};');
        lines.push('    var commandCounter = 0;');
        lines.push('');
        lines.push('    function incrementCounter(n) {');
        lines.push('        n = n || 1;');
        lines.push('        commandCounter += n;');
        lines.push('        if (typeof window.updateSkulptCommandCounter === "function") {');
        lines.push('            window.updateSkulptCommandCounter(commandCounter);');
        lines.push('        }');
        lines.push('    }');
        lines.push('');
        
        for (var cmdName in GameCommands) {
            var cmd = GameCommands[cmdName];
            var args = cmd.args || [];
            var defaults = cmd.defaults || {};
            var countsAsMultiple = cmd.countsAsMultiple || false;
            
            lines.push('    mod.' + cmdName + ' = new Sk.builtin.func(function(' + args.join(', ') + ') {');
            
            var jsArgsList = [];
            if (args.length > 0) {
                for (var i = 0; i < args.length; i++) {
                    var argName = args[i];
                    var defaultVal = defaults[argName];
                    var defaultStr = defaultVal === null ? 'null' : 
                                     typeof defaultVal === 'string' ? '"' + defaultVal + '"' : 
                                     String(defaultVal);
                    lines.push('        var js_' + argName + ' = ' + defaultStr + ';');
                    lines.push('        if (' + argName + ' !== undefined) {');
                    lines.push('            js_' + argName + ' = Sk.ffi.remapToJs(' + argName + ');');
                    lines.push('        }');
                    jsArgsList.push('js_' + argName);
                }
            }
            
            lines.push('        return Sk.misceval.promiseToSuspension(');
            lines.push('            (async function() {');
            lines.push('                var result = await window.gameCommand_' + cmdName + '(' + jsArgsList.join(', ') + ');');
            
            if (countsAsMultiple) {
                lines.push('                incrementCounter(typeof result === "number" ? result : 1);');
            } else {
                lines.push('                incrementCounter(1);');
            }
            
            lines.push('                return Sk.builtin.none.none$;');
            lines.push('            })()');
            lines.push('        );');
            lines.push('    });');
            lines.push('');
        }
        
        lines.push('    return mod;');
        lines.push('};');
        
        return lines.join('\n');
    }

    // Generate and expose the module source
    window.playerModuleSource = buildSkulptModuleSource();

    // ========== COMMAND COUNTER ==========
    
    var globalCommandCounter = 0;

    window.updateSkulptCommandCounter = function(count) {
        globalCommandCounter = count;
    };

    window.getCommandCount = function() {
        return globalCommandCounter;
    };

    window.resetCommandCounter = function() {
        globalCommandCounter = 0;
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
        gameState.playerPos = { x: gameState.startPos.x, y: gameState.startPos.y };
        gameState.playerDirection = 'right';
        gameState.isRunning = false;
        document.getElementById('run-btn').disabled = false;
        
        if (gameState.collectibles) {
            for (var i = 0; i < gameState.collectibles.length; i++) {
                gameState.collectibles[i].collected = false;
            }
        }
        
        gameState.messageLog = [];
        var messagePanel = document.getElementById('message-panel');
        if (messagePanel) {
            messagePanel.innerHTML = '';
        }
        
        // Restore MissionState from snapshot if this is a mission level
        if (window.levelEntrySnapshot && window.levelEntrySnapshot.missionState) {
            if (window.MissionState) {
                MissionState.loadState(window.levelEntrySnapshot.missionState);
                gameState.inventory = MissionState.getInventory();
                console.log('[resetGame] Restored MissionState from snapshot:', MissionState.getState());
                
                // Re-synchronize collectibles with restored MissionState
                if (gameState.collectibles) {
                    for (var j = 0; j < gameState.collectibles.length; j++) {
                        var c = gameState.collectibles[j];
                        c.collected = MissionState.isCollected(c.x, c.y);
                    }
                }
            }
        } else {
            gameState.inventory = {};
        }
        
        // Update inventory panel
        var inventoryPanel = document.getElementById('inventory-panel');
        if (inventoryPanel) {
            inventoryPanel.innerHTML = '<strong>Inventory:</strong>';
            for (var item in gameState.inventory) {
                if (gameState.inventory[item] > 0) {
                    var itemSpan = document.createElement('span');
                    itemSpan.className = 'inventory-item';
                    itemSpan.textContent = ' ' + item + ': ' + gameState.inventory[item];
                    inventoryPanel.appendChild(itemSpan);
                }
            }
        }
        
        // Reset code editor to starter code
        if (window.EditorManager) {
            EditorManager.resetToSnapshot();
            
            // Also update Blockly if in block mode
            if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
                if (window.BlocklyIntegration && window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode) {
                    window.BlocklyIntegration.convertFromText(window.levelEntrySnapshot.starterCode);
                }
            }
        }
        
        render();
        updateViewport();
    };

    // ========== EXPORTS ==========
    
    window.GameCommands = GameCommands;

    console.log('[Game Commands] Loaded successfully');
})();
