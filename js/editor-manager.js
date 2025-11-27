const EditorManager = (function() {
    let jar = null;
    let initialized = false;
    
    function init() {
        const editorElement = document.getElementById('editor');
        if (!editorElement) return false;
        
        if (initialized && jar) return true;
        
        if (!window.CodeJar) {
            console.error('[EditorManager] CodeJar library not loaded');
            return false;
        }
        
        const highlight = editor => {
            const code = editor.textContent;
            if (window.PythonHighlighter) {
                editor.innerHTML = PythonHighlighter.highlight(code);
            }
        };
        
        editorElement.setAttribute('contenteditable', 'true');
        
        jar = CodeJar(editorElement, highlight, {
            tab: '    ',
            indentOn: /:$/,
            addClosing: false,
            spellcheck: false
        });
        
        jar.onUpdate(() => {
            updateLineNumbers();
            if (window.UserProgressManager) {
                UserProgressManager.saveCode(jar.toString());
            }
        });
        
        initialized = true;
        console.log('[EditorManager] Initialized successfully');
        return true;
    }
    
    function updateCode(code) {
        if (!initialized || !jar) {
            if (!init()) {
                console.warn('[EditorManager] Cannot update code - editor not initialized');
                return false;
            }
        }
        
        jar.updateCode(code);
        updateLineNumbers();
        return true;
    }
    
    function getCode() {
        if (!initialized || !jar) {
            const editorElement = document.getElementById('editor');
            return editorElement ? editorElement.textContent : '';
        }
        return jar.toString();
    }
    
    function updateLineNumbers() {
        const editor = document.getElementById('editor');
        const lineNumbers = document.getElementById('line-numbers');
        if (!editor || !lineNumbers) return;
        
        const lines = editor.textContent.split('\n');
        const numbers = [];
        for (let i = 1; i <= lines.length; i++) {
            numbers.push(i);
        }
        lineNumbers.textContent = numbers.join('\n');
    }
    
    function isInitialized() {
        return initialized && jar !== null;
    }
    
    function resetToSnapshot() {
        if (window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode) {
            updateCode(window.levelEntrySnapshot.starterCode);
            console.log('[EditorManager] Reset to snapshot code');
            return true;
        }
        return false;
    }
    
    return {
        init: init,
        updateCode: updateCode,
        getCode: getCode,
        updateLineNumbers: updateLineNumbers,
        isInitialized: isInitialized,
        resetToSnapshot: resetToSnapshot
    };
})();

window.EditorManager = EditorManager;
