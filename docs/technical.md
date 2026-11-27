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
   - [The Level Start - What Every Run Goes Back To](#the-level-start---what-every-run-goes-back-to)
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
17. [Engine Notes](#engine-notes)
18. [CodeTribe Integration](#codetribe-integration)

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
| Persistence | CodeTribe keeps each student's code per slide; the browser keeps a copy and the mission state |
| Hosting | Runs only inside CodeTribe. Skulpt (`/assets/js/skulpt.2c08b3e.min.js`, `skulpt-stdlib.2c08b3e.js`) and marked (`/assets/js/marked.15.0.12.min.js`) come from CodeTribe's own site; Blockly comes from unpkg, pinned to 11.0.0 |

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
│
├── js/
│   ├── main.js                   # Application initialization, gameState
│   ├── game-engine.js            # Rendering, character drawing
│   ├── game-commands.js          # Python command definitions
│   ├── lesson-parser.js          # Markdown lesson parsing
│   ├── level-helpers.js          # The level's helpers.py: its text and its functions' names
│   ├── skulpt-runtime.js         # Python code execution, mistakes, stopping
│   ├── skulpt-bridge.js          # Builds the player module from GameCommands
│   ├── python-error-explainer.js # Python mistakes in plain words
│   ├── python-backpack-inventory.js # The Python backpack (list) and inventory (dictionary)
│   ├── editor-manager.js         # CodeJar editor management
│   ├── syntax-highlighter.js     # Python syntax highlighting
│   ├── user-progress.js          # Progress persistence
│   ├── code-book.js              # Code reference panel
│   │
│   ├── guide/
│   │   ├── mistake-finder.js     # Finds the mistakes in the code (no page code)
│   │   ├── mistake-lines.js      # The red lines and their icon
│   │   ├── guide-bubble.js       # The guide's bubble and Show me
│   │   └── level-advice.js       # HELP: the level's advice
│   │
│   ├── game-engine/
│   │   ├── level-loader.js       # Level initialization
│   │   ├── reset-manager.js      # The level start, restored by every Run and RESET
│   │   ├── signal-manager.js     # Pub/sub event system
│   │   ├── element-interaction-logic.js
│   │   ├── vehicle-interaction-logic.js
│   │   ├── proximity-guard.js    # Collectible detection
│   │   ├── tile-contents.js      # What is on a tile, and the nearest thing by name
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
│       ├── confirm-dialog.js     # Modal dialogs
│       ├── file-tabs.js          # The main.py and helpers.py tabs, and the read-only view
│       └── backpack-inventory-panels.js # Draws both panels the way Python prints them
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
│   └── guide.css                 # The red lines, the icon and the guide's bubble
│
└── docs/
    ├── technical.md                  # This file
    ├── authoring.md                  # How to create lessons
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
| Level start | What every Run and RESET go back to | In-memory | `js/game-engine/reset-manager.js` |

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
| **Items** | `objects`, `inventory`, `backpack`, `builtElements`, `farmPlots` | Pushable objects (unfinished), the inventory and backpack, what was built or planted |
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
    'door_5_3': { removed: false, transformed: true, newType: 'door-open' },
    'coin_2_8': { removed: true }
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
- Only mission levels write it to the browser. A normal level empties it in memory, so its backpack starts empty, and never writes it, so the chapter's mission progress stays for the next mission level

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

### The Level Start - What Every Run Goes Back To

`ResetManager` (`js/game-engine/reset-manager.js`) keeps one snapshot per level, the **level start**:

```javascript
levelStart = {
    missionState: MissionState.getState(),   // empty on normal levels
    builtElements: [...],                    // a copy
    tiles: [[...], ...]                      // a copy of the level's tiles
};
```

- `LevelLoader.initialize()` takes it with `ResetManager.captureLevelStart(gameState)` at every level start, then calls `restoreLevelStart()`, so the level's first run and every later one start the same way.
- `ResetManager.restoreLevelStart(gameState)` puts back the mission state (inventory, backpack, collected items, element states), the signals, the elements, the boats, the farm, the built things, the tiles and the character, then redraws the panels and the map.
- **Run** calls it before every program. **RESET** calls it too, after stopping the program, then clears the Console Log, puts back the starter code and saves an empty file (see [Reset System](#reset-system)).
- **Missions** start from what they carry in: the chapter's mission state from the browser. A mission level that reuses the map (no tile rows) also keeps the tiles and built things of the mission level before it. Every other level starts with no built things and its own copy of its tiles, so a bridge never rewrites the lesson.

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

### Normal Levels and the Mission State

A normal (exercise) level empties `MissionState` in memory at its start, so its inventory and backpack start empty, and it never writes it to the browser. A mission level loads the chapter's mission state from the browser at its start.

Example flow:
- **Level 1 (mission)** - Player collects 5 coins, saved to MissionState
- **Level 2 (exercise)** - Player starts with an empty inventory and backpack; the saved mission state is untouched
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
    helpers: '...',             // the helpers.py section's code, or the previous level's
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
    slug: 'lesson-1-getting-started',
    textFingerprint: '1k2b3c',  // a short fingerprint of the level's text
    tests: {...}                // only from CodeTribe's Tests dialog (load-lesson)
}
```

Repeated `collectibles:`, `transforms:`, `vehicles:`, `megaElements:` and `scenery:` lines add up. The level text has no Tests block: tests come only from CodeTribe.

### Map Inheritance

Levels can omit their own map to inherit from the previous level. The `LevelLoader` keeps:
- `lastMapRows` - the tile rows of the last level that had its own; a level without rows gets its own copy of them
- `lastMissionMap` - the tiles and built things of the last mission level; a mission level without rows keeps them, so bridges and buildings carry over

### helpers.py

A level's `<!-- helpers.py [read-only] -->` section gives students ready-made functions in a second, read-only file. The rules for lessons are in `docs/authoring.md` ([Helpers](authoring.md#helpers-helperspy)).

- **Reading:** `parseCourseLevels` puts the section's code in `level.helpers`. A level without the section takes the previous level's in the same file, like the map. The section is taken out of the level's text.
- **Holding:** `LevelHelpers` (`js/level-helpers.js`) holds the current level's helpers; `LevelLoader.initialize` calls `setLevel(level)`. `fileText()` is the file as students see it, `# Read-only: this lesson's helpers` and then the code. `names()` gives the names of its top-level `def` lines, and `functionAt(line)` the function a line of the file belongs to.
- **Showing:** `FileTabs.showLevelFiles()` (`js/ui/file-tabs.js`), called by `loadLevel`, puts the `main.py` and `helpers.py` tabs above the code and a read-only view after the editor when the level has helpers, and hides them when it hasn't. The view uses `PythonHighlighter` and the editor's line numbers (`EditorManager.lineNumbersFor`).
- **Switching** only hides and shows, so the CodeJar editor is never touched and nothing from `helpers.py` is saved. Leaving `main.py` keeps its cursor (`EditorManager.savedCursor()`) and takes the focus off the editor; coming back puts the cursor back (`restoreCursor()`) and places the red lines again.
- **RUN and HELP bring `main.py` to the front first:** `runCodeWithSkulpt` and `showLevelAdvice` call `FileTabs.openMain()`, so the red lines, the guide's bubble and HELP's advice always show.
- **Running:** before each Run, `SkulptRuntime` sets `Sk.builtinFiles.files['src/lib/helpers.py']` to the hidden first lines plus `fileText()`, or removes it when the level has none. `Sk.importMainWithBody` clears `Sk.sysmodules` on every Run, so each Run imports it fresh. RUN always runs `main.py`, whichever tab is open.
- **Mistakes:** Skulpt's traceback goes from where the error happened outwards, and the main program's frames are `<stdin>.py`. The line comes from the first `main.py` frame. When the frame that line called into is in `helpers.py`, the words name the helper: "This line calls go_to() from helpers.py, and it stopped inside go_to(). Check what you gave it."
- **The guide:** `helpers` is a known name on a level with helpers, and the helpers' names join once the program has `from helpers import *`. Without that line, a call to a helper is the `not-brought-in` mistake ([The Guide](#the-guide)).

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

### The Player Module

- `js/skulpt-bridge.js` builds the `player` module from plain functions (`window.buildPlayerModule`): one Python function for each `GameCommands` entry, plus `backpack` and `inventory` from `js/python-backpack-inventory.js`. Skulpt gets a one-line stub: `var $builtinmodule = window.buildPlayerModule;`.
- The module is built again for every run, since Skulpt imports it again.
- An alias (`aliasOf`) takes everything from its target: arguments, defaults, flags and `execute`.
- **Actions** run as a Skulpt suspension, so Python waits for their animation, and they count for the command counter. They give back `None`, except an entry flagged `returnsResult`, which gives back what its `execute` returns: `move_forward()` the steps it took.
- **Questions** are entries flagged `isQuestion`. Their `execute` is a plain function, called at once: no suspension, no animation, and not counted as a command, so a run of questions alone never wins. A stopped run's question throws `__STOP__`, like a command's.
- Answers become Python values: a JavaScript array is a tuple, `null` is `None`, a boolean is `True` or `False`.

### Available Python Commands

Defined in `js/game-commands.js`:

| Command | Description |
|---------|-------------|
| `move_forward(steps)`, `forward(steps)` | Move forward (default 1 step; 0 or less doesn't move); a closed door or other blocked tile stops it. Each step can fire an `on_step` element. Gives back the steps it took |
| `turn_left(times)`, `left(times)`, `turn_right(times)`, `right(times)` | Turn (default 1 time) |
| `collect()` | Collect the item on your tile, or else the one in front |
| `interact()` | Board or leave a boat, or swap or remove an element next to you |
| `open()`, `close()` | Open or close the door in front |
| `build(type)` | Build a structure in front, paid from the inventory |
| `plant(crop)`, `water()`, `harvest()` | Farming, on the tile in front |
| `speak(message)` | Write a message in the Console Log |
| `push()`, `place(item)` | Unfinished: no pushable things or containers exist yet |

| Question | Answers |
|----------|---------|
| `position()` | `(x, y)`, the character's tile (`ProximityGuard.getPlayerPosition()`) |
| `path_clear()` | `True` when `move_forward()` could take a step: both use `openTileInFront()` |
| `find(name)` | The nearest `(x, y)` holding that name, or `None` (`TileContents.findNearest`) |
| `at_goal()` | `checkVictory()`, the same check that wins a level without tests |
| `facing()` | `gameState.playerDirection`: `"up"`, `"down"`, `"left"` or `"right"` |

`js/game-engine/tile-contents.js` reads the world:
- `TileContents.nameAt(x, y)`: the name of what's on top of a tile: its item or element (`ElementInteractionManager`), else its boat (not the one the character is in), else the tile's name in `tiles.json`. Outside the map it's `null`.
- `TileContents.findNearest(name, x, y)`: the nearest tile whose `nameAt` is that name, counted in steps along the grid; a tie goes to the tile higher up, then further left. Big elements, scenery and built things aren't looked at.
- `findElementAt(x, y, sections)` and `findVehicleAt(x, y)` are the one lookup for what's on a tile; `ProximityGuard.check` uses them too.

### Mistakes

- `explainPythonError(error, hiddenLineCount, helpersFile)` (`js/python-error-explainer.js`) gives `{line, text, syntaxError}`, with the line taken from the traceback's first `main.py` frame and counted from the student's first line (the 3 hidden lines are taken off). A mistake inside a helper gets the helper's words ([helpers.py](#helperspy)).
- Plain words for NameError, SyntaxError and indentation (this Skulpt build reports most indentation mistakes as `SyntaxError: bad input`; "unindent does not match any outer indentation level" gets the indentation wording); TypeError and IndexError keep Python's message with what it means; any other error keeps Python's message. The error's name stays at the end, as in "(NameError)". A game command's own error (backpack full, nothing in front) shows the game's message.
- `executePythonCode` gives the mistake back (`{mistake, wasStopped}`) instead of writing it. A line past the end of the code (an unclosed bracket) is capped at the last line with code.
- `runCodeWithSkulpt` decides where it shows. After a finished run whose code is still in the editor, the editor's red lines get the finder's mistakes and Python's ([The Guide](#the-guide)). In Blocks mode, or for a mistake with no line, the Console Log writes "Line N: ..." in red. A stopped run shows nothing.
- The 2-minute limit (Skulpt's `TimeoutError`) shows "Code stopped - ran too long (2 minute limit)".

### Stopping

- STOP, ⌘/Ctrl + Enter while running, and RESET call `SkulptRuntime.stopRunningProgram()`.
- Every run has its own stop token (`SkulptRuntime.currentProgramRun()`). Stopping marks it stopped, ends a program that is waiting on a command or `time.sleep` at once (the runtime's suspension handler never resumes it), and ends a move animation under way at the end of its step.
- `move_forward()` and the turns stop their loops when their run is stopped, and a new command of a stopped run throws `__STOP__`. A stopped program can't move anything again, even if a new run starts.

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
- Game commands, read from `GameCommands` each time it colours, so every real command is coloured
- The `player` object

### Saving the Code

- `EditorManager` saves from CodeJar's update hook, which fires only when the student edits (typing, paste, undo, redo). CodeJar's `updateCode()` doesn't call it, so code the game sets itself (the level's code, the clean-up before a run) is never saved.
- RESET saves on purpose: an empty file, which means the level's starter code. Nothing else writes code into the editor; the guide only shows a fix, and the student types it.
- `UserProgressManager.saveCode(code)` waits 500 ms, then keeps a browser copy and sends `save-progress {content}` to CodeTribe ([User Progress Management](#user-progress-management)).

### Where Lines Are

- `EditorManager.linePosition(lineNumber)` measures a line on the page with a range over the editor's text (CodeJar shares its `getNodeAndOffset`), since long lines wrap: its first row's top, its last row's top and bottom, and where its text ends, in the editor box's coordinates.
- `EditorManager.cursorLine()` reads the cursor's line (`null` when the editor isn't focused), and `placeCursorAtLineEnd(lineNumber)` puts the cursor at the end of a line. Both use `savedCursor()` and `restoreCursor(cursor)`, which also keep the cursor while `helpers.py` is open.
- The editor's update hook calls `MistakeLines.codeChanged`, and `updateCode` (code the game sets) calls `MistakeLines.clear`. The guide is placed again after each edit and when the editor changes size or scrolls.

### The Guide

Mistakes have their own spot in the editor: red lines, an icon and the guide's bubble (`js/guide/`, `css/guide.css`). Nothing pops up by itself.

- **The mistake finder** (`MistakeFinder.find(code)`): rules, no AI and no page code. It gives `{mistakes, unknownWordLines}`. Each mistake is `{line, kind, hint, fix}`; `fix` is `{pieces, words}`: the line as pieces to keep, add, take out or swap, and the words with the important part at the odd places (the bubble makes it bold).
  - Kinds: spelling, capital letters, a space in a name, no colon, a bracket missing or one too many, a missing or mismatched quote, `=` to compare, a command without `()`, a value without brackets, `else if`, a missing or extra indent, and a helper called without `from helpers import *` (`not-brought-in`: "go_to() is in helpers.py, but this program doesn't bring it in.", with Show me "Put this on line 1: from helpers import *").
  - It reads the names it knows from where they're defined: Skulpt's keywords and built-ins, the player module (`playerModuleNames()` in the bridge), the backpack's and inventory's methods (`PythonBackpackInventory.backpackMethods`, `inventoryMethods`), the hidden first lines' imports (`SkulptRuntime.preludeImports`), the level's helpers (`LevelHelpers.names()`, once the program brings them in) and the student's own names.
  - A typo is a word close to a command, `backpack` or `inventory` and their methods, the student's names, a keyword or a common built-in: 1 edit step for words up to 4 letters, 2 up to 10, 3 beyond, with two swapped letters as one step.
  - It never marks a word that isn't close to anything, words of 1 or 2 letters, what follows a dot (except `player.`, `backpack.` and `inventory.`), a name before `=`, text in quotes, comments, or values in brackets that go on over several lines.
- **Red lines** (`MistakeLines`):
  - `show(code, pythonMistake)`, after a finished Run: every line the finder marks, plus the line Python stopped on. On Python's line the finder's words win, since they come with a Show me. Python's SyntaxError line is left out when the finder found a grammar mistake, because after a missing bracket Python names a later line.
  - `clear()` at every Run and whenever the game sets the code (a new level, RESET, CodeTribe's saved code).
  - `codeChanged(code)`, while the student types: red lines move with their code. A line the finder marked stays red until it has no mistake and every word on it is one Python knows; part-way through a fix it keeps its hint, and Show me comes back when the finder sees the mistake again. A line red only from Python clears once it changes. Typing never adds a red line.
- **The icon:** the code panel's comment icon, two characters after the end of the red line the mouse rests on, otherwise the red line the cursor is on (read on the page's `selectionchange`). Clicking it opens the bubble without taking the editor's focus; on a hovered line it also puts the cursor at the end of that line. Its name for screen readers is "Open the guide for line N".
- **The bubble** (`GuideBubble`): the guide's face, the hint, then a "Show me ›" link that shows the fixed line with the change marked (green to add, red to take out, amber for two swapped letters, dots for spaces) and in words. It sits above its line when it fits inside the editor, otherwise below. HELP's advice to add a line leaves that next line free when it sits below, so the student can type there. A red line's bubble follows its line and closes when the cursor moves to another line or the line is fixed. Every bubble closes with ×, Escape, a click anywhere outside it, Run, RESET and a new level. Typing doesn't close it.
- **HELP** (`showLevelAdvice`, `js/guide/level-advice.js`): with red lines, it puts the cursor at the end of the first one and opens its bubble. Otherwise it opens the level's advice in the bubble, worked out from the level's written solution: the next line to add (pointing at the last line of code), a line that differs, or a general tip. The hint never holds the answer; the code is only under Show me. When a test with a description failed in the last run, that description is the hint.
- **Blocks mode** has no guide: its mistakes stay in the Console Log.

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

Located in `js/game-engine/reset-manager.js`. There is one restore, `restoreLevelStart(gameState)`, for every Run and RESET ([The Level Start](#the-level-start---what-every-run-goes-back-to)).

### Run

`SkulptRuntime` calls `restoreLevelStart()` before every program, so every Run starts from the level's start: the same inventory, backpack, items, doors, boats, farm, built things and tiles.

### RESET

`resetGame()` in `js/game-commands.js`:
1. Stops the program at once (`SkulptRuntime.stopRunningProgram()`), before asking, so nothing moves while the question is open. Cancel leaves the character where it stopped and keeps the code.
2. After the student confirms: `restoreLevelStart()`
3. Clears the Console Log (`clearConsoleLog()`, next to `toggleConsoleLog()`)
4. Puts back the starter code and saves an empty file

---

## User Progress Management

`UserProgressManager` (`js/user-progress.js`) loads and saves the student's code. CodeTribe keeps each student's code per slide (a game lesson is an Exercises lesson with an empty `main.py` on each slide); the browser keeps a copy for guests.

### Which Code a Level Shows

When a level loads, `codeForLevel(level)` gives, in order:
1. the code CodeTribe sent with `load-progress {content}` (kept until the level loads, since it can arrive first); an empty `content` means the level's starter code;
2. the browser copy;
3. the level's starter code.

A `load-progress` that arrives after the level loaded is shown at once.

### Browser Copy

```javascript
// In localStorage under 'userProgress'
{
    "lesson-1-getting-started-1k2b3c": { code: "import player\nplayer.move_forward()" }
}
```

The key is the level's title (as a slug) plus a short fingerprint of its text, so two different levels with one title don't share code.

---

## Testing System

Tests come only from CodeTribe: each slide's Tests dialog, sent with `load-lesson` as `[{name, rule, description}]`. `parseHostTests()` reads each rule with `parseTestsYaml()` and keeps its name and description. A level with no tests is won at the star (`_defaultGoalCheck`).

The check after a Run awards a win only when the run finished without a Python mistake and ran at least one game command. So running nothing, or a program that stops on its first line, never wins, even in a level whose star is on the start square (a mission that ends back at base). A win can still come during a run, the moment a move reaches the star or the tests pass.

### Test Types

Defined in `js/tests/test-types.js`:

| Test Type | Rule | Passes when |
|-----------|------|-------------|
| `position` | `target: goal`, `target: [x, y]`, or `x` and `y` | The player is there |
| `direction` | `facing: up` (down, left, right) | The player faces that way |
| `inventory` | `item`, plus `min`, `max` or `exact` | The count fits |
| `collectibles` | `all: true`, `count: N` or `types: [...]` | Enough of the level's items are collected (the element manager marks them) |
| `code_regex` | `pattern` (single backslashes), `message`, `flags` | The code matches |
| `element_state` | `element`, `position: [x, y]`, `state` | The element placed there now has that type, or `removed` |

### Test Execution

`TestRunner` (`js/tests/test-runner.js`) checks the tests at the end of each `move_forward()` and when a program ends without being stopped. All tests must pass. Each named test's result is sent to CodeTribe as `checker-validation`. `lastFailedTests()` gives the current level's failed tests from the last check, which HELP reads for a description.

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
│  • playerPos, mapData, objects                           │
│  • inventory (working copy), objects                     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ captured on level load
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Level start (ResetManager)                 │
│  (What every Run and RESET go back to)                   │
│  • mission state, built things, tiles                    │
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
| Level start | "Where every Run and RESET go back to" |
| Mission Level | Progress carries forward within chapter |
| Exercise Level | Fresh start, practice mode |
| SignalManager | Event system for element interactions |
| LevelLoader | Initializes levels and captures snapshots |
| ResetManager | Takes the level start and restores it for every Run and RESET |

---

## Engine Notes

- **Farming** (`plant()`, `water()`, `harvest()`) works on the tile in front of the player. Crops go dirt, sprout (5 s), grown (5 s after watering).
- **Building** (`build()`) needs a `cost` in `elements.json`, builds in front, adds to `gameState.builtElements`, and records mission structures. A bridge turns its tile into path.
- **Tile access** (`js/game-engine/tile-access.js`) is the one rule for walking and building: the tile's `access`, big elements' `blockedTiles`, and single elements whose definition has `"blockedTiles": "all"` (a closed door).
- **The tile in front** is worked out in one place, `ProximityGuard.getForwardPosition(distance)`.
- **Element swaps** go through `ElementInteractionManager.setElementType(element, type)`, used by `interact()`, signals, `open()` and `close()`. A swap goes both ways: the element's replacement becomes its old type.
- **Signals** are cleared before elements and boats register their listeners again, at every level start and every Run.
- **Rendering** is double-buffered: frames are drawn offscreen and copied to the canvas in one step.

---

## CodeTribe Integration

The game runs only inside CodeTribe, in a frame on the app's own address (under `/student/code-panel/iframe/...`). It talks to CodeTribe only through `postMessage`.

### Messages

| Message | Direction | Shape |
|---------|-----------|-------|
| `app-ready` | game → CodeTribe | `{type: 'app-ready', currentLevelId: null}`, once the game is ready |
| `load-lesson` | CodeTribe → game | `{type: 'load-lesson', body: JSON.stringify({content, tests})}`: the slide's Markdown and its tests as `[{name, rule, description}]` |
| `load-progress` | CodeTribe → game | `{type: 'load-progress', content}`: the slide's saved code, or `''` for none (the level's starter code) |
| `save-progress` | game → CodeTribe | `{type: 'save-progress', content}`: the editor's code, 500 ms after the student edits it, and after RESET |
| `checker-validation` | game → CodeTribe | `{type: 'checker-validation', checkerId: <test name>, valid}`, for each named test after every check |
| `nextSlide` | game → CodeTribe | `{type: 'nextSlide', skip: true}`, after the last level |

The game accepts `load-lesson` and `load-progress` only from `window.parent`.

### Example

```javascript
iframe.contentWindow.postMessage({
    type: 'load-lesson',
    body: JSON.stringify({
        content: '# Python Adventure - First Steps\n## CHAPTER 1\n--- <!-- Level 1 Start -->\n...',
        tests: [
            { name: 'Reach the star', rule: 'type: position\ntarget: goal', description: 'Walk all the way to the star.' },
            { name: 'Use a for loop', rule: 'type: code_regex\npattern: for .* in range' }
        ]
    })
}, '*');

iframe.contentWindow.postMessage({ type: 'load-progress', content: 'move_forward()' }, '*');
```
