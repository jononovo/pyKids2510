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

    function helperText(name) {
        return 'This line calls ' + name + '() from helpers.py, and it stopped inside ' + name + '(). Check what you gave it.';
    }

    function explainPythonError(error, hiddenLineCount, helpersFile) {
        const frames = error.traceback || [];
        const mainFile = frames.length ? frames[frames.length - 1].filename : null;
        const mainAt = frames.findIndex(frame => frame.filename === mainFile);
        const calledFrame = mainAt > 0 ? frames[mainAt - 1] : null;
        const syntaxError = error.tp$name === 'SyntaxError';
        const helper = !syntaxError && calledFrame && calledFrame.filename === helpersFile ? LevelHelpers.functionAt(calledFrame.lineno - hiddenLineCount) : null;
        return {
            line: mainAt >= 0 ? Math.max(1, frames[mainAt].lineno - hiddenLineCount) : null,
            text: helper ? helperText(helper) : errorText(error),
            syntaxError: syntaxError
        };
    }

    window.explainPythonError = explainPythonError;
})();
