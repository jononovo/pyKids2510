// ============================================
// SKULPT RUNTIME - Python Interpreter Integration
// ============================================

(function() {
    'use strict';

    var commandCounter = 0;

    window.incrementSkulptCommandCounter = function() {
        commandCounter++;
    };

    function builtinRead(filename) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
            throw "File not found: '" + filename + "'";
        }
        return Sk.builtinFiles["files"][filename];
    }

    function configureSkulpt() {
        // Register the player module from window (loaded via script tag)
        if (window.playerBuiltinModule) {
            Sk.builtinModules.player = window.playerBuiltinModule;
        } else {
            console.error('[Skulpt Runtime] Player module not found - ensure player-module.js loads first');
        }

        Sk.configure({
            output: function(text) {
                console.log('[Python]', text);
                var messagePanel = document.getElementById('message-panel');
                if (messagePanel && text.trim()) {
                    var msgDiv = document.createElement('div');
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
    }

    function formatSkulptError(error) {
        var lineNum = null;
        var errorMsg = '';
        
        if (error.traceback && error.traceback.length > 0) {
            lineNum = error.traceback[0].lineno;
        }
        
        if (error.args && error.args.v && error.args.v.length > 0) {
            errorMsg = Sk.ffi.remapToJs(error.args.v[0]);
        } else {
            errorMsg = error.toString();
        }
        
        if (errorMsg.indexOf('SyntaxError') !== -1) {
            var match = errorMsg.match(/line (\d+)/);
            if (match) lineNum = parseInt(match[1]);
        }
        
        return { line: lineNum, error: errorMsg };
    }

    async function executePythonCode(code) {
        configureSkulpt();
        
        commandCounter = 0;
        
        if (typeof gameState !== 'undefined') {
            gameState.playerPos = {...gameState.startPos};
            gameState.playerDirection = 'right';
            if (typeof render === 'function') render();
            if (typeof updateViewport === 'function') updateViewport();
        }

        var executionError = null;

        try {
            await Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, code, true);
            });
        } catch (error) {
            executionError = formatSkulptError(error);
            console.error('[Skulpt Error]', executionError.error);
        }

        return { executionError: executionError, executedCommands: commandCounter };
    }

    async function runCodeWithSkulpt() {
        if (typeof gameState === 'undefined' || gameState.isRunning) return;
        
        gameState.isRunning = true;
        var runBtn = document.getElementById('run-btn');
        if (runBtn) runBtn.disabled = true;
        
        var code;
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

        var result = await executePythonCode(code);
        var executionError = result.executionError;
        var executedCommands = result.executedCommands;
        
        var reachedGoal = typeof checkVictory === 'function' ? checkVictory() : false;
        
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
            var runBtn = document.getElementById('run-btn');
            if (runBtn) runBtn.disabled = true;
            
            var result = await executePythonCode(code);
            var executionError = result.executionError;
            var executedCommands = result.executedCommands;
            
            var reachedGoal = typeof checkVictory === 'function' ? checkVictory() : false;
            
            if (window.tutorEnabled && !reachedGoal && typeof analyzeCodeAndProvideHelp === 'function') {
                analyzeCodeAndProvideHelp(code, executionError, executedCommands);
            }
            
            gameState.isRunning = false;
            if (runBtn) runBtn.disabled = false;
        }
    };

    console.log('[Skulpt Runtime] Loaded successfully');
})();
