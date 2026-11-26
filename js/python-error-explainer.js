(function() {
    'use strict';

    const INDENTATION_MESSAGE = 'unindent does not match any outer indentation level';

    const MEANINGS = {
        TypeError: 'That means a value is the wrong kind for what this line does with it, like adding a number to text.',
        IndexError: "That means there's no item at that position. Positions start at 0."
    };

    function pythonMessage(error) {
        return error.args && error.args.v.length > 0 ? String(Sk.ffi.remapToJs(error.args.v[0])) : String(error);
    }

    function errorName(error, message) {
        if (error.tp$name === 'SyntaxError' && message === INDENTATION_MESSAGE) return 'IndentationError';
        return error.tp$name;
    }

    function plainWords(name, message) {
        if (name === 'NameError') {
            const unknownName = message.match(/name '(.+)' is not defined/);
            return "Python doesn't know " + (unknownName ? unknownName[1] : 'a name on this line') + '. Check the spelling.';
        }
        if (name === 'SyntaxError') return "Python can't read this line. Check the brackets, quotes and the colon at the end.";
        if (name === 'IndentationError') return "The spaces at the start of this line don't line up.";
        if (MEANINGS[name]) return message + '. ' + MEANINGS[name];
        return message;
    }

    function errorText(error) {
        if (!(error instanceof Sk.builtin.BaseException)) return String(error.message || error);
        if (error.tp$name === 'ExternalError') return String((error.nativeError && error.nativeError.message) || pythonMessage(error));
        const message = pythonMessage(error);
        const name = errorName(error, message);
        return plainWords(name, message) + ' (' + name + ')';
    }

    function explainPythonError(error, hiddenLineCount) {
        const firstFrame = error.traceback && error.traceback[0];
        return {
            line: firstFrame ? Math.max(1, firstFrame.lineno - hiddenLineCount) : null,
            text: errorText(error),
            syntaxError: error.tp$name === 'SyntaxError'
        };
    }

    window.explainPythonError = explainPythonError;
})();
