// CodeJar – micro code editor
// https://github.com/antonmedv/codejar

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.CodeJar = factory());
}(this, (function () {
    'use strict';

    function CodeJar(editor, highlight, opt = {}) {
        const options = {
            tab: '\t',
            indentOn: /[({\[]$/,
            moveToNewLine: /^[)}\]]/,
            spellcheck: false,
            catchTab: true,
            preserveIdent: true,
            addClosing: true,
            history: true,
            window: window,
            ...opt
        };
        
        const listeners = [];
        const history = [];
        let at = -1;
        let focus = false;
        let onUpdate = () => {};
        let prev;

        editor.setAttribute('contenteditable', 'plaintext-only');
        editor.setAttribute('spellcheck', options.spellcheck ? 'true' : 'false');
        editor.style.outline = 'none';
        editor.style.overflowWrap = 'break-word';
        editor.style.overflowY = 'auto';
        editor.style.whiteSpace = 'pre-wrap';

        let isLegacy = editor.contentEditable !== 'plaintext-only';
        if (isLegacy) {
            editor.setAttribute('contenteditable', 'true');
        }

        const debounce = (cb, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => cb(...args), wait);
            };
        };

        const save = () => {
            const s = window.getSelection();
            const pos = {
                start: 0,
                end: 0,
                dir: undefined
            };

            if (s.rangeCount > 0) {
                const ws = editor.querySelectorAll('*');
                const r = s.getRangeAt(0);
                const sc = r.startContainer;
                const so = r.startOffset;
                const ec = r.endContainer;
                const eo = r.endOffset;
                const co = r.commonAncestorContainer;

                pos.dir = s.anchorNode === sc && s.anchorOffset === so ? 'forward' : 'backward';
                pos.start = getPos(editor, sc, so);
                pos.end = getPos(editor, ec, eo);
            }
            return pos;
        };

        const restore = (pos) => {
            const s = window.getSelection();
            s.removeAllRanges();
            
            if (pos.start >= 0 && pos.end >= 0) {
                const range = document.createRange();
                const startPos = getNodeAndOffset(editor, pos.start);
                const endPos = getNodeAndOffset(editor, pos.end);
                
                if (startPos.node && endPos.node) {
                    range.setStart(startPos.node, startPos.offset);
                    range.setEnd(endPos.node, endPos.offset);
                    s.addRange(range);
                }
            }
        };

        const getPos = (root, node, offset) => {
            let pos = 0;
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            while (walker.nextNode()) {
                if (walker.currentNode === node) {
                    return pos + offset;
                }
                pos += walker.currentNode.textContent.length;
            }
            return pos;
        };

        const getNodeAndOffset = (root, pos) => {
            let currentPos = 0;
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            while (walker.nextNode()) {
                const len = walker.currentNode.textContent.length;
                if (currentPos + len >= pos) {
                    return {
                        node: walker.currentNode,
                        offset: pos - currentPos
                    };
                }
                currentPos += len;
            }
            
            return { node: root, offset: 0 };
        };

        const doHighlight = (editor) => {
            const pos = save();
            highlight(editor, pos);
            restore(pos);
        };

        const debounceHighlight = debounce(() => {
            doHighlight(editor);
        }, 30);

        const handleInput = () => {
            const code = editor.textContent || '';
            if (code !== prev) {
                recordHistory();
                debounceHighlight();
                onUpdate(code);
                prev = code;
            }
        };

        const handleKeydown = (event) => {
            if (event.defaultPrevented) return;

            // Handle tab
            if (options.catchTab && event.key === 'Tab') {
                event.preventDefault();
                document.execCommand('insertText', false, options.tab);
            }

            // Handle undo/redo
            if (event.ctrlKey || event.metaKey) {
                if (event.key === 'z' && !event.shiftKey) {
                    event.preventDefault();
                    handleUndo();
                } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
                    event.preventDefault();
                    handleRedo();
                }
            }
        };

        const recordHistory = debounce(() => {
            if (!options.history) return;
            const code = editor.textContent || '';
            if (history[at] !== code) {
                at++;
                history[at] = code;
                history.splice(at + 1);
            }
        }, 300);

        const handleUndo = () => {
            if (at > 0) {
                at--;
                const code = history[at];
                editor.textContent = code;
                doHighlight(editor);
                onUpdate(code);
            }
        };

        const handleRedo = () => {
            if (at < history.length - 1) {
                at++;
                const code = history[at];
                editor.textContent = code;
                doHighlight(editor);
                onUpdate(code);
            }
        };

        // Initialize
        recordHistory();
        doHighlight(editor);

        // Add event listeners
        editor.addEventListener('keydown', handleKeydown);
        editor.addEventListener('input', handleInput);
        editor.addEventListener('focus', () => { focus = true; });
        editor.addEventListener('blur', () => { focus = false; });

        // Public API
        return {
            updateOptions(newOptions) {
                Object.assign(options, newOptions);
            },
            updateCode(code) {
                editor.textContent = code;
                doHighlight(editor);
                onUpdate(code);
                recordHistory();
            },
            onUpdate(cb) {
                onUpdate = cb;
            },
            toString() {
                return editor.textContent || '';
            },
            save() {
                return save();
            },
            restore(pos) {
                restore(pos);
            },
            recordHistory,
            destroy() {
                editor.removeEventListener('keydown', handleKeydown);
                editor.removeEventListener('input', handleInput);
            }
        };
    }

    return CodeJar;
})));