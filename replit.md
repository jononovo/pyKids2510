# Python Learning Platform - Interactive Game Tutorial

## Overview

This project is an **interactive Python programming education platform** that combines a tile-based game engine with a real-time code execution environment. Students learn Python by writing code to control a character through various challenges and levels.

Built as a **simple static web application** with no backend dependencies, it's designed to be embedded into other platforms that provide their own database and framework infrastructure.

## Purpose & Goals

- **Educational**: Teach Python programming fundamentals through interactive gameplay
- **Portable**: Single-page application that can be easily embedded or deployed
- **Interactive**: Real-time visual feedback as students write and execute Python commands
- **Progressive**: Multi-level system with increasing complexity

## Current State

The application is fully functional and ready to use:
- ✅ Web server running on port 5000
- ✅ Interactive code editor with Python syntax highlighting
- ✅ Tile-based game engine with sprite animation support
- ✅ Lesson authoring system using markdown files
- ✅ Sound generation and visual feedback

## Project Architecture

### Core Components

1. **Frontend (index.html)**
   - Single HTML file containing all application logic
   - HTML5 Canvas for game rendering (32x32 pixel tile grid)
   - CodeJar editor for syntax-highlighted Python editing
   - Vanilla JavaScript - no framework dependencies

2. **Game Engine**
   - 2D tile-based rendering system
   - Character animation (6x2 sprite grid: idle + walking states)
   - Movement commands: `move_forward()`, `turn_left()`, `turn_right()`
   - Collision detection and objective tracking
   - Web Audio API for procedural sound generation

3. **Lesson System**
   - Markdown-based lesson authoring (`python-course-chapter1.md`)
   - Each lesson defines:
     - Objectives and challenges
     - Starter code and solutions
     - Tile map layouts
     - Character starting/goal positions
     - Collectible items

4. **Map Graphics System**
   - SVG-based tile rendering system
   - Organized in `assets/map/` with subdirectories:
     - `tiles/` - Basic tiles (grass, path, water, rock)
     - `objects/` - Interactive objects (trees, bushes, flowers)
     - `special/` - Special items (goal star, collectibles)
     - `mega-elements/` - Multi-tile graphics (2x2, 4x4, etc.) like houses, mountains
   - **Mega-Element System** - Multi-tile elements spanning multiple grid spaces:
     - Managed by `MegaElementManager` module (`js/game-engine/mega-element-manager.js`)
     - Manifest: `assets/map/mega-elements.json` with size and collision data
     - Use upper-left anchor point, extending right and down
     - Collision blocking via `blockedTiles` in manifest
     - Rendering layer: background → tiles → elements → mega-elements → goal → player
   - Automatic caching and preloading for performance
   - Fallback to programmatic rendering if SVGs unavailable

5. **Server (server.py)**
   - Simple Python HTTP server
   - Serves static files on port 5000
   - Cache-control headers for instant preview updates in Replit

### File Structure

```
.
├── index.html                      # Main application (self-contained)
├── python-course-chapter1.md       # Chapter 1 lesson content
├── Chicken.png                     # Default character sprite
├── server.py                       # Simple HTTP server
└── README.md                       # Project description
```

## How It Works

1. **User loads the application** - Opens in web browser
2. **Loads lesson file** - User uploads markdown lesson file via file picker
3. **Lesson parsed** - System extracts objectives, code, and map data
4. **Game rendered** - Canvas displays the tile-based game world
5. **Student codes** - Writes Python commands in the editor
6. **Code executes** - Python-like commands parsed and executed visually
7. **Progress tracked** - Level completion tracked with visual indicators

## Technical Stack

- **Language**: JavaScript (vanilla), Python (server only)
- **Graphics**: HTML5 Canvas
- **Editor**: CodeJar (loaded from CDN)
- **Audio**: Web Audio API
- **No external dependencies** beyond CodeJar for editing
- **No database** - designed to be embedded in platforms with their own DB

## Development Notes

### Running Locally

The server automatically starts via the Replit workflow:
- Serves on `http://0.0.0.0:5000`
- Cache-control headers prevent stale content in Replit's iframe
- Auto-reloads on file changes

### Lesson File Format

Lessons are markdown files with special code blocks:
- `<!-- Starter Code -->` - Initial code shown in editor
- `<!-- Solution -->` - Solution code (hidden)
- `<!-- Map -->` - Tile layout and positions

### Sprite Format

Custom character sprites must follow the 6x2 grid format:
- Top row: 6 idle animation frames
- Bottom row: 6 walking animation frames
- Automatically cycles through frames during movement

## Integration Notes

This application is designed to be **embedded into another platform**:
- No database required (host platform manages user data)
- No authentication system (host platform handles auth)
- Portable as a single HTML file
- Can be iframed or integrated via web components

## Educational Content

Currently includes Chapter 1 with 3 levels covering:
1. **Basic Movement** - Simple path following
2. **Functions & Direction** - Turn commands and navigation
3. **Function Arguments** - Using parameters to move multiple steps

The platform is based on the original game at **codingforkids.io**.

## Recent Changes

- **2025-11-26**: Skulpt Integration Refactor - Single Source of Truth
  - **Consolidated Architecture**: Merged `python-parser.js` and `player-module.js` into single `js/game-commands.js`
  - **Single Source of Truth**: All 11 game commands defined once with metadata + execute functions
  - **Code Generation Pattern**: Skulpt module source generated at load time from GameCommands registry
  - **Self-Contained Wrappers**: Generated Skulpt functions reference window globals (no closure dependencies)
  - **Multi-Arg Support**: All arguments properly forwarded to command functions
  - **Command Counter**: Accurate tracking via `countsAsMultiple` for multi-step commands
  - **Repetition for Turn Commands**: `turn_left(3)` and `turn_right(2)` now repeat N times
  - **Simplified Command Aliases**: Added `forward()`, `left()`, `right()` as shortcuts
  - **Auto-Import Prelude**: Students no longer need `import player` - commands work directly
  - **Deleted Files**: Removed `js/python-parser.js` and `js/player-module.js`

- **2025-11-26**: Complete Tile Manifest - Single Source of Truth
  - **tiles.json is Authoritative**: All tile definitions (IDs, paths, fallback colors, overlay flags) live in `assets/map/tiles.json`
  - **Runtime Generation**: `TILES` constants and `tileDataById` lookup generated dynamically from manifest at load time
  - **Named Keys**: Manifest uses human-readable keys (GRASS, PATH, TREE) instead of numeric indices
  - **Zero Hardcoded Values**: Removed all hardcoded tile constants from JavaScript code
  - **Simplified Helpers**: `getTilePath()`, `getTileFallbackColor()`, `isTileOverlay()` lookup directly by tile ID
  - **Easier Customization**: Add/modify tiles by editing JSON file - no code changes required
- **2025-11-25**: Chapter Dropdown for Developers
  - **Added dropdown button** in header area (▼ chevron) to switch between lesson files
  - **Dynamic file discovery**: Server endpoint `/markdown-files.json` lists all `.md` files in `assets/` folder
  - **Quick switching**: Click any file to load it immediately without using file picker
  - **Auto-close**: Dropdown closes automatically after selecting a file

- **2025-10-15**: Modular Beach/Island Tile System
  - **Created Complete Beach Tile Set**: New modular tiles for creating any island or water-based map
    - `sand.svg` - Sandy beach base tile with texture
    - `beach-edge-top/bottom/left/right.svg` - Beach edges where sand meets water
    - `beach-corner-*.svg` - Smooth corner transitions for natural coastlines
  - **Built Island House Map**: New 24x24 tile island graphic map featuring:
    - Cozy house with top-down perspective
    - Tropical island surrounded by water
    - Beach transitions using the new modular tiles
    - Trees, bushes, flowers from existing assets
    - Stone paths, pond, and dock
  - **Added Level 5**: Island Adventure level using the new graphic map
  - **True Top-Down Perspective**: All elements designed for overhead view like classic SNES games
  - **Reusable Components**: Beach tiles can be used to create any water/island configuration

- **2025-10-15**: SVG-Based Map Tile System & Graphic Map Support
  - **Created Map Asset Structure**: New `assets/map/` folder with subdirectories for tiles, objects, special items, and collectibles
  - **Designed SVG Graphics**: Created high-quality SVG tiles for grass, path, water, rock, trees, bushes, flowers, and the goal star
  - **Implemented SVG Rendering**: Modified game engine to load and render SVG images instead of programmatically drawn rectangles
  - **Performance Optimization**: Added Map-based caching system for loaded SVG images with preloading on startup
  - **Automatic Fallback**: Preserves backward compatibility with fallback to colored rectangles if SVGs fail to load
  - **Visual Improvements**: Much more appealing graphics with textured tiles, layered trees, and glowing star effects
  - **Easy Customization**: Artists/educators can now modify map graphics by simply editing SVG files without touching code
  - **Organized Collectibles Folder**: Created dedicated `assets/map/collectibles/` folder with multiple collectible types (coin, gem, key, heart, star, apple)
  - **Fixed Performance Bug**: Prevented network spam from repeated SVG load attempts by caching failed loads
  - **Full Graphic Map Support**: Added ability to use pre-drawn full PNG/SVG backgrounds instead of tiles
    - New `assets/map/graphic-maps/` folder for full background images
    - Lesson markdown supports `graphic:` field to specify background image URL
    - Character and collectibles render on top of the background
    - Tiles marked as 0 become transparent when graphic background is used
    - Created sample castle garden map demonstrating the feature
    - Perfect for advanced levels with complex visuals like castles and landscapes

- **2025-10-13**: Blockly Visual Coding Integration
  - **Modular Architecture**: Created blockly-integration/ folder with isolated code
  - **Lazy Loading**: Blockly CDN and resources only load when "Blocks" mode is activated
  - **Custom Blocks**: Movement blocks that generate player.move_forward(), turn_left(), turn_right()
  - **Dual Coding Modes**: Students can toggle between Python text editor and visual blocks
  - **Full-Width Editor**: Expanded editor to use full panel width for better visibility
  - **Fixed Critical Bugs**: Removed duplicate script includes and fixed loop detection logic
  - **Preserved Functionality**: All existing features (tutor, code book, sprite selection) still work

- **2025-10-12 (Final)**: Code Book Implementation
  - **Created Code Book Panel**: Slide-out documentation panel from right side
  - **Added Function Documentation**: Documented player.move_forward(), turn_left(), and turn_right()
  - **Styled Panel Design**: Dark theme with green accents matching game aesthetic
  - **Interactive Toggle**: Click Code Book button or close X to show/hide panel
  - **Smooth Animations**: CSS transitions for panel slide-in/out effects
  - **Code Examples**: Each function includes usage examples and descriptions

- **2025-10-12**: Initial Replit setup & Sprite Dropdown Feature
  - Renamed main file to `index.html`
  - Added Python HTTP server with cache-control
  - Configured workflow for port 5000
  - Created documentation
  - **Refactored codebase** into modular structure (css/, js/, assets/)
  - **Fixed CodeJar CDN issue** (created local UMD version in js/codejar.js)
  - **Added sprite dropdown menu** that auto-populates from assets/sprites/ folder
  - **Enhanced server** with /sprites.json endpoint for dynamic sprite listing
  - **Refined UI styling**: Made button borders thinner (1px), removed borders from dropdown menus
  
- **2025-10-12 (Afternoon)**: Implemented Intelligent Coding Tutor System
  - **Phase 1-9 Implementation Complete**: Full coding tutor with smart recommendations
  - **Rules-Based Logic**: Analyzes student code vs solution, provides contextual help
  - **Code Comparison Engine**: Normalizes and compares code, handles variations
  - **Smart Recommendations**: Different help for incomplete code, errors, or incorrect lines
  - **Apply Button**: Automatically inserts or replaces code in editor
  - **Toggle Functionality**: Help button (green when active) enables/disables tutor
  - **Persistent Settings**: Tutor state saved in localStorage
  - **Integration with Run Code**: Automatically analyzes failed attempts and offers help
  - **Clean Implementation**: Single overlay dialog with pixel art avatar

- **2025-10-12 (Evening)**: Tutor Improvements & Testing Suite
  - **Improved Rules-Based Tutor**: Clear "Change line X from Y to Z" format for errors
  - **Simplified AI Context**: AI tutor now analyzes solution code to understand constraints
  - **Tutor Toggle Button**: Added ON/OFF toggle next to coin display for tutor control
  - **Visual Polish**: Updated tutor dialog to match original design with warmer colors
  - **Comprehensive Test Suite**: Created separate tests.html with 29 automated tests
  - **Test Coverage**: Tests for tutor systems, code execution, level progression, map rendering, and file loading
  - **Clean Separation**: Test page is completely independent from main application

## Future Enhancements (Not Implemented)

Potential features for the embedding platform to add:
- User progress tracking and persistence
- More chapters and advanced Python concepts
- Multiplayer or collaborative coding
- AI-powered hints and assistance
- Code validation and automated testing
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

SVG-based tile rendering system with assets organized in `assets/map/` (tiles, objects, elements, special items). It supports automatic caching and preloading, with a fallback to programmatic rendering. The system also supports full graphic maps (PNG/SVG backgrounds) where tiles can become transparent.

**Asset Organization:**
- `tiles/` - Static terrain tiles (grass, path, water, etc.)
- `objects/` - Static decorative objects (trees, bushes, flowers)
- `elements/` - All interactive elements (collectibles like coins/gems, transforms like doors/levers)
- `special/` - Special items (star-goal)

**Tile System (tiles.json)**: Single source of truth for all tile definitions:
- `TILES` constant is dynamically generated from manifest at load time via `buildTileConstants()`
- `getTileIdByName(name)` helper for looking up tile IDs by name
- `access` property controls walkability:
  - No access property = walkable by default
  - `"blocked"` = never passable (tree, rock, bush)
  - `["boat", "ship"]` = only these character types can pass (water)
  - `{"requires": ["key"]}` or `{"requires": {"wood": 100}}` = inventory requirements
- Adding new tiles requires only editing `assets/map/tiles.json` - no code changes needed

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
    - `elementStates`: Object tracking transformed elements (e.g., doors that have been opened)
    - `structures`: Array for built structures (future use)
  - **Level Types**: `exercise` (sandbox, no persistence) vs `mission/quest` (persistent inventory/progress)
  - **Map Inheritance**: Exercises use most recent map layout; missions prefer the last mission's map (via `lastMapCache`/`lastMissionMapCache`)
  - **Collect Command Integration**: `collect()` records items to MissionState inventory for mission levels, filtering already-collected positions
  - **chapterState Format**: `{chapter: 1, inventory: {}, collectedItems: [], structures: [], elementStates: {}}`
  - **Level Entry Snapshot** (`window.levelEntrySnapshot`): Reset functionality preserves the state when first entering a level:
    - `starterCode`: The code loaded when entering the level (saved code if available, otherwise starter code)
    - `missionState`: Deep copy of MissionState at level entry (inventory, collectedItems, structures, elementStates)
    - `levelIndex`: Tracks which level the snapshot belongs to (prevents overwriting on same-level reloads)
    - Reset button restores code editor, MissionState, inventory UI, and collectible states to entry snapshot

- **Test System** (`js/tests/`): Modular level completion testing:
  - **Test Context** (`test-context.js`): Snapshots all game state for tests (player position, inventory, collectibles, code, mission state)
  - **Test Types** (`test-types.js`): Available test implementations:
    - `position`: Check player at goal or specific coordinates
    - `inventory`: Check item counts (min/exact/max)
    - `collectibles`: Check collected items (all/count/types)
    - `code_regex`: Regex match on student code
    - `direction`: Check player facing direction
    - `element_state`: Check transformed elements
  - **Test Runner** (`test-runner.js`): Orchestrates test execution with fallback to goalPos check when no tests defined
  - **Lesson Parser Integration**: Parses `<!-- Tests -->` YAML sections from lesson markdown
  - **Fallback Behavior**: If no tests defined, defaults to standard goalPos win condition

- **Element Interaction System** (`js/game-engine/element-interaction-logic.js`): Single source of truth for all interactive elements:
  - **ElementInteractionManager**: Singleton class managing element loading, parsing, state, and interactions
  - **Element Manifest** (`assets/map/elements.json`): Defines available elements (door, door-open, lever, button, etc.) with SVG paths and fallback colors
  - **Syntax (outer array wrapper ALWAYS required)**:
    - Single type: `[["type", [[coords...]]]]`
    - Multiple types: `[["type1", [[coords...]]], ["type2", [[coords...]]]]`
    - With trigger: `[["type", {"trigger": "on_step", "at": [[coords...]]}]]`
  - **Element Types**:
    - `collectibles:` - Items picked up with `collect()`, default trigger `on_collect`
    - `transforms:` - Elements changed with `interact()`, default trigger `on_interact`
  - **Transform Behavior**:
    - Disappear: `["door", [[6,6]]]`
    - Swap: `["door", "door-open", [[4,4]]]`
  - **Trigger Types**: `on_collect`, `on_interact`, `on_step` (auto-trigger when player walks on tile)

## Documentation

- **Lesson Authoring Guide**: `docs/LESSON_AUTHORING_GUIDE.md` - Comprehensive guide for creating lessons, missions, and quests. Includes template structure, map design, collectibles, available commands, and technical details.

## External Dependencies

- **CodeJar**: Used for the interactive code editor (loaded from CDN, or local UMD version).
- **Skulpt**: Used for in-browser Python execution.
- **Blockly**: Used for visual coding integration (lazy-loaded from CDN).
- **No external database**: Designed to be embedded in platforms that provide their own database infrastructure.
