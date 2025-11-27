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

A 2D tile-based rendering system with character animation supports movement commands (`move_forward()`, `turn_left()`, `turn_right()`), collision detection, and objective tracking. A Camera System allows pan/zoom controls for navigating large maps, with auto-follow functionality and a "Reset View" option.

### Lesson System

Lessons are authored in Markdown files (`.md`), defining objectives, challenges, starter code, solutions, tile map layouts, character positions, and collectible items. A dynamic chapter dropdown allows developers to switch between lesson files. The system also supports a story-driven "Mission System" for persistent state across levels.

### Map Graphics System

An SVG-based tile rendering system organizes assets in `assets/map/` (tiles, objects, elements, special items). It supports automatic caching and preloading, with a fallback to programmatic rendering. Full graphic maps (PNG/SVG backgrounds) are supported, allowing tiles to become transparent. `tiles.json` is the single source of truth for all tile definitions, dynamically generating `TILES` constants and managing access control properties. The system also supports interactive elements defined in `assets/map/elements.json`, handling collectibles and transforms with various trigger types.

### Multi-Tile Rendering Systems

Two parallel systems handle large multi-tile graphics:

-   **Mega-Elements** (`js/game-engine/mega-element-manager.js`): Multi-tile blocking structures like houses and shops (3x3 tiles). Defined in `assets/map/mega-elements.json` with collision detection via `blockedTiles`. SVGs in `assets/map/mega-elements/`.

-   **Mega-Objects** (`js/game-engine/mega-object-manager.js`): Multi-tile walkable terrain features like mountains and hills. Defined in `assets/map/mega-objects.json` without blocking. SVGs in `assets/map/mega-objects/`.

**Rendering Order**: `tiles → mega-objects → elements → mega-elements → goal star → player`

This ensures terrain features appear as background, while structures render in front of the player.

### Vehicle System

The vehicle system (`js/game-engine/vehicle-interaction-logic.js`) enables character-vehicle interactions:

-   **Tile Access Control**: Water tiles in `tiles.json` have `access: ["boat", "ship", "fish"]` restricting traversal to specific character types.
-   **Boarding**: Players use `interact()` when adjacent to a vehicle. The system stores the original sprite, changes `characterType` to the vehicle type (e.g., "boat"), and loads the vehicle sprite.
-   **Disembarking**: Using `interact()` while on a vehicle finds an adjacent land tile, moves the player there, and restores the original sprite and character type.
-   **Lesson Authoring**: Use `vehicles: ["boat", [[x,y]]]` section in level markdown to place vehicles.
-   **Element Definition**: Vehicles are defined in `elements.json` with `vehicleType` and `spritePath` properties.

### Technical Implementations & Features

-   **Code Execution**: Python-like commands are parsed and executed visually. Skulpt integration consolidates game commands into `js/game-commands.js`, generating the Skulpt module source at load time. Commands support multi-argument and repetition, with simplified aliases and an auto-import prelude. The `Editor Manager` (`js/editor-manager.js`) handles editor functionalities.
-   **Visual Coding**: Integration with Blockly allows toggling between a Python text editor and visual blocks, with custom blocks for movement commands.
-   **Coding Tutor**: An intelligent, rules-based tutor analyzes student code against solutions, providing contextual help and recommendations with an "Apply" button.
-   **Code Book**: A slide-out panel provides documentation and examples for in-game functions.
-   **Sprite Selection**: A dropdown allows dynamic selection of character sprites.
-   **Integration**: Designed for embedding, the application communicates with parent platforms via `window.parent.postMessage` for progress tracking and uses `localStorage` for session caching. A `User Progress System` (`js/user-progress.js`) manages saving and loading user progress and chapter states.
-   **Test System**: A modular testing system (`js/tests/`) parses `<!-- Tests -->` YAML sections from lesson markdown, supporting various test types (position, inventory, collectibles, code regex, direction, element state) and providing fallback to goal position checking.

## External Dependencies

-   **CodeJar**: For the interactive code editor.
-   **Skulpt**: For in-browser Python execution.
-   **Blockly**: For visual coding integration.
-   **No external database**: Designed to be embedded in platforms that provide their own database infrastructure.