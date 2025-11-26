# Python Learning Platform - Interactive Game Tutorial

## Overview

This project is an interactive Python programming education platform designed to teach Python fundamentals through an engaging, tile-based game. Students write Python code to control a character, solve challenges, and navigate through various levels, receiving real-time visual feedback. It's a self-contained, static web application intended for easy embedding into other educational platforms, providing a portable and interactive learning experience without backend dependencies. The platform aims to be highly educational, portable, and interactive, with a progressive multi-level system.

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

A 2D tile-based rendering system with a character animation (6x2 sprite grid) supports movement commands (`move_forward()`, `turn_left()`, `turn_right()`), collision detection, and objective tracking.

### Lesson System

Lessons are authored in Markdown files (`.md`), defining objectives, challenges, starter code, solutions, tile map layouts, character positions, and collectible items. The system includes a dynamic chapter dropdown for developers to switch between lesson files.

### Map Graphics System

SVG-based tile rendering system with assets organized in `assets/map/` (tiles, objects, special items). It supports automatic caching and preloading, with a fallback to programmatic rendering. A `tiles.json` manifest externalizes tile definitions, enabling easier customization. The system also supports full graphic maps (PNG/SVG backgrounds) where tiles can become transparent.

### Technical Implementations & Features

- **Code Execution**: Python-like commands are parsed and executed visually. Skulpt integration has been refactored for a single source of truth for game commands (`js/game-commands.js`), generating Skulpt module source at load time. Commands now support multi-argument and repetition for turns, with simplified aliases and auto-import prelude.
- **Editor Manager** (`js/editor-manager.js`): Centralized module managing the CodeJar code editor instance with methods for initialization, code updates, line numbers, and reset functionality. Exposes `init()`, `updateCode()`, `getCode()`, `updateLineNumbers()`, `isInitialized()`, and `resetToSnapshot()` methods via the global `EditorManager` object.
- **Visual Coding**: Integration with Blockly allows students to toggle between a Python text editor and visual blocks, with custom blocks for movement commands.
- **Coding Tutor**: An intelligent, rules-based coding tutor analyzes student code against solutions, providing contextual help and recommendations, with an "Apply" button to insert/replace code.
- **Code Book**: A slide-out panel provides documentation and examples for in-game functions.
- **Sprite Selection**: A dropdown allows dynamic selection of character sprites from the `assets/sprites/` folder.
- **Integration**: Designed for embedding, the application communicates with parent platforms via `window.parent.postMessage` for code progress and level completion tracking, using `localStorage` for session caching.
- **User Progress System**: `js/user-progress.js` provides a UserProgressManager with two-way communication:
  - **Outbound Messages** (App → Host):
    - `{type: 'app-ready', currentLevelId: '...'}` - Sent when app is ready to receive data
    - `{type: 'save-progress', levelId: '...', data: {code, completed, chapterState?}}` - Sent when student saves code (includes chapterState for mission levels)
    - `{type: 'checker-validation', checkerId: 'level 1', valid: true, chapterState?}` - Sent on level completion (includes chapterState for mission levels)
  - **Inbound Messages** (Host → App):
    - `{type: 'load-progress', levelId: '...', code: '...', completed: true, chapterState?: {...}}` - Load saved progress into editor (chapterState for missions)
    - `{type: 'load-all-progress', progress: {...}}` - Load all progress data at once
- **Mission System** (`js/mission/`): A story-driven mission system with persistent state:
  - **Mission Detector** (`mission-detector.js`): Identifies mission/quest levels via `## MISSION` or `## QUEST` headers (case-insensitive)
  - **Mission State** (`mission-state.js`): Manages persistent chapter state including:
    - `inventory`: Collected resources (e.g., `{wood: 3, coin: 2}`)
    - `collectedItems`: Array of `{x, y, type}` for already-collected positions
    - `structures`: Array for built structures (future use)
  - **Level Types**: `exercise` (sandbox, no persistence) vs `mission/quest` (persistent inventory/progress)
  - **Map Inheritance**: Exercises use most recent map layout; missions prefer the last mission's map (via `lastMapCache`/`lastMissionMapCache`)
  - **Collect Command Integration**: `collect()` records items to MissionState inventory for mission levels, filtering already-collected positions
  - **chapterState Format**: `{chapter: 1, inventory: {}, collectedItems: [], structures: []}`
  - **Level Entry Snapshot** (`window.levelEntrySnapshot`): Reset functionality preserves the state when first entering a level:
    - `starterCode`: The code loaded when entering the level (saved code if available, otherwise starter code)
    - `missionState`: Deep copy of MissionState at level entry (inventory, collectedItems, structures)
    - `levelIndex`: Tracks which level the snapshot belongs to (prevents overwriting on same-level reloads)
    - Reset button restores code editor, MissionState, inventory UI, and collectible states to entry snapshot

## External Dependencies

- **CodeJar**: Used for the interactive code editor (loaded from CDN, or local UMD version).
- **Skulpt**: Used for in-browser Python execution.
- **Blockly**: Used for visual coding integration (lazy-loaded from CDN).
- **No external database**: Designed to be embedded in platforms that provide their own database infrastructure.