const GuideBubble = (function() {
    'use strict';

    const GAP = 10;
    const LEFT = 6;

    let bubble = null;
    let state = null;

    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function bubbleElement() {
        const box = document.getElementById('editor').parentNode;
        if (bubble && bubble.parentNode === box) return bubble;
        bubble = make('div', 'guide-bubble');
        bubble.setAttribute('role', 'dialog');
        bubble.setAttribute('aria-label', 'The guide');
        bubble.hidden = true;
        bubble.addEventListener('mousedown', event => {
            if (event.target.closest('button')) event.preventDefault();
        });
        bubble.addEventListener('click', event => {
            if (event.target.closest('.guide-show-me')) {
                state.revealed = true;
                render();
            } else if (event.target.closest('.guide-close')) {
                close();
            }
        });
        box.appendChild(bubble);
        return bubble;
    }

    const visibleSpaces = text => (/^\s+$/.test(text) ? text.replace(/ /g, '·') : text);

    function fixElement(fix) {
        const box = make('div', 'guide-fix');
        const line = box.appendChild(make('code', 'guide-fixed-line'));
        fix.pieces.forEach(piece => {
            if (piece.keep !== undefined) {
                line.appendChild(document.createTextNode(piece.keep));
            } else if (piece.swap) {
                line.appendChild(make('ins', 'guide-swap', piece.swap));
            } else {
                if (piece.remove) line.appendChild(make('del', 'guide-remove', visibleSpaces(piece.remove)));
                if (piece.add) line.appendChild(make('ins', 'guide-add', visibleSpaces(piece.add)));
            }
        });
        const words = box.appendChild(make('p', 'guide-words'));
        fix.words.forEach((part, index) => words.appendChild(index % 2 ? make('b', '', part) : document.createTextNode(part)));
        return box;
    }

    function render() {
        const element = bubbleElement();
        const hints = [...new Set(state.mistakes.map(mistake => mistake.hint))];
        const fixes = state.mistakes.filter(mistake => mistake.fix).map(mistake => mistake.fix);
        element.textContent = '';
        element.appendChild(make('span', 'guide-face', '🐶')).setAttribute('aria-hidden', 'true');
        const say = element.appendChild(make('div', 'guide-say'));
        hints.forEach(hint => say.appendChild(make('p', 'guide-hint', hint)));
        if (fixes.length && state.revealed) fixes.forEach(fix => say.appendChild(fixElement(fix)));
        if (fixes.length && !state.revealed) say.appendChild(make('button', 'guide-show-me', 'Show me ›')).type = 'button';
        const closeButton = element.appendChild(make('button', 'guide-close', '×'));
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Close the guide');
        place();
    }

    function open(lineNumber, mistakes, onRedLine) {
        state = { line: lineNumber, mistakes: mistakes, onRedLine: onRedLine, revealed: false };
        render();
    }

    function update(lineNumber, mistakes) {
        state.line = lineNumber;
        state.mistakes = mistakes;
        render();
    }

    function close() {
        state = null;
        if (bubble) bubble.hidden = true;
    }

    function place() {
        if (!state || !bubble) return;
        const position = EditorManager.linePosition(state.line);
        bubble.hidden = !position;
        if (!position) return;
        const editor = document.getElementById('editor');
        const aboveTop = position.top - bubble.offsetHeight - GAP;
        const fitsAbove = aboveTop >= editor.offsetTop;
        const nextLineRoom = state.mistakes.some(mistake => mistake.addsLine) ? parseFloat(getComputedStyle(editor).lineHeight) : 0;
        bubble.classList.toggle('below', !fitsAbove);
        bubble.style.top = (fitsAbove ? aboveTop : position.bottom + nextLineRoom + GAP) + 'px';
        bubble.style.left = editor.offsetLeft + LEFT + 'px';
    }

    function redLine() {
        return state && state.onRedLine ? state.line : null;
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && state) close();
    });

    return {
        open: open,
        update: update,
        close: close,
        place: place,
        redLine: redLine
    };
})();

window.GuideBubble = GuideBubble;
