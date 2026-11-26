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
                if (text.trim()) {
                    if (window.showGameMessage) {
                        window.showGameMessage(text.trim(), 'player');
                    } else {
                        var messagePanel = document.getElementById('message-panel');
                        if (messagePanel) {
                            var msgDiv = document.createElement('div');
                            msgDiv.className = 'message-item message-player';
                            msgDiv.textContent = text.trim();
                            messagePanel.appendChild(msgDiv);
                            messagePanel.scrollTop = messagePanel.scrollHeight;
                        }
                    }
                }
            },
            read: builtinRead,
            __future__: Sk.python3,
            execLimit: 120000,
            yieldLimit: 100,
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

    var CODE_PRELUDE = 'from player import *\nimport player\nimport time\n';

    function sanitizeCode(code) {
        return code
            .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
            .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
            .replace(/\u00A0/g, ' ')
            .replace(/[\u2028\u2029]/g, '\n')
            .replace(/[\u200B-\u200D\uFEFF]/g, '');
    }

    var currentProgramRun = { stopped: true };
    var stopWaitingProgram = null;

    function waitUnlessStopped(suspension) {
        return new Promise(function(resolve, reject) {
            var stopped = false;
            stopWaitingProgram = function() {
                stopped = true;
                stopWaitingProgram = null;
                reject(new Error('__STOP__'));
            };
            suspension.data.promise.then(function(result) {
                suspension.data.result = result;
            }, function(error) {
                suspension.data.error = error;
            }).then(function() {
                if (stopped) return;
                stopWaitingProgram = null;
                try {
                    resolve(suspension.resume());
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    function stopRunningProgram() {
        currentProgramRun.stopped = true;
        if (stopWaitingProgram) stopWaitingProgram();
        endMoveAnimationNow();
    }

    async function executePythonCode(code) {
        configureSkulpt();

        if (typeof window.resetCommandCounter === 'function') window.resetCommandCounter();

        ResetManager.restoreLevelStart(gameState);

        var fullCode = CODE_PRELUDE + sanitizeCode(code);
        var executionError = null;
        var run = { stopped: false };
        currentProgramRun = run;

        try {
            await Sk.misceval.asyncToPromise(
                function() {
                    return Sk.importMainWithBody("<stdin>", false, fullCode, true);
                },
                {
                    "*": function(suspension) {
                        if (run.stopped) throw new Error('__STOP__');
                        if (suspension.data.type === 'Sk.promise') return waitUnlessStopped(suspension);
                    }
                }
            );
        } catch (error) {
            var errorStr = error.toString();
            if (run.stopped) {
                console.log('[Skulpt Runtime] Execution stopped by user');
            } else if (errorStr.indexOf('TimeLimitError') !== -1) {
                console.log('[Skulpt Runtime] Execution timed out (120 second limit)');
                if (window.showGameMessage) {
                    showGameMessage('Code stopped - ran too long (2 minute limit)', 'error');
                }
            } else {
                executionError = formatSkulptError(error);
                console.error('[Skulpt Error]', executionError.error);
            }
        }

        var executedCommands = typeof window.getCommandCount === 'function' ? window.getCommandCount() : 0;
        return { executionError: executionError, executedCommands: executedCommands, wasStopped: run.stopped };
    }

    function setButtonToRun(btn) {
        if (!btn) return;
        btn.innerHTML = '<span class="btn-icon">▶</span> <span class="btn-text">RUN CODE</span>';
        btn.classList.remove('stop-btn');
        btn.disabled = false;
    }

    function setButtonToStop(btn) {
        if (!btn) return;
        btn.innerHTML = '<span class="btn-icon">■</span> <span class="btn-text">STOP</span>';
        btn.classList.add('stop-btn');
        btn.disabled = false;
    }

    async function runCodeWithSkulpt() {
        var runBtn = document.getElementById('run-btn');
        
        if (typeof gameState === 'undefined') return;
        
        if (gameState.isRunning) {
            stopRunningProgram();
            if (runBtn) runBtn.disabled = true;
            return;
        }

        gameState.isRunning = true;
        setButtonToStop(runBtn);
        
        var code;
        var isBlockMode = window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode();
        
        if (isBlockMode) {
            code = window.BlocklyModeSwitcher.getCode();
        } else if (window.EditorManager && window.EditorManager.isInitialized()) {
            code = window.EditorManager.getCode();
        } else {
            console.error('[Skulpt Runtime] No code source available');
            gameState.isRunning = false;
            setButtonToRun(runBtn);
            return;
        }

        var sanitizedCode = sanitizeCode(code);
        if (sanitizedCode !== code && !isBlockMode) {
            window.EditorManager.updateCode(sanitizedCode);
            code = sanitizedCode;
        }

        var result = await executePythonCode(code);
        var executionError = result.executionError;
        var executedCommands = result.executedCommands;
        var wasStopped = result.wasStopped;

        if (!wasStopped && window.TestRunner) {
            TestRunner.evaluate();
        }
        
        var reachedGoal = typeof checkVictory === 'function' ? checkVictory() : false;
        
        if (!wasStopped && window.tutorEnabled && !reachedGoal && typeof analyzeCodeAndProvideHelp === 'function') {
            analyzeCodeAndProvideHelp(code, executionError, executedCommands);
        }
        
        gameState.isRunning = false;
        setButtonToRun(runBtn);
    }

    window.SkulptRuntime = {
        execute: executePythonCode,
        runCode: runCodeWithSkulpt,
        stopRunningProgram: stopRunningProgram,
        currentProgramRun: function() { return currentProgramRun; },
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
