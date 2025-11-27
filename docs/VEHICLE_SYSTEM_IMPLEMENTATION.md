# Vehicle System Implementation - Technical Documentation

This document provides complete context for the vehicle/boat system feature, including design decisions, implementation details, known issues, and the full conversation for context.

---

## Table of Contents

1. [Project Goal](#project-goal)
2. [Design Decisions](#design-decisions)
3. [What Was Implemented](#what-was-implemented)
4. [Known Issues](#known-issues)
5. [Files Changed](#files-changed)
6. [Full Conversation Context](#full-conversation-context)

---

## Project Goal

Build a Python Learning Platform vehicle/boat system that enables character-vehicle interaction mechanics. Players can board vehicles using `interact()`, traverse previously blocked water tiles, and disembark to land. The system integrates with the existing tile-based game engine and uses the elements system architecture with a new `vehicles:` section type.

---

## Design Decisions

### Core Architecture Choices

1. **Vehicles are Elements**: Vehicles are implemented as elements (not separate entities) using a `vehicles:` section parallel to `collectibles:` and `transforms:` in lesson markdown files.

2. **Boat Persists on Map**: The boat remains visible on the map before and after boarding (not removed on interaction).

3. **Leverage Existing Infrastructure**: The `canMoveTo()` function already checks `gameState.characterType` against a tile's `access` array - this existing infrastructure was leveraged rather than building new movement logic.

4. **Single Source of Truth**: Vehicle-specific logic is contained in `vehicle-interaction-logic.js`, with trigger detection delegated from `element-interaction-logic.js`.

### Interaction Flow (Intended Design)

1. Player walks to land tile adjacent to the boat (which is on water)
2. Player faces the boat
3. Player uses `interact()` command
4. System detects adjacent vehicle element
5. System calls `board()` which:
   - Stores original player sprite in `gameState.originalSpriteImage`
   - Changes `gameState.characterType` to vehicle type (e.g., "boat")
   - Moves player to boat's position
   - Loads boat sprite into `gameState.characterImage`
6. Player can now traverse water tiles (because characterType is "boat")
7. Player uses `interact()` again to disembark:
   - System finds adjacent land tile
   - Moves player to land tile
   - Restores original sprite
   - Resets characterType to "player"

---

## What Was Implemented

### 1. Tile Access System (`assets/map/tiles.json`)

Added `access` property to water tiles:
```json
{
  "id": "water",
  "name": "Water",
  "blocking": true,
  "access": ["boat", "ship", "fish"]
}
```

### 2. GameState Properties (`js/main.js`)

Added new state properties:
```javascript
characterType: 'player',      // Current character type (player, boat, ship, etc.)
originalSpriteImage: null,    // Stores original sprite when boarding vehicle
activeVehicle: null           // Reference to currently boarded vehicle element
```

Reset logic was also added to restore these on level reset.

### 3. Vehicle Interaction Logic (`js/game-engine/vehicle-interaction-logic.js`)

New file with `VehicleInteractionManager`:
- `board(vehicleElement, gameState, tileManifest)`: Handles boarding logic
- `disembark(gameState, tileManifest)`: Handles disembarking logic
- `findAdjacentLandTile(x, y, tileMap, tileManifest)`: Finds valid land tiles for disembarkation
- `canBoardVehicle(vehicleElement, gameState)`: Validates boarding conditions
- `isOnVehicle(gameState)`: Checks if player is currently on a vehicle

### 4. Element Interaction Integration (`js/game-engine/element-interaction-logic.js`)

- Added default trigger for vehicles: `'vehicles': 'on_interact'`
- Added `parseVehicleSection()` method to parse `vehicles:` from level data
- Updated `loadLevelElements()` to process vehicles section
- `handleInteract()` delegates to VehicleInteractionManager when vehicle detected

### 5. Game Commands Update (`js/game-commands.js`)

Updated `interact()` to pass `tileManifest` to `handleInteract()`:
```javascript
window.ElementInteractionManager.handleInteract(gameState, tileManifest);
```

### 6. Lesson Parser (`js/lesson-parser.js`)

Added vehicles section parsing:
```javascript
} else if (line.includes('vehicles:')) {
    try {
        const vehiclesStr = line.split('vehicles:')[1].trim();
        const vehiclesArray = JSON.parse(vehiclesStr);
        level.map.vehicles = vehiclesArray;
    } catch (e) {
        console.log('Could not parse vehicles:', line);
    }
}
```

### 7. Boat Asset (`assets/map/elements/boat.svg`)

Created SVG boat graphic.

### 8. Elements Definition (`assets/map/elements.json`)

Added boat to elements manifest:
```json
{
  "id": "boat",
  "name": "Boat",
  "spritePath": "assets/map/elements/boat.svg",
  "vehicleType": "boat",
  "blocking": false
}
```

### 9. Test Level (`assets/chapter1-elements-demo.md`)

Added boat to Level 1:
```markdown
vehicles: ["boat", [[5,8]]]
```

### 10. Documentation (`docs/LESSON_AUTHORING_GUIDE.md`)

Added comprehensive vehicles section documentation.

---

## Known Issues

### Issue 1: Character Sprite Not Swapping Visually

**Symptom**: When player uses `interact()` on the boat tile, nothing happens visually - the character sprite doesn't change to the boat sprite.

**Potential Causes**:
1. **Trigger Detection**: The `handleInteract()` function may need to check for vehicles on adjacent tiles (the intended flow) rather than only the current position.
2. **Sprite Rendering**: The `drawCharacter()` function in `game-engine.js` might still be using the original sprite image reference rather than dynamically checking `gameState.characterImage` after the swap.
3. **Vehicle Element Detection**: The system might not be finding the boat as a "vehicle" element due to trigger condition mismatch.

### Issue 2: Boat Placement

**Current State**: Boat may be placed on water tile but player was able to walk onto it.

**Expected Behavior**: Water tiles should be blocked for "player" character type. Only characters with type "boat", "ship", or "fish" should be able to traverse water.

**Potential Cause**: The `canMoveTo()` function might not be checking the tile `access` property correctly.

### Areas to Investigate

1. **`canMoveTo()` in `js/game-engine.js`**: Verify it checks `tile.access` against `gameState.characterType`
2. **`drawCharacter()` in `js/game-engine.js`**: Verify it uses `gameState.characterImage` dynamically for rendering
3. **`handleInteract()` in `js/game-engine/element-interaction-logic.js`**: Verify it looks for vehicles on adjacent tiles (facing direction)

---

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `assets/map/tiles.json` | Modified | Added `access` property to water tiles |
| `js/main.js` | Modified | Added gameState properties and reset logic |
| `js/game-engine/vehicle-interaction-logic.js` | Created | New file with VehicleInteractionManager |
| `js/game-engine/element-interaction-logic.js` | Modified | Added vehicle parsing and interaction delegation |
| `js/game-commands.js` | Modified | Pass tileManifest to handleInteract() |
| `js/lesson-parser.js` | Modified | Added vehicles: section parsing |
| `assets/map/elements/boat.svg` | Created | Boat graphic asset |
| `assets/map/elements.json` | Modified | Added boat element with vehicleType |
| `index.html` | Modified | Added vehicle-interaction-logic.js script |
| `assets/chapter1-elements-demo.md` | Modified | Added boat to Level 1 |
| `docs/LESSON_AUTHORING_GUIDE.md` | Modified | Added vehicles documentation |
| `replit.md` | Modified | Added Vehicle System section |

---

## Full Conversation Context

### Initial Implementation Summary (Agent → User)

The agent completed the following tasks:
1. Implemented tile access system with water tiles restricted to boat/ship/fish
2. Created vehicle-interaction-logic.js with board/disembark validation
3. Extended element-interaction-logic.js to parse vehicles section
4. Added characterType, originalSpriteImage, and activeVehicle to gameState
5. Created boat.svg asset and updated elements.json
6. Updated lesson parser to handle vehicles: section
7. Added documentation to LESSON_AUTHORING_GUIDE.md
8. Deployed boat to test level

Architect review passed - system functionally complete.

---

### User Testing Feedback

**User:**
> OK, so I just sent the character there and use the interact command while the character was over/on the tile where the boat is.
> 0. should we move the boat onto a water square adjacent to the land?
> 1. But nothing happened. the character did not swap. at least not visually.
>
> What are your thoughts on this?
>
> Don't change anything yet

---

### Agent Analysis

**Agent Response:**

Good observations! Let me share my thoughts on both points:

**0. Boat Placement**
You're right - the boat should be on a water tile adjacent to land, not on land itself. This way:
- Player walks to the land tile next to the water
- Player faces the boat (which is floating on water)
- Player uses `interact()` to board
- Player can then traverse water tiles

Currently, if the boat is on water and the character walked onto that tile, that actually reveals a bug - the tile access restriction (water tiles requiring boat/ship/fish character types) might not be working as expected.

**1. Visual Sprite Swap Not Happening**
There are a few potential issues I'm thinking about:

1. **Trigger Detection**: The `handleInteract()` function needs to check for vehicles either:
   - On the player's current position (if somehow they got there)
   - On an adjacent tile the player is facing (the intended flow)

2. **Sprite Loading**: The `board()` function sets `gameState.characterImage` to the vehicle sprite, but the rendering code in `game-engine.js` (specifically `drawCharacter()`) might still be using the original sprite image reference rather than checking `gameState.characterImage` after the swap.

3. **Vehicle Element Detection**: The system might not be finding the boat as a "vehicle" element because the interaction logic might be looking for a different trigger condition.

**My Recommendation (when you're ready):**
The most likely culprits are:
1. The `canMoveTo()` function might not be checking the tile access property correctly
2. The `drawCharacter()` function might need to dynamically use `gameState.characterImage` for rendering
3. The vehicle detection in `handleInteract()` might need adjustment to look at adjacent tiles rather than current position

---

## Next Steps for Debugging

1. **Check `canMoveTo()` implementation**: Verify that water tile access restriction is working
2. **Check `drawCharacter()` implementation**: Ensure it dynamically uses `gameState.characterImage`
3. **Check `handleInteract()` vehicle detection**: Verify it finds vehicles on adjacent tiles
4. **Add console logging**: Add debug logs to trace the interaction flow
5. **Test adjacent tile detection**: Move boat to water tile adjacent to land and test from land

---

## Lesson Authoring Reference

### Placing Vehicles in Levels

```markdown
vehicles: ["boat", [[x,y]]]
```

Example:
```markdown
vehicles: ["boat", [[5,8]]]
```

### Element Definition Required Properties

In `elements.json`, vehicles must have:
```json
{
  "id": "boat",
  "vehicleType": "boat",
  "spritePath": "assets/map/elements/boat.svg"
}
```

### Player Commands

- `interact()` - Board a vehicle when adjacent, or disembark when on a vehicle

---

*Document created: November 27, 2025*
*Last updated: November 27, 2025*
