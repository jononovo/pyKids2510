// ============================================
//   CUSTOM BLOCKLY CODE GENERATOR
// ============================================

window.BlocklyGenerator = {
    // Initialize the custom generator
    init: function() {
        // Custom code generator initialized
    },
    
    // Generate code from workspace
    generateCode: function(workspace) {
        if (!workspace) {
            return '';
        }
        
        try {
            // Get all top-level blocks in the workspace
            const topBlocks = workspace.getTopBlocks(true);
            const codeLines = [];
            
            // Process each block chain
            topBlocks.forEach(block => {
                this.processBlockChain(block, codeLines);
            });
            
            // Join all lines with newlines
            return codeLines.filter(line => line).join('\n');
        } catch (error) {
            // Error generating code
            return '';
        }
    },
    
    // Process a chain of connected blocks
    processBlockChain: function(block, codeLines) {
        while (block) {
            // Handle different block types
            if (block.type === 'repeat_times') {
                const nestedCode = this.processRepeatBlock(block);
                if (nestedCode) {
                    codeLines.push(nestedCode);
                }
            } else {
                const line = this.blockToCode(block);
                if (line) {
                    codeLines.push(line);
                }
            }
            
            // Move to next block in chain
            block = block.getNextBlock();
        }
    },
    
    // Convert a single block to its Python code
    blockToCode: function(block) {
        const generators = {
            'import_player': () => 'import player',
            'player_move_forward': () => 'player.move_forward()',
            'player_turn_left': () => 'player.turn_left()',
            'player_turn_right': () => 'player.turn_right()',
            'player_move_steps': (block) => {
                // Get the value from the connected block or field
                const stepsInput = block.getInput('STEPS');
                let steps = 1;
                
                if (stepsInput && stepsInput.connection && stepsInput.connection.targetBlock()) {
                    // If there's a connected value block, get its value
                    const valueBlock = stepsInput.connection.targetBlock();
                    steps = valueBlock.getFieldValue('NUM') || 1;
                } else {
                    // Otherwise try to get from a direct field
                    steps = block.getFieldValue('STEPS') || 1;
                }
                
                return `player.move_forward(${steps})`;
            },
            'move_forward': () => 'player.move_forward()',
            'turn_left': () => 'player.turn_left()',  
            'turn_right': () => 'player.turn_right()',
            'move_forward_steps': (block) => {
                const steps = block.getFieldValue('NUM') || 1;
                return `player.move_forward(${steps})`;
            }
        };
        
        const generator = generators[block.type];
        return generator ? generator(block) : null;
    },
    
    // Process repeat/loop blocks
    processRepeatBlock: function(block) {
        const times = block.getFieldValue('TIMES') || 1;
        const innerBlocks = block.getInputTargetBlock('DO');
        
        if (!innerBlocks) {
            return null;
        }
        
        // Get code for inner blocks
        const innerCode = [];
        this.processBlockChain(innerBlocks, innerCode);
        
        if (innerCode.length === 0) {
            return null;
        }
        
        // Format as Python for loop
        const indentedCode = innerCode.map(line => '    ' + line).join('\n');
        return `for i in range(${times}):\n${indentedCode}`;
    }
};