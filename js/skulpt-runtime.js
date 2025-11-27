// ============================================
// SKULPT RUNTIME - Python Interpreter Integration
// ============================================

(function() {
    'use strict';

    function builtinRead(filename) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
            throw "File not found: '" + filename + "'";
        }
        return Sk.builtinFiles["files"][filename];
    }

    function configureSkulpt() {
        // Ensure Sk.builtinFiles exists (required for custom modules)
        if (!Sk.builtinFiles) Sk.builtinFiles = {};
        if (!Sk.builtinFiles.files) Sk.builtinFiles.files = {};

        // Inject the player module into Skulpt's virtual file system
        // Uses pre-generated self-contained module source from game-commands.js
        if (window.playerModuleSource) {
            Sk.builtinFiles.files['src/lib/player.js'] = window.playerModuleSource;
        } else {
            console.error('[Skulpt Runtime] Player module source not found - ensure game-commands.js loads first');
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

    var CODE_PRELUDE = 'from player import *\nimport player\n';

    async function executePythonCode(code) {
        configureSkulpt();
        
        if (typeof window.resetCommandCounter === 'function') window.resetCommandCounter();
        
        if (typeof gameState !== 'undefined') {
            if (window.ResetManager) {
                ResetManager.softReset(gameState);
            } else {
                gameState.playerPos = {...gameState.startPos};
                gameState.playerDirection = 'right';
                gameState.characterType = 'player';
                
                if (window.VehicleInteractionManager) {
                    VehicleInteractionManager.reset(gameState);
                }
                
                if (typeof render === 'function') render();
                if (typeof updateViewport === 'function') updateViewport();
            }
        }

        var fullCode = CODE_PRELUDE + code;
        var executionError = null;

        try {
            await Sk.misceval.asyncToPromise(function() {
                return Sk.importMainWithBody("<stdin>", false, fullCode, true);
            });
        } catch (error) {
            executionError = formatSkulptError(error);
            console.error('[Skulpt Error]', executionError.error);
        }

        var executedCommands = typeof window.getCommandCount === 'function' ? window.getCommandCount() : 0;
        return { executionError: executionError, executedCommands: executedCommands };
    }

    async function runCodeWithSkulpt() {
        if (typeof gameState === 'undefined' || gameState.isRunning) return;
        
        gameState.isRunning = true;
        var runBtn = document.getElementById('run-btn');
        if (runBtn) runBtn.disabled = true;
        
        var code;
        if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
            code = window.BlocklyModeSwitcher.getCode();
        } else if (window.EditorManager && window.EditorManager.isInitialized()) {
            code = window.EditorManager.getCode();
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
        getCommandCount: function() { return typeof window.getCommandCount === 'function' ? window.getCommandCount() : 0; }
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
