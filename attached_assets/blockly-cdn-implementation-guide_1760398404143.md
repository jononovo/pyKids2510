# Blockly CDN Implementation Guide

## Overview
This guide documents the implementation of Google Blockly via CDN for creating a visual block-based programming environment with custom blocks.

## Core Implementation

### 1. Loading Blockly from CDN

```html
<script src="https://unpkg.com/blockly@11.0.0/blockly.min.js"></script>
```

**Key Points:**
- Use a specific version (`@11.0.0`) for stability
- The unpkg CDN is reliable and officially recommended
- Alternative CDN: `https://cdn.jsdelivr.net/npm/blockly@11.0.0/blockly.min.js`

### 2. Basic HTML Structure

```html
<div id="blocklyDiv" style="height: 100vh; width: 100vw;"></div>

<!-- Toolbox definition must be in the HTML -->
<xml id="toolbox" style="display: none">
    <!-- Categories and blocks go here -->
</xml>
```

### 3. Workspace Initialization

```javascript
workspace = Blockly.inject('blocklyDiv', {
    toolbox: document.getElementById('toolbox'),
    grid: {
        spacing: 25,
        length: 1,
        colour: '#e5e7eb',
        snap: true
    },
    zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,  // Controls initial block size
        maxScale: 2,
        minScale: 0.4
    },
    trashcan: true,
    renderer: 'zelos'  // Modern renderer with better performance
});
```

## Custom Block Implementation

### 1. Defining Custom Blocks

```javascript
Blockly.Blocks['move_forward'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("➡️ Move Forward");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10b981');
        this.setTooltip("Move forward one step");
    }
};
```

### 2. Code Generation for Custom Blocks

```javascript
// Handle different Blockly versions
if (!Blockly.JavaScript) {
    if (window.javascriptGenerator) {
        Blockly.JavaScript = window.javascriptGenerator;
    } else {
        Blockly.JavaScript = new Blockly.Generator('JavaScript');
    }
}

// Define code generation
Blockly.JavaScript['move_forward'] = function(block) {
    return 'moveForward();\n';
};
```

## Hiding Default Categories

### Method 1: Custom Toolbox XML
Only include the categories you want:

```xml
<xml id="toolbox" style="display: none">
    <category name="🚀 Movement" colour="#10b981">
        <!-- Only movement blocks -->
    </category>
    <category name="🔄 Control" colour="#8b5cf6">
        <!-- Only essential control blocks -->
    </category>
</xml>
```

### Method 2: CSS Hiding (Not Recommended)
```css
/* This can cause positioning issues */
.blocklyToolboxDiv { display: none !important; }
```

## Styling Considerations

### Safe CSS Modifications

```css
/* These styles are generally safe */
.blocklyToolboxDiv {
    background: #f8f9fb !important;
}

.blocklyTreeRow {
    padding: 12px 16px !important;
    border-radius: 8px !important;
    font-size: 15px !important;
}

.blocklyTreeRow:hover {
    background-color: #e5e7eb !important;
}
```

### CSS to Avoid

```css
/* AVOID these as they cause cursor offset issues */
.blocklyBlockCanvas {
    transform: scale(1.2);  /* Causes cursor misalignment */
}

.blocklyTreeRow:hover {
    transform: translateX(5px);  /* Breaks hover detection */
}

/* Don't force width on toolbox */
.blocklyToolboxDiv {
    width: 200px !important;  /* Causes block jumping when dragging */
}
```

## Common Issues and Solutions

### Issue 1: Cursor Offset When Dragging Blocks
**Cause:** CSS transforms or forced widths on Blockly elements
**Solution:** Remove all transform properties and width overrides

### Issue 2: Blocks Not Loading
**Cause:** Blockly not fully loaded when initializing
**Solution:** 
```javascript
window.addEventListener('load', function() {
    setTimeout(initializeBlockly, 500);  // Give CDN time to load
});
```

### Issue 3: Code Generation Not Working
**Cause:** JavaScript generator not properly initialized (varies by version)
**Solution:** Check multiple possible locations for the generator

### Issue 4: Custom Blocks Not Appearing
**Cause:** Blocks defined after workspace initialization
**Solution:** Always define blocks before calling `Blockly.inject()`

## Platform Integration Tips

### For Embedding in iframes
```html
<iframe 
    src="blockly.html" 
    style="width: 100%; height: 600px; border: none;"
    sandbox="allow-scripts allow-same-origin">
</iframe>
```

### For React/Vue/Angular
1. Load Blockly in `index.html` or dynamically in component
2. Initialize in lifecycle methods (`useEffect`, `mounted`, etc.)
3. Clean up workspace on unmount: `workspace.dispose()`

### For Electron/Desktop Apps
- Can use local Blockly files instead of CDN for offline support
- Same implementation otherwise

## Block Sizing

Control block size through:
1. `startScale` in zoom configuration (1.0 = normal, 1.2 = 20% larger)
2. Font size in theme configuration
3. Avoid CSS scaling which causes positioning issues

## Custom Categories with Emojis

Add visual appeal without complex customization:
```xml
<category name="🚀 Movement" colour="#10b981">
<category name="🔄 Control" colour="#8b5cf6">
<category name="🔢 Numbers" colour="#f59e0b">
```

## Essential Configuration Options

```javascript
{
    toolbox: toolboxXML,           // Required
    renderer: 'zelos',             // Modern, recommended
    theme: Blockly.Themes.Classic, // Default theme
    scrollbars: true,              // Enable workspace scrolling
    trashcan: true,                // Enable delete functionality
    zoom: {                        // Zoom configuration
        controls: true,
        wheel: true,
        startScale: 1.0
    },
    grid: {                        // Visual grid
        spacing: 25,
        snap: true
    }
}
```

## Final Notes

- Blockly doesn't natively support icon-only toolboxes with flyout titles
- Custom toolbox implementations often conflict with Blockly's internal positioning
- The simplest, most stable approach is using the native toolbox with emoji prefixes
- Always test drag-and-drop functionality after CSS changes
- Version 11.0.0 is stable and well-documented as of 2025