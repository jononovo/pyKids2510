const MistakeLines = (function() {
    'use strict';

    const ICON_PATH = 'M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z';
    const ICON_SIZE = 20;
    const KINDS_PYTHON_CAN_READ = ['spelling', 'capitals', 'call'];

    let red = new Map();
    let lines = [];
    let placed = new Map();
    let hoveredLine = null;
    let layer = null;
    let icon = null;
    const measure = document.createElement('canvas').getContext('2d');

    function editorBox() {
        return document.getElementById('editor').parentNode;
    }

    function ensureLayer() {
        const box = editorBox();
        if (layer && layer.parentNode === box) return;
        layer = document.createElement('div');
        layer.className = 'mistake-lines';
        layer.setAttribute('aria-hidden', 'true');
        icon = document.createElement('button');
        icon.type = 'button';
        icon.className = 'mistake-icon';
        icon.hidden = true;
        icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="' + ICON_PATH + '"/></svg>';
        icon.addEventListener('mousedown', event => event.preventDefault());
        icon.addEventListener('click', openIconLine);
        box.appendChild(layer);
        box.appendChild(icon);
        box.addEventListener('pointermove', followMouse);
        box.addEventListener('pointerleave', () => hover(null));
    }

    function byLine(mistakes) {
        const grouped = new Map();
        mistakes.forEach(mistake => {
            if (!grouped.has(mistake.line)) grouped.set(mistake.line, []);
            grouped.get(mistake.line).push(mistake);
        });
        return grouped;
    }

    function show(code, pythonMistake) {
        const found = MistakeFinder.find(code).mistakes;
        const grammarFound = found.some(mistake => !KINDS_PYTHON_CAN_READ.includes(mistake.kind));
        const pythonLineShown = pythonMistake && !found.some(mistake => mistake.line === pythonMistake.line) && !(pythonMistake.syntaxError && grammarFound);
        lines = code.split('\n');
        red = new Map();
        byLine(found).forEach((mistakes, line) => red.set(line, { mistakes: mistakes, text: lines[line - 1], fromPython: false }));
        if (pythonLineShown) {
            red.set(pythonMistake.line, { mistakes: [{ line: pythonMistake.line, kind: 'python', hint: pythonMistake.text, fix: null }], text: lines[pythonMistake.line - 1], fromPython: true });
        }
        GuideBubble.close();
        place();
    }

    function clear() {
        red = new Map();
        GuideBubble.close();
        place();
    }

    function lineMover(oldLines, newLines) {
        let same = 0;
        while (same < oldLines.length && same < newLines.length && oldLines[same] === newLines[same]) same++;
        let sameEnd = 0;
        while (sameEnd < oldLines.length - same && sameEnd < newLines.length - same && oldLines[oldLines.length - 1 - sameEnd] === newLines[newLines.length - 1 - sameEnd]) sameEnd++;
        const changedEnd = newLines.length - sameEnd;
        return line => {
            if (line <= same) return line;
            if (line > oldLines.length - sameEnd) return line + newLines.length - oldLines.length;
            return changedEnd > same ? Math.min(line, changedEnd) : null;
        };
    }

    function codeChanged(code) {
        const newLines = code.split('\n');
        if (red.size) keepRedLines(code, newLines);
        lines = newLines;
        place();
    }

    function keepRedLines(code, newLines) {
        const moveLine = lineMover(lines, newLines);
        const found = MistakeFinder.find(code);
        const fresh = byLine(found.mistakes);
        const openLine = GuideBubble.redLine();
        let openLineNow = null;
        const kept = new Map();
        red.forEach((entry, line) => {
            const moved = moveLine(line);
            if (moved === null) return;
            const text = newLines[moved - 1];
            let next = null;
            if (entry.fromPython) next = text === entry.text ? entry : null;
            else if (fresh.has(moved)) next = { mistakes: fresh.get(moved), text: text, fromPython: false };
            else if (found.unknownWordLines.has(moved)) next = { mistakes: entry.mistakes.map(mistake => ({ ...mistake, fix: null })), text: text, fromPython: false };
            if (!next) return;
            kept.set(moved, next);
            if (line === openLine) openLineNow = moved;
        });
        red = kept;
        if (openLine === null) return;
        if (openLineNow !== null && red.has(openLineNow)) GuideBubble.update(openLineNow, red.get(openLineNow).mistakes);
        else GuideBubble.close();
    }

    function place() {
        placed = new Map();
        if (red.size || layer) drawRedLines();
        GuideBubble.place();
    }

    function drawRedLines() {
        ensureLayer();
        layer.textContent = '';
        red.forEach((entry, line) => {
            const position = EditorManager.linePosition(line);
            if (!position) return;
            placed.set(line, position);
            const band = document.createElement('div');
            band.className = 'mistake-line';
            band.style.top = position.top + 'px';
            band.style.height = position.bottom - position.top + 'px';
            layer.appendChild(band);
        });
        placeIcon();
    }

    function iconLine() {
        if (hoveredLine !== null && red.has(hoveredLine)) return hoveredLine;
        const cursor = EditorManager.cursorLine();
        return cursor !== null && red.has(cursor) ? cursor : null;
    }

    function characterWidth() {
        measure.font = getComputedStyle(document.getElementById('editor')).font;
        return measure.measureText('M').width;
    }

    function placeIcon() {
        if (!icon) return;
        const line = iconLine();
        const position = line !== null ? placed.get(line) : null;
        icon.hidden = !position;
        if (!position) return;
        const rowHeight = position.bottom - position.lastRowTop;
        icon.style.left = Math.min(position.textEnd + 2 * characterWidth(), editorBox().clientWidth - ICON_SIZE) + 'px';
        icon.style.top = position.lastRowTop + (rowHeight - ICON_SIZE) / 2 + 'px';
        icon.dataset.line = String(line);
        icon.setAttribute('aria-label', 'Open the guide for line ' + line);
    }

    function followMouse(event) {
        if (event.pointerType !== 'mouse' || event.target.closest('.guide-bubble')) return;
        const y = event.clientY - editorBox().getBoundingClientRect().top;
        let line = null;
        placed.forEach((position, number) => {
            if (y >= position.top && y < position.bottom) line = number;
        });
        hover(line);
    }

    function hover(line) {
        if (line === hoveredLine) return;
        hoveredLine = line;
        placeIcon();
    }

    function openIconLine() {
        const line = Number(icon.dataset.line);
        if (!red.has(line)) return;
        if (EditorManager.cursorLine() !== line) EditorManager.placeCursorAtLineEnd(line);
        GuideBubble.open(line, red.get(line).mistakes, true);
    }

    function openFirst() {
        if (!red.size) return false;
        const first = Math.min(...red.keys());
        EditorManager.placeCursorAtLineEnd(first);
        GuideBubble.open(first, red.get(first).mistakes, true);
        placeIcon();
        return true;
    }

    document.addEventListener('selectionchange', () => {
        const openLine = GuideBubble.redLine();
        const cursor = EditorManager.cursorLine();
        if (openLine !== null && cursor !== null && cursor !== openLine) GuideBubble.close();
        placeIcon();
    });

    return {
        show: show,
        clear: clear,
        codeChanged: codeChanged,
        place: place,
        openFirst: openFirst
    };
})();

window.MistakeLines = MistakeLines;
