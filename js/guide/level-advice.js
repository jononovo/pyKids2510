(function() {
    'use strict';

    const GENERAL_TIP = { hint: 'Try adding more movement commands to reach the goal.', code: 'player.move_forward()' };

    function codeLines(code) {
        return code.split('\n')
            .map((text, index) => ({ line: index + 1, indent: text.match(/^\s*/)[0], text: text.trim().replace(/\s+/g, ' ') }))
            .filter(entry => entry.text && !entry.text.startsWith('#') && !entry.text.startsWith('import'));
    }

    function linesAreEquivalent(studentLine, solutionLine) {
        if (studentLine === solutionLine) return true;
        if (studentLine.includes('move_forward()') && solutionLine.includes('move_forward(1)')) return true;
        if (studentLine.includes('move_forward(1)') && solutionLine.includes('move_forward()')) return true;
        return false;
    }

    function changeMarks(typed, wanted) {
        const marks = [];
        let changes = [];
        const endChanges = () => {
            if (changes.length === 1) marks.push(changes[0]);
            if (changes.length > 1) {
                marks.push({
                    remove: changes.map(piece => (piece.swap ? piece.swap[1] + piece.swap[0] : piece.remove || '')).join(''),
                    add: changes.map(piece => piece.swap || piece.add || '').join('')
                });
            }
            changes = [];
        };
        MistakeFinder.editSteps(typed, wanted).pieces.forEach(piece => {
            if (piece.keep === undefined) {
                changes.push(piece);
                return;
            }
            endChanges();
            marks.push(piece);
        });
        endChanges();
        return marks;
    }

    function generalTip(line) {
        return { line: line, hint: GENERAL_TIP.hint, addsLine: true, fix: { pieces: [{ add: GENERAL_TIP.code }], words: ['For example.'] } };
    }

    function levelAdvice(code) {
        const student = codeLines(code);
        const solution = codeLines(courseData.levels[currentLevel].solutionCode || '').map(entry => entry.text);
        const lastLine = student.length ? student[student.length - 1].line : 1;
        if (!solution.length) return generalTip(lastLine);
        const wrong = student.map((entry, index) => ({ entry: entry, right: solution[index] })).filter(pair => !linesAreEquivalent(pair.entry.text, pair.right || ''));
        if (wrong.length > 2) return generalTip(lastLine);
        if (!wrong.length && student.length < solution.length) {
            return { line: lastLine, hint: 'Good start! You need more commands to reach the goal.', addsLine: true, fix: { pieces: [{ add: solution[student.length] }], words: ['Add this on the next line.'] } };
        }
        if (wrong.length && wrong[0].right !== undefined) {
            const entry = wrong[0].entry;
            const right = wrong[0].right;
            return { line: entry.line, hint: 'This line is different from what the level needs.', fix: { pieces: [{ keep: entry.indent }, ...changeMarks(entry.text, right)], words: ["It's ", right, '.'] } };
        }
        return generalTip(lastLine);
    }

    function failedTestDescription() {
        const failed = TestRunner.lastFailedTests().find(test => test.description && String(test.description).trim());
        return failed ? String(failed.description).trim() : null;
    }

    function showLevelAdvice() {
        if (MistakeLines.openFirst()) return;
        const advice = levelAdvice(EditorManager.getCode());
        const description = failedTestDescription();
        if (description) advice.hint = description;
        EditorManager.placeCursorAtLineEnd(advice.line);
        GuideBubble.open(advice.line, [advice], false);
    }

    window.showLevelAdvice = showLevelAdvice;
})();
