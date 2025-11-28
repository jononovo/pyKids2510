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
                // Use ProximityGuard to find collectible - check self first, then forward
                var guardResult = window.ProximityGuard 
                    ? ProximityGuard.check({ mode: 'self', sections: ['collectibles'] })
                    : { success: false };
                
                // Fallback: check the tile in front of player
                if (!guardResult.success && window.ProximityGuard) {
                    guardResult = ProximityGuard.check({ mode: 'forward', sections: ['collectibles'] });
                }
                
                if (guardResult.success && guardResult.element) {
                    // Consume the collectible
                    var consumeResult = ProximityGuard.consume(guardResult.element);
                    if (consumeResult.success) {
                        playCollectSound();
                        animateCollectSparkle(guardResult.position.x, guardResult.position.y);
                        console.log('[collect]', consumeResult.message);
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
        // Use ProximityGuard to validate position and find collectible
        var guardResult = ProximityGuard.require({
            mode: 'self',
            sections: ['collectibles'],
            errorTemplate: ProximityGuard.Messages.NOTHING_HERE
        });
        
        var element = guardResult.element;
        
        // Check if backpack is full
        if (window.MissionState && MissionState.isBackpackFull()) {
            console.log('[backpack.append] Backpack is full!');
            throw new Error('Backpack is full! Remove an item first.');
        }
        
        // Add to backpack
        var result = MissionState.addToBackpack(element.type);
        if (result.success) {
            ElementInteractionManager.elementStates[element.id] = { removed: true };
            
            if (MissionState.isMissionLevel) {
                MissionState.markItemCollected(element.x, element.y, element.type);
            }
            
            if (!gameState.backpack) gameState.backpack = [];
            gameState.backpack = MissionState.getBackpack();
            
            playCollectSound();
            animateCollectSparkle(element.x, element.y);
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

    // ========== INVENTORY DICTIONARY ACCESS ==========
    // Allows students to use inventory["coin"] += 1 syntax
    
    window.gameCommand_inventory_get = function(key) {
        if (window.MissionState && MissionState.isMissionLevel) {
            return MissionState.getInventoryCount(key);
        }
        if (!gameState.inventory) {
            gameState.inventory = {};
        }
        var value = gameState.inventory[key];
        return (value !== undefined) ? value : 0;
    };
    
    window.gameCommand_inventory_set = async function(key, value) {
        value = parseInt(value) || 0;
        value = Math.max(0, value);
        
        var currentValue = 0;
        if (window.MissionState && MissionState.isMissionLevel) {
            currentValue = MissionState.getInventoryCount(key);
        } else if (gameState.inventory) {
            currentValue = gameState.inventory[key] || 0;
        }
        
        var diff = value - currentValue;
        
        // If trying to add items, check for a matching collectible (forgiving - no error thrown)
        if (diff > 0) {
            // Use ProximityGuard.check() - doesn't throw, just returns result
            var guardResult = ProximityGuard.check({
                mode: 'self',
                sections: ['collectibles'],
                typeMatch: key
            });
            
            // If no collectible found, log message and continue (forgiving behavior)
            if (!guardResult.success) {
                var message = guardResult.message || 'Nothing to collect here! Move to an item first.';
                console.log('[inventory]', message);
                // Return current value unchanged - program continues
                return currentValue;
            }
            
            var element = guardResult.element;
            
            // Consume the collectible (removes it from the map)
            var consumeResult = ProximityGuard.consume(element);
            if (!consumeResult.success) {
                console.log('[inventory] Failed to consume element - continuing');
                // Return current value unchanged - program continues
                return currentValue;
            }
            
            // Note: activateElement already handles inventory updates
            // But we sync to ensure consistency
            console.log('[inventory] Collected', key, 'via inventory syntax at', element.x + ',' + element.y);
            
            // Get the updated inventory from the authoritative source
            if (window.MissionState && MissionState.isMissionLevel) {
                gameState.inventory = MissionState.getInventory();
            }
            
            // Play collection feedback
            playCollectSound();
            animateCollectSparkle(element.x, element.y);
            updateInventoryDisplay();
            await render();
            
            var newValue = gameState.inventory[key] || 0;
            console.log('[inventory]', key, 'now =', newValue);
            return newValue;
        } else if (diff < 0) {
            // Decreasing inventory is allowed anywhere
            if (window.MissionState && MissionState.isMissionLevel) {
                var amountToRemove = Math.min(Math.abs(diff), currentValue);
                if (amountToRemove > 0) {
                    MissionState.removeFromInventory(key, amountToRemove);
                }
                gameState.inventory = MissionState.getInventory();
            } else {
                if (!gameState.inventory) {
                    gameState.inventory = {};
                }
                if (value <= 0) {
                    delete gameState.inventory[key];
                } else {
                    gameState.inventory[key] = value;
                }
            }
            
            updateInventoryDisplay();
            await render();
            console.log('[inventory] Set', key, '=', value);
        }
        
        return value;
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
            lines.push('                if (window.shouldStopExecution) throw new Error("__STOP__");');
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
        
        // Add backpack object using Sk.misceval.buildClass - proper Skulpt pattern
        lines.push('    // Backpack object - Python list-like interface');
        lines.push('    var BackpackClass = Sk.misceval.buildClass(mod, function($gbl, $loc) {');
        lines.push('        $loc.__init__ = new Sk.builtin.func(function(self) {});');
        lines.push('');
        lines.push('        $loc.append = new Sk.builtin.func(function(self) {');
        lines.push('            return Sk.misceval.promiseToSuspension(');
        lines.push('                (async function() {');
        lines.push('                    await window.gameCommand_backpack_append();');
        lines.push('                    incrementCounter(1);');
        lines.push('                    return Sk.builtin.none.none$;');
        lines.push('                })()');
        lines.push('            );');
        lines.push('        });');
        lines.push('');
        lines.push('        $loc.remove = new Sk.builtin.func(function(self, item) {');
        lines.push('            var js_item = item ? Sk.ffi.remapToJs(item) : null;');
        lines.push('            return Sk.misceval.promiseToSuspension(');
        lines.push('                (async function() {');
        lines.push('                    await window.gameCommand_backpack_remove(js_item);');
        lines.push('                    incrementCounter(1);');
        lines.push('                    return Sk.builtin.none.none$;');
        lines.push('                })()');
        lines.push('            );');
        lines.push('        });');
        lines.push('    }, "Backpack", []);');
        lines.push('');
        lines.push('    mod.backpack = Sk.misceval.callsim(BackpackClass);');
        lines.push('');
        
        // Add inventory object using Sk.misceval.buildClass - Python dict-like interface
        lines.push('    // Inventory object - Python dict-like interface with auto-init to 0');
        lines.push('    var InventoryClass = Sk.misceval.buildClass(mod, function($gbl, $loc) {');
        lines.push('        $loc.__init__ = new Sk.builtin.func(function(self) {});');
        lines.push('');
        lines.push('        $loc.__getitem__ = new Sk.builtin.func(function(self, key) {');
        lines.push('            var js_key = Sk.ffi.remapToJs(key);');
        lines.push('            var value = window.gameCommand_inventory_get(js_key);');
        lines.push('            return Sk.ffi.remapToPy(value);');
        lines.push('        });');
        lines.push('');
        lines.push('        $loc.__setitem__ = new Sk.builtin.func(function(self, key, value) {');
        lines.push('            var js_key = Sk.ffi.remapToJs(key);');
        lines.push('            var js_value = Sk.ffi.remapToJs(value);');
        lines.push('            return Sk.misceval.promiseToSuspension(');
        lines.push('                (async function() {');
        lines.push('                    await window.gameCommand_inventory_set(js_key, js_value);');
        lines.push('                    return Sk.builtin.none.none$;');
        lines.push('                })()');
        lines.push('            );');
        lines.push('        });');
        lines.push('    }, "Inventory", []);');
        lines.push('');
        lines.push('    mod.inventory = Sk.misceval.callsim(InventoryClass);');
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
