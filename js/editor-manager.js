const EditorManager = (function() {
    let jar = null;
    let initialized = false;
    let currentEditorElement = null;
    
    function init() {
        const editorElement = document.getElementById('editor');
        if (!editorElement) return false;
        
        if (initialized && jar && currentEditorElement === editorElement) {
            return true;
        }
        
        if (jar && jar.destroy) {
            jar.destroy();
            console.log('[EditorManager] Destroyed old CodeJar instance');
        }
        
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
        
        currentEditorElement = editorElement;
        initialized = true;
        console.log('[EditorManager] Initialized successfully');
        return true;
    }
    
    function reinitialize() {
        initialized = false;
        currentEditorElement = null;
        if (jar && jar.destroy) {
            jar.destroy();
        }
        jar = null;
        return init();
    }
    
    function updateCode(code) {
        const editorElement = document.getElementById('editor');
        
        if (!initialized || !jar || currentEditorElement !== editorElement) {
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
        const editorElement = document.getElementById('editor');
        
        if (!initialized || !jar || currentEditorElement !== editorElement) {
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
        const editorElement = document.getElementById('editor');
        return initialized && jar !== null && currentEditorElement === editorElement;
    }
    
    function resetToSnapshot() {
        if (window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode) {
            updateCode(window.levelEntrySnapshot.starterCode);
            console.log('[EditorManager] Reset to snapshot code');
            return true;
        }
        console.warn('[EditorManager] No snapshot starterCode available');
        return false;
    }
    
    return {
        init: init,
        reinitialize: reinitialize,
        updateCode: updateCode,
        getCode: getCode,
        updateLineNumbers: updateLineNumbers,
        isInitialized: isInitialized,
        resetToSnapshot: resetToSnapshot
    };
})();

window.EditorManager = EditorManager;
