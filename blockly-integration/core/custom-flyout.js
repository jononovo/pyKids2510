// ============================================
//   CUSTOM FLYOUT WITH SMALLER BLOCKS
// ============================================

window.CustomVerticalFlyout = class extends Blockly.VerticalFlyout {
    constructor(workspaceOptions) {
        super(workspaceOptions);
    }
    
    // Override to make flyout blocks smaller than workspace blocks
    getFlyoutScale() {
        // Return 75% scale for toolbox blocks (slightly bigger than 70% for better visibility)
        // This makes them visually distinct as "menu items"
        return 0.75;
    }
};