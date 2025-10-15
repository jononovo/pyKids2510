// ============================================
//   SOLUTION SCANNER FOR DYNAMIC TOOLBOX
// ============================================

window.SolutionScanner = {
    // Scan the chapter markdown for required blocks
    scanChapterSolutions: async function() {
        const requiredBlocks = new Set();
        
        try {
            // Fetch the chapter markdown
            const response = await fetch('/assets/python-course-chapter1.md');
            const markdownText = await response.text();
            
            // Extract all solution code blocks (between <!-- Solution --> and ```)
            // Allow language tags like ```python
            const solutionRegex = /<!-- Solution -->\s*```(?:python)?\s*([\s\S]*?)```/g;
            const solutions = [];
            let match;
            
            while ((match = solutionRegex.exec(markdownText)) !== null) {
                solutions.push(match[1]);
            }
            
            // Analyze each solution for required blocks
            solutions.forEach(code => {
                // Check for import statement
                if (code.includes('import player')) {
                    requiredBlocks.add('import_player');
                }
                
                // Check for player functions
                if (code.includes('player.move_forward()')) {
                    requiredBlocks.add('player_move_forward');
                }
                
                // Check for move_forward with parameters
                if (/player\.move_forward\(\d+\)/.test(code)) {
                    requiredBlocks.add('player_move_steps');
                    requiredBlocks.add('math_number'); // For the number parameter
                }
                
                if (code.includes('player.turn_left()')) {
                    requiredBlocks.add('player_turn_left');
                }
                
                if (code.includes('player.turn_right()')) {
                    requiredBlocks.add('player_turn_right');
                }
                
                // Check for loops (not in current chapter but for future)
                if (/for\s+\w+\s+in\s+range/.test(code)) {
                    requiredBlocks.add('controls_repeat_ext');
                    requiredBlocks.add('math_number');
                }
                
                // Check for conditionals (not in current chapter but for future)
                if (/if\s+/.test(code)) {
                    requiredBlocks.add('controls_if');
                }
                
                if (/while\s+/.test(code)) {
                    requiredBlocks.add('controls_whileUntil');
                }
            });
            
            console.log('Required blocks found:', Array.from(requiredBlocks));
            return Array.from(requiredBlocks);
            
        } catch (error) {
            console.error('Error scanning solutions:', error);
            // Return basic blocks as fallback
            return ['import_player', 'player_move_forward', 'player_turn_left', 'player_turn_right'];
        }
    }
};