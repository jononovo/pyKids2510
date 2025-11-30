# Python Learning Platform - Interactive Game Tutorial

## Overview

This project is an interactive Python programming education platform designed to teach Python fundamentals through an engaging, tile-based game. Students control a character by writing Python code to navigate challenges, collect items, and complete levels. It's a portable, multi-level learning experience delivered as a static web application, intended for embedding into larger educational platforms that handle backend services. The platform aims to make Python learning accessible and fun through interactive gameplay.

## User Preferences

I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

### Core Components & Design

The application is a single-page, vanilla JavaScript and HTML5 Canvas web application. It uses CodeJar for syntax-highlighted Python editing and the Web Audio API for sound. A simple Python HTTP server (`server.py`) serves static files for development.

### Game Engine

A 2D tile-based rendering system supports character movement (`move_forward()`, `turn_left()`, `turn_right()`), collision detection, and objective tracking. A Camera System provides pan/zoom functionality and auto-follow.

**Double-Buffered Rendering**: The rendering system uses an offscreen canvas to prevent visual flicker during async operations like SVG tile loading and farming timer updates. All draw operations target the offscreen buffer via `getRenderContext()`, which atomically copies to the visible canvas after a complete frame is rendered. A re-entry guard (`renderInProgress`) prevents race conditions when mouse events trigger overlapping render calls. Note: Rendering modules (tile-renderer.js, element-renderer.js) define draw functions but rely on game-engine's `render()` entry point rather than firing during module load.

### Lesson System

Lessons are defined in Markdown files, specifying objectives, starter code, solutions, tile maps, character positions, and collectibles. The system includes a dynamic chapter dropdown and a "Mission System" for persistent state across levels.

### Map Graphics System

An SVG-based tile rendering system loads assets from `assets/map/`, supporting caching, preloading, and full graphic backgrounds. `tiles.json` defines all tile properties, and `elements.json` defines interactive elements and triggers. The system includes modules for tile, element, viewport, and camera rendering, ensuring a specific script loading order and global state exposure via `window.*`.

### Multi-Tile Rendering Systems

Two systems manage large multi-tile graphics:
-   **Mega-Elements**: Blocking structures (e.g., houses) defined in `assets/map/elements.json` with `blockedTiles` property for collision detection. SVG assets are organized in category folders under `assets/map/elements/` (buildings, vehicles, collectibles, interactive, landscaping).
-   **Scenery**: Walkable terrain features (e.g., mountains, trees) defined in `assets/map/scenery.json`. SVG assets located in `assets/map/scenery/`.
Rendering order ensures proper layering: `tiles → farm-plots → scenery → elements → built-elements → vehicles → mega-elements → goal star → player`.

### Farming System

Players can plant, water, and harvest crops using Python commands (`plant()`, `water()`, `harvest()`). All farming commands target the **tile in front of the player** (based on facing direction), not the tile the player is standing on. Crops progress through 'dirt', 'sprout', and 'grown' stages with 5-second intervals between each stage. State is managed in `gameState.farmPlots` and rendered dynamically. Use `time.sleep(5)` in Python code to wait for growth transitions.

**Farming Command Details:**
- `plant(cropName)`: Plants on the forward tile after validating it's walkable and not blocked (uses same checks as `build()` command via `ProximityGuard.canPlaceAt()`). Replanting on an existing plot refreshes it.
- `water()`: Waters a sprout on the forward tile to trigger growth to 'grown' stage.
- `harvest()`: Harvests a grown crop from the forward tile and adds it to inventory.

### Build System

The `build()` command allows students to construct elements using inventory items. Buildable elements, defined with `cost` in `assets/map/elements.json`, are added to `gameState.builtElements` for rendering and `MissionState.structures` for mission tracking.

### Level Loader

The `LevelLoader` (`js/game-engine/level-loader.js`) centralizes game state initialization, handling camera resets, map inheritance, game state setup, collectible processing, manager initialization, mission inventory loading, and reset snapshot capture.

### Reset System

A `ResetManager` (`js/game-engine/reset-manager.js`) provides two reset modes:
-   **Full Reset**: Clears all game state, inventory, code, and UI.
-   **Soft Reset**: Resets player position and vehicles only, preserving run-lock.

**Reset Flow (Fixed Nov 2025):**
1. `SignalManager.reset()` clears all signal listeners first
2. `resetElements()` → `resetStates()`:
   - Reloads fresh elements from `currentLevelData`
   - Clears `elementStates` to empty
   - Calls `_registerSignalListeners()` to set hidden:true for spawn elements
   - Applies snapshot states on top (for level 2+ carried-over state)
3. `resetVehicles()` → `resetStates()`:
   - Reloads fresh vehicles from `currentLevelData`
   - Clears `vehicleStates` to empty
   - Calls `_registerSignalListeners()` to set hidden:true for spawn vehicles

**Critical Design Note**: `SignalManager.reset()` must only be called from `ResetManager`, not during `loadLevelElements()`. This ensures spawn-triggered signal listeners survive initial level load and properly gate spawn-only elements/vehicles until their trigger signals fire.

### Coordinate Utilities

A shared utility (`js/game-engine/coord-utils.js`) provides `expandCoordinates()` for parsing the `[[x,y], [x2,y2]]` coordinate format used throughout the system. Both `ElementInteractionLogic` and `MegaElementManager` use this utility to eliminate duplicated parsing logic.

### Signal System

A pub/sub system (`js/game-engine/signal-manager.js`) enables dynamic interactions via named signals. Elements emit signals (`on_collect`, `on_step`, `on_interact`) and listen for them to `spawn`, `remove`, or trigger `on` state changes.

### TileAccess System

A unified utility (`js/game-engine/tile-access.js`) for all tile availability checking. Determines whether an actor (player or vehicle) can occupy a tile based on tile properties, mega-element blocking, and actor-specific requirements. Vehicles define `requires: "water"` in `elements.json` to traverse water tiles. See `docs/TILE_ACCESS_NOTES.md` for architecture details and future unification plans.

### ProximityGuard System

This system (`js/game-engine/proximity-guard.js`) enforces proximity for collection commands. `check()` validates position silently, `require()` throws errors, and `consume()` activates elements. It supports 'self', 'forward', 'adjacent', and radius-based checks.

### Game Message Display System

A unified system (`js/game-engine/feedback-effects.js`) displays user-facing feedback in a dedicated Message Panel within the game view. Messages are categorized as 'success', 'error', 'info', or 'player' with corresponding styling, providing feedback for commands like `collect()`, `interact()`, `backpack` operations, `speak()`, and Python `print()`.

### Technical Implementations & Features

-   **Code Execution**: Python-like commands are executed visually using Skulpt, with game commands consolidated in `js/game-commands.js` and an `Editor Manager` handling editor functionality.
-   **Visual Coding**: Integration with Blockly allows switching between text and block-based coding.
-   **Coding Tutor**: A rules-based tutor analyzes student code and offers contextual help.
-   **Code Book**: A slide-out panel provides documentation for in-game commands, authoring guidelines (`docs/authoring.md`), and technical details (`docs/technical.md`).
-   **Backpack System**: A 4-item capacity backpack, persisting across mission levels via MissionState, teaching Python list methods. `backpack.append()` collects items from the **forward tile only** (advanced behavior). `backpack.pop()` drops items onto the forward tile with three modes: `pop()` (last item), `pop(index)` (by position), or `pop("item")` (by name).
-   **Collection Commands**: `collect()` is beginner-friendly (checks standing tile, then forward tile). Advanced commands like `backpack.append()` and `inventory[key] = value` only work on the **forward tile**.
-   **Sprite Selection**: Dynamic character sprite selection.
-   **Integration**: Communicates with parent platforms via `postMessage` for progress tracking and uses `localStorage` for session caching. A `User Progress System` manages state.
-   **Test System**: Parses YAML sections from lesson Markdown for various test types (position, inventory, code regex, etc.).

## External Dependencies

-   **CodeJar**: For the interactive code editor.
-   **Skulpt**: For in-browser Python execution.
-   **Blockly**: For visual coding integration.
-   **No external database**: Designed for embedding in platforms providing their own database infrastructure.