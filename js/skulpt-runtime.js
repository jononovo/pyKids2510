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
        Sk.builtinFiles.files['src/lib/player.js'] = 'var $builtinmodule = window.buildPlayerModule;';

        Sk.configure({
            output: function(text) {
                console.log('[Python]', text);
                if (text.trim()) showGameMessage(text.trim(), 'player');
            },
            read: builtinRead,
            __future__: Sk.python3,
            execLimit: 120000,
            yieldLimit: 100,
            killableWhile: true,
            killableFor: true
        });
    }

    var PRELUDE_IMPORTS = ['player', 'time'];
    var CODE_PRELUDE = 'from player import *\n' + PRELUDE_IMPORTS.map(function(name) { return 'import ' + name + '\n'; }).join('');
    var CODE_PRELUDE_LINE_COUNT = CODE_PRELUDE.split('\n').length - 1;
    var HELPERS_FILE = 'src/lib/helpers.py';

    function registerLevelHelpers() {
        if (LevelHelpers.hasHelpers()) Sk.builtinFiles.files[HELPERS_FILE] = CODE_PRELUDE + LevelHelpers.fileText();
        else delete Sk.builtinFiles.files[HELPERS_FILE];
    }

    function pythonMistake(error, code) {
        var mistake = explainPythonError(error, CODE_PRELUDE_LINE_COUNT, HELPERS_FILE);
        if (mistake.line) mistake.line = Math.min(mistake.line, code.replace(/\s+$/, '').split('\n').length);
        return mistake;
    }

    function showMistakeInConsoleLog(mistake) {
        showGameMessage(mistake.line ? 'Line ' + mistake.line + ': ' + mistake.text : mistake.text, 'error');
    }

    function showRunMistakes(code, mistake, isBlockMode) {
        if (mistake && (isBlockMode || !mistake.line)) showMistakeInConsoleLog(mistake);
        if (isBlockMode || EditorManager.getCode() !== code) return;
        MistakeLines.show(code, mistake && mistake.line ? mistake : null);
    }

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
        registerLevelHelpers();

        if (typeof window.resetCommandCounter === 'function') window.resetCommandCounter();

        MistakeLines.clear();
        ResetManager.restoreLevelStart(gameState);

        var studentCode = sanitizeCode(code);
        var fullCode = CODE_PRELUDE + studentCode;
        var mistake = null;
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
            if (run.stopped) {
                console.log('[Skulpt Runtime] Execution stopped by user');
            } else if (error.tp$name === 'TimeoutError') {
                console.log('[Skulpt Runtime] Execution timed out (120 second limit)');
                showGameMessage('Code stopped - ran too long (2 minute limit)', 'error');
            } else {
                mistake = pythonMistake(error, studentCode);
                console.error('[Skulpt Error]', mistake.text);
            }
        }

        return { mistake: mistake, wasStopped: run.stopped };
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
            FileTabs.openMain();
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

        if (!result.wasStopped) {
            if (window.TestRunner) TestRunner.evaluate({ allowWin: !result.mistake && window.getCommandCount() > 0 });
            showRunMistakes(code, result.mistake, isBlockMode);
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
        getCommandCount: function() { return typeof window.getCommandCount === 'function' ? window.getCommandCount() : 0; },
        preludeImports: PRELUDE_IMPORTS
    };

    window.pythonExecutor = {
        execute: async function(code) {
            if (typeof gameState === 'undefined' || gameState.isRunning) return;
            
            gameState.isRunning = true;
            var runBtn = document.getElementById('run-btn');
            if (runBtn) runBtn.disabled = true;
            
            var result = await executePythonCode(code);
            if (result.mistake) showMistakeInConsoleLog(result.mistake);

            gameState.isRunning = false;
            if (runBtn) runBtn.disabled = false;
        }
    };

    console.log('[Skulpt Runtime] Loaded successfully');
})();
