// ============================================
//   CONTROL FLOW BLOCKS
// ============================================

// Additional control flow blocks if needed
window.BlocklyControlBlocks = {
    init: function() {
        // Add any custom control blocks here if needed
        // The standard Blockly control blocks are already available
        
        // Example: Custom "repeat until at goal" block
        Blockly.Blocks['player_repeat_until_goal'] = {
            init: function() {
                this.appendStatementInput("DO")
                    .setCheck(null)
                    .appendField("🎯 Repeat until at goal");
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(BlocklyConfig.colors.control);
                this.setTooltip("Repeat the enclosed blocks until the player reaches the goal");
            }
        };
    }
};

// Initialize blocks when loaded
if (typeof Blockly !== 'undefined') {
    BlocklyControlBlocks.init();
}