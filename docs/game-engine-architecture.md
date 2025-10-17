# Game Engine Architecture

## Overview

The game engine is a browser-based 2D tile system that combines visual map rendering with code execution capabilities. It interprets Python-like commands to control character movement and interactions within an interactive learning environment.

## Core Components

### 1. Map System

The engine supports two distinct map rendering modes:

#### Tile-Based Maps
- **Grid System**: Uses a 2D array where each cell contains a tile type value (0-7)
- **Tile Types**:
  - `0` - Grass (walkable)
  - `1` - Decoration (non-walkable) 
  - `2` - Path (walkable)
  - `3` - Water/Rock (non-walkable)
  - `4` - Tree (non-walkable)
  - `5` - Bush (non-walkable)
  - `6` - Flower (non-walkable)
  - `7` - Collectible (walkable, auto-collected)

#### Graphic Maps
- **Background Image**: Full-resolution background (SVG/PNG) loaded as base layer
- **Collision Overlay**: Transparent tile grid defines walkable/non-walkable areas
- **Hybrid Rendering**: Collectibles rendered on top of background image

### 2. Movement System

#### Character Controller
```javascript
// Core movement functions
animateMove(fromX, fromY, toX, toY, direction)  // Animates tile-to-tile movement
canMoveTo(x, y)                                  // Collision detection
updateViewport()                                  // Camera following
```

#### Animation System
- **Sprite Support**: 6x2 sprite grid (idle row, walking row)
- **Frame Animation**: 6 frames for walking, 4 frames for idle
- **Procedural Animation**: Hop effect for default character
- **Speed Settings**: Configurable movement duration (slow/normal/fast)

### 3. Rendering Pipeline

The rendering follows a strict layer order:

1. **Background Layer**: Graphic map background (if present)
2. **Tile Layer**: Map tiles or collectibles only (in graphic mode)
3. **Object Layer**: Special items, goals
4. **Character Layer**: Player sprite with animations
5. **UI Layer**: Hover highlights, debugging info

```javascript
// Render order in game-engine.js
async function render() {
    // 1. Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. Draw background
    if (gameState.backgroundImage) {
        ctx.drawImage(gameState.backgroundImage, ...);
    }
    
    // 3. Draw tiles
    await drawTiles();
    
    // 4. Draw goal
    await drawStar(goalPos);
    
    // 5. Draw character
    drawCharacter(playerPos);
    
    // 6. Draw UI overlays
    drawTileHover(hoveredTile);
}
```

### 4. Asset Management

#### SVG Tile System
- **Caching**: All tiles cached after first load
- **Fallback**: Colored rectangles if SVG fails
- **Preloading**: Batch loading on initialization

```javascript
const SVG_TILES = {
    grass: 'assets/map/tiles/grass.svg',
    water: 'assets/map/tiles/water.svg',
    // ... more tiles
};

const COLLECTIBLE_SVGS = {
    gem: 'assets/map/collectibles/gem.svg',
    coin: 'assets/map/collectibles/coin.svg',
    // ... more collectibles
};
```

### 5. Command System

#### Python Parser
Interprets Python-like commands and translates them to game actions:

```python
player.move_forward(3)  # Move 3 tiles forward
player.turn_left()      # Rotate counter-clockwise
player.turn_right()     # Rotate clockwise
```

#### Command Execution Flow
1. **Parse**: Extract command and parameters from Python code
2. **Validate**: Check if action is valid (collision detection)
3. **Animate**: Smooth visual transition
4. **Update**: Modify game state
5. **Check**: Test win conditions, collectible pickups

### 6. Game State Management

The central `gameState` object maintains:

```javascript
gameState = {
    // Position tracking
    playerPos: {x, y},
    startPos: {x, y},
    goalPos: {x, y},
    
    // Map data
    mapData: [],        // 2D tile array
    mapWidth: number,
    mapHeight: number,
    
    // Animation state
    isRunning: boolean,
    currentSpriteFrame: number,
    idleAnimation: number,
    
    // Level progress
    levelCompleted: [],
    collectibles: []
}
```

### 7. Audio System

#### Procedural Sound Generation
- **Step Sounds**: Generated using Web Audio API
- **Victory Fanfare**: Multi-note sequence on level completion
- **Frequency-based**: No external audio files required

```javascript
function playStepSound() {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    // ... envelope and playback
}
```

## Data Flow

### Level Loading
1. **Parse Markdown**: Extract map data from lesson files
2. **Initialize State**: Set start/goal positions, load map array
3. **Load Assets**: Preload required SVG tiles and sprites
4. **Render Initial State**: Draw map and place character

### Command Execution
1. **User Input**: Player writes Python code in editor
2. **Parse Commands**: Extract movement/action commands
3. **Queue Actions**: Build execution sequence
4. **Execute Sequentially**: Animate each action with delays
5. **Update Display**: Reflect new game state

## Extension Points

### Adding New Actions
To add a new player action:

1. **Define in Codebook**: Add to `assets/codebook/codebook-markdown.md`
2. **Parser Support**: Add case in `python-parser.js`
3. **Engine Implementation**: Add function in `game-engine.js`
4. **Visual Feedback**: Add animation or effect

### Adding New Tile Types
1. **Define Constant**: Add to `TILES` enum
2. **Add SVG Asset**: Place in `assets/map/tiles/`
3. **Set Collision**: Update `canMoveTo()` logic
4. **Rendering Logic**: Add special case in `drawTile()`

## Performance Optimizations

### Current Optimizations
- **SVG Caching**: Load once, reuse Image objects
- **Promise Batching**: Parallel tile loading
- **Animation Frames**: RequestAnimationFrame for smooth motion
- **Viewport Culling**: Only render visible tiles (planned)

### Potential Improvements
- **WebGL Rendering**: For larger maps
- **Tile Atlasing**: Single texture for all tiles
- **Object Pooling**: Reuse animation objects
- **Worker Threads**: Offload parsing to web worker

## Game Actions Engine (Proposed)

### Architecture Goals
The Game Actions Engine would extend the current movement-only system to support rich interactions:

1. **Action Registry**: Centralized definition of all possible actions
2. **World State**: Track interactive objects and their states
3. **Action Validation**: Check preconditions before execution
4. **Visual Feedback**: Particles, animations, sound effects
5. **Event System**: Trigger chains of actions

### Proposed Structure
```javascript
class GameActionsEngine {
    constructor() {
        this.registry = new ActionRegistry();
        this.worldState = new WorldState();
        this.executor = new ActionExecutor();
    }
    
    executeAction(actionName, params) {
        const action = this.registry.get(actionName);
        if (action.validate(this.worldState, params)) {
            return this.executor.run(action, params);
        }
    }
}
```

### Example Actions
- **push(object)**: Move objects to clear paths
- **open(door)**: Unlock new areas
- **collect(resource)**: Gather items for crafting
- **build(structure)**: Create bridges, walls
- **activate(switch)**: Trigger mechanisms
- **combine(items)**: Craft new objects

This would transform the engine from a navigation puzzle solver into a full interactive game environment where code controls complex interactions with the world.