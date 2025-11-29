# Python Learning Platform - Technical Documentation

Comprehensive technical documentation for the Python Learning Platform game engine and educational system.

---

## Index

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Game Engine State Management](#game-engine-state-management)
   - [gameState - Runtime State](#gamestate---runtime-state)
   - [MissionState - Persistent Chapter State](#missionstate---persistent-chapter-state)
   - [levelEntrySnapshot - Reset Reference Point](#levelentrysnapshot---reset-reference-point)
5. [Level Types](#level-types)
6. [Lesson System](#lesson-system)
7. [Map System](#map-system)
8. [Code Execution Pipeline](#code-execution-pipeline)
9. [Editor System](#editor-system)
10. [Signal System](#signal-system)
11. [Blockly Integration](#blockly-integration)
12. [Reset System](#reset-system)
13. [User Progress Management](#user-progress-management)
14. [Testing System](#testing-system)
15. [Rendering Pipeline](#rendering-pipeline)
16. [Game Message Display System](#game-message-display-system)

---

## Overview

The Python Learning Platform is an interactive educational tool designed to teach Python programming through a game-based interface. Users control a character within a 2D tile-based game world using Python commands, learning programming concepts through progressive challenges.

### Key Features

- **Tile-based game engine** with HTML5 Canvas rendering
- **Real-time Python code execution** via Skulpt interpreter
- **Markdown-based lesson authoring** system
- **Visual block-based coding** via Blockly integration
- **Persistent progress tracking** across levels and chapters
- **Signal-based element interactions** for dynamic gameplay
- **Sprite animation support** with idle and walking states
- **Procedural sound generation** using Web Audio API

### Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla JavaScript, HTML5 Canvas |
| Code Editor | CodeJar with custom syntax highlighting |
| Python Runtime | Skulpt (browser-based Python interpreter) |
| Visual Coding | Google Blockly |
| Persistence | localStorage |
| Deployment | Standalone HTML (minimal dependencies) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Game Canvas │  │ Code Editor │  │ Controls (Run/Reset)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Core Systems                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Lesson       │  │ Game Engine  │  │ Code Execution       │   │
│  │ Parser       │  │ (Rendering,  │  │ (Skulpt Runtime,     │   │
│  │              │  │  Animation)  │  │  Game Commands)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     State Management                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ gameState    │  │ MissionState │  │ UserProgressManager  │   │
│  │ (Runtime)    │  │ (Persistent) │  │ (Code/Completion)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Interaction Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Element      │  │ Vehicle      │  │ Signal Manager       │   │
│  │ Interaction  │  │ Interaction  │  │ (Pub/Sub Events)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
project/
├── index.html                    # Main application entry point
├── server.py                     # Development server
│
├── js/
│   ├── main.js                   # Application initialization, gameState
│   ├── game-engine.js            # Rendering, character drawing
│   ├── game-commands.js          # Python command definitions
│   ├── lesson-parser.js          # Markdown lesson parsing
│   ├── skulpt-runtime.js         # Python code execution
│   ├── editor-manager.js         # CodeJar editor management
│   ├── syntax-highlighter.js     # Python syntax highlighting
│   ├── user-progress.js          # Progress persistence
│   ├── code-book.js              # Code reference panel
│   ├── coding-tutor.js           # AI tutor integration
│   │
│   ├── game-engine/
│   │   ├── level-loader.js       # Level initialization
│   │   ├── reset-manager.js      # Full/soft reset logic
│   │   ├── signal-manager.js     # Pub/sub event system
│   │   ├── element-interaction-logic.js
│   │   ├── vehicle-interaction-logic.js
│   │   ├── proximity-guard.js    # Collectible detection
│   │   ├── mega-element-manager.js
│   │   ├── scenery-manager.js    # Multi-tile walkable scenery
│   │   └── feedback-effects.js   # Audio/visual effects
│   │
│   ├── map/
│   │   ├── tile-renderer.js      # Tile drawing
│   │   ├── element-renderer.js   # Element drawing
│   │   ├── camera-controls.js    # Pan/zoom
│   │   ├── viewport.js           # Viewport management
│   │   └── tile-hover.js         # Hover effects
│   │
│   ├── mission/
│   │   ├── mission-state.js      # Persistent chapter state
│   │   └── mission-detector.js   # Level type detection
│   │
│   ├── tests/
│   │   ├── test-runner.js        # Test execution
│   │   ├── test-types.js         # Test type definitions
│   │   └── test-context.js       # Test context utilities
│   │
│   └── ui/
│       └── confirm-dialog.js     # Modal dialogs
│
├── blockly-integration/
│   ├── index.js                  # Blockly initialization
│   ├── core/
│   │   ├── config.js             # Toolbox configuration
│   │   ├── workspace.js          # Workspace management
│   │   └── custom-flyout.js      # Custom flyout rendering
│   ├── blocks/
│   │   ├── movement-blocks.js    # Movement block definitions
│   │   ├── control-blocks.js     # Control flow blocks
│   │   └── generator.js          # Python code generation
│   ├── ui/
│   │   ├── mode-switcher.js      # Text/Block mode toggle
│   │   ├── control-panel.js      # Blockly controls
│   │   └── settings-dialog.js    # Blockly settings
│   └── utils/
│       └── solution-scanner.js   # Analyze solutions for blocks
│
├── assets/
│   ├── python-course-chapter1.md # Course content
│   ├── chapter-template.md       # Lesson authoring template
│   ├── map/                      # SVG tiles and elements
│   └── sprites/                  # Character sprites
│
├── css/
│   ├── styles.css                # Main styles
│   ├── editor.css                # Editor styles
│   └── tutor.css                 # Tutor panel styles
│
└── docs/
    ├── TECHNICAL_DOCUMENTATION.md    # This file
    ├── LESSON_AUTHORING_GUIDE.md     # How to create lessons
    ├── map-creation-guide.md         # Map creation guide
    └── map-quick-reference.md        # Quick reference
```

---

## Game Engine State Management

The game engine uses three distinct state management systems:

| State Object | Purpose | Persistence | Location |
|--------------|---------|-------------|----------|
| `gameState` | Runtime state for current level | In-memory only | `js/main.js` |
| `MissionState` | Persistent progress within a chapter | localStorage | `js/mission/mission-state.js` |
| `levelEntrySnapshot` | Reset reference point | In-memory | `js/main.js` |

---

### gameState - Runtime State

`gameState` is the **runtime state object** - it holds everything needed to run the current level. Unlike `MissionState` (which persists), `gameState` is rebuilt/reset when you load a level or run code.

#### Definition

Defined in `js/main.js` and exposed globally via `window.gameState`:

```javascript
let gameState = {
    // Player Position & State
    playerPos: {x: 0, y: 0},
    startPos: {x: 0, y: 0},
    goalPos: {x: 0, y: 0},
    playerDirection: 'right',
    characterType: 'player',
    
    // Execution State
    isRunning: false,
    moveQueue: [],
    
    // Map Data
    mapData: [],
    mapWidth: 0,
    mapHeight: 0,
    
    // Progress Tracking
    levelCompleted: [],
    
    // Animation State
    idleAnimation: 0,
    idlePhase: 0,
    idlePauseTime: 0,
    idlePauseDuration: 120,
    spriteImage: null,
    spriteFrameWidth: 0,
    spriteFrameHeight: 0,
    currentSpriteFrame: 0,
    spriteAnimationCounter: 0,
    
    // Visual State
    backgroundImage: null,
    hoveredTile: {x: -1, y: -1},
    
    // Items & Objects
    collectibles: [],
    objects: [],
    inventory: {},
    
    // UI State
    messageLog: []
};
```

#### Property Reference

| Category | Properties | Purpose |
|----------|------------|---------|
| **Player** | `playerPos`, `startPos`, `goalPos`, `playerDirection`, `characterType` | Player location, direction, and type |
| **Execution** | `isRunning`, `moveQueue` | Whether code is running, queued movements |
| **Map** | `mapData`, `mapWidth`, `mapHeight` | 2D tile array and dimensions |
| **Progress** | `levelCompleted` | Array tracking completed levels |
| **Animation** | `idleAnimation`, `idlePhase`, `spriteImage`, etc. | Sprite animation state |
| **Visual** | `backgroundImage`, `hoveredTile` | Background graphic, mouse hover state |
| **Items** | `collectibles`, `objects`, `inventory` | Map items and player inventory |
| **UI** | `messageLog` | In-game messages |

#### Relationship to MissionState

For **mission levels**, when a level loads:
```javascript
gameState.inventory = MissionState.getInventory();
gameState.backpack = MissionState.getBackpack();
```

`gameState.inventory` is a **working copy**. During gameplay, changes update both `gameState` and `MissionState` (which saves to localStorage).

For **exercise levels**, `gameState.inventory` starts empty and isn't synced.

---

### MissionState - Persistent Chapter State

`MissionState` is a module pattern singleton (defined in `js/mission/mission-state.js`) that manages persistent data across levels **within a chapter**. It uses `localStorage` for persistence.

#### What Persists Across Mission/Quest Levels

For **Mission/Quest levels**, the following data carries over between levels within the same chapter:

##### 1. Inventory (`inventory`)
A dictionary of item counts.
```javascript
{ coin: 5, key: 2, gem: 1 }
```
Items collected stay with the player across levels.

##### 2. Backpack (`backpack`)
An array of up to 4 specific items (capacity limit).
```javascript
['sword', 'potion', 'map']
```
Different from inventory - these are individual "held" items with a strict capacity.

##### 3. Collected Items (`collectedItems`)
Tracks which collectibles have been picked up by their (x, y) coordinates.
```javascript
[
    { x: 5, y: 3, type: 'coin' },
    { x: 10, y: 7, type: 'gem' }
]
```
Prevents the same collectible from reappearing when revisiting a level.

##### 4. Structures (`structures`)
Player-built structures with their position and type.
```javascript
[
    { x: 4, y: 6, type: 'bridge' },
    { x: 8, y: 2, type: 'ladder' }
]
```
Things the player has constructed persist across levels.

##### 5. Element States (`elementStates`)
States of interactive elements like doors, switches, levers.
```javascript
{
    'door_5_3': 'open',
    'switch_2_8': 'activated'
}
```
If you unlock a door or flip a switch, it stays that way.

#### What Does NOT Carry Over

- **Player position** - Always starts at the level's defined `startPos`
- **Code in the editor** - Each level has its own starter code
- **Message log** - Cleared each level
- **Runtime animation/visual state** - Resets

#### Persistence Scope

- State persists **within a chapter** (stored in localStorage under `missionChapterState.chapter{N}`)
- Starting a **new chapter** resets everything
- Calling `MissionState.clearChapter()` wipes the saved state

#### Key Methods

| Method | Purpose |
|--------|---------|
| `init(chapterNumber, savedState)` | Initialize for a chapter |
| `reset()` | Clear current state (memory only) |
| `getState()` / `loadState(state)` | Export/import full state |
| `addToInventory(type, amount)` | Add items to inventory |
| `removeFromInventory(type, amount)` | Remove items from inventory |
| `addToBackpack(item)` | Add item to backpack (max 4) |
| `removeFromBackpack(item)` | Remove item from backpack |
| `isCollected(x, y)` | Check if collectible was already collected |
| `markItemCollected(x, y, type)` | Record a collected item |
| `setElementStates(states)` | Save element states |
| `getElementStates()` | Retrieve element states |
| `clearChapter(chapterNum)` | Clear saved state from localStorage |

---

### levelEntrySnapshot - Reset Reference Point

Defined in `js/main.js`, this captures the state when a level is first entered, allowing the reset system to restore to that point.

```javascript
window.levelEntrySnapshot = {
    starterCode: '',        // Code when entering level
    missionState: null,     // MissionState snapshot for reset
    levelIndex: -1          // Which level this is for
};
```

The snapshot is captured by `LevelLoader._captureResetSnapshot()` when a level loads.

---

## Level Types

The system distinguishes between level types based on title keywords:

| Level Type | Keywords | Inventory | Collectibles | Element States |
|------------|----------|-----------|--------------|----------------|
| **Mission** | "MISSION" in title | From MissionState | Already-collected stay collected | Persist |
| **Quest** | "QUEST" in title | From MissionState | Already-collected stay collected | Persist |
| **Exercise** | Everything else | Empty | All fresh | All reset |

### Detection Logic

The `MissionDetector` module (`js/mission/mission-detector.js`) determines level type:

```javascript
function getLevelType(title) {
    if (MISSION_PATTERN.test(title)) return 'mission';
    if (QUEST_PATTERN.test(title)) return 'quest';
    return 'exercise';
}
```

### Important: MissionState Persists Through Exercise Levels

MissionState remains in memory even during exercise levels - they just don't read from it or write to it.

Example flow:
- **Level 1 (mission)** - Player collects 5 coins, saved to MissionState
- **Level 2 (exercise)** - Player starts with empty inventory (MissionState still exists)
- **Level 3 (mission)** - Player loads from MissionState, has 5 coins

---

## Lesson System

Lessons are authored in Markdown files and parsed by `js/lesson-parser.js`.

### Chapter File Structure

```markdown
# Chapter Title
## CHAPTER 1

--- <!-- Level 1 -->
## LESSON 1: Getting Started

### OBJECTIVE
> Learn to move forward

### Content here...

<!-- Starter Code -->
```
import player
player.move_forward()
```

<!-- Solution -->
```
import player
player.move_forward()
player.move_forward()
```

<!-- Map -->
```
[0,0,0,0,0],
[0,0,0,0,0],
[0,0,0,0,0]
startPos: 0,1
goalPos: 4,1
```

<!-- Tests -->
```
position: 4,1
```

--- <!-- Level 2 -->
## MISSION 1: Collect Items
...
```

### Parsed Level Structure

```javascript
{
    title: 'LESSON 1: Getting Started',
    type: 'exercise',           // Detected from title
    markdown: '...',            // Full markdown content
    starterCode: '...',
    solutionCode: '...',
    map: {
        layout: [[0,0,0,0,0], ...],
        startPos: {x: 0, y: 1},
        goalPos: {x: 4, y: 1},
        collectibles: [],
        transforms: [],
        vehicles: [],
        megaElements: [],
        scenery: [],
        graphic: null
    },
    tests: [...]
}
```

### Map Inheritance

Levels can omit their own map to inherit from the previous level. The `LevelLoader` maintains two caches:
- `lastMapCache` - Last map from any level
- `lastMissionMapCache` - Last map specifically from mission/quest levels

---

## Map System

The platform supports two map rendering modes:

### Tile-Based Maps

Traditional grid system using numeric tile codes:

| Code | Tile Type |
|------|-----------|
| 0 | Grass (walkable) |
| 1 | Tree (obstacle) |
| 2 | Path (walkable) |
| 3 | Bush (obstacle) |
| 4 | Rock (obstacle) |
| 5 | Water (obstacle) |
| 6 | Flower (walkable) |
| 7 | Invisible (for graphic maps) |
| 8 | Sand (walkable) |

### Graphic Maps

Full background images with transparent tile overlays:
```
graphic: assets/map/graphic-maps/island-house.svg
```

### Map Configuration Options

```
startPos: x,y           # Player start position
goalPos: x,y            # Goal/star position
collectibles: [...]     # Items to collect
transforms: [...]       # Interactive elements
vehicles: [...]         # Boats, etc.
megaElements: [...]     # Multi-tile blocking structures
scenery: [...]          # Multi-tile walkable terrain
```

---

## Code Execution Pipeline

```
User Code (Editor)
       │
       ▼
┌──────────────────┐
│ EditorManager    │ ── Gets code from CodeJar
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ skulpt-runtime   │ ── Wraps code with prelude
│                  │    "from player import *"
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Skulpt Engine    │ ── Executes Python
│                  │    Calls JS functions
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ game-commands.js │ ── Defines Python commands
│ (GameCommands)   │    move_forward(), turn_left(), etc.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ gameState        │ ── Updates player position
│ Animation        │    Renders movement
└──────────────────┘
```

### Available Python Commands

Defined in `js/game-commands.js`:

| Command | Description |
|---------|-------------|
| `move_forward(steps)` | Move forward (default 1 step) |
| `turn_left(times)` | Turn left (default 1 time) |
| `turn_right(times)` | Turn right (default 1 time) |
| `collect()` | Collect item at current position |
| `interact()` | Interact with element (lever, button, vehicle) |
| `build(type)` | Build a structure |
| `push()` | Push an object |
| `open()` | Open a door/chest |
| `speak(message)` | Display a message |
| `read()` | Read a sign |
| `plant()` | Plant a seed |
| `water()` | Water a plant |

---

## Editor System

### CodeJar Integration

The `EditorManager` (`js/editor-manager.js`) wraps CodeJar:

```javascript
jar = CodeJar(editorElement, highlight, {
    tab: '    ',
    indentOn: /:$/,
    addClosing: false,
    spellcheck: false
});
```

### Syntax Highlighting

Custom Python highlighting via `js/syntax-highlighter.js`:
- Keywords (import, for, if, while, def)
- Strings
- Numbers
- Comments
- Function calls

### Auto-Save

Code changes are automatically saved via `UserProgressManager`:

```javascript
jar.onUpdate(() => {
    UserProgressManager.saveCode(jar.toString());
});
```

---

## Signal System

The `SignalManager` (`js/game-engine/signal-manager.js`) implements a pub/sub pattern for cross-element communication.

### Core API

```javascript
SignalManager.subscribe(signalName, callback);  // Listen for signal
SignalManager.emit(signalName);                 // Trigger signal
SignalManager.reset();                          // Clear all listeners
```

### Signal Properties in Elements

| Property | Context | Description |
|----------|---------|-------------|
| `on_collect` | collectibles | Emit signal when collected |
| `on_step` | collectibles, transforms | Emit signal when stepped on |
| `on_interact` | transforms | Emit signal when interacted with |
| `spawn` | any | Start hidden; appear when signal received |
| `remove` | any | Disappear when signal received |
| `on` | transforms | Trigger transform when signal received |

### Example: Key Unlocks Boat

```
collectibles: [["key", {"at": [[25,46]], "on_collect": "got_key"}]]
vehicles: [["boat", {"spawn": "got_key", "at": [[17,51]]}]]
```

Flow: Player collects key → emits `got_key` → boat appears.

---

## Blockly Integration

### Architecture

```
blockly-integration/
├── index.js              # Entry point, lazy loading
├── core/
│   ├── config.js         # Toolbox configuration
│   ├── workspace.js      # Workspace management
│   └── custom-flyout.js  # Smaller toolbox blocks
├── blocks/
│   ├── movement-blocks.js
│   ├── control-blocks.js
│   └── generator.js      # Blocks → Python
├── ui/
│   ├── mode-switcher.js  # Text ↔ Block toggle
│   └── settings-dialog.js
└── utils/
    └── solution-scanner.js
```

### Lazy Loading

Blockly resources are loaded on-demand when the user switches to block mode:

```javascript
async function loadBlocklyResources() {
    await loadCSS('ui/styles.css');
    await loadScript('blockly.min.js');  // From CDN
    await loadScript('blocks/movement-blocks.js');
    // ... more modules
}
```

### Dynamic Toolbox

The `SolutionScanner` analyzes chapter solutions to determine which blocks are needed:

```javascript
// Scans solution code for patterns
if (code.includes('player.move_forward()')) {
    requiredBlocks.add('player_move_forward');
}
```

### Code Generation

`BlocklyGenerator.generateCode()` converts blocks to Python:

```javascript
blockToCode: function(block) {
    const generators = {
        'player_move_forward': () => 'player.move_forward()',
        'player_turn_left': () => 'player.turn_left()',
        // ...
    };
    return generators[block.type](block);
}
```

---

## Reset System

Located in `js/game-engine/reset-manager.js`.

### Full Reset (Reset Button)

Restores everything to level entry state:

1. `resetPlayerState()` - Position, direction, `isRunning`
2. `resetVehicles()` - Via `VehicleInteractionManager.reset()`
3. `resetSignalListeners()` - Via `SignalManager.reset()`
4. `resetElements()` - Via `ElementInteractionManager.resetStates()`
5. `resetCollectibles()` - Set all to `collected = false`
6. `resetInventory()` - Restore from `levelEntrySnapshot.missionState`
7. `resetMissionState()` - Restore MissionState from snapshot
8. `resetEditor()` - Reset to starter code
9. `resetUI()` - Clear message log, update inventory panel

### Soft Reset (Run Code)

Minimal reset before running code:

1. `resetPlayerPosition()` - Position and direction only
2. `resetVehicles()` - Reset vehicle states
3. `resetSignalListeners()` - Re-register listeners

Does **not** reset: collectibles, inventory, editor code, MissionState

---

## User Progress Management

`UserProgressManager` (`js/user-progress.js`) handles persistence of:

- User's code per level
- Level completion status
- Chapter state (for embedded scenarios)

### Storage Structure

```javascript
// In localStorage under 'userProgress'
{
    "chapter1-level-1": {
        code: "import player\nplayer.move_forward()",
        completed: true
    },
    "chapter1-mission-1": {
        code: "...",
        completed: false
    }
}
```

### Embedded Mode

When embedded in a parent application, progress is synced via `postMessage`:

```javascript
window.parent.postMessage({
    type: 'save-progress',
    levelId: currentLevelId,
    code: code,
    completed: false
}, '*');
```

---

## Testing System

### Test Types

Defined in `js/tests/test-types.js`:

| Test Type | Syntax | Description |
|-----------|--------|-------------|
| Position | `position: x,y` | Player must be at position |
| Inventory | `inventory: item >= N` | Must have N or more of item |
| Collected | `collected: >= N` | Must collect N items |
| Command Count | `commands: <= N` | Must use N or fewer commands |

### Test Execution

`TestRunner` (`js/tests/test-runner.js`) evaluates tests after code execution:

```javascript
TestRunner.evaluate();  // Called after each command
```

### Test Syntax Example

```
<!-- Tests -->
```
position: 4,1
inventory: coin >= 3
commands: <= 10
```
```

---

## Rendering Pipeline

The `render()` function in `js/game-engine.js` draws the game:

```javascript
async function render() {
    // 1. Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Draw background (if graphic map)
    if (gameState.backgroundImage) {
        ctx.drawImage(gameState.backgroundImage, ...);
    }
    
    // 3. Draw tiles
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            await drawTile(x, y, tileType);
        }
    }
    
    // 4. Draw layers in order
    await drawScenery();        // Background terrain
    await drawElements();       // Collectibles, interactive
    await drawVehicles();       // Boats, etc.
    await drawMegaElements();   // Structures
    
    // 5. Draw goal star
    await drawStar(goalPos);
    
    // 6. Draw player
    drawCharacter(playerPos, direction);
    
    // 7. Draw hover effect
    if (hoveredTile) drawTileHover(hoveredTile);
    
    // 8. Update viewport
    updateViewport();
}
```

### Rendering Order (Bottom to Top)

1. Background image (graphic maps)
2. Tiles
3. Scenery (walkable terrain features)
4. Elements (collectibles, interactive items)
5. Vehicles
6. Mega-elements (blocking structures)
7. Goal star
8. Player character
9. UI overlays (hover, tooltips)

---

## State Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     localStorage                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  missionChapterState.chapter1                    │    │
│  │  missionChapterState.chapter2                    │    │
│  │  userProgress (code, completion)                 │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ saveToStorage() / load
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    MissionState                          │
│  (Persistent within chapter)                             │
│  • inventory, backpack, collectedItems                   │
│  • structures, elementStates                             │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ sync on mission levels
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     gameState                            │
│  (Runtime - current level only)                          │
│  • playerPos, mapData, collectibles                      │
│  • inventory (working copy), objects                     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ captured on level load
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 levelEntrySnapshot                       │
│  (Reset reference point)                                 │
│  • starterCode, missionState snapshot                    │
└─────────────────────────────────────────────────────────┘
```

---

## Game Message Display System

Use `showGameMessage(text, type)` to display user-facing feedback in the Message Panel.

**When to use:**
- Player feedback for game actions (collecting, interacting, errors)
- Output from student code (`print()`, `speak()`)

**When NOT to use:**
- Developer debug logs (use `console.log` instead)
- Internal state tracking or diagnostics

**Message Types:**
| Type | Color | Use Case |
|------|-------|----------|
| `'success'` | Green | Successful actions (collected item, boarded vehicle) |
| `'error'` | Red | Failed actions (nothing to collect, backpack full) |
| `'info'` | Blue | Informational (nothing to interact with) |
| `'player'` | White | Student code output (`print()`, `speak()`) |

**Example:**
```javascript
showGameMessage('Collected coin', 'success');
showGameMessage('Nothing to collect here!', 'error');
showGameMessage('Hello world', 'player');
```

---

## Summary

| Concept | Description |
|---------|-------------|
| `gameState` | "What's happening right now" (volatile, in-memory) |
| `MissionState` | "What should be remembered" (persistent, localStorage) |
| `levelEntrySnapshot` | "Where to go back to on reset" |
| Mission Level | Progress carries forward within chapter |
| Exercise Level | Fresh start, practice mode |
| SignalManager | Event system for element interactions |
| LevelLoader | Initializes levels and captures snapshots |
| ResetManager | Handles full and soft resets |
