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
    
    function updateBackpackDisplay() {
        if (window.LevelLoader && LevelLoader.updateBackpackUI) {
            LevelLoader.updateBackpackUI();
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
                        playBumpSound();
                        break;
                    }
                }
                
                if (window.TestRunner) {
                    TestRunner.evaluate();
                } else {
                    checkWinCondition();
                }
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
                
                // Use ElementInteractionManager for all collectibles
                if (window.ElementInteractionManager) {
                    var result = ElementInteractionManager.handleCollect(pos.px, pos.py, gameState);
                    if (result.success) {
                        playCollectSound();
                        animateCollectSparkle(pos.px, pos.py);
                        console.log('[collect]', result.message);
                        updateInventoryDisplay();
                        await render();
                    }
                }
                
                await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
            }
        },

        interact: {
            args: [],
            defaults: {},
            execute: async function() {
                var px = Math.floor(gameState.playerPos.x);
                var py = Math.floor(gameState.playerPos.y);
                
                // If aboard a vehicle, try to disembark
                if (window.VehicleInteractionManager && VehicleInteractionManager.isBoarded()) {
                    var disembarkResult = VehicleInteractionManager.handleDisembark(gameState);
                    console.log('[interact]', disembarkResult.message);
                    if (disembarkResult.success) {
                        playInteractSound();
                        animateInteractPop(px, py);
                        await render();
                    }
                    await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
                    return;
                }
                
                // Check all 4 adjacent tiles
                var adjacent = [
                    { x: px + 1, y: py },
                    { x: px, y: py - 1 },
                    { x: px, y: py + 1 },
                    { x: px - 1, y: py }
                ];
                
                for (var i = 0; i < adjacent.length; i++) {
                    var tile = adjacent[i];
                    
                    // Try vehicle boarding
                    if (window.VehicleInteractionManager) {
                        var vehicleResult = VehicleInteractionManager.handleInteract(tile.x, tile.y, gameState);
                        if (vehicleResult.success) {
                            playInteractSound();
                            animateInteractPop(tile.x, tile.y);
                            console.log('[interact]', vehicleResult.message);
                            await render();
                            await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
                            return;
                        }
                    }
                    
                    // Try element interaction
                    if (window.ElementInteractionManager) {
                        var result = ElementInteractionManager.handleInteract(tile.x, tile.y, gameState);
                        if (result.success) {
                            playInteractSound();
                            animateInteractPop(tile.x, tile.y);
                            console.log('[interact]', result.message);
                            await render();
                            await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
                            return;
                        }
                    }
                }
                
                console.log('[interact]', 'Nothing to interact with nearby');
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
    
    // ========== BACKPACK COMMANDS ==========
    // Special object methods: backpack.append() and backpack.remove()
    
    window.gameCommand_backpack_append = async function(itemType) {
        var pos = getTargetPosition();
        
        if (!window.ElementInteractionManager) {
            console.log('[backpack.append] ElementInteractionManager not available');
            return { success: false };
        }
        
        var element = ElementInteractionManager.getElementAt(pos.px, pos.py);
        if (!element) {
            console.log('[backpack.append] Nothing to collect at current position');
            return { success: false, message: 'Nothing to collect here' };
        }
        
        if (element.section !== 'collectibles') {
            console.log('[backpack.append] Element is not collectible');
            return { success: false, message: 'This cannot be collected' };
        }
        
        if (window.MissionState && MissionState.isBackpackFull()) {
            console.log('[backpack.append] Backpack is full!');
            return { success: false, message: 'Backpack is full!' };
        }
        
        var result = MissionState.addToBackpack(element.type);
        if (result.success) {
            ElementInteractionManager.elementStates[element.id] = { removed: true };
            
            if (MissionState.isMissionLevel) {
                MissionState.markItemCollected(element.x, element.y, element.type);
            }
            
            if (!gameState.backpack) gameState.backpack = [];
            gameState.backpack = MissionState.getBackpack();
            
            playCollectSound();
            animateCollectSparkle(pos.px, pos.py);
            updateBackpackDisplay();
            await render();
            console.log('[backpack.append]', result.message);
        }
        
        await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
        return result;
    };
    
    window.gameCommand_backpack_remove = async function(itemType) {
        if (!itemType) {
            console.log('[backpack.remove] No item specified');
            return { success: false, message: 'No item specified' };
        }
        
        if (!window.MissionState) {
            console.log('[backpack.remove] MissionState not available');
            return { success: false };
        }
        
        var result = MissionState.removeFromBackpack(itemType);
        if (result.success) {
            gameState.backpack = MissionState.getBackpack();
            updateBackpackDisplay();
            await render();
            console.log('[backpack.remove]', result.message);
        } else {
            console.log('[backpack.remove]', result.message);
        }
        
        await new Promise(function(r) { setTimeout(r, getAnimationDuration(0.5)); });
        return result;
    };

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
        
        // Add backpack object with append() and remove() methods
        lines.push('    // Backpack object - Python list-like interface');
        lines.push('    var BackpackClass = function() {};');
        lines.push('    BackpackClass.prototype.tp$name = "backpack";');
        lines.push('');
        lines.push('    BackpackClass.prototype.append = new Sk.builtin.func(function(self, item) {');
        lines.push('        return Sk.misceval.promiseToSuspension(');
        lines.push('            (async function() {');
        lines.push('                await window.gameCommand_backpack_append();');
        lines.push('                incrementCounter(1);');
        lines.push('                return Sk.builtin.none.none$;');
        lines.push('            })()');
        lines.push('        );');
        lines.push('    });');
        lines.push('');
        lines.push('    BackpackClass.prototype.remove = new Sk.builtin.func(function(self, item) {');
        lines.push('        var js_item = Sk.ffi.remapToJs(item);');
        lines.push('        return Sk.misceval.promiseToSuspension(');
        lines.push('            (async function() {');
        lines.push('                await window.gameCommand_backpack_remove(js_item);');
        lines.push('                incrementCounter(1);');
        lines.push('                return Sk.builtin.none.none$;');
        lines.push('            })()');
        lines.push('        );');
        lines.push('    });');
        lines.push('');
        lines.push('    BackpackClass.prototype.tp$getattr = function(name) {');
        lines.push('        if (name === "append") return this.append;');
        lines.push('        if (name === "remove") return this.remove;');
        lines.push('        return undefined;');
        lines.push('    };');
        lines.push('');
        lines.push('    mod.backpack = new BackpackClass();');
        lines.push('');
        
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
        // Reset camera to auto-follow mode when running code
        if (window.camera) {
            window.camera.isManualPan = false;
        }
        
        if (window.SkulptRuntime) {
            await window.SkulptRuntime.runCode();
        } else {
            console.error('Skulpt runtime not loaded');
        }
    };

    window.resetGame = async function() {
        if (window.ConfirmDialog) {
            var confirmed = await ConfirmDialog.show({
                title: 'Reset Level',
                message: 'Your code and level progress will be cleared.',
                okText: 'Reset',
                cancelText: 'Cancel'
            });
            if (!confirmed) return;
        }
        
        if (window.ResetManager) {
            ResetManager.fullReset(gameState);
        } else {
            console.error('[resetGame] ResetManager not available');
        }
        
        // Direct editor reset - use level starter code directly
        var starterCode = '';
        if (window.courseData && window.courseData.levels && typeof currentLevel !== 'undefined') {
            starterCode = window.courseData.levels[currentLevel].starterCode || '';
        }
        
        if (window.EditorManager) {
            EditorManager.updateCode(starterCode);
        }
        
        // Handle Blockly mode if active
        if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
            if (window.BlocklyIntegration) {
                window.BlocklyIntegration.convertFromText(starterCode);
            }
        }
    };

    // ========== EXPORTS ==========
    
    window.GameCommands = GameCommands;

    console.log('[Game Commands] Loaded successfully');
})();
