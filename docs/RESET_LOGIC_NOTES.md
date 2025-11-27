# Reset Logic - Technical Notes

## Overview

The reset system uses a centralized `ResetManager` module for game state resets. The editor reset is handled **directly in `resetGame()`** for simplicity and reliability.

---

## Current Architecture

### Files Involved

1. **`js/game-commands.js`** - Contains `resetGame()` function (Reset button handler)
2. **`js/game-engine/reset-manager.js`** - Centralized game state reset manager
3. **`js/editor-manager.js`** - Handles CodeJar editor interactions

### Reset Flow

```
User clicks Reset button
    ↓
resetGame() in game-commands.js
    ↓
Browser confirm() dialog - waits for user confirmation
    ↓
ResetManager.fullReset(gameState) - resets game state
    ↓
Direct EditorManager.updateCode(starterCode) - resets editor
    ↓
Handle Blockly if active
```

---

## Two Reset Modes

### fullReset() - Reset Button
- Resets player position, vehicles, elements, collectibles, inventory, mission state
- Resets editor code to starter code (handled in resetGame directly)
- Resets UI (messages, inventory display)
- Sets `gameState.isRunning = false` and enables Run button

### softReset() - Run Code
- Only resets player position and vehicles
- Does NOT touch editor code
- Does NOT change `gameState.isRunning` (preserves run-lock during execution)

---

## Key Implementation Details

### Confirmation Dialog

Uses the browser's native `confirm()` dialog instead of a custom modal. This is more reliable in iframe/embedded contexts where custom overlays may have visibility issues.

```javascript
var confirmed = confirm('Reset Level?\n\nYour code and level progress will be cleared.');
if (!confirmed) return;
```

### Editor Reset

The editor reset uses the level data directly:

```javascript
// In resetGame(), after ResetManager.fullReset():
var starterCode = '';
if (window.courseData && window.courseData.levels && typeof currentLevel !== 'undefined') {
    starterCode = window.courseData.levels[currentLevel].starterCode || '';
}
EditorManager.updateCode(starterCode);
```

This approach is simpler and more reliable than the previous snapshot-based system.

---

## Debug Logging

Console logs for reset flow:
- `[resetGame] Reset button clicked` - Button click registered
- `[resetGame] Confirm result: true/false` - User confirmation result
- `[resetGame] Performing reset...` - Reset started
- `[ResetManager] Performing full reset` - Game state reset
- `[resetGame] Editor reset to starter code, length: X` - Editor updated
- `[resetGame] Reset complete` - Reset finished
