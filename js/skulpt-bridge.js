(function() {
    'use strict';

    const PLAYER_OBJECTS = {
        backpack: PythonBackpackInventory.createBackpack,
        inventory: PythonBackpackInventory.createInventory
    };

    function playerModuleNames() {
        return Object.keys(GameCommands).concat(Object.keys(PLAYER_OBJECTS));
    }

    function buildPlayerModule() {
        const mod = {};
        let commandCount = 0;

        function runGameCommand(command, countsAsMultiple) {
            const run = SkulptRuntime.currentProgramRun();
            if (run.stopped) throw new Error('__STOP__');
            return Sk.misceval.promiseToSuspension(command().then(function(result) {
                if (!run.stopped) {
                    commandCount += countsAsMultiple && typeof result === 'number' ? result : 1;
                    window.updateSkulptCommandCounter(commandCount);
                }
                return Sk.builtin.none.none$;
            }));
        }

        Object.keys(GameCommands).forEach(function(commandName) {
            const command = GameCommands[commandName];
            const argNames = command.args || [];
            const defaults = command.defaults || {};
            mod[commandName] = new Sk.builtin.func(function(...pythonArgs) {
                const jsArgs = argNames.map((argName, i) => pythonArgs[i] !== undefined ? Sk.ffi.remapToJs(pythonArgs[i]) : defaults[argName]);
                return runGameCommand(() => window['gameCommand_' + commandName](...jsArgs), command.countsAsMultiple);
            });
        });

        Object.keys(PLAYER_OBJECTS).forEach(name => {
            mod[name] = PLAYER_OBJECTS[name](mod, runGameCommand);
        });
        return mod;
    }

    window.buildPlayerModule = buildPlayerModule;
    window.playerModuleNames = playerModuleNames;

    console.log('[Skulpt Bridge] Module loaded');
})();
