(function() {
    'use strict';

    const PLAYER_OBJECTS = {
        backpack: PythonBackpackInventory.createBackpack,
        inventory: PythonBackpackInventory.createInventory
    };

    function playerModuleNames() {
        return Object.keys(GameCommands).concat(Object.keys(PLAYER_OBJECTS));
    }

    function commandTarget(commandName) {
        const command = GameCommands[commandName];
        return command.aliasOf ? GameCommands[command.aliasOf] : command;
    }

    function toPython(answer) {
        return Array.isArray(answer) ? new Sk.builtin.tuple(answer.map(toPython)) : Sk.ffi.remapToPy(answer);
    }

    function buildPlayerModule() {
        const mod = {};
        let commandCount = 0;

        function runningProgram() {
            const run = SkulptRuntime.currentProgramRun();
            if (run.stopped) throw new Error('__STOP__');
            return run;
        }

        function runGameCommand(command, countsAsMultiple, returnsResult) {
            const run = runningProgram();
            return Sk.misceval.promiseToSuspension(command().then(function(result) {
                if (!run.stopped) {
                    commandCount += countsAsMultiple && typeof result === 'number' ? result : 1;
                    window.updateSkulptCommandCounter(commandCount);
                }
                return returnsResult ? toPython(result) : Sk.builtin.none.none$;
            }));
        }

        function askQuestion(question) {
            runningProgram();
            return toPython(question());
        }

        Object.keys(GameCommands).forEach(function(commandName) {
            const command = commandTarget(commandName);
            const argNames = command.args || [];
            const defaults = command.defaults || {};
            mod[commandName] = new Sk.builtin.func(function(...pythonArgs) {
                const jsArgs = argNames.map((argName, i) => pythonArgs[i] !== undefined ? Sk.ffi.remapToJs(pythonArgs[i]) : defaults[argName]);
                if (command.isQuestion) return askQuestion(() => command.execute(...jsArgs));
                return runGameCommand(() => command.execute(...jsArgs), command.countsAsMultiple, command.returnsResult);
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
