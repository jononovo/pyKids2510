// ============================================
//   CUSTOM MOVEMENT BLOCKS
// ============================================

// Define custom blocks for player movement commands
window.BlocklyMovementBlocks = {
    init: function() {
        // Import Player - The starting block
        Blockly.Blocks['import_player'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("🎮 Import Player");
                this.setNextStatement(true, null);
                this.setColour('#FF6B6B');  // Distinct red/pink color
                this.setTooltip("Add the player to the game map - This should be your first block!");
                this.setHelpUrl("");
            }
        };

        // Move Forward (simple)
        Blockly.Blocks['player_move_forward'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("➡️ Move Forward");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(BlocklyConfig.colors.movement);
                this.setTooltip("Move the player forward one step");
            }
        };

        // Move Forward with steps
        Blockly.Blocks['player_move_steps'] = {
            init: function() {
                this.appendValueInput("STEPS")
                    .setCheck("Number")
                    .appendField("🏃 Move Forward");
                this.appendDummyInput()
                    .appendField("steps");
                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(BlocklyConfig.colors.movement);
                this.setTooltip("Move forward a specific number of steps");
            }
        };

        // Turn Left
        Blockly.Blocks['player_turn_left'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("↺ Turn Left");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(BlocklyConfig.colors.movement);
                this.setTooltip("Turn the player 90 degrees left");
            }
        };

        // Turn Right
        Blockly.Blocks['player_turn_right'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("↻ Turn Right");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(BlocklyConfig.colors.movement);
                this.setTooltip("Turn the player 90 degrees right");
            }
        };
    }
};

// Initialize blocks when loaded
if (typeof Blockly !== 'undefined') {
    BlocklyMovementBlocks.init();
}