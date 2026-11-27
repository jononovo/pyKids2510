const LevelHelpers = (function() {
    'use strict';

    const READ_ONLY_LINE = "# Read-only: this lesson's helpers";
    const TOP_LEVEL_DEF = /^def\s+([A-Za-z_]\w*)/;

    let code = '';

    function setLevel(level) {
        code = level.helpers;
    }

    function hasHelpers() {
        return code !== '';
    }

    function fileText() {
        return READ_ONLY_LINE + '\n' + code;
    }

    function names() {
        return code.split('\n').map(line => line.match(TOP_LEVEL_DEF)).filter(Boolean).map(match => match[1]);
    }

    function functionAt(lineNumber) {
        const topLine = fileText().split('\n').slice(0, lineNumber).reverse().find(line => /^[^\s#]/.test(line));
        const definition = topLine && topLine.match(TOP_LEVEL_DEF);
        return definition ? definition[1] : null;
    }

    return {
        setLevel: setLevel,
        hasHelpers: hasHelpers,
        fileText: fileText,
        names: names,
        functionAt: functionAt
    };
})();

window.LevelHelpers = LevelHelpers;
