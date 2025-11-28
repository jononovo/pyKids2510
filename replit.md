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

**Rendering Order**: `tiles → mega-objects → elements → mega-elements → goal star → player`

This ensures terrain features appear as background, while structures render in front of the player.

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

This separation ensures the Run button stays disabled during code execution (preventing re-entry) while the Reset button fully restores the level to its starting state.

### Technical Implementations & Features

-   **Code Execution**: Python-like commands are parsed and executed visually. Skulpt integration consolidates game commands into `js/game-commands.js`, generating the Skulpt module source at load time. Commands support multi-argument and repetition, with simplified aliases and an auto-import prelude. The `Editor Manager` (`js/editor-manager.js`) handles editor functionalities with DOM element tracking to handle element recreation.
-   **Visual Coding**: Integration with Blockly allows toggling between a Python text editor and visual blocks, with custom blocks for movement commands.
-   **Coding Tutor**: An intelligent, rules-based tutor analyzes student code against solutions, providing contextual help and recommendations with an "Apply" button.
-   **Code Book**: A slide-out panel provides documentation and examples for in-game functions.
-   **Backpack System**: A 4-item capacity backpack for Chapter 2 curriculum, teaching Python list methods. Students use `backpack.append()` to collect items and `backpack.remove("item")` to drop them. The backpack persists across mission levels via MissionState, displays in a green-bordered panel alongside inventory when populated, and properly resets with the Reset button.
-   **Sprite Selection**: A dropdown allows dynamic selection of character sprites.
-   **Integration**: Designed for embedding, the application communicates with parent platforms via `window.parent.postMessage` for progress tracking and uses `localStorage` for session caching. A `User Progress System` (`js/user-progress.js`) manages saving and loading user progress and chapter states.
-   **Test System**: A modular testing system (`js/tests/`) parses `<!-- Tests -->` YAML sections from lesson markdown, supporting various test types (position, inventory, collectibles, code regex, direction, element state) and providing fallback to goal position checking.

## External Dependencies

-   **CodeJar**: For the interactive code editor.
-   **Skulpt**: For in-browser Python execution.
-   **Blockly**: For visual coding integration.
-   **No external database**: Designed to be embedded in platforms that provide their own database infrastructure.