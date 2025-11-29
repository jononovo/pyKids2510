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

Players can plant, water, and harvest crops using Python commands (`plant()`, `water()`, `harvest()`). Crops progress through 'dirt', 'sprout', and 'grown' stages with 10-second intervals between each stage. State is managed in `gameState.farmPlots` and rendered dynamically. Use `time.sleep(10)` in Python code to wait for growth transitions.

### Build System

The `build()` command allows students to construct elements using inventory items. Buildable elements, defined with `cost` in `assets/map/elements.json`, are added to `gameState.builtElements` for rendering and `MissionState.structures` for mission tracking.

### Level Loader

The `LevelLoader` (`js/game-engine/level-loader.js`) centralizes game state initialization, handling camera resets, map inheritance, game state setup, collectible processing, manager initialization, mission inventory loading, and reset snapshot capture.

### Reset System

A `ResetManager` (`js/game-engine/reset-manager.js`) provides two reset modes:
-   **Full Reset**: Clears all game state, inventory, code, and UI.
-   **Soft Reset**: Resets player position and vehicles only, preserving run-lock.
Both clear and re-register signal listeners to ensure consistent state.

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
-   **Backpack System**: A 4-item capacity backpack, persisting across mission levels via MissionState, teaching Python list methods.
-   **Sprite Selection**: Dynamic character sprite selection.
-   **Integration**: Communicates with parent platforms via `postMessage` for progress tracking and uses `localStorage` for session caching. A `User Progress System` manages state.
-   **Test System**: Parses YAML sections from lesson Markdown for various test types (position, inventory, code regex, etc.).

## External Dependencies

-   **CodeJar**: For the interactive code editor.
-   **Skulpt**: For in-browser Python execution.
-   **Blockly**: For visual coding integration.
-   **No external database**: Designed for embedding in platforms providing their own database infrastructure.