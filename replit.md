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

- **2025-10-15**: SVG-Based Map Tile System
  - **Created Map Asset Structure**: New `assets/map/` folder with subdirectories for tiles, objects, special items, and collectibles
  - **Designed SVG Graphics**: Created high-quality SVG tiles for grass, path, water, rock, trees, bushes, flowers, and the goal star
  - **Implemented SVG Rendering**: Modified game engine to load and render SVG images instead of programmatically drawn rectangles
  - **Performance Optimization**: Added Map-based caching system for loaded SVG images with preloading on startup
  - **Automatic Fallback**: Preserves backward compatibility with fallback to colored rectangles if SVGs fail to load
  - **Visual Improvements**: Much more appealing graphics with textured tiles, layered trees, and glowing star effects
  - **Easy Customization**: Artists/educators can now modify map graphics by simply editing SVG files without touching code
  - **Organized Collectibles Folder**: Created dedicated `assets/map/collectibles/` folder with multiple collectible types (coin, gem, key, heart, star, apple)
  - **Fixed Performance Bug**: Prevented network spam from repeated SVG load attempts by caching failed loads

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
