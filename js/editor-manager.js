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
            MistakeLines.codeChanged(jar.toString());
            if (window.UserProgressManager) {
                UserProgressManager.saveCode(jar.toString());
            }
        });
        editorElement.addEventListener('scroll', MistakeLines.place);
        if (window.ResizeObserver) new ResizeObserver(MistakeLines.place).observe(editorElement);

        currentEditorElement = editorElement;
        initialized = true;
        console.log('[EditorManager] Initialized successfully');
        return true;
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
        MistakeLines.clear();
        return true;
    }
    
    function getCode() {
        const editorElement = document.getElementById('editor');
        
        if (!initialized || !jar || currentEditorElement !== editorElement) {
            return editorElement ? editorElement.textContent : '';
        }
        return jar.toString();
    }
    
    function lineNumbersFor(code) {
        return code.split('\n').map((_, index) => index + 1).join('\n');
    }

    function updateLineNumbers() {
        const editor = document.getElementById('editor');
        const lineNumbers = document.getElementById('line-numbers');
        if (!editor || !lineNumbers) return;
        lineNumbers.textContent = lineNumbersFor(editor.textContent);
    }
    
    function isInitialized() {
        const editorElement = document.getElementById('editor');
        return initialized && jar !== null && currentEditorElement === editorElement;
    }

    function lineStart(lines, lineNumber) {
        return lines.slice(0, lineNumber - 1).reduce((total, line) => total + line.length + 1, 0);
    }

    function savedCursor() {
        return isInitialized() && document.activeElement === currentEditorElement ? jar.save() : null;
    }

    function restoreCursor(cursor) {
        if (!isInitialized()) return;
        currentEditorElement.focus({ preventScroll: true });
        jar.restore(cursor);
    }

    function cursorLine() {
        const selection = savedCursor();
        if (!selection) return null;
        const cursor = selection.dir === 'backward' ? selection.start : selection.end;
        return getCode().slice(0, cursor).split('\n').length;
    }

    function placeCursorAtLineEnd(lineNumber) {
        if (!isInitialized()) return;
        const lines = getCode().split('\n');
        const line = Math.min(Math.max(lineNumber, 1), lines.length);
        const end = lineStart(lines, line) + lines[line - 1].length;
        restoreCursor({ start: end, end: end });
    }

    function linePosition(lineNumber) {
        const lines = getCode().split('\n');
        if (!isInitialized() || lineNumber < 1 || lineNumber > lines.length) return null;
        const editorElement = currentEditorElement;
        const style = getComputedStyle(editorElement);
        const rowHeight = parseFloat(style.lineHeight);
        const box = editorElement.parentNode.getBoundingClientRect();
        const editorBox = editorElement.getBoundingClientRect();
        const contentTop = editorBox.top + editorElement.clientTop + parseFloat(style.paddingTop) - editorElement.scrollTop;
        const text = lines[lineNumber - 1].replace(/\s+$/, '');
        if (!text) {
            const above = lineNumber > 1 ? linePosition(lineNumber - 1) : null;
            const top = above ? above.bottom : contentTop - box.top;
            return { top: top, bottom: top + rowHeight, lastRowTop: top, textEnd: editorBox.left + editorElement.clientLeft + parseFloat(style.paddingLeft) - box.left };
        }
        const start = lineStart(lines, lineNumber);
        const from = jar.getNodeAndOffset(start);
        const to = jar.getNodeAndOffset(start + text.length);
        const range = document.createRange();
        range.setStart(from.node, from.offset);
        range.setEnd(to.node, to.offset);
        const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0);
        if (!rects.length) return null;
        const rowOf = rect => Math.floor((rect.top + rect.height / 2 - contentTop) / rowHeight);
        const firstRow = Math.min(...rects.map(rowOf));
        const lastRow = Math.max(...rects.map(rowOf));
        const textEnd = Math.max(...rects.filter(rect => rowOf(rect) === lastRow).map(rect => rect.right));
        const rowTop = row => contentTop + row * rowHeight - box.top;
        return { top: rowTop(firstRow), bottom: rowTop(lastRow) + rowHeight, lastRowTop: rowTop(lastRow), textEnd: textEnd - box.left };
    }

    return {
        init: init,
        updateCode: updateCode,
        getCode: getCode,
        updateLineNumbers: updateLineNumbers,
        lineNumbersFor: lineNumbersFor,
        isInitialized: isInitialized,
        savedCursor: savedCursor,
        restoreCursor: restoreCursor,
        cursorLine: cursorLine,
        placeCursorAtLineEnd: placeCursorAtLineEnd,
        linePosition: linePosition
    };
})();

window.EditorManager = EditorManager;
