const EditorManager = (function() {
    let jar = null;
    let initialized = false;
    let currentEditorElement = null;
    let markedErrorLine = null;
    const errorLineMark = document.createElement('div');
    errorLineMark.className = 'error-line-mark';

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
            clearErrorLine();
            if (window.UserProgressManager) {
                UserProgressManager.saveCode(jar.toString());
            }
        });
        editorElement.addEventListener('scroll', positionErrorLineMark);

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
        clearErrorLine();
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

    function positionErrorLineMark() {
        if (!markedErrorLine) return;
        const editorElement = document.getElementById('editor');
        const style = getComputedStyle(editorElement);
        const lineHeight = parseFloat(style.lineHeight);
        errorLineMark.style.height = lineHeight + 'px';
        errorLineMark.style.top = (editorElement.offsetTop + parseFloat(style.paddingTop) + (markedErrorLine - 1) * lineHeight - editorElement.scrollTop) + 'px';
    }

    function markErrorLine(lineNumber) {
        markedErrorLine = lineNumber;
        document.getElementById('editor').parentNode.appendChild(errorLineMark);
        positionErrorLineMark();
    }

    function clearErrorLine() {
        markedErrorLine = null;
        errorLineMark.remove();
    }

    return {
        init: init,
        reinitialize: reinitialize,
        updateCode: updateCode,
        getCode: getCode,
        updateLineNumbers: updateLineNumbers,
        isInitialized: isInitialized,
        markErrorLine: markErrorLine,
        clearErrorLine: clearErrorLine
    };
})();

window.EditorManager = EditorManager;
