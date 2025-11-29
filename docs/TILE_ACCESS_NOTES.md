# Tile Access & Proximity Guard - Unified Access Control

## Overview

The game engine uses two complementary systems for spatial validation:

- **TileAccess** - Determines whether an actor (player, vehicle) can occupy a tile
- **ProximityGuard** - Determines whether an actor can interact with elements from their current position

## TileAccess Module (`js/game-engine/tile-access.js`)

Central utility for all tile availability checking. Provides a single source of truth for movement validation.

### Key Method

```javascript
TileAccess.canActorMoveTo(x, y, actorType, gameState, options)
```

- `actorType`: `'player'` or vehicle type (e.g., `'boat'`)
- `options.forPlacement`: When true, also blocks on built elements (for `build()` command)

### Access Rules

Tiles define access via the `access` property in `tiles.json`:
- `"blocked"` - No actor can enter
- `"water"` - Only actors with matching `requires: "water"` can enter
- Array format `["player", "boat"]` - Explicit list of allowed actors
- Omitted - All actors allowed

### Internal Mapping

```javascript
const ACCESS_TILE_MAP = {
    "water": [5, 8]  // WATER and WATER_DARK tile IDs
};
```

Actors with `requires: "water"` (defined in `elements.json`) can traverse these tiles.

## ProximityGuard Module (`js/game-engine/proximity-guard.js`)

Validates that the player is close enough to interact with elements.

### Key Methods

- `check(type, x, y)` - Silent validation, returns boolean
- `require(type, x, y, elementType)` - Throws error if not in range
- `consume(type, x, y, elementType)` - Validates and activates element

### Proximity Types

- `'self'` - Element at player's exact position
- `'forward'` - Element in front of player
- `'adjacent'` - Any of 4 cardinal directions
- Radius-based - Numeric distance check

## Current Unification

### What's Unified

1. **Vehicle movement** now uses `TileAccess.canActorMoveTo()` instead of inline tile checks
2. **Disembark validation** calls TileAccess directly (removed `canPlayerWalkTo` wrapper)
3. **Element placement** uses TileAccess with `forPlacement: true` option
4. **Actor-based access** - Both players and vehicles use the same `requires` property lookup

### Code Removed

- `getVehicleDefinition()` in VehicleInteractionManager (used `ElementInteractionManager` directly)
- `canPlayerWalkTo()` wrapper (inlined TileAccess call)
- ~40 lines of duplicate tile-checking logic

## Potential Future Unification

### 1. Move `findAdjacentWalkableTile` to TileAccess

Currently in VehicleInteractionManager, only used for disembarking. Could become:

```javascript
TileAccess.findAdjacentTile(x, y, actorType, gameState)
```

**Consideration**: Only beneficial if other systems need filtered adjacent tile search.

### 2. Merge ProximityGuard's `getAdjacentPositions` with TileAccess

ProximityGuard has coordinate generation; TileAccess has walkability checks. Could expose:

```javascript
TileAccess.getWalkableAdjacent(x, y, actorType, gameState)
```

**Consideration**: Watch for circular dependencies - ProximityGuard already depends on VehicleInteractionManager.

### 3. Unified Blocking Layer

Currently three blocking sources checked separately:
- Tile access rules (`tiles.json`)
- Mega-elements (`MegaElementManager.isTileBlocked`)
- Built elements (only for placement)

Could consolidate into:

```javascript
TileAccess.isBlocked(x, y, options) // { checkMegaElements, checkBuiltElements }
```

### 4. Element Interaction Ranges

ProximityGuard uses hardcoded proximity types. Could be data-driven:

```json
{
    "type": "lever",
    "interaction_range": "forward"
}
```

Then ProximityGuard reads from element definitions instead of command-level configuration.

## Design Principles

1. **TileAccess** answers "can this actor be here?"
2. **ProximityGuard** answers "can the player reach this element?"
3. Keep element definitions (`elements.json`) as the source of truth for properties like `requires`
4. Avoid circular dependencies between modules
5. Inline simple wrappers - don't create functions that just call another function

## File Locations

- `js/game-engine/tile-access.js` - Tile movement validation
- `js/game-engine/proximity-guard.js` - Element interaction range checks
- `assets/map/tiles.json` - Tile definitions with access rules
- `assets/map/elements.json` - Element definitions with `requires` and interaction properties

The end.