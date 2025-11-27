# Reset Logic - Technical Notes for Next Agent

## Overview

The reset system was recently refactored to centralize distributed reset logic into a unified `ResetManager` module. However, there's a critical bug: **the Reset button is not clearing the code editor and restoring the starter code**.

---

## Current Architecture

### Files Involved

1. **`js/game-engine/reset-manager.js`** - New centralized reset manager
2. **`js/editor-manager.js`** - Handles CodeJar editor interactions
3. **`js/game-commands.js`** - Contains `resetGame()` function (Reset button handler)
4. **`js/main.js`** - Contains `loadLevel()` which saves the starter code snapshot

### Reset Flow (Current)

```
User clicks Reset button
    ↓
resetGame() in game-commands.js
    ↓
ConfirmDialog.show() - waits for user confirmation
    ↓
ResetManager.fullReset(gameState)
    ↓
Calls multiple reset methods including resetEditor()
    ↓
resetEditor() calls EditorManager.resetToSnapshot()
    ↓
resetToSnapshot() checks window.levelEntrySnapshot.starterCode
    ↓
If truthy, calls EditorManager.updateCode(starterCode)
```

### Key Code Locations

**ResetManager.fullReset()** - `js/game-engine/reset-manager.js` lines 11-27:
```javascript
fullReset(gameState) {
    console.log('[ResetManager] Performing full reset');
    
    this.resetPlayerState(gameState);
    this.resetVehicles(gameState);
    this.resetElements(gameState);
    this.resetCollectibles(gameState);
    this.resetInventory(gameState);
    this.resetMissionState(gameState);
    this.resetEditor();  // <-- This should reset the code editor
    this.resetUI(gameState);
    
    if (typeof render === 'function') render();
    if (typeof updateViewport === 'function') updateViewport();
}
```

**ResetManager.resetEditor()** - `js/game-engine/reset-manager.js` lines 107-120:
```javascript
resetEditor() {
    if (window.EditorManager) {
        const success = EditorManager.resetToSnapshot();
        if (!success) {
            console.warn('[ResetManager] Editor reset failed - no snapshot available');
        }
        
        // Also handle Blockly mode
        if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
            if (window.BlocklyIntegration && window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode) {
                window.BlocklyIntegration.convertFromText(window.levelEntrySnapshot.starterCode);
            }
        }
    }
}
```

**EditorManager.resetToSnapshot()** - `js/editor-manager.js` lines 105-113:
```javascript
function resetToSnapshot() {
    if (window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode) {
        updateCode(window.levelEntrySnapshot.starterCode);
        console.log('[EditorManager] Reset to snapshot code');
        return true;
    }
    console.warn('[EditorManager] No snapshot starterCode available');
    return false;
}
```

**Snapshot saved in loadLevel()** - `js/main.js` lines 305-308 (inside setTimeout):
```javascript
// Always save starterCode snapshot for reset functionality
window.levelEntrySnapshot.starterCode = level.starterCode;
console.log('[loadLevel] Saved starterCode snapshot for level', currentLevel + 1);
```

---

## The Problem

### Observed Behavior
- User types code in the editor
- User clicks Reset button
- Confirmation dialog appears, user confirms
- **The user's typed code remains - it is NOT replaced with starter code**

### Evidence from Browser Console Logs
- Multiple `[ResetManager] Performing soft reset (Run Code)` entries exist (from Run button)
- **Zero** `[ResetManager] Performing full reset` entries (from Reset button)
- The log `[loadLevel] Saved starterCode snapshot for level 1` DOES appear on page load

### Likely Root Causes

1. **Falsy check on starterCode**: The condition `if (window.levelEntrySnapshot.starterCode)` treats empty strings as falsy. If starterCode is `""` for any reason, the reset silently fails.

2. **Async timing issue**: The starterCode might be captured before the async code loading completes, resulting in an empty string.

3. **Confirmation dialog not resolving**: The async/await flow with the confirmation dialog may not be working correctly.

4. **DOM element mismatch**: EditorManager might be updating a stale CodeJar instance if the DOM element was recreated.

---

## Global Variables for Reference

- `window.levelEntrySnapshot.starterCode` - Should contain the starter code from markdown
- `window.currentLessonStarterCode` - Also stores starter code, set during level load
- `window.EditorManager` - The editor manager singleton
- `window.ResetManager` - The reset manager singleton

---

## Potential Solutions

### Option 1: Fix the falsy check
Change the condition to explicitly check for undefined/null:
```javascript
if (window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode !== undefined) {
```

### Option 2: Simplify the reset flow
Bypass ResetManager for editor reset and directly use:
```javascript
EditorManager.updateCode(window.currentLessonStarterCode || '');
```

### Option 3: Add debug logging
Add console.log statements to trace exactly where the flow breaks:
- Log the value of `window.levelEntrySnapshot.starterCode` when resetToSnapshot is called
- Log whether the confirmation dialog resolves true/false
- Log if fullReset is actually being called

### Option 4: Reconsider the architecture
The current flow is:
```
resetGame → ResetManager.fullReset → resetEditor → EditorManager.resetToSnapshot → checks levelEntrySnapshot
```

A simpler flow could be:
```
resetGame → EditorManager.updateCode(level.starterCode)
```

---

## Two Reset Modes (Important Context)

The ResetManager was designed with two modes:

1. **fullReset()** - Called by Reset button
   - Resets player position, vehicles, elements, collectibles, inventory, mission state
   - Resets editor code to starter code
   - Resets UI (messages, inventory display)
   - Sets `gameState.isRunning = false` and enables Run button

2. **softReset()** - Called before running code
   - Only resets player position and vehicles
   - Does NOT touch editor code
   - Does NOT change `gameState.isRunning` (preserves run-lock during execution)

The softReset was specifically designed to NOT reset the editor or run-state, so the Run button stays disabled during code execution.

---

## Files Modified in Recent Refactor

1. Created `js/game-engine/reset-manager.js`
2. Modified `js/editor-manager.js` - Added DOM element tracking and resetToSnapshot()
3. Modified `js/game-commands.js` - resetGame() now delegates to ResetManager
4. Modified `js/skulpt-runtime.js` - executePythonCode() now uses ResetManager.softReset()
5. Modified `index.html` - Added script tag for reset-manager.js

---

## Testing Steps

1. Load the application
2. Open browser console (F12)
3. Type some code in the editor
4. Click the Reset button
5. Confirm in the dialog
6. Check console for:
   - `[ResetManager] Performing full reset`
   - `[EditorManager] Reset to snapshot code` OR `[EditorManager] No snapshot starterCode available`
7. Check if editor code changed

---

## Quick Debug Commands (Browser Console)

```javascript
// Check if starterCode snapshot exists
console.log('Snapshot:', window.levelEntrySnapshot);

// Check current lesson starter code
console.log('Current lesson starter:', window.currentLessonStarterCode);

// Manually trigger reset to test
ResetManager.fullReset(gameState);

// Manually reset editor
EditorManager.resetToSnapshot();

// Manually update editor with known code
EditorManager.updateCode('# Test code\nprint("hello")');
```
