# Python Learning Platform - Interactive Game Tutorial

## Overview

This project is an interactive Python programming education platform that combines a tile-based game engine with a real-time code execution environment. Students learn Python by writing code to control a character through various challenges and levels.

Built as a simple static web application with no backend dependencies, it's designed to be embedded into other platforms that provide their own database and framework infrastructure. Its purpose is to teach Python fundamentals through interactive gameplay, offering a portable and progressive multi-level learning experience.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

### Core Components & Design

The application is a single-page application (`index.html`) using vanilla JavaScript and HTML5 Canvas for rendering. It uses the CodeJar editor for syntax-highlighted Python and the Web Audio API for sound. A simple Python HTTP server (`server.py`) serves static files.

### Game Engine

A 2D tile-based rendering system with character animation supports movement commands (`move_forward()`, `turn_left()`, `turn_right()`), collision detection, and objective tracking. The Camera System (`js/map/camera-controls.js`) allows pan/zoom controls for navigating large maps, with auto-follow functionality and a "Reset View" option.

### Lesson System

Lessons are authored in Markdown files (`.md`), defining objectives, challenges, starter code, solutions, tile map layouts, character positions, and collectible items. A dynamic chapter dropdown allows developers to switch between lesson files. The system also supports a story-driven "Mission System" for persistent state across levels.

### Map Graphics System

An SVG-based tile rendering system organizes assets in `assets/map/` (tiles, objects, elements, special items). It supports automatic caching and preloading, with a fallback to programmatic rendering. Full graphic maps (PNG/SVG backgrounds) are supported, allowing tiles to become transparent. `tiles.json` is the single source of truth for all tile definitions, dynamically generating `TILES` constants and managing access control properties. The system also supports interactive elements defined in `assets/map/elements.json`, handling collectibles and transforms with various trigger types.

The map rendering system is modularized under `js/map/`:

-   **tile-renderer.js** (238 lines): SVG loading infrastructure, tile/star/hover drawing with caching
-   **element-renderer.js** (202 lines): Interactive elements, mega-elements, vehicles, mega-objects rendering
-   **viewport.js** (65 lines): Viewport management with player-follow camera and zoom support
-   **camera-controls.js** (238 lines): Pan/zoom controls, keyboard/mouse input, auto-follow toggle
-   **tile-hover.js** (71 lines): Mouse hover tracking with zoom/pan awareness

**Script Loading Order**: tile-renderer → element-renderer → viewport → camera-controls → tile-hover → game-engine

**Global Exposures**: Modules communicate via `window.*` for shared state (`TILE_SIZE`, `gameState`, `camera`) and drawing functions (`drawTile`, `drawStar`, `drawElements`, etc.).

### Multi-Tile Rendering Systems

Two parallel systems handle large multi-tile graphics:

-   **Mega-Elements** (`js/game-engine/mega-element-manager.js`): Multi-tile blocking structures like houses and shops (3x3 tiles). Defined in `assets/map/mega-elements.json` with collision detection via `blockedTiles`. SVGs in `assets/map/mega-elements/`.

-   **Mega-Objects** (`js/game-engine/mega-object-manager.js`): Multi-tile walkable terrain features like mountains and hills. Defined in `assets/map/mega-objects.json` without blocking. SVGs in `assets/map/mega-objects/`.

**Rendering Order**: `tiles → mega-objects → elements → built-elements → vehicles → mega-elements → goal star → player`

This ensures terrain features appear as background, while structures render in front of the player.

### Build System

The `build()` command allows students to construct elements using inventory materials. Buildable elements are defined in `assets/map/elements.json` with a `cost` property.

**Cost Tiers:**
- Objects (2 wood): fence, fence-gate, path
- Mega-objects-simple (4 wood): house, bridge, farm, trading-post, docks, boat
- Mega-objects-complex (10 coins + 20 food): zoo, roller-coaster, helicopter

**Build Flow:**
1. `build("fence")` - Look up element in elements.json
2. Check element exists and has `cost` property
3. Validate inventory has required materials
4. Deduct materials from inventory
5. Add element to `gameState.builtElements` for rendering
6. Record in `MissionState.structures` for mission tracking
7. Show success/error feedback via `showGameMessage()`

**Two-Collection Architecture:**
- `gameState.builtElements`: Level-scoped rendering array, restored from snapshot on reset
- `MissionState.structures`: Mission-wide metadata for tracking built structures across levels (not auto-rendered)

**Persistence:** Built objects reset to starting snapshot. Structures built in previous levels persist in MissionState but don't auto-render in new levels.

**Rendering:** `drawBuiltElements()` in `js/map/element-renderer.js` renders built elements using the same SVG system as regular elements.

### Level Loader

The `LevelLoader` module (`js/game-engine/level-loader.js`, 268 lines) centralizes all game state initialization for levels, separating it from UI/editor concerns in main.js. It handles:
- Camera reset to default state
- Map inheritance logic (caching layouts for levels without explicit maps)
- Game state setup (mapData, player position, direction, level type)
- Collectibles processing with mission state filtering
- Manager initialization (ElementInteractionManager, MegaElementManager, MegaObjectManager)
- Mission inventory loading from persistent MissionState
- Reset snapshot capture for full reset functionality
- Canvas resizing and background graphic loading

### Reset System

A centralized `ResetManager` (`js/game-engine/reset-manager.js`) handles all game state resets with two modes:

-   **Full Reset** (`fullReset()`): Triggered by the Reset button. Clears everything: player position, vehicles, elements, collectibles, inventory, mission state, editor code, and UI.
-   **Soft Reset** (`softReset()`): Triggered before running code. Only resets player position and vehicles, preserving the run-lock to prevent concurrent execution.

Both reset modes follow a unified pattern for signal handling: clear all signal listeners, then re-register them (same as level load). This ensures spawn-gated elements (those with `spawn` property) start hidden and only appear when their signal is emitted.

This separation ensures the Run button stays disabled during code execution (preventing re-entry) while the Reset button fully restores the level to its starting state.

### Signal System

A pub/sub-based cross-element triggering system (`js/game-engine/signal-manager.js`) enables dynamic interactions between game elements using named signal variables:

-   **Emitting Signals**: Elements can emit signals via `on_collect`, `on_step`, or `on_interact` properties. When an element is activated, it emits the specified signal name.
-   **Listening for Signals**: Elements can listen via `spawn`, `remove`, or `on` properties:
    -   `spawn: "signal_name"` - Element starts hidden, appears when signal is emitted
    -   `remove: "signal_name"` - Element disappears when signal is emitted
    -   `on: "signal_name"` - For transforms, triggers state change when signal is emitted

**Example Config** (in lesson markdown):
```yaml
collectibles: [["key", {"at": [[4, 5]], "on_collect": "got_key"}]]
vehicles: [["boat", {"spawn": "got_key", "at": [[2, 7]]}]]
```
In this example, collecting the key emits "got_key" signal, which causes the boat to spawn (appear) at position (2,7).

**Signal Flow**: Element activated → emit signal → SignalManager notifies listeners → hidden elements spawn or visible elements get removed

### ProximityGuard System

A unified position validation system (`js/game-engine/proximity-guard.js`) that enforces proximity requirements for collection-related commands. Students must be standing on or near collectibles for inventory/backpack operations to work.

**API Methods:**
- `check(options)`: Validates position and returns element info (silent on failure)
- `require(options)`: Validates position and throws user-friendly error on failure
- `consume(element)`: Activates an element via ElementInteractionManager

**Mode Options:**
- `'self'`: Current player tile (default)
- `'forward'`: Tile in front of player
- `'adjacent'`: Any of the 4 surrounding tiles
- `{radius: n}`: Any tile within n tiles (Manhattan distance)

**Usage in Commands:**
- `collect()`: Uses check() with fallback to forward position
- `backpack.append()`: Uses require() - must stand on collectible
- `inventory["key"] += 1`: Uses check() with typeMatch validation (forgiving - logs message but continues execution if no collectible found)

**Script Loading Order**: After element-interaction-logic.js, before vehicle-interaction-logic.js

### Game Message Display System

A unified messaging system (`js/game-engine/feedback-effects.js`) displays user-facing feedback directly in the game's Message Panel (bottom-left of the game view), making game feedback visible to students instead of only appearing in the browser console.

**API:**
- `showGameMessage(text, type)`: Displays a message in the message panel with optional color styling

**Message Types:**
- `'success'`: Green text - for successful actions (collecting items, boarding vehicles)
- `'error'`: Red text - for failed actions (nothing to collect, backpack full)
- `'info'`: Blue text - for informational messages (nothing to interact with)
- `'player'`: White text - for player messages from `speak()` and `print()`

**Messages are displayed for:**
- `collect()`: Success/failure feedback
- `interact()`: Boarding vehicles, element interactions, or "nothing to interact with"
- `backpack.append()`/`backpack.remove()`: Success/failure with backpack operations
- `inventory["item"] += 1`: Collection feedback or proximity errors
- `speak()`: Custom messages from student code
- Python `print()`: Output from student code

**CSS Classes:** `.message-error`, `.message-success`, `.message-info`, `.message-player` in `css/styles.css`

### Technical Implementations & Features

-   **Code Execution**: Python-like commands are parsed and executed visually. Skulpt integration consolidates game commands into `js/game-commands.js`, generating the Skulpt module source at load time. Commands support multi-argument and repetition, with simplified aliases and an auto-import prelude. The `Editor Manager` (`js/editor-manager.js`) handles editor functionalities with DOM element tracking to handle element recreation.
-   **Visual Coding**: Integration with Blockly allows toggling between a Python text editor and visual blocks, with custom blocks for movement commands.
-   **Coding Tutor**: An intelligent, rules-based tutor analyzes student code against solutions, providing contextual help and recommendations with an "Apply" button.
-   **Code Book**: A slide-out panel with tabbed navigation provides documentation across three sections: **Commands** (in-game function reference), **Authoring** (lesson creation guide from `docs/authoring.md`), and **Tech** (technical documentation from `docs/technical.md`). Content is lazy-loaded from source files.
-   **Backpack System**: A 4-item capacity backpack for Chapter 2 curriculum, teaching Python list methods. Students use `backpack.append()` to collect items and `backpack.remove("item")` to drop them. The backpack persists across mission levels via MissionState, displays in a green-bordered panel alongside inventory when populated, and properly resets with the Reset button.
-   **Sprite Selection**: A dropdown allows dynamic selection of character sprites.
-   **Integration**: Designed for embedding, the application communicates with parent platforms via `window.parent.postMessage` for progress tracking and uses `localStorage` for session caching. A `User Progress System` (`js/user-progress.js`) manages saving and loading user progress and chapter states.
-   **Test System**: A modular testing system (`js/tests/`) parses `<!-- Tests -->` YAML sections from lesson markdown, supporting various test types (position, inventory, collectibles, code regex, direction, element state) and providing fallback to goal position checking.

## External Dependencies

-   **CodeJar**: For the interactive code editor.
-   **Skulpt**: For in-browser Python execution.
-   **Blockly**: For visual coding integration.
-   **No external database**: Designed to be embedded in platforms that provide their own database infrastructure.