// ============================================
//   BLOCKLY CONFIGURATION
// ============================================

window.BlocklyConfig = {
    // Workspace configuration
    workspace: {
        grid: {
            spacing: 20,
            length: 1,
            colour: '#3a3a3a',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 0.8,  // Reduced by 20% for smaller blocks
            maxScale: 2,
            minScale: 0.5
        },
        trashcan: true,
        renderer: 'zelos',
        // Theme will be set dynamically when Blockly is loaded
        theme: null
    },
    
    // Block colors
    colors: {
        movement: '#7fc542',
        control: '#8b5cf6',
        math: '#f59e0b',
        variables: '#ec4899'
    },
    
    // Toolbox XML template
    getToolboxXML: function() {
        return `
        <xml id="blockly-toolbox">
            <category name="Movement" colour="${this.colors.movement}">
                <block type="import_player"></block>
                <sep></sep>
                <block type="player_move_forward"></block>
                <block type="player_move_steps">
                    <value name="STEPS">
                        <shadow type="math_number">
                            <field name="NUM">3</field>
                        </shadow>
                    </value>
                </block>
                <block type="player_turn_left"></block>
                <block type="player_turn_right"></block>
            </category>
            <category name="Control" colour="${this.colors.control}">
                <block type="controls_repeat_ext">
                    <value name="TIMES">
                        <shadow type="math_number">
                            <field name="NUM">3</field>
                        </shadow>
                    </value>
                </block>
                <block type="controls_whileUntil"></block>
                <block type="controls_if"></block>
                <block type="controls_if">
                    <mutation else="1"></mutation>
                </block>
            </category>
            <category name="Math" colour="${this.colors.math}">
                <block type="math_number">
                    <field name="NUM">1</field>
                </block>
                <block type="math_arithmetic">
                    <value name="A">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="B">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="math_random_int">
                    <value name="FROM">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="TO">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                    </value>
                </block>
            </category>
            <category name="Variables" colour="${this.colors.variables}" custom="VARIABLE"></category>
        </xml>`;
    },
    
    // Simple toolbox without categories - just the required blocks
    getSimpleToolboxXML: function(blockTypes) {
        // If no blocks specified, use a minimal default set
        if (!blockTypes || blockTypes.length === 0) {
            blockTypes = ['import_player', 'player_move_forward'];
        }
        
        let xml = '<xml id="blockly-toolbox">';
        
        // Add blocks in a logical order
        const blockOrder = [
            'import_player',
            'player_move_forward',
            'player_move_steps',
            'player_turn_left', 
            'player_turn_right',
            'controls_repeat_ext',
            'controls_if',
            'controls_whileUntil',
            'math_number'
        ];
        
        // Add each required block in order
        blockOrder.forEach(blockType => {
            if (!blockTypes.includes(blockType)) return;
            
            switch(blockType) {
                case 'import_player':
                    xml += '<block type="import_player"></block>';
                    break;
                    
                case 'player_move_forward':
                    xml += '<block type="player_move_forward"></block>';
                    break;
                    
                case 'player_move_steps':
                    xml += `<block type="player_move_steps">
                        <value name="STEPS">
                            <shadow type="math_number">
                                <field name="NUM">3</field>
                            </shadow>
                        </value>
                    </block>`;
                    break;
                    
                case 'player_turn_left':
                    xml += '<block type="player_turn_left"></block>';
                    break;
                    
                case 'player_turn_right':
                    xml += '<block type="player_turn_right"></block>';
                    break;
                    
                case 'controls_repeat_ext':
                    xml += `<block type="controls_repeat_ext">
                        <value name="TIMES">
                            <shadow type="math_number">
                                <field name="NUM">3</field>
                            </shadow>
                        </value>
                    </block>`;
                    break;
                    
                case 'controls_if':
                    xml += '<block type="controls_if"></block>';
                    break;
                    
                case 'controls_whileUntil':
                    xml += '<block type="controls_whileUntil"></block>';
                    break;
                    
                case 'math_number':
                    xml += '<block type="math_number"><field name="NUM">1</field></block>';
                    break;
            }
            
            // Add small separator between blocks
            xml += '<sep gap="8"></sep>';
        });
        
        xml += '</xml>';
        return xml;
    }
};