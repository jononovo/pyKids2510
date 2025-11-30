// ============================================
// SKULPT BRIDGE - Generates Skulpt module from GameCommands
// Must load AFTER game-commands.js and BEFORE skulpt-runtime.js
// ============================================

(function() {
    'use strict';

    function buildSkulptModuleSource() {
        var GameCommands = window.GameCommands;
        
        if (!GameCommands) {
            console.error('[Skulpt Bridge] GameCommands not found - ensure game-commands.js loads first');
            return '';
        }
        
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
        lines.push('');
        lines.push('        $loc.pop = new Sk.builtin.func(function(self, arg) {');
        lines.push('            var js_arg = arg !== undefined ? Sk.ffi.remapToJs(arg) : undefined;');
        lines.push('            return Sk.misceval.promiseToSuspension(');
        lines.push('                (async function() {');
        lines.push('                    await window.gameCommand_backpack_pop(js_arg);');
        lines.push('                    incrementCounter(1);');
        lines.push('                    return Sk.builtin.none.none$;');
        lines.push('                })()');
        lines.push('            );');
        lines.push('        });');
        lines.push('    }, "Backpack", []);');
        lines.push('');
        lines.push('    mod.backpack = Sk.misceval.callsim(BackpackClass);');
        lines.push('');
        
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

    window.playerModuleSource = buildSkulptModuleSource();

    console.log('[Skulpt Bridge] Module loaded');
})();
