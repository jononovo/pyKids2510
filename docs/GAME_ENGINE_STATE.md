# Game Engine State Management

Technical documentation for the game engine's state management system.

---

## Index

1. [Overview](#overview)
2. [gameState - Runtime State](#gamestate---runtime-state)
3. [MissionState - Persistent Chapter State](#missionstate---persistent-chapter-state)
4. [levelEntrySnapshot - Reset Reference Point](#levelentrysnapshot---reset-reference-point)
5. [Level Types](#level-types)
6. [Reset System](#reset-system)
7. [State Flow Diagrams](#state-flow-diagrams)

---

## Overview

The game engine uses three distinct state management systems:

| State Object | Purpose | Persistence | Location |
|--------------|---------|-------------|----------|
| `gameState` | Runtime state for current level | In-memory only | `js/main.js` |
| `MissionState` | Persistent progress within a chapter | localStorage | `js/mission/mission-state.js` |
| `levelEntrySnapshot` | Reset reference point | In-memory | `js/main.js` |

---

## gameState - Runtime State

`gameState` is the **runtime state object** - it holds everything needed to run the current level. Unlike `MissionState` (which persists), `gameState` is rebuilt/reset when you load a level or run code.

### Definition

Defined in `js/main.js` and exposed globally via `window.gameState`:

```javascript
let gameState = {
    // Player Position & State
    playerPos: {x: 0, y: 0},
    startPos: {x: 0, y: 0},
    goalPos: {x: 0, y: 0},
    playerDirection: 'right',
    characterType: 'player',
    
    // Execution State
    isRunning: false,
    moveQueue: [],
    
    // Map Data
    mapData: [],
    mapWidth: 0,
    mapHeight: 0,
    
    // Progress Tracking
    levelCompleted: [],
    
    // Animation State
    idleAnimation: 0,
    idlePhase: 0,
    idlePauseTime: 0,
    idlePauseDuration: 120,
    spriteImage: null,
    spriteFrameWidth: 0,
    spriteFrameHeight: 0,
    currentSpriteFrame: 0,
    spriteAnimationCounter: 0,
    
    // Visual State
    backgroundImage: null,
    hoveredTile: {x: -1, y: -1},
    
    // Items & Objects
    collectibles: [],
    objects: [],
    inventory: {},
    
    // UI State
    messageLog: []
};
```

### Property Reference

| Category | Properties | Purpose |
|----------|------------|---------|
| **Player** | `playerPos`, `startPos`, `goalPos`, `playerDirection`, `characterType` | Player location, direction, and type |
| **Execution** | `isRunning`, `moveQueue` | Whether code is running, queued movements |
| **Map** | `mapData`, `mapWidth`, `mapHeight` | 2D tile array and dimensions |
| **Progress** | `levelCompleted` | Array tracking completed levels |
| **Animation** | `idleAnimation`, `idlePhase`, `spriteImage`, etc. | Sprite animation state |
| **Visual** | `backgroundImage`, `hoveredTile` | Background graphic, mouse hover state |
| **Items** | `collectibles`, `objects`, `inventory` | Map items and player inventory |
| **UI** | `messageLog` | In-game messages |

### Relationship to MissionState

For **mission levels**, when a level loads:
```javascript
gameState.inventory = MissionState.getInventory();
gameState.backpack = MissionState.getBackpack();
```

`gameState.inventory` is a **working copy**. During gameplay, changes update both `gameState` and `MissionState` (which saves to localStorage).

For **exercise levels**, `gameState.inventory` starts empty and isn't synced.

---

## MissionState - Persistent Chapter State

`MissionState` is a module pattern singleton (defined in `js/mission/mission-state.js`) that manages persistent data across levels **within a chapter**. It uses `localStorage` for persistence.

### What Persists Across Mission/Quest Levels

For **Mission/Quest levels**, the following data carries over between levels within the same chapter:

#### 1. Inventory (`inventory`)
A dictionary of item counts.
```javascript
{ coin: 5, key: 2, gem: 1 }
```
Items collected stay with the player across levels.

#### 2. Backpack (`backpack`)
An array of up to 4 specific items (capacity limit).
```javascript
['sword', 'potion', 'map']
```
Different from inventory - these are individual "held" items with a strict capacity.

#### 3. Collected Items (`collectedItems`)
Tracks which collectibles have been picked up by their (x, y) coordinates.
```javascript
[
    { x: 5, y: 3, type: 'coin' },
    { x: 10, y: 7, type: 'gem' }
]
```
Prevents the same collectible from reappearing when revisiting a level.

#### 4. Structures (`structures`)
Player-built structures with their position and type.
```javascript
[
    { x: 4, y: 6, type: 'bridge' },
    { x: 8, y: 2, type: 'ladder' }
]
```
Things the player has constructed persist across levels.

#### 5. Element States (`elementStates`)
States of interactive elements like doors, switches, levers.
```javascript
{
    'door_5_3': 'open',
    'switch_2_8': 'activated'
}
```
If you unlock a door or flip a switch, it stays that way.

### What Does NOT Carry Over

- **Player position** - Always starts at the level's defined `startPos`
- **Code in the editor** - Each level has its own starter code
- **Message log** - Cleared each level
- **Runtime animation/visual state** - Resets

### Persistence Scope

- State persists **within a chapter** (stored in localStorage under `missionChapterState.chapter{N}`)
- Starting a **new chapter** resets everything
- Calling `MissionState.clearChapter()` wipes the saved state

### Key Methods

| Method | Purpose |
|--------|---------|
| `init(chapterNumber, savedState)` | Initialize for a chapter |
| `reset()` | Clear current state (memory only) |
| `getState()` / `loadState(state)` | Export/import full state |
| `addToInventory(type, amount)` | Add items to inventory |
| `removeFromInventory(type, amount)` | Remove items from inventory |
| `addToBackpack(item)` | Add item to backpack (max 4) |
| `removeFromBackpack(item)` | Remove item from backpack |
| `isCollected(x, y)` | Check if collectible was already collected |
| `markItemCollected(x, y, type)` | Record a collected item |
| `setElementStates(states)` | Save element states |
| `getElementStates()` | Retrieve element states |
| `clearChapter(chapterNum)` | Clear saved state from localStorage |

---

## levelEntrySnapshot - Reset Reference Point

Defined in `js/main.js`, this captures the state when a level is first entered, allowing the reset system to restore to that point.

```javascript
window.levelEntrySnapshot = {
    starterCode: '',        // Code when entering level
    missionState: null,     // MissionState snapshot for reset
    levelIndex: -1          // Which level this is for
};
```

The snapshot is captured by `LevelLoader._captureResetSnapshot()` when a level loads.

---

## Level Types

The system distinguishes between level types:

| Level Type | Inventory | Collectibles | Element States | Map Inheritance |
|------------|-----------|--------------|----------------|-----------------|
| **Mission/Quest** | Loaded from MissionState | Already-collected stay collected | Persist | Uses `lastMissionMapCache` |
| **Exercise** | Always starts empty | All fresh | All reset | Uses `lastMapCache` |

### How It Works

```javascript
_initializeInventory(gameState, levelType) {
    const isMission = levelType === 'mission' || levelType === 'quest';
    
    if (isMission && MissionState.isInitialized()) {
        gameState.inventory = MissionState.getInventory();
        gameState.backpack = MissionState.getBackpack();
    } else {
        gameState.inventory = {};
        gameState.backpack = [];
    }
}
```

### Important: MissionState Persists Through Exercise Levels

MissionState remains in memory even during exercise levels - they just don't read from it or write to it.

Example:
- **Level 1 (mission)** - Player collects 5 coins, saved to MissionState
- **Level 2 (exercise)** - Player starts with empty inventory (MissionState still exists)
- **Level 3 (mission)** - Player loads from MissionState, has 5 coins

---

## Reset System

Located in `js/game-engine/reset-manager.js`, the `ResetManager` provides two reset modes.

### Full Reset (Reset Button)

Triggered by the Reset button. Restores everything to level entry state:

1. `resetPlayerState()` - Position, direction, character type, `isRunning`
2. `resetVehicles()` - Via `VehicleInteractionManager.reset()`
3. `resetSignalListeners()` - Via `SignalManager.reset()`
4. `resetElements()` - Via `ElementInteractionManager.resetStates()`
5. `resetCollectibles()` - Set all to `collected = false`
6. `resetInventory()` - Restore from `levelEntrySnapshot.missionState`
7. `resetMissionState()` - Restore MissionState from snapshot
8. `resetEditor()` - Reset to starter code
9. `resetUI()` - Clear message log, update inventory panel

### Soft Reset (Run Code)

Triggered before running code. Minimal reset:

1. `resetPlayerPosition()` - Position and direction only
2. `resetVehicles()` - Reset vehicle states
3. `resetSignalListeners()` - Re-register listeners

Does **not** reset: collectibles, inventory, editor code, MissionState

---

## State Flow Diagrams

### Level Load Flow

```
Load Level
    │
    ├── LevelLoader.initialize()
    │       │
    │       ├── _resolveMapLayout() ──► Get map from level or cache
    │       │
    │       ├── _initializeGameState() ──► Set mapData, positions
    │       │
    │       ├── _initializeInventory() ──► Load from MissionState if mission
    │       │
    │       └── _captureResetSnapshot() ──► Save for reset
    │
    └── Ready to play
```

### Full Reset Flow

```
Reset Button Clicked
    │
    ├── ConfirmDialog.show()
    │
    └── ResetManager.fullReset()
            │
            ├── Restore player to startPos
            ├── Reset vehicles, signals, elements
            ├── Restore inventory from snapshot
            ├── Restore MissionState from snapshot
            ├── Reset editor to starter code
            └── Update UI
```

### State Relationship

```
┌─────────────────────────────────────────────────────────┐
│                     localStorage                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  missionChapterState.chapter1                    │    │
│  │  missionChapterState.chapter2                    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ saveToStorage() / load
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    MissionState                          │
│  (Persistent within chapter)                             │
│  • inventory, backpack, collectedItems                   │
│  • structures, elementStates                             │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ sync on mission levels
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     gameState                            │
│  (Runtime - current level only)                          │
│  • playerPos, mapData, collectibles                      │
│  • inventory (working copy), objects                     │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ captured on level load
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 levelEntrySnapshot                       │
│  (Reset reference point)                                 │
│  • starterCode, missionState snapshot                    │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

| Concept | Think of it as... |
|---------|-------------------|
| `gameState` | "What's happening right now" (volatile, in-memory) |
| `MissionState` | "What should be remembered" (persistent, localStorage) |
| `levelEntrySnapshot` | "Where to go back to on reset" |
| Mission Level | Progress carries forward |
| Exercise Level | Fresh start, practice mode |
