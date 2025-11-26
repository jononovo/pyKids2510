// ============================================
// SKULPT RUNTIME - Python Interpreter Integration
// ============================================

(function() {
    'use strict';

    let commandCounter = 0;

    function builtinRead(filename) {
        if (filename === "src/builtin/player.js") {
            return createPlayerModuleSource();
        }
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
            throw "File not found: '" + filename + "'";
        }
        return Sk.builtinFiles["files"][filename];
    }

    function createPlayerModuleSource() {
        return "";
    }

    function createPlayerModule() {
        const mod = { __name__: new Sk.builtin.str("player") };

        mod.move_forward = new Sk.builtin.func(function(steps) {
            steps = steps !== undefined ? Sk.ffi.remapToJs(steps) : 1;
            steps = parseInt(steps) || 1;
            
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    for (let i = 0; i < steps; i++) {
                        await moveForward();
                        commandCounter++;
                    }
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.turn_left = new Sk.builtin.func(function() {
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await turnLeft();
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.turn_right = new Sk.builtin.func(function() {
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await turnRight();
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.push = new Sk.builtin.func(function() {
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await push();
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.speak = new Sk.builtin.func(function(message) {
            const msg = message !== undefined ? Sk.ffi.remapToJs(message) : '';
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await speak(msg);
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.collect = new Sk.builtin.func(function(resource) {
            const res = resource !== undefined ? Sk.ffi.remapToJs(resource) : null;
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await collect(res);
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.water = new Sk.builtin.func(function() {
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await water();
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.open = new Sk.builtin.func(function() {
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await window.open ? open() : Promise.resolve();
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.close = new Sk.builtin.func(function() {
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await close();
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.place = new Sk.builtin.func(function(item) {
            const it = item !== undefined ? Sk.ffi.remapToJs(item) : null;
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await place(it);
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        mod.build = new Sk.builtin.func(function(objectName) {
            const name = objectName !== undefined ? Sk.ffi.remapToJs(objectName) : null;
            return new Sk.misceval.promiseToSuspension(
                (async () => {
                    await build(name);
                    commandCounter++;
                    return Sk.builtin.none.none$;
                })()
            );
        });

        return mod;
    }

    function injectPlayerModule() {
        const playerFuncs = createPlayerModule();
        
        const playerMod = new Sk.builtin.module();
        playerMod.$d = new Sk.builtin.dict([]);
        
        for (const key in playerFuncs) {
            playerMod.$d.mp$ass_subscript(new Sk.builtin.str(key), playerFuncs[key]);
        }
        
        Sk.sysmodules.mp$ass_subscript(new Sk.builtin.str("player"), playerMod);
    }

    function configureSkulpt() {
        Sk.configure({
            output: function(text) {
                console.log('[Python]', text);
                const messagePanel = document.getElementById('message-panel');
                if (messagePanel && text.trim()) {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message-item';
                    msgDiv.textContent = text.trim();
                    messagePanel.appendChild(msgDiv);
                    messagePanel.scrollTop = messagePanel.scrollHeight;
                }
            },
            read: builtinRead,
            __future__: Sk.python3,
            execLimit: null,
            killableWhile: true,
            killableFor: true
        });

        injectPlayerModule();
    }

    function formatSkulptError(error) {
        let lineNum = null;
        let errorMsg = '';
        
        if (error.traceback && error.traceback.length > 0) {
            lineNum = error.traceback[0].lineno;
        }
        
        if (error.args && error.args.v && error.args.v.length > 0) {
            errorMsg = Sk.ffi.remapToJs(error.args.v[0]);
        } else {
            errorMsg = error.toString();
        }
        
        if (errorMsg.includes('SyntaxError')) {
            const match = errorMsg.match(/line (\d+)/);
            if (match) lineNum = parseInt(match[1]);
        }
        
        return { line: lineNum, error: errorMsg };
    }

    async function executePythonCode(code) {
        configureSkulpt();
        
        commandCounter = 0;
        
        gameState.playerPos = {...gameState.startPos};
        gameState.playerDirection = 'right';
        render();
        updateViewport();

        let executionError = null;

        try {
            await Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, code, true);
            });
        } catch (error) {
            executionError = formatSkulptError(error);
            console.error('[Skulpt Error]', executionError.error);
        }

        return { executionError, executedCommands: commandCounter };
    }

    async function runCodeWithSkulpt() {
        if (typeof gameState === 'undefined' || gameState.isRunning) return;
        
        gameState.isRunning = true;
        const runBtn = document.getElementById('run-btn');
        if (runBtn) runBtn.disabled = true;
        
        let code;
        if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
            code = window.BlocklyModeSwitcher.getCode();
        } else if (typeof jar !== 'undefined') {
            code = jar.toString();
        } else {
            console.error('[Skulpt Runtime] No code source available');
            gameState.isRunning = false;
            if (runBtn) runBtn.disabled = false;
            return;
        }

        const { executionError, executedCommands } = await executePythonCode(code);
        
        const reachedGoal = typeof checkVictory === 'function' ? checkVictory() : false;
        
        if (window.tutorEnabled && !reachedGoal && typeof analyzeCodeAndProvideHelp === 'function') {
            analyzeCodeAndProvideHelp(code, executionError, executedCommands);
        }
        
        gameState.isRunning = false;
        if (runBtn) runBtn.disabled = false;
    }

    window.SkulptRuntime = {
        execute: executePythonCode,
        runCode: runCodeWithSkulpt,
        configure: configureSkulpt,
        getCommandCount: function() { return commandCounter; }
    };

    window.pythonExecutor = {
        execute: async function(code) {
            if (typeof gameState === 'undefined' || gameState.isRunning) return;
            
            gameState.isRunning = true;
            const runBtn = document.getElementById('run-btn');
            if (runBtn) runBtn.disabled = true;
            
            const { executionError, executedCommands } = await executePythonCode(code);
            
            const reachedGoal = typeof checkVictory === 'function' ? checkVictory() : false;
            
            if (window.tutorEnabled && !reachedGoal && typeof analyzeCodeAndProvideHelp === 'function') {
                analyzeCodeAndProvideHelp(code, executionError, executedCommands);
            }
            
            gameState.isRunning = false;
            if (runBtn) runBtn.disabled = false;
        }
    };

    console.log('[Skulpt Runtime] Loaded successfully');
})();
