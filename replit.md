# Python Learning Platform - Interactive Game Tutorial

## Overview

This project is an interactive Python programming education platform that teaches Python fundamentals through an engaging, tile-based game. Students write Python code to control a character, solve challenges, and navigate through various levels, receiving real-time visual feedback. It's a self-contained, static web application designed for easy embedding into other educational platforms, providing a portable and interactive learning experience without backend dependencies. The platform aims to be highly educational, portable, and interactive, with a progressive multi-level system.

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

A 2D tile-based rendering system with character animation supports movement commands (`move_forward()`, `turn_left()`, `turn_right()`), collision detection, and objective tracking.

### Lesson System

Lessons are authored in Markdown files (`.md`), defining objectives, challenges, starter code, solutions, tile map layouts, character positions, and collectible items. The system includes a dynamic chapter dropdown for developers to switch between lesson files.

### Map Graphics System

An SVG-based tile rendering system organizes assets in `assets/map/` (tiles, objects, elements, special items). It supports automatic caching and preloading, with a fallback to programmatic rendering. The system also supports full graphic maps (PNG/SVG backgrounds) where tiles can become transparent. The `tiles.json` file serves as the single source of truth for all tile definitions, dynamically generating `TILES` constants and supporting access control properties.

**Asset Organization:**
- `tiles/` - Static terrain tiles (grass, path, water, etc.)
- `objects/` - Static decorative objects (trees, bushes, flowers)
- `elements/` - All interactive elements (collectibles like coins/gems, transforms like doors/levers)
- `special/` - Special items (star-goal)

### Technical Implementations & Features

-   **Code Execution**: Python-like commands are parsed and executed visually. Skulpt integration consolidates game commands into `js/game-commands.js`, generating the Skulpt module source at load time. Commands now support multi-argument and repetition for turns, with simplified aliases and an auto-import prelude.
-   **Editor Manager** (`js/editor-manager.js`): A centralized module managing the CodeJar editor instance with methods for initialization, code updates, line numbers, and reset functionality.
-   **Visual Coding**: Integration with Blockly allows toggling between a Python text editor and visual blocks, with custom blocks for movement commands.
-   **Coding Tutor**: An intelligent, rules-based tutor analyzes student code against solutions, providing contextual help and recommendations with an "Apply" button.
-   **Code Book**: A slide-out panel provides documentation and examples for in-game functions.
-   **Sprite Selection**: A dropdown allows dynamic selection of character sprites.
-   **Integration**: Designed for embedding, the application communicates with parent platforms via `window.parent.postMessage` for progress tracking and uses `localStorage` for session caching.
-   **User Progress System** (`js/user-progress.js`): Manages two-way communication for saving and loading user progress, including level completion status and `chapterState` for mission levels.
-   **Mission System** (`js/mission/`): A story-driven system with persistent state (`inventory`, `collectedItems`, `elementStates`, `structures`) for "mission" or "quest" levels, identified via markdown headers. Supports level entry snapshots for reset functionality.
-   **Test System** (`js/tests/`): Modular level completion testing, parsing `<!-- Tests -->` YAML sections from lesson markdown. Supports various test types (position, inventory, collectibles, code regex, direction, element state) and provides a fallback to goal position checking.
-   **Element Interaction System** (`js/game-engine/element-interaction-logic.js`): Manages interactive elements defined in `assets/map/elements.json`, supporting collectibles and transforms with various trigger types (`on_collect`, `on_interact`, `on_step`).

## External Dependencies

-   **CodeJar**: Used for the interactive code editor.
-   **Skulpt**: Used for in-browser Python execution.
-   **Blockly**: Used for visual coding integration.
-   **No external database**: Designed to be embedded in platforms that provide their own database infrastructure.