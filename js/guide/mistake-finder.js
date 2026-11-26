const MistakeFinder = (function() {
    'use strict';

    const BLOCK_STARTERS = /^(if|elif|else|for|while|def|class|try|except|finally|with)\b/;
    const COMPARE_STARTERS = /^(if|elif|while)\b/;
    const STATEMENT_START = /^(?:(?:if|elif|else|for|while|def|class|return|import|from|try|except|finally|with|pass|break|continue|global|nonlocal|del|assert|raise)\b|[A-Za-z_][\w.]*\s*(?:\(|\[|[-+*/%]?=(?!=)))/;
    const SINGLE_VALUE = /^(?:-?\d+(?:\.\d+)?|"[^"]*"|'[^']*'|[A-Za-z_]\w*)$/;
    const OPENERS = { '(': ')', '[': ']', '{': '}' };
    const CLOSERS = { ')': '(', ']': '[', '}': '{' };
    const STRING_PREFIX = /^(?:[rRbBuUfF]|[rR][bBfF]|[bBfF][rR])$/;
    const COMMON_PYTHON = ['print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'input', 'abs', 'min', 'max', 'sum', 'sorted', 'round', 'type', 'enumerate', 'zip'];

    function gameNames() {
        const keywords = Object.keys(Sk.ParseTables.keywords);
        return {
            keywords: keywords,
            python: keywords.concat(Object.keys(Sk.builtins).map(name => name.replace(/_\$rw\$$/, ''))),
            commonPython: COMMON_PYTHON,
            playerModule: window.playerModuleNames(),
            preludeImports: SkulptRuntime.preludeImports,
            backpackMethods: PythonBackpackInventory.backpackMethods,
            inventoryMethods: PythonBackpackInventory.inventoryMethods
        };
    }

    function editSteps(typed, target) {
        const rows = typed.length + 1;
        const cols = target.length + 1;
        const cost = Array.from({ length: rows }, () => new Array(cols).fill(0));
        for (let i = 0; i < rows; i++) cost[i][0] = i;
        for (let j = 0; j < cols; j++) cost[0][j] = j;
        for (let i = 1; i < rows; i++) {
            for (let j = 1; j < cols; j++) {
                const same = typed[i - 1] === target[j - 1] ? 0 : 1;
                cost[i][j] = Math.min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + same);
                if (i > 1 && j > 1 && typed[i - 1] === target[j - 2] && typed[i - 2] === target[j - 1]) cost[i][j] = Math.min(cost[i][j], cost[i - 2][j - 2] + 1);
            }
        }
        const pieces = [];
        let i = typed.length;
        let j = target.length;
        while (i > 0 || j > 0) {
            if (i > 1 && j > 1 && typed[i - 1] === target[j - 2] && typed[i - 2] === target[j - 1] && cost[i][j] === cost[i - 2][j - 2] + 1) {
                pieces.unshift({ swap: target.slice(j - 2, j) });
                i -= 2;
                j -= 2;
            } else if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + (typed[i - 1] === target[j - 1] ? 0 : 1)) {
                pieces.unshift(typed[i - 1] === target[j - 1] ? { keep: target[j - 1] } : { remove: typed[i - 1], add: target[j - 1] });
                i -= 1;
                j -= 1;
            } else if (j > 0 && cost[i][j] === cost[i][j - 1] + 1) {
                pieces.unshift({ add: target[j - 1] });
                j -= 1;
            } else {
                pieces.unshift({ remove: typed[i - 1] });
                i -= 1;
            }
        }
        return { distance: cost[typed.length][target.length], pieces: joinPieces(pieces) };
    }

    function joinPieces(pieces) {
        const joined = [];
        for (const piece of pieces) {
            const last = joined[joined.length - 1];
            if (last && piece.keep !== undefined && last.keep !== undefined) last.keep += piece.keep;
            else joined.push({ ...piece });
        }
        return joined;
    }

    const allowedDistance = word => (word.length <= 4 ? 1 : word.length <= 10 ? 2 : 3);
    const indentOf = line => line.match(/^\s*/)[0].length;
    const isBlank = entry => !entry.line.trim() || entry.line.trim().startsWith('#');

    function scanCode(source) {
        const scanned = [];
        let triple = null;
        for (const line of source.split('\n')) {
            let code = '';
            let quote = null;
            let quoteAt = -1;
            let i = 0;
            while (i < line.length) {
                const character = line[i];
                if (triple) {
                    if (line.startsWith(triple, i)) {
                        code += '   ';
                        i += 3;
                        triple = null;
                    } else {
                        code += ' ';
                        i += 1;
                    }
                    continue;
                }
                if (quote) {
                    if (character === '\\') {
                        code += '  ';
                        i += 2;
                        continue;
                    }
                    code += ' ';
                    if (character === quote) quote = null;
                    i += 1;
                    continue;
                }
                if (character === '#') break;
                if (character === '"' || character === "'") {
                    const prefix = code.match(/([A-Za-z]{1,2})$/);
                    if (prefix && STRING_PREFIX.test(prefix[1]) && !/\w/.test(code[code.length - prefix[1].length - 1] || '')) code = code.slice(0, code.length - prefix[1].length) + ' '.repeat(prefix[1].length);
                    if (line.startsWith(character.repeat(3), i)) {
                        triple = character.repeat(3);
                        code += '   ';
                        i += 3;
                        continue;
                    }
                    quote = character;
                    quoteAt = i;
                    code += ' ';
                    i += 1;
                    continue;
                }
                code += character;
                i += 1;
            }
            scanned.push({ line: line, code: code, openQuote: quote, quoteAt: quoteAt, endsInsideTriple: Boolean(triple) });
        }
        return scanned;
    }

    function depthZeroIndex(code, test) {
        let depth = 0;
        for (let i = 0; i < code.length; i++) {
            const character = code[i];
            if (OPENERS[character]) depth += 1;
            else if (CLOSERS[character]) depth = Math.max(0, depth - 1);
            else if (depth === 0 && test(code, i)) return i;
        }
        return -1;
    }

    const isSingleEquals = (code, i) => code[i] === '=' && code[i + 1] !== '=' && !'=!<>:+-*/%&|^@'.includes(code[i - 1] || '');

    function namesFrom(text) {
        return text
            .split(',')
            .map(part => part.replace(/[()[\]*\s]/g, ' ').trim().split(/\s|:|=/)[0])
            .filter(name => /^[A-Za-z_]\w*$/.test(name));
    }

    function assignmentTargets(code) {
        const cuts = [];
        let depth = 0;
        for (let i = 0; i < code.length; i++) {
            const character = code[i];
            if (OPENERS[character]) depth += 1;
            else if (CLOSERS[character]) depth = Math.max(0, depth - 1);
            else if (depth === 0 && isSingleEquals(code, i)) cuts.push([i, i + 1]);
            else if (depth === 0 && code[i + 1] === '=' && '+-*/%&|^@'.includes(character) && code[i + 2] !== '=') {
                cuts.push([i, i + 2]);
                i += 1;
            }
        }
        const targets = [];
        let from = 0;
        for (const [cutStart, cutEnd] of cuts) {
            targets.push(...namesFrom(code.slice(from, cutStart).replace(/\.[A-Za-z_]\w*|\[[^\]]*\]/g, '')));
            from = cutEnd;
        }
        return targets;
    }

    function studentNames(statements) {
        const names = new Set();
        const add = list => list.forEach(name => names.add(name));
        for (const statement of statements) {
            const code = statement.code;
            for (const match of code.matchAll(/\b(?:def|class)\s+([A-Za-z_]\w*)\s*(?:\(([^)]*)\))?/g)) {
                names.add(match[1]);
                if (match[2]) add(match[2].split(',').map(part => part.replace(/[*\s]/g, '').split(/[:=]/)[0]).filter(Boolean));
            }
            for (const match of code.matchAll(/\bfor\s+([^:]+?)\s+in\b/g)) add(namesFrom(match[1]));
            for (const match of code.matchAll(/\blambda\s+([^:]*):/g)) add(namesFrom(match[1]));
            for (const match of code.matchAll(/\bas\s+([A-Za-z_]\w*)/g)) names.add(match[1]);
            for (const match of code.matchAll(/\b(?:global|nonlocal)\s+([^#]+)/g)) add(namesFrom(match[1]));
            for (const match of code.matchAll(/([A-Za-z_]\w*)\s*:=/g)) names.add(match[1]);
            const importMatch = code.match(/^\s*import\s+(.+)$/);
            if (importMatch) add(importMatch[1].split(',').map(part => part.trim().split(/\s+as\s+/).pop().split('.')[0]));
            const fromMatch = code.match(/^\s*from\s+\S+\s+import\s+(.+)$/);
            if (fromMatch) add(fromMatch[1].replace(/[()]/g, '').split(',').map(part => part.trim().split(/\s+as\s+/).pop()).filter(name => name !== '*'));
            add(assignmentTargets(code));
        }
        return names;
    }

    const closersFor = stack => stack.map(opener => OPENERS[opener]).reverse().join('');

    function firstExtraCloser(scanned, start, last) {
        const stack = [];
        for (let i = start; i <= last; i++) {
            const code = scanned[i].code;
            for (let at = 0; at < code.length; at++) {
                const character = code[at];
                if (OPENERS[character]) stack.push(character);
                else if (CLOSERS[character]) {
                    if (stack.length && stack[stack.length - 1] === CLOSERS[character]) stack.pop();
                    else return { line: i, at: at, character: character };
                }
            }
        }
        return null;
    }

    function splitStatements(scanned) {
        const statements = [];
        let index = 0;
        while (index < scanned.length) {
            if (isBlank(scanned[index])) {
                index += 1;
                continue;
            }
            const start = index;
            const indent = indentOf(scanned[start].line);
            const stack = [];
            const stackAfter = [];
            let end = start;
            for (let i = start; i < scanned.length; i++) {
                if (i > start && isBlank(scanned[i])) {
                    stackAfter[i] = stack.slice();
                    continue;
                }
                for (const character of scanned[i].code) {
                    if (OPENERS[character]) stack.push(character);
                    else if (CLOSERS[character] && stack.length && stack[stack.length - 1] === CLOSERS[character]) stack.pop();
                }
                stackAfter[i] = stack.slice();
                end = i;
                if (!stack.length && !scanned[i].code.trimEnd().endsWith('\\') && !scanned[i].endsInsideTriple) break;
            }
            let last = end;
            let missing = null;
            if (stack.length) {
                const firstCode = scanned[start].code;
                if (BLOCK_STARTERS.test(firstCode.trim()) && /:\s*$/.test(firstCode)) {
                    last = start;
                    missing = { line: start, closers: closersFor(stackAfter[start]), beforeColon: true };
                } else {
                    for (let j = start + 1; j <= end; j++) {
                        if (!isBlank(scanned[j]) && indentOf(scanned[j].line) <= indent && STATEMENT_START.test(scanned[j].code.trim())) {
                            last = j - 1;
                            while (last > start && isBlank(scanned[last])) last -= 1;
                            break;
                        }
                    }
                    missing = { line: last, closers: closersFor(stackAfter[last]) };
                }
            }
            const lines = [];
            for (let i = start; i <= last; i++) if (i === start || !isBlank(scanned[i])) lines.push(i + 1);
            statements.push({
                firstLine: start + 1,
                lastLine: last + 1,
                lines: lines,
                indent: indent,
                code: lines.map(number => scanned[number - 1].code).join('\n'),
                missing: missing,
                extraCloser: firstExtraCloser(scanned, start, last)
            });
            index = last + 1;
        }
        return statements;
    }

    const piecesForEnd = (line, added) => [{ keep: line.trimEnd() }, { add: added }];

    function find(source, knownNames = gameNames()) {
        const scanned = scanCode(source);
        const lines = scanned.map(entry => entry.line);
        const statements = splitStatements(scanned);
        const ownNames = studentNames(statements);
        const keywords = new Set(knownNames.keywords);
        const commandNames = knownNames.playerModule.filter(name => !['backpack', 'inventory'].includes(name));
        const known = new Set([...knownNames.python, ...knownNames.playerModule, ...knownNames.preludeImports, ...ownNames]);
        const suggestions = [...new Set([...knownNames.playerModule, ...knownNames.preludeImports, ...knownNames.keywords, ...knownNames.commonPython, ...ownNames])];
        const memberNames = { player: knownNames.playerModule, backpack: knownNames.backpackMethods, inventory: knownNames.inventoryMethods };
        const skipQuoteChecks = /"""|'''/.test(source);
        const mistakes = [];
        const unknownWordLines = new Set();
        const report = (line, kind, hint, pieces, words) => mistakes.push({ line: line, kind: kind, hint: hint, fix: pieces ? { pieces: pieces, words: words } : null });
        let previous = null;

        for (const statement of statements) {
            const first = statement.firstLine;
            const last = statement.lastLine;
            const firstText = lines[first - 1];
            const lastText = lines[last - 1];
            const trimmed = statement.code.trim();
            const firstWord = (trimmed.match(/^[A-Za-z_]\w*/) || [''])[0];
            const startsBlock = BLOCK_STARTERS.test(trimmed) || (!known.has(firstWord) && BLOCK_STARTERS.test(firstWord.toLowerCase()));
            const colonMissing = startsBlock && !statement.missing && depthZeroIndex(statement.code, (text, i) => text[i] === ':' && text[i + 1] !== '=') === -1;
            const opensBlock = startsBlock && (/:\s*$/.test(statement.code) || colonMissing);

            if (previous && previous.opensBlock && statement.indent <= previous.indent) {
                const needed = ' '.repeat(previous.indent + 4 - statement.indent);
                report(first, 'indent', 'This line belongs inside the line above it.', [{ add: needed }, { keep: firstText }], ['Add ', needed.length + ' spaces', ' at the start.']);
            } else if (previous && !previous.opensBlock && statement.indent > previous.indent) {
                report(first, 'indent', "This line starts with spaces it doesn't need.", [{ keep: firstText.slice(0, previous.indent) }, { remove: firstText.slice(previous.indent, statement.indent) }, { keep: firstText.slice(statement.indent) }], ['Take out the spaces at the start.']);
            }

            const elseIf = statement.code.match(/^(\s*)else\s+if\b/);
            if (elseIf) report(first, 'elif', 'Python has its own short word for this.', [{ keep: elseIf[1] }, { remove: firstText.slice(elseIf[1].length, elseIf[0].length), add: 'elif' }, { keep: firstText.slice(elseIf[0].length) }], ['Python writes ', 'else if', ' as ', 'elif', '.']);

            if (colonMissing) report(last, 'colon', "Something's missing at the end of this line.", piecesForEnd(lastText, ':'), ['Add a ', ':', ' at the end.']);

            if (COMPARE_STARTERS.test(trimmed)) {
                const lastCode = scanned[last - 1].code;
                const at = depthZeroIndex(lastCode, isSingleEquals);
                if (at > 0) report(last, 'compare', 'To compare two things, Python needs something different here.', [{ keep: lastText.slice(0, at) }, { remove: '=', add: '==' }, { keep: lastText.slice(at + 1) }], ['Use ', '==', ' to compare.']);
            }

            if (statement.missing && !scanned[statement.missing.line].openQuote) {
                const missing = statement.missing;
                const text = lines[missing.line];
                if (missing.beforeColon) {
                    const colonAt = scanned[missing.line].code.lastIndexOf(':');
                    report(missing.line + 1, 'bracket', 'A bracket is missing on this line.', [{ keep: text.slice(0, colonAt) }, { add: missing.closers }, { keep: text.slice(colonAt) }], ['Add ', missing.closers, ' before the ', ':', '.']);
                } else {
                    report(missing.line + 1, 'bracket', 'A bracket is missing on this line.', piecesForEnd(text, missing.closers), ['Add ', missing.closers, ' at the end.']);
                }
            }
            if (statement.extraCloser && !scanned[statement.extraCloser.line].openQuote) {
                const extra = statement.extraCloser;
                const text = lines[extra.line];
                report(extra.line + 1, 'bracket', 'This line has a closing bracket too many.', [{ keep: text.slice(0, extra.at) }, { remove: extra.character }, { keep: text.slice(extra.at + 1) }], ['Take out one ', extra.character, '.']);
            }

            for (const number of statement.lines) {
                const entry = scanned[number - 1];
                const text = lines[number - 1];
                if (entry.openQuote && !skipQuoteChecks) {
                    const other = entry.openQuote === '"' ? "'" : '"';
                    const otherAt = text.lastIndexOf(other);
                    if (otherAt > entry.quoteAt) {
                        report(number, 'quote', "The quotes around some text on this line don't match.", [{ keep: text.slice(0, otherAt) }, { remove: other, add: entry.openQuote }, { keep: text.slice(otherAt + 1) }], ['Use ', entry.openQuote, ' at both ends of the text.']);
                    } else {
                        const closing = text.trimEnd().match(/\)*$/)[0];
                        const body = text.trimEnd().slice(0, text.trimEnd().length - closing.length);
                        report(number, 'quote', 'Some text on this line has no closing quote.', [{ keep: body }, { add: entry.openQuote }, { keep: closing }], ['Add ', entry.openQuote, ' to close the text.']);
                    }
                }
                const handled = new Set();
                for (const match of entry.code.matchAll(/\b([A-Za-z_]\w*) +([A-Za-z_]\w*)\b/g)) {
                    const joined = match[1] + '_' + match[2];
                    if (commandNames.includes(joined) && !known.has(match[1])) {
                        const at = match.index;
                        const secondAt = at + match[0].length - match[2].length;
                        report(number, 'space', "A name on this line has a space in it. Python's names can't.", [{ keep: text.slice(0, at + match[1].length) }, { remove: text.slice(at + match[1].length, secondAt), add: '_' }, { keep: text.slice(secondAt) }], ['Use ', '_', ' instead of the space: ', joined, '.']);
                        handled.add(at);
                        handled.add(secondAt);
                    }
                }
                for (const match of entry.code.matchAll(/\b[A-Za-z_]\w*\b/g)) {
                    const word = match[0];
                    const at = match.index;
                    if (handled.has(at) || /^\d/.test(word)) continue;
                    const before = entry.code.slice(0, at);
                    const after = entry.code.slice(at + word.length);
                    if (/^\s*=(?!=)/.test(after)) continue;
                    const dot = before.match(/([A-Za-z_]\w*)\s*\.\s*$/);
                    let candidates = suggestions;
                    if (dot) {
                        if (!memberNames[dot[1]]) continue;
                        candidates = memberNames[dot[1]];
                        if (candidates.includes(word)) continue;
                    } else if (/\.\s*$/.test(before) || known.has(word)) {
                        continue;
                    }
                    const sameButCapitals = candidates.find(name => name.toLowerCase() === word.toLowerCase());
                    if (sameButCapitals) {
                        report(number, 'capitals', 'Python cares about capital letters. A word on this line has the wrong ones.', [{ keep: text.slice(0, at) }, ...editSteps(word, sameButCapitals).pieces, { keep: text.slice(at + word.length) }], ["It's ", sameButCapitals, '.']);
                        continue;
                    }
                    let best = null;
                    if (word.length >= 3) {
                        for (const name of candidates) {
                            const result = editSteps(word, name);
                            if (result.distance <= allowedDistance(word) && (!best || result.distance < best.distance)) best = { name: name, distance: result.distance, pieces: result.pieces };
                        }
                    }
                    if (best) report(number, 'spelling', 'A word on this line looks mistyped.', [{ keep: text.slice(0, at) }, ...best.pieces, { keep: text.slice(at + word.length) }], ["It's ", best.name, '.']);
                    else unknownWordLines.add(number);
                }
            }

            if (statement.lines.length === 1 && !startsBlock) {
                const bare = trimmed.match(/^(?:player\s*\.\s*)?([A-Za-z_]\w*)$/);
                if (bare && commandNames.includes(bare[1]) && !ownNames.has(bare[1])) report(last, 'call', 'This command needs something after it to run.', piecesForEnd(lastText, '()'), ['Add ', '()', ' after the command.']);
                const value = firstText.match(/^(\s*(?:player\s*\.\s*)?([A-Za-z_]\w*))([ \t]+)(\S.*?)\s*$/);
                if (value && commandNames.includes(value[2]) && SINGLE_VALUE.test(value[4]) && !keywords.has(value[4])) {
                    report(first, 'value', "Python can't read a command and its value like this.", [{ keep: value[1] }, { remove: value[3], add: '(' }, { keep: value[4] }, { add: ')' }], ['The value goes in brackets: ', value[1].trim() + '(' + value[4] + ')', '.']);
                }
            }

            previous = { indent: statement.indent, opensBlock: opensBlock };
        }
        return { mistakes: mistakes, unknownWordLines: unknownWordLines };
    }

    return { find: find, editSteps: editSteps };
})();

window.MistakeFinder = MistakeFinder;
