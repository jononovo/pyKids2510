// ============================================
// PYTHON SYNTAX HIGHLIGHTER MODULE
// ============================================

const PythonHighlighter = {
    colors: {
        keyword: '#ff79c6',
        comment: '#6272a4',
        string: '#f1fa8c',
        number: '#bd93f9',
        function: '#50fa7b',
        object: '#f8f8f2',
        default: '#e6e6e6'
    },
    
    keywords: [
        'import', 'from', 'as', 'if', 'else', 'elif', 'for', 'while',
        'def', 'class', 'return', 'pass', 'break', 'continue', 'and',
        'or', 'not', 'in', 'is', 'try', 'except', 'finally', 'with',
        'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del'
    ],
    
    gameFunctions: [
        'move_forward', 'turn_left', 'turn_right', 'push', 'build',
        'collect', 'jump', 'wait', 'check', 'scan'
    ],
    
    gameObjects: ['player', 'world', 'game'],
    
    highlight: function(code) {
        // First, escape HTML characters
        code = code.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
        
        // Split lines to handle comments properly
        const lines = code.split('\n');
        const highlightedLines = lines.map(line => {
            // Check if this line is a comment
            if (line.trim().startsWith('#')) {
                // It's a comment - wrap the entire line and don't process further
                return `<span style="color: ${this.colors.comment};">${line}</span>`;
            }
            
            // Check if line contains a comment (but doesn't start with one)
            const commentIndex = line.indexOf('#');
            let beforeComment = line;
            let commentPart = '';
            
            if (commentIndex !== -1) {
                beforeComment = line.substring(0, commentIndex);
                commentPart = line.substring(commentIndex);
            }
            
            // Process the non-comment part
            let highlighted = beforeComment;
            
            // Highlight strings first (to avoid matching keywords inside strings)
            highlighted = highlighted.replace(
                /(["'])(.*?)\1/g, 
                `<span style="color: ${this.colors.string};">$1$2$1</span>`
            );
            
            // Now highlight keywords (but not inside strings)
            const keywordRegex = new RegExp(`\\b(${this.keywords.join('|')})\\b`, 'g');
            highlighted = this.replaceOutsideSpans(highlighted, keywordRegex,
                `<span style="color: ${this.colors.keyword};">$1</span>`);
            
            // Highlight numbers
            highlighted = this.replaceOutsideSpans(highlighted, /\b(\d+)\b/g,
                `<span style="color: ${this.colors.number};">$1</span>`);
            
            // Highlight game functions
            const functionRegex = new RegExp(`\\b(${this.gameFunctions.join('|')})\\b`, 'g');
            highlighted = this.replaceOutsideSpans(highlighted, functionRegex,
                `<span style="color: ${this.colors.function};">$1</span>`);
            
            // Highlight game objects
            const objectRegex = new RegExp(`\\b(${this.gameObjects.join('|')})\\b`, 'g');
            highlighted = this.replaceOutsideSpans(highlighted, objectRegex,
                `<span style="color: ${this.colors.object};">$1</span>`);
            
            // Add the comment part if it exists
            if (commentPart) {
                highlighted += `<span style="color: ${this.colors.comment};">${commentPart}</span>`;
            }
            
            return highlighted;
        });
        
        return highlightedLines.join('\n');
    },
    
    // Helper function to replace only outside of existing <span> tags
    replaceOutsideSpans: function(text, regex, replacement) {
        // Split by spans to avoid replacing inside them
        const parts = text.split(/(<span[^>]*>.*?<\/span>)/);
        return parts.map(part => {
            // If this part is a span, don't modify it
            if (part.startsWith('<span')) {
                return part;
            }
            // Otherwise, apply the replacement
            return part.replace(regex, replacement);
        }).join('');
    }
};

window.PythonHighlighter = PythonHighlighter;