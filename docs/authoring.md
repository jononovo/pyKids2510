# Lesson and Mission Authoring Guide

This comprehensive guide covers everything you need to know about creating lessons, missions, and quests for the Python Learning Platform. It includes the lesson template structure, map design, collectibles, available commands, and technical implementation details.

---

## Table of Contents

1. [Overview](#overview)
2. [Level Types](#level-types)
3. [Lesson File Structure](#lesson-file-structure)
4. [Lesson Template](#lesson-template)
5. [Map System](#map-system)
6. [Map Inheritance](#map-inheritance)
7. [Tile Reference](#tile-reference)
8. [Elements System](#elements-system)
9. [Vehicles System](#vehicles-system)
10. [Mega-Elements System](#mega-elements-system)
11. [Mega-Objects System](#mega-objects-system)
12. [Signal System](#signal-system)
13. [Available Python Commands](#available-python-commands)
14. [Mission State System](#mission-state-system)
15. [Backpack and Inventory Systems](#backpack-and-inventory-systems)
16. [Tests System](#tests-system)
17. [Best Practices](#best-practices)
18. [Complete Examples](#complete-examples)
19. [Troubleshooting](#troubleshooting)
20. [Technical Reference](#technical-reference)
21. [Quick Reference: All Features](#quick-reference-all-features)

---

## Overview

Lessons are authored in Markdown files (`.md`) located in the `assets/` directory. Each chapter file can contain multiple levels (missions, quests, or exercises) that teach Python programming through an interactive tile-based game.

**Key Files:**
- `assets/chapter1-master-map.md` - Main chapter file with all levels
- `assets/map/tiles.json` - Tile definitions and graphics
- `assets/map/elements.json` - Interactive element definitions (doors, levers, etc.)
- `js/lesson-parser.js` - Parses markdown into game data
- `js/mission/mission-detector.js` - Determines level types
- `js/game-engine/element-interaction-logic.js` - Handles element interactions

---

## Level Types

The platform supports three types of levels, each with different behaviors:

### Mission Levels
- **Keyword:** Title must contain "MISSION" (e.g., `## MISSION 1: GATHER WOOD`)
- **State Persistence:** Inventory and collected items carry forward to subsequent missions
- **Use Case:** Story-driven progression where players accumulate resources

### Quest Levels
- **Keyword:** Title must contain "QUEST" (e.g., `## QUEST 1: BUILD YOUR STORAGE SHED`)
- **State Persistence:** Same as missions - inventory persists
- **Use Case:** Larger challenges that combine skills from multiple lessons

### Exercise Levels
- **Keyword:** Any title without "MISSION" or "QUEST" (e.g., `## LESSON 1: MOVING FORWARD`)
- **State Persistence:** No persistence - each exercise starts fresh
- **Use Case:** Skill practice and sandbox experimentation

**Technical Note:** The level type is detected by `MissionDetector.getLevelType(title)` which checks for keywords case-insensitively.

---

## Lesson File Structure

A chapter file has the following structure:

```markdown
# CHAPTER 1 MASTER MAP
## FARM HOMESTEAD

Welcome text and chapter introduction...

--- <!-- Mission 1 -->
## MISSION 1: GATHER WOOD
[Level content...]

--- <!-- Mission 2 -->
## MISSION 2: NAVIGATE THE MAZE
[Level content...]

--- <!-- Quest 1 -->
## QUEST 1: BUILD YOUR STORAGE SHED
[Level content...]
```

**Important Elements:**
- `# CHAPTER X` - Chapter header (parsed for chapter name)
- `## CATEGORY NAME` - Category/theme name (e.g., FARM HOMESTEAD)
- `--- <!-- Level Name -->` - Level separator (required between levels)
- `## LEVEL TITLE` - Level title (determines level type)

---

## Lesson Template

Each level follows this template structure:

```markdown
--- <!-- Mission X -->
## MISSION X: LEVEL TITLE

### AVAILABLE AFTER
Prerequisite description (e.g., Completing Lesson 1)

### OBJECTIVE
> Main goal displayed prominently with blockquote styling

Detailed description of what the student needs to accomplish. Use backticks for `code references` like `move_forward()`.

### SUCCESS CRITERIA
- First criterion
- Second criterion
- Third criterion

### REWARDS
- Resource: +amount
- Unlocks next level

<!-- Starter Code -->
```
import player

# Comments to guide the student
player.move_forward()
```

<!-- Solution -->
```
import player

# Complete solution with comments
player.move_forward(5)
player.turn_left()
player.move_forward(3)
player.collect()
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,3],
[3,0,1,0,2,2,2,0,0,3],
[3,0,0,0,2,0,0,0,0,3],
[3,0,0,0,2,0,7,0,0,3],
[3,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3]
startPos: 2,3
goalPos: 6,4
collectibles: [[6,4,"wood"]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: inventory
    item: wood
    min: 1
```
---
```

### Section Descriptions

| Section | Required | Description |
|---------|----------|-------------|
| `## TITLE` | Yes | Level title - determines level type |
| `### AVAILABLE AFTER` | No | Prerequisites for unlocking |
| `### OBJECTIVE` | Yes | Main goal (use `>` blockquote for emphasis) |
| `### SUCCESS CRITERIA` | No | List of completion requirements |
| `### REWARDS` | No | What the player earns |
| `<!-- Starter Code -->` | Yes | Initial code in editor |
| `<!-- Solution -->` | No | Reference solution |
| `<!-- Map -->` | Yes | Map layout and configuration |
| `<!-- Tests -->` | No | Custom level completion tests (see Tests System below) |

---

## Map System

The map is defined in a code block after `<!-- Map -->`. It consists of:

### Map Layout

A 2D array where each number represents a tile type:

```
[3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,3],
[3,0,1,0,2,2,2,0,0,3],
[3,0,0,0,2,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3]
```

**Coordinate System:**
- X-axis: Left to right (column index)
- Y-axis: Top to bottom (row index)
- Origin (0,0): Top-left corner

### Map Properties

```
startPos: X,Y          # Player starting position
goalPos: X,Y           # Goal/star position
collectibles: [[X,Y,"type"],[X,Y,"type"]]  # Collectible items
graphic: path/to/image.png  # Optional background image
```

### Background Graphics

You can use a custom image as a background behind the tile map. When a `graphic` is specified, tiles become transparent overlays, allowing the background image to show through.

#### Tile Size Reference

The engine uses **32×32 pixel tiles**. Calculate your background image dimensions based on your map size:

```
Image Width  = Map Width (tiles) × 32 pixels
Image Height = Map Height (tiles) × 32 pixels
```

#### Standard Map Sizes

| Size | Tiles | Pixel Dimensions |
|------|-------|------------------|
| Small | 16×11 | 512×352 pixels |
| Medium (default) | 20×15 | 640×480 pixels |
| Large | 24×24 | 768×768 pixels |
| Extra Large | 60×60 | 1920×1920 pixels |

**Note:** The default canvas is 640×480 pixels (20×15 tiles).

#### Image Format Recommendations

- **SVG** (recommended): Scales naturally without pixelation. Use `viewBox` matching your tile dimensions.
- **PNG**: Use exact pixel dimensions to avoid scaling artifacts.

#### Example Usage

For a 20×20 tile map, create a 640×640 pixel background:

```markdown
<!-- Map -->
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
... (20 rows)
startPos: 5,5
goalPos: 15,15
graphic: assets/backgrounds/forest-20x20.png
```

The `graphic` path is relative to the project root.

### Annotated Tiles

You can mark tiles as interactive by adding an asterisk (`*`):

```
[0,0,1*,0,0]  # The tile at index 2 becomes a collectible
```

This automatically adds the position to the collectibles array.

---

## Map Inheritance

Mission and Quest levels can inherit maps from previous levels, allowing you to reuse the same map across multiple missions without duplicating the layout.

### How Map Inheritance Works

1. **Mission 1** defines a full map layout (the 2D array of tiles)
2. **Mission 2** can omit the map layout but still include metadata (startPos, goalPos, collectibles)
3. When Mission 2 loads, it automatically inherits the map from Mission 1

### Technical Details

The system uses two caches:
- `lastMapCache`: Most recent map from any level
- `lastMissionMapCache`: Most recent map from a Mission/Quest level specifically

When loading a level:
1. If the level has map layout rows (`[...]`), it uses that map and updates the caches
2. If the level has NO layout rows, it checks:
   - For missions/quests: Uses `lastMissionMapCache` if available
   - Falls back to `lastMapCache` otherwise
3. Console logs `[Map Inheritance] Mission using last mission map` when inheritance occurs

### Creating a Level with Map Inheritance

**Mission 1 (defines the map):**
```markdown
<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3]
startPos: 2,2
goalPos: 7,2
collectibles: [["coin", [[5,2]]]]
```
```

**Mission 2 (inherits map, different collectibles):**
```markdown
<!-- Map -->
```
startPos: 2,2
goalPos: 7,2
collectibles: [["gem", [[3,2],[6,2]]]]
```
```

**Key Points:**
- Mission 2's `<!-- Map -->` block has NO `[...]` rows, only metadata
- The startPos and goalPos can be the same or different from the inherited map
- Collectibles are specific to each level (not inherited)
- The `hasOwnMap` flag is `false` when `layout.length === 0`

### When to Use Map Inheritance

**Good use cases:**
- Multi-part missions on the same map with different objectives
- Story progression where the player explores different areas
- Varying difficulty with same terrain but different collectibles

**Avoid when:**
- The new mission needs a completely different layout
- The map size or terrain should change
- You need different tile types or obstacles

### Chapter Reset

Map caches reset when the chapter changes. Each new chapter starts fresh without inheriting from the previous chapter.

---

## Tile Reference

Tiles are defined in `assets/map/tiles.json`, which serves as the **single source of truth** for all tile definitions. The `TILES` constant is dynamically generated from this manifest at load time via `buildTileConstants()`.

All tiles are **walkable by default** unless an `access` property is specified.

| ID | Name | Description | Access |
|----|------|-------------|--------|
| 0 | grass | Light green grass | (walkable) |
| 1 | grass-dark | Dark green grass (decorative) | (walkable) |
| 2 | path | Dirt/sand path | (walkable) |
| 3 | tree | Tree obstacle | blocked |
| 4 | bush | Bush (overlay on grass) | blocked |
| 5 | water | Light blue water | boat, ship, fish |
| 6 | rock | Rock obstacle | blocked |
| 7 | flower | Flower (decorative, overlay) | (walkable) |
| 8 | water-dark | Slightly darker water (for variety) | boat, ship, fish |

### Tile Access System

The `access` property in `tiles.json` controls who can traverse a tile:

| Access Value | Meaning | Example Use |
|-------------|---------|-------------|
| *(none)* | Walkable by all (default) | grass, path, flower |
| `"blocked"` | Never passable | tree, rock, bush, wall |
| `["boat", "ship"]` | Only these character types can pass | water, lava |
| `{"requires": ["key"]}` | Need items in inventory | locked door |
| `{"requires": {"wood": 100}}` | Need resource amounts | resource gate |

### Special Tiles

- **Star/Goal:** Rendered at `goalPos` using `assets/map/special/star-goal.svg`

### Adding Custom Tiles

1. Add SVG file to `assets/map/tiles/` or `assets/map/objects/`
2. Update `assets/map/tiles.json`:

```json
{
  "tiles": {
    "CUSTOM": { 
      "id": 9,
      "name": "custom-tile", 
      "path": "tiles/custom.svg", 
      "fallbackColor": "#hexcolor",
      "overlay": "grass",
      "access": "blocked"
    }
  }
}
```

**Properties:**
- `id`: Unique numeric ID for the tile
- `name`: Identifier for the tile (used for dynamic lookup and placement matching)
- `path`: Relative path from `assets/map/`
- `fallbackColor`: Color when SVG fails to load
- `overlay`: Base tile to render underneath ("grass" or "water")
- `access`: (optional) Access restriction - see table above

### Access Property Examples

```json
// Completely blocked tile (wall, tree, rock)
"3": { "name": "tree", "path": "objects/tree.svg", "access": "blocked" }

// Only specific character types can pass (water for boats)
"5": { "name": "water", "path": "tiles/water.svg", "access": ["boat", "ship", "fish"] }

// Requires items in inventory (locked door)
"8": { "name": "locked-door", "path": "objects/door.svg", "access": { "requires": ["key"] } }

// Requires resource amounts (resource gate)
"9": { "name": "gate", "path": "objects/gate.svg", "access": { "requires": { "wood": 100, "stone": 50 } } }
```

---

## Elements System

Elements are interactive items placed over tiles. They can be collectibles, transforms, or other interactive objects.

### Element Behavior Types

| Section | Default Trigger | Behavior |
|---------|-----------------|----------|
| `collectibles:` | `on_collect` | Disappears + adds to inventory |
| `transforms:` | `on_interact` | Disappears or swaps to replacement |

### Collectibles

Collectibles are items players pick up using the `collect()` command. All element definitions require an outer array wrapper.

**Single Type (outer wrapper required):**
```
collectibles: [["gem", [[5,3],[8,9],[12,4]]]]
```

**Multiple Types:**
```
collectibles: [["gem", [[5,3],[8,9]]], ["coin", [[2,4],[6,7]]]]
```

**With Trigger Override:**
```
collectibles: [["gem", [[1,3]]], ["gem", {"trigger": "on_step", "at": [[5,3],[8,9]]}]]
```

### Transforms

Transforms are elements that change when the player uses `interact()`. All element definitions require an outer array wrapper.

**Disappear on interact:**
```
transforms: [["door", [[6,6],[8,9]]]]
```

**Swap to replacement:**
```
transforms: [["door", "door-open", [[4,4],[7,7]]]]
```

**With on_step trigger (auto-trigger when stepped on):**
```
transforms: [["door", "door-open", {"trigger": "on_step", "at": [[7,7]]}]]
```

**Multiple transform types:**
```
transforms: [["door", "door-open", [[4,4]]], ["lever", "lever-on", [[8,8]]]]
```

### Available Collectible Types

Located in `assets/map/elements/`:

| Type | File | Description |
|------|------|-------------|
| coin | collectible-coin.svg | Currency (gold coin) |
| gem | collectible-gem.svg | Default collectible (precious gem) |
| key | key.svg | Key item |
| heart | heart.svg | Health/life |
| star | star.svg | Special item |
| apple | apple.svg | Food resource |
| wood | wood.svg | Building material |

### Available Element Types

Located in `assets/map/elements.json`:

| Type | Description |
|------|-------------|
| door | A closed door |
| door-open | An open door |
| lever | A lever (off position) |
| lever-on | A lever (on position) |
| button | A pressable button |
| crate | A wooden crate |
| sign | An informational sign |

### Adding Custom Elements

1. Add SVG file to `assets/map/objects/`
2. Update `assets/map/elements.json`:

```json
{
  "elements": {
    "custom-element": {
      "name": "custom-element",
      "path": "objects/custom-element.svg",
      "fallbackColor": "#hexcolor",
      "description": "Description of the element"
    }
  }
}
```

### Adding Custom Collectibles

1. Add SVG file to `assets/map/elements/`
2. Use the filename (without extension) as the type:

```
collectibles: ["custom-item", [[5,3]]]
```

Ensure `assets/map/elements/custom-item.svg` exists.

---

## Vehicles System

Vehicles are boardable elements that change the player's `characterType`, enabling traversal of otherwise inaccessible tiles (e.g., water).

### Key Files

| File | Purpose |
|------|---------|
| `assets/map/elements.json` | Vehicle definitions (requires `vehicleType` property) |
| `js/game-engine/vehicle-interaction-logic.js` | `VehicleInteractionManager` - boarding, disembarking, state |
| `js/map/element-renderer.js` | `drawVehicles()`, `drawCharacterVehicle()` |

### Vehicle Definition Schema

Vehicles are defined in `elements.json` with a `vehicleType` property:

```json
{
  "elements": {
    "boat": {
      "name": "boat",
      "path": "elements/boat.svg",
      "fallbackColor": "#8B5A2B",
      "width": 1,
      "height": 2,
      "vehicleType": "boat",
      "description": "A wooden sailing boat for water travel"
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Vehicle identifier |
| `path` | string | Relative path from `assets/map/` |
| `width` | number | Width in tiles (default: 1) |
| `height` | number | Height in tiles (default: 1) |
| `vehicleType` | string | **Required.** Character type when boarded (must match tile `access` arrays) |
| `fallbackColor` | string | Hex color when SVG fails |

### Map Syntax

Place vehicles using the `vehicles:` property in the map block:

```
vehicles: [["boat", [[5,3]]]]
```

**Multiple vehicles:**
```
vehicles: [["boat", [[5,3],[10,8]]], ["raft", [[2,6]]]]
```

**Format:** `[["type", [[x,y], [x2,y2], ...]]]`

### Interaction Flow

1. **Board:** Player stands adjacent to vehicle and calls `player.interact()`
   - System checks all 4 adjacent tiles for a vehicle
   - `gameState.characterType` changes to `vehicleType` (e.g., `"boat"`)
   - Player position moves to vehicle tile
   - Vehicle is hidden from render (player "becomes" the vehicle)

2. **Move:** Player can now traverse tiles where `access` includes the vehicle type
   - Example: Water tiles have `access: ["boat", "ship", "fish"]`

3. **Disembark:** Player calls `player.interact()` while boarded
   - System finds adjacent tile with `access` including `"player"`
   - Player teleports to that tile; `characterType` resets to `"player"`
   - Vehicle remains at disembark water tile

### Tile Access Integration

For vehicles to work, tile definitions in `tiles.json` must include the vehicle type in their `access` array:

```json
"WATER": { "id": 5, "path": "tiles/water.svg", "access": ["boat", "ship", "fish"] }
```

When `gameState.characterType === "boat"`, the player can traverse any tile where `access.includes("boat")`.

### Reset Behavior

- **Full Reset:** Vehicles return to original positions; player disembarks
- **Soft Reset:** Same behavior (vehicles reset before code execution)

### Example: Island-Hopping Mission

```markdown
<!-- Map -->
```
[5,5,5,5,5,5,5,5,5,5],
[5,0,0,0,5,5,5,0,0,5],
[5,0,0,0,5,5,5,0,0,5],
[5,0,0,5,5,5,5,5,0,5],
[5,5,5,5,5,5,5,5,5,5]
startPos: 1,1
goalPos: 8,2
vehicles: [["boat", [[3,2]]]]
```
```

**Solution:**
```python
import player

player.move_forward(2)
player.interact()       # Board boat
player.move_forward(4)
player.interact()       # Disembark
player.move_forward()
```

---

## Mega-Elements System

Mega-elements are multi-tile graphics (2x2, 3x3, etc.) for structures like houses, shops, and landmarks. **They are now defined in the unified `elements.json` file** alongside single-tile elements.

### Key Files

| File | Purpose |
|------|---------|
| `assets/map/elements.json` | Unified manifest defining ALL elements (both single-tile and mega-elements) |
| `assets/map/elements/buildings/*.svg` | Building SVG graphics (houses, shops, etc.) |
| `assets/map/elements/landscaping/*.svg` | Landscaping elements (decorative structures) |
| `js/game-engine/mega-element-manager.js` | Loading, parsing, collision detection |
| `js/game-engine/element-interaction-logic.js` | Provides element definitions to MegaElementManager |

### Element Categories

SVG assets are organized into category folders under `assets/map/elements/`:

| Category | Description | Examples |
|----------|-------------|----------|
| `buildings/` | Structures with blocking tiles | house, shop |
| `collectibles/` | Items players can pick up | coins, gems, keys |
| `interactive/` | Elements that change state | doors, levers, buttons |
| `vehicles/` | Boardable transport | boats, carts |
| `landscaping/` | Decorative elements | signs, fences |

### Manifest Schema (Unified)

Mega-elements are defined in `elements.json` with `width`, `height`, and `blockedTiles` properties:

```json
{
  "elements": {
    "house": {
      "name": "house",
      "path": "elements/buildings/house-3x3.svg",
      "width": 3,
      "height": 3,
      "fallbackColor": "#8B4513",
      "blockedTiles": [[0,1], [1,1], [2,1], [0,2], [1,2], [2,2]],
      "description": "A cozy cottage"
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Identifier for the mega-element |
| `path` | string | Relative path from `assets/map/` |
| `width` | number | Width in tiles |
| `height` | number | Height in tiles |
| `fallbackColor` | string | Hex color when SVG fails |
| `blockedTiles` | array\|"all" | Tile offsets `[[dx,dy],...]` that block movement |
| `description` | string | Optional description |

### Map Syntax

Place mega-elements using the `megaElements:` property in the map block:

```
megaElements: [["house", [[15,4]]], ["shop", [[1,4]]]]
```

**Format:** `[["type", [[x,y], [x2,y2], ...]]]`

- Position is the **upper-left corner** of the mega-element
- Element extends **right** and **down** from that position
- Multiple instances: `["house", [[5,2], [12,8]]]`

### Collision Detection

`blockedTiles` defines which tiles within the mega-element block player movement:

```
blockedTiles: [[0,1], [1,1], [2,1], [0,2], [1,2], [2,2]]
```

- Offsets are relative to anchor position (upper-left)
- Row 0 is often unblocked (roof overhang)
- Use `"all"` to block entire footprint

**Example 3x3 house at position (5,2):**
```
       x=5   x=6   x=7
y=2  [ roof  roof  roof ]  <- row 0, unblocked (visual only)
y=3  [ wall  door  wall ]  <- row 1, blocked
y=4  [ wall  wall  wall ]  <- row 2, blocked
```

### SVG Requirements

- **Dimensions:** `width * 32` x `height * 32` pixels (e.g., 3x3 = 96x96)
- **ViewBox:** Match pixel dimensions `viewBox="0 0 96 96"`
- **Style:** Use `shape-rendering="crispEdges"` for pixel art
- **Visual style:** 3/4 RPG view (roof from above + front wall visible)

### Rendering Order

Mega-elements render after tiles and mega-objects but before the player:
`background → tiles → mega-objects → elements → mega-elements → goal star → player`

### Available Mega-Elements

| Type | Size | Description |
|------|------|-------------|
| `house` | 3x3 | Cottage with sloped roof and front door |
| `shop` | 3x3 | Trader stand with stone counter and awning |

### Adding Custom Mega-Elements

1. Create SVG in appropriate category folder under `assets/map/elements/` (e.g., `buildings/`, `landscaping/`)
2. Add entry to `assets/map/elements.json` with `width`, `height`, and `blockedTiles` properties
3. Reference in level: `megaElements: [["my-element", [[x,y]]]]`

---

## Mega-Objects System

Mega-objects are multi-tile walkable graphics for terrain features like hills, mountains, and decorative landscapes. Unlike mega-elements, mega-objects do NOT block player movement - the character can walk over them.

### Key Files

| File | Purpose |
|------|---------|
| `assets/map/mega-objects.json` | Manifest defining all mega-objects |
| `assets/map/mega-objects/*.svg` | SVG graphics (sized to tile dimensions) |
| `js/game-engine/mega-object-manager.js` | Loading and rendering |

### Manifest Schema

```json
{
  "megaObjects": {
    "moderate-mountain": {
      "name": "moderate-mountain",
      "path": "mega-objects/moderate-mountain-6x7.svg",
      "width": 6,
      "height": 7,
      "fallbackColor": "#7a8b6e",
      "description": "A moderate-sized mountain with rocky terrain"
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Identifier for the mega-object |
| `path` | string | Relative path from `assets/map/` |
| `width` | number | Width in tiles |
| `height` | number | Height in tiles |
| `fallbackColor` | string | Hex color when SVG fails |
| `description` | string | Optional description |

**Note:** Unlike mega-elements, mega-objects have no `blockedTiles` property - they are always walkable.

### Map Syntax

Place mega-objects using the `megaObjects:` property in the map block:

```
megaObjects: [["moderate-mountain", [[5,2]]], ["hill", [[15,8]]]]
```

**Format:** `[["type", [[x,y], [x2,y2], ...]]]`

- Position is the **upper-left corner** of the mega-object
- Object extends **right** and **down** from that position
- Multiple instances: `["moderate-mountain", [[5,2], [18,10]]]`

### SVG Requirements

- **Dimensions:** `width * 32` x `height * 32` pixels (e.g., 6x7 = 192x224)
- **ViewBox:** Match pixel dimensions `viewBox="0 0 192 224"`
- **Style:** Use `shape-rendering="crispEdges"` for pixel art
- **Visual style:** Top-down/overhead RPG view

### Rendering Order

Mega-objects render after tiles but before elements, mega-elements, and the player:
`background → tiles → mega-objects → elements → mega-elements → goal star → player`

This ensures terrain features like mountains appear as background visuals that the player walks over.

### Available Mega-Objects

| Type | Size | Description |
|------|------|-------------|
| `highland-plateau` | 5x4 | Flat-topped grassy plateau with cliff edges and pine trees |
| `moderate-mountain` | 6x7 | Rocky mountain terrain with grass patches, walkable |
| `large-mountain` | 8x9 | Isometric mountain with snow-capped peaks, cliff faces, and pine trees |

### Adding Custom Mega-Objects

1. Create SVG in `assets/map/mega-objects/` (sized correctly)
2. Add entry to `assets/map/mega-objects.json`
3. Reference in level: `megaObjects: [["my-object", [[x,y]]]]`

---

## Signal System

Signals enable cross-element triggering via a pub/sub pattern. Elements emit named signals; other elements listen and react.

### Signal Properties

| Property | Context | Description |
|----------|---------|-------------|
| `on_collect` | collectibles | Emit signal when collected |
| `on_step` | collectibles, transforms | Emit signal when stepped on |
| `on_interact` | transforms | Emit signal when interacted with |
| `spawn` | collectibles, vehicles, transforms | Start hidden; appear when signal received |
| `remove` | collectibles, transforms | Disappear when signal received |
| `on` | transforms | Trigger transform when signal received |

### Syntax

Signals are added as properties in the element config object:

```
collectibles: [["key", {"at": [[4,5]], "on_collect": "got_key"}]]
vehicles: [["boat", {"spawn": "got_key", "at": [[2,7]]}]]
transforms: [["door", "door-open", {"on": "lever_pulled", "at": [[6,6]]}]]
```

### Examples

**Key unlocks boat:**
```
collectibles: [["key", {"at": [[25,46]], "on_collect": "got_key"}]]
vehicles: [["boat", {"spawn": "got_key", "at": [[17,51]]}]]
```
Player collects key → emits `got_key` → boat appears.

**Lever opens door:**
```
transforms: [["lever", "lever-on", {"at": [[3,3]], "on_interact": "lever_pulled"}]]
transforms: [["door", "door-open", {"on": "lever_pulled", "at": [[8,8]]}]]
```
Player interacts with lever → emits `lever_pulled` → door transforms to open.

**Stepping on plate removes barrier:**
```
transforms: [["plate", "plate-down", {"trigger": "on_step", "at": [[5,5]], "on_step": "plate_pressed"}]]
collectibles: [["barrier", {"remove": "plate_pressed", "at": [[10,5]]}]]
```
Player steps on plate → emits `plate_pressed` → barrier disappears.

**Chain reaction:**
```
collectibles: [["gem", {"at": [[2,2]], "on_collect": "gem_collected"}]]
collectibles: [["key", {"spawn": "gem_collected", "at": [[5,5]], "on_collect": "key_collected"}]]
vehicles: [["boat", {"spawn": "key_collected", "at": [[8,8]]}]]
```
Collect gem → key appears → collect key → boat appears.

### Technical Notes

- Signal names are arbitrary strings (use descriptive names like `got_key`, `door_opened`)
- Elements with `spawn` start hidden (`vehicleStates[id].hidden = true`)
- On reset, all signals are cleared and listeners re-registered (elements return to initial state)
- Multiple elements can listen to the same signal
- One element can emit and listen to different signals

---

## Available Python Commands

Students write Python code using these commands:

### Movement Commands

| Command | Description | Example |
|---------|-------------|---------|
| `player.move_forward()` | Move 1 tile forward | `player.move_forward()` |
| `player.move_forward(n)` | Move n tiles forward | `player.move_forward(5)` |
| `player.turn_left()` | Turn 90° left | `player.turn_left()` |
| `player.turn_left(n)` | Turn left n times | `player.turn_left(2)` |
| `player.turn_right()` | Turn 90° right | `player.turn_right()` |
| `player.turn_right(n)` | Turn right n times | `player.turn_right(2)` |

### Shorthand Aliases

| Alias | Equivalent |
|-------|------------|
| `forward()` or `forward(n)` | `move_forward(n)` |
| `left()` or `left(n)` | `turn_left(n)` |
| `right()` or `right(n)` | `turn_right(n)` |

**Note:** All commands work with or without the `player.` prefix.

### Interaction Commands

| Command | Description |
|---------|-------------|
| `player.collect()` | Collect item at current position |
| `player.interact()` | Interact with element at current position (transforms) |
| `player.push()` | Push object in facing direction |
| `player.speak("text")` | Display speech bubble |
| `player.build("structure")` | Build a structure |
| `player.place("item")` | Place an item |
| `player.open()` | Open door/container |
| `player.close()` | Close door/container |
| `player.water()` | Water a sprout (farming) |

### Farming Commands

The farming system allows players to plant, grow, and harvest crops. Crops progress through three stages with 10-second intervals between each stage.

**Growth Stages:**
1. **Dirt** - Immediately after `plant()` is called
2. **Sprout** - Appears 10 seconds after planting
3. **Grown** - Appears 10 seconds after watering the sprout with `water()`

| Command | Alternative | Description |
|---------|-------------|-------------|
| `plant("cropName")` | `player.plant("cropName")` | Plant a crop at current position (creates dirt plot) |
| `water()` | `player.water()` | Water a sprout at current position (triggers growth to full crop) |
| `harvest()` | `player.harvest()` | Harvest a fully grown crop and add it to inventory |

**Note:** Both forms work - you can use either `plant("corn")` or `player.plant("corn")`.

**Example - Full Farming Cycle:**
```python
import player
import time

# Plant corn at current position
plant("corn")

# Wait 10 seconds for sprout to appear
time.sleep(10)

# Water the sprout
water()

# Wait 10 seconds for crop to fully grow
time.sleep(10)

# Harvest the grown crop
harvest()
```

**Notes:**
- Players must be standing on the tile to plant, water, or harvest
- Growth timers run in real-time (not affected by game speed settings)
- Harvested crops are added to the player's inventory
- Farm plots are cleared after harvesting
- Resetting the level clears all farm plots

### Build Command

The `build()` command allows players to construct elements using inventory materials.

| Command | Alternative | Description |
|---------|-------------|-------------|
| `build("elementName")` | `player.build("elementName")` | Build an element in front of the player |

**Note:** Both forms work - you can use either `build("bridge")` or `player.build("bridge")`.

**Defining Buildable Elements:**

Elements become buildable by adding a `cost` property in `assets/map/elements.json`:

```json
{
  "bridge": {
    "name": "bridge",
    "path": "elements/bridge.svg",
    "cost": { "wood": 5 },
    "description": "A wooden bridge"
  },
  "fence": {
    "name": "fence",
    "path": "elements/fence.svg",
    "cost": { "wood": 2, "stone": 1 },
    "description": "A sturdy fence"
  }
}
```

**Example Usage:**
```python
import player

# Collect enough wood first
move_forward(2)
collect()  # Get wood

# Move to build location and build
move_forward(3)
build("bridge")
```

**Notes:**
- The element is built in the tile the player is facing
- Materials are deducted from inventory when built
- Built elements are tracked in `MissionState.structures` for mission persistence
- Building a bridge on water converts the tile to a walkable path

### Backpack Commands (Python Lists)

The backpack is a 4-item capacity list for teaching list methods.

| Command | Description |
|---------|-------------|
| `collect()` | Add item at current position to backpack |
| `backpack.append("item")` | Add item to backpack |
| `backpack.remove("item")` | Remove specific item from backpack |
| `len(backpack)` | Check number of items |
| `"item" in backpack` | Check if item exists |

### Inventory Commands (Python Dictionaries)

The inventory tracks item counts using dictionary syntax.

| Command | Description |
|---------|-------------|
| `inventory["item"] += 1` | Increment item count |
| `inventory["item"] -= 1` | Decrement item count (clamps to 0) |
| `count = inventory["item"]` | Read item count (returns 0 if missing) |
| `inventory["item"] = 5` | Set item count directly |

### Code Structure

All student code should start with:

```python
import player

# Student code here
player.move_forward()
```

The `import player` is required and automatically handled by the runtime.

---

## Mission State System

For mission and quest levels, state persists across levels within a chapter.

### What Persists

- **Inventory:** Collected resources (e.g., `{wood: 3, coin: 5}`)
- **Collected Items:** Positions of already-collected items
- **Element States:** Transformed elements (e.g., opened doors)
- **Structures:** Built structures (future feature)

### How It Works

1. **Level Load:** MissionState loads saved data from localStorage
2. **Collect Action:** Items added to MissionState inventory
3. **Interact Action:** Element transformations recorded in elementStates
4. **Level Complete:** State saved and carries to next level
5. **Reset Button:** Returns to state when level was first entered

### Technical Details

```javascript
// MissionState structure
{
  chapter: 1,
  inventory: { wood: 3, coin: 2 },
  collectedItems: [
    { x: 14, y: 3, type: "wood" },
    { x: 8, y: 7, type: "wood" }
  ],
  elementStates: {
    "10,5": { type: "door-open", wasType: "door" }
  },
  structures: []
}
```

### Exercise Levels

Exercise levels do NOT persist state. Each run starts fresh, making them ideal for practice.

---

## Backpack and Inventory Systems

The platform provides two data structure systems for teaching Python fundamentals: a **Backpack** (list) and an **Inventory** (dictionary). Each supports two interaction methods—simplified commands and real Python syntax—enabling progressive curriculum design.

### Backpack (Python Lists)

A 4-item capacity list for teaching `append()` and `remove()` methods.

#### Simplified Method: `collect()`
```python
player.collect()  # Adds item at current position to backpack
```
- Item auto-added if backpack has space
- Silently fails if backpack is full

#### Real Python Syntax
```python
backpack.append("apple")     # Add item
backpack.remove("apple")     # Remove specific item
len(backpack)                # Check count
"apple" in backpack          # Check membership
```

#### Persistence
- Mission/Quest levels: Persists across levels via `MissionState.backpack`
- Exercise levels: Resets each run

#### UI Display
Green-bordered panel showing backpack contents (max 4 items).

---

### Inventory (Python Dictionaries)

A key-value store for teaching dictionary operations with numeric counts.

#### Simplified Method: `collect()`
```python
player.collect()  # Increments inventory[itemType] by 1
```
- Automatically initializes missing keys to 0
- Item type determined by collectible at player position

#### Real Python Dictionary Syntax
```python
inventory["coin"] += 1       # Increment count
inventory["coin"] -= 2       # Decrement (clamps to 0)
count = inventory["gem"]     # Read value (returns 0 if missing)
inventory["key"] = 5         # Direct assignment
```

**Key behaviors:**
- Missing keys return `0` (no `KeyError`—beginner-safe)
- Values clamp to `0` minimum (negative counts impossible)
- Changes sync immediately to UI

**Position-based collection (forgiving):**
- `inventory["key"] += 1` requires the player to be standing on a matching collectible
- If no collectible is found at the player's position, the command logs a message but **continues execution** (does not stop the program)
- This "forgiving" behavior matches movement commands—the action doesn't happen, but subsequent code still runs
- Students see feedback in the console: `[inventory] Nothing to collect here! Move to an item first.`

#### Persistence
- Mission/Quest levels: Source of truth is `MissionState.inventory`
- Exercise levels: Stored in `gameState.inventory`, resets each run

#### UI Display
"Inventory:" panel showing item counts (e.g., `coin: 5`).

---

### Teaching Progression

Design curriculum to progress from simplified commands to real Python syntax:

| Stage | Backpack (Lists) | Inventory (Dicts) |
|-------|------------------|-------------------|
| **Intro** | `collect()` adds items | `collect()` increments counts |
| **Intermediate** | `backpack.append("item")` | `inventory["item"] += 1` |
| **Advanced** | `backpack.remove("item")`, loops | `inventory["item"] -= n`, conditionals |

#### Example Lesson Progression

**Level 1: Introduction**
```python
# Collect 3 coins using the collect() command
player.move_forward(3)
player.collect()
```

**Level 5: List Methods**
```python
# Manage your backpack inventory
backpack.append("torch")
backpack.append("rope")
if "torch" in backpack:
    player.move_forward()
```

**Level 10: Dictionary Operations**
```python
# Track resources precisely
inventory["coin"] += 5
if inventory["coin"] >= 10:
    inventory["coin"] -= 10
    player.build("bridge")
```

---

### Implementation Files

| File | Purpose |
|------|---------|
| `js/game-commands.js` | `gameCommand_inventory_get/set`, backpack commands |
| `js/skulpt-runtime.js` | Skulpt `InventoryClass` with `__getitem__`/`__setitem__` |
| `js/mission/mission-state.js` | Persistent storage for mission levels |
| `js/game-engine/level-loader.js` | Loads backpack/inventory from MissionState on level init |
| `js/game-engine/reset-manager.js` | Handles reset behavior for both systems |

---

## Tests System

The tests system allows you to define custom completion criteria for levels beyond just reaching the goal position. If no tests are defined, the level defaults to the standard goal position check.

### Basic Syntax

Tests are defined in a YAML code block after `<!-- Tests -->`:

```markdown
<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: inventory
    item: wood
    min: 3
```
```

### Configuration Options

| Property | Description |
|----------|-------------|
| `pass_all: true` | All tests must pass (default). Set to `false` if any test passing is sufficient. |
| `tests:` | Array of test definitions |

### Available Test Types

#### Position Test
Check if the player is at a specific location.

```yaml
- type: position
  target: goal          # Check if at goalPos (default)
```

```yaml
- type: position
  target: [5, 3]        # Check specific coordinates
```

```yaml
- type: position
  x: 5
  y: 3                  # Alternative syntax
```

#### Inventory Test
Check if the player has collected specific items.

```yaml
- type: inventory
  item: wood
  min: 5                # At least 5 wood
```

```yaml
- type: inventory
  item: coin
  exact: 10             # Exactly 10 coins
```

```yaml
- type: inventory
  item: gem
  max: 3                # At most 3 gems
```

#### Collectibles Test
Check the state of collectible items on the map.

```yaml
- type: collectibles
  all: true             # All collectibles must be collected
```

```yaml
- type: collectibles
  count: 3              # At least 3 items collected
```

```yaml
- type: collectibles
  types: ["wood", "gem"]  # These specific types must be collected
```

#### Code Regex Test
Check if the student's code matches a pattern.

```yaml
- type: code_regex
  pattern: "for .* in range"
  message: "Use a for loop to repeat commands"
```

```yaml
- type: code_regex
  pattern: "move_forward\\(\\d+\\)"
  flags: "i"            # Case insensitive
  success_message: "Great use of move_forward with an argument!"
```

#### Direction Test
Check which direction the player is facing.

```yaml
- type: direction
  facing: up            # up, down, left, right
```

#### Element State Test
Check if an interactive element has been transformed.

```yaml
- type: element_state
  x: 4
  y: 4
  state: door-open      # Check if door at (4,4) is open
```

### Fallback Behavior

**If no `<!-- Tests -->` section is defined**, the level uses the default behavior: the player wins by reaching the `goalPos` position. This maintains backward compatibility with existing lessons.

### Complete Example

```markdown
--- <!-- Mission 3 -->
## MISSION 3: THE COLLECTOR

### OBJECTIVE
> Collect all 3 gems and return home

### SUCCESS CRITERIA
- Collect all gems
- Return to the starting position
- Use a for loop

<!-- Starter Code -->
```
import player

# Collect all gems efficiently
```

<!-- Solution -->
```
import player

for i in range(3):
    player.move_forward(2)
    player.collect()
    player.turn_right()
    player.move_forward(2)
    player.turn_left()
```

<!-- Map -->
```
[3,3,3,3,3,3,3],
[3,0,0,0,0,0,3],
[3,0,0,0,0,0,3],
[3,0,0,0,0,0,3],
[3,3,3,3,3,3,3]
startPos: 1,2
goalPos: 1,2
collectibles: [["gem", [[3,1],[3,2],[3,3]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: collectibles
    all: true
  - type: code_regex
    pattern: "for .* in range"
    message: "Try using a for loop to repeat your commands"
```
---
```

---

## Best Practices

### Lesson Design

1. **Progressive Difficulty:** Start simple, add complexity gradually
2. **Clear Objectives:** One main goal per level
3. **Scaffolded Code:** Starter code should guide without giving away solution
4. **Meaningful Rewards:** Connect rewards to story progression

### Map Design

1. **Appropriate Size:** 10x10 to 20x20 tiles is ideal
2. **Clear Paths:** Make walkable areas obvious
3. **Strategic Obstacles:** Use trees/water to create puzzles
4. **Visual Variety:** Mix tile types for interest
5. **Border the Map:** Surround with trees (3) to prevent walking off

### Code Examples

1. **Starter Code:** Include partial solution to reduce frustration
2. **Comments:** Guide students with helpful comments
3. **Solution Code:** Provide optimal/reference solution

### Collectibles

1. **Logical Placement:** Items should be reachable
2. **Type Consistency:** Use appropriate types for the story
3. **Clean Backgrounds:** Place collectibles on grass (0) or path (2) tiles - avoid layering with decorative tiles like flowers (7) as this causes visual overlap

### Water Tiles

1. **Variety:** Mix water (5) and water-dark (8) for natural-looking oceans
2. **Distribution:** Use ~85-95% light water with sparse dark patches
3. **Island Maps:** Water tiles can replace trees for island-themed levels

---

## Complete Examples

### Example 1: Basic Mission

```markdown
--- <!-- Mission 1 -->
## MISSION 1: FIRST STEPS

### AVAILABLE AFTER
Starting the game

### OBJECTIVE
> Learn to move your character forward

Use the `move_forward()` command to walk to the flower and collect it.

### SUCCESS CRITERIA
- Reach the flower position
- Collect the item

### REWARDS
- Flower: +1
- Unlocks Mission 2

<!-- Starter Code -->
```
import player

# Move forward to reach the flower
player.move_forward()
```

<!-- Solution -->
```
import player

# Move 3 tiles to reach the flower
player.move_forward(3)
player.collect()
```

<!-- Map -->
```
[3,3,3,3,3,3,3],
[3,0,0,0,0,0,3],
[3,0,0,0,7,0,3],
[3,0,0,0,0,0,3],
[3,3,3,3,3,3,3]
startPos: 1,2
goalPos: 4,2
collectibles: [[4,2,"flower"]]
```
---
```

### Example 2: Exercise Level (No Persistence)

```markdown
--- <!-- Exercise -->
## LESSON 2: TURNING PRACTICE

### OBJECTIVE
> Practice turning left and right

Experiment with turning commands. This is a sandbox - try different combinations!

### SUCCESS CRITERIA
- Reach the star

<!-- Starter Code -->
```
import player

# Try turning and moving
player.turn_left()
player.move_forward()
```

<!-- Solution -->
```
import player

player.turn_left()
player.move_forward(2)
player.turn_right()
player.move_forward(3)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,3],
[3,0,2,2,2,0,0,3],
[3,0,2,0,2,0,0,3],
[3,0,2,2,2,0,0,3],
[3,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3]
startPos: 3,3
goalPos: 5,1
```
---
```

### Example 3: Quest with Multiple Objectives

```markdown
--- <!-- Quest 1 -->
## QUEST 1: THE GREAT HARVEST

### AVAILABLE AFTER
Completing all Chapter 1 Missions

### OBJECTIVE
> Collect all crops and deliver them to the barn

This is your final challenge! Plan an efficient route to collect all 5 crops and reach the barn.

### REQUIREMENTS
- Collect 5 apples
- Reach the barn (star position)

### SUCCESS CRITERIA
- All apples collected
- Reached the barn
- Code is efficient (bonus)

### REWARDS
- Chapter 1 Complete!
- Unlocks Chapter 2

<!-- Starter Code -->
```
import player

# Plan your route!
# Apples are scattered around the farm

```

<!-- Solution -->
```
import player

# Efficient harvest route
player.move_forward(2)
player.collect()
player.turn_right()
player.move_forward(4)
player.collect()
player.turn_left()
player.move_forward(3)
player.collect()
# Continue to remaining apples...
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,7,0,0,0,0,7,0,0,3],
[3,0,0,0,0,2,2,0,0,0,0,3],
[3,7,0,0,0,2,2,0,0,7,0,3],
[3,0,0,0,0,2,2,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,3],
[3,0,7,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1,4
goalPos: 5,2
collectibles: [[3,1,"apple"],[8,1,"apple"],[1,3,"apple"],[9,3,"apple"],[2,6,"apple"]]
```
---
```

### Example 4: Mission with Interactive Elements

```markdown
--- <!-- Mission 2 -->
## MISSION 2: THE SECRET DOOR

### AVAILABLE AFTER
Completing Mission 1

### OBJECTIVE
> Discover the hidden treasure room by opening a mysterious door!

You've found a locked door blocking a treasure room! Use `player.interact()` to open the door, then collect the treasure inside.

### SUCCESS CRITERIA
- Navigate to the door
- Use interact() to open the door
- Collect the hidden treasure

### REWARDS
- Key: +1
- Gems: +3

<!-- Starter Code -->
```
import player

# Find the door and open it!
# Hint: Use player.interact() when at the door
player.move_forward()
```

<!-- Solution -->
```
import player

# Navigate to the door
player.move_forward(3)
player.turn_left()
player.move_forward(3)

# Open the door!
player.interact()

# Enter and collect treasure
player.move_forward(2)
player.collect()
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,3,0,0,0,0,0,0,3],
[3,0,1,0,0,0,0,3,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,3,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,3,3,3,0,3,3,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,8
goalPos: 10,2
collectibles: ["key", [[10,2]]]
transforms: ["door", "door-open", [[10,4]]]
```
---
```

### Example 5: Magic Stepping Stones (on_step trigger)

```markdown
--- <!-- Mission 3 -->
## MISSION 3: THE MAGIC BRIDGE

### OBJECTIVE
> Cross the enchanted bridge where doors open automatically as you step on them!

The ancient bridge has magical tiles that transform as you walk on them!

### SUCCESS CRITERIA
- Cross the magical bridge
- Collect the star at the end

<!-- Starter Code -->
```
import player

# Walk across the magic bridge!
# The doors will open automatically when you step on them
player.move_forward()
```

<!-- Solution -->
```
import player

# Cross the magical bridge - doors open as you step!
player.move_forward(2)  # Step on first magic tile
player.move_forward(2)  # Step on second magic tile
player.turn_left()
player.move_forward(2)
player.collect()
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3],
[3,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,0,0,0,5,3],
[3,5,5,5,5,0,0,0,5,3],
[3,5,5,5,5,5,5,0,5,3],
[3,0,0,0,0,0,5,0,5,3],
[3,0,0,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,3],
[3,3,3,3,3,3,3,3,3,3]
startPos: 1,5
goalPos: 5,2
collectibles: ["star", [[5,2]]]
transforms: ["door", "door-open", {"trigger": "on_step", "at": [[3,5],[5,5],[7,4],[7,3]]}]
```
---
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Level not loading | Missing separator | Add `--- <!-- Level X -->` before level |
| Map not rendering | Invalid JSON | Check for trailing commas, proper brackets |
| Collectibles not showing | Wrong coordinates | Verify X,Y match walkable tiles |
| Wrong level type | Title missing keyword | Include MISSION or QUEST in title |
| Code not running | Missing import | Ensure `import player` in starter code |
| Elements not parsing | Invalid JSON in triggers | Use double-quoted keys: `{"trigger": "on_step", "at": [[x,y]]}` |
| Transforms not working | Wrong section name | Use `transforms:` not `transform:` |
| Door not rendering | Missing element definition | Check `assets/map/elements.json` has the element type |
| Map not inheriting | Map block has layout rows | Remove `[...]` rows to trigger inheritance |
| Inherited map shows wrong collectibles | Collectibles from previous level | Each level needs its own `collectibles:` line |
| Tests not running | Missing YAML block | Wrap tests in ` ```yaml ` code block |
| Test failing unexpectedly | Wrong test configuration | Check test type syntax and property names |

### Validation Checklist

- [ ] Level has separator line before title
- [ ] Title follows naming convention for level type
- [ ] Map layout is valid JSON arrays (or empty for inheritance)
- [ ] startPos and goalPos are on walkable tiles
- [ ] Collectible positions are on walkable tiles
- [ ] Element/transform positions are on walkable tiles
- [ ] Trigger objects use double-quoted keys (valid JSON)
- [ ] Starter code includes `import player`
- [ ] Solution code actually solves the level
- [ ] Tests section uses valid YAML syntax
- [ ] Test types match available options (position, inventory, collectibles, code_regex, direction, element_state)
- [ ] For inherited maps: Previous mission defines the map layout

---

## Technical Reference

### File Locations

```
assets/
├── chapter1-master-map.md     # Main lesson file
├── chapter1-elements-demo.md  # Demo of element interaction system
├── map/
│   ├── tiles.json             # Tile definitions
│   ├── elements.json          # Interactive element definitions
│   ├── tiles/                 # Tile SVGs
│   ├── objects/               # Static object SVGs (trees, bushes, flowers)
│   ├── elements/              # All interactive element SVGs (collectibles, doors, etc.)
│   └── special/               # Special items (star-goal)
└── sprites/                   # Character sprites

js/
├── lesson-parser.js           # Parses markdown to game data
├── game-commands.js           # Python command implementations
├── main.js                    # Main app logic, map inheritance
├── game-engine/
│   └── element-interaction-logic.js  # Element interaction system
├── mission/
│   ├── mission-detector.js    # Detects level types
│   └── mission-state.js       # Manages persistent state
├── tests/
│   ├── test-runner.js         # Orchestrates test execution
│   ├── test-types.js          # Test type implementations
│   └── test-context.js        # Snapshots game state for tests
└── ui/
    └── confirm-dialog.js      # Custom modal dialogs
```

### Parser Regex Patterns

```javascript
// Level separator
/^---\s*<!--.*?-->/m

// Title extraction
/^##\s+(.+)$/m

// Starter code
/<!--\s*Starter Code\s*-->\s*\n*```([\s\S]*?)```/

// Solution code
/<!--\s*Solution\s*-->\s*\n*```([\s\S]*?)```/

// Map data
/<!--\s*Map\s*-->\s*\n*```([\s\S]*?)```/

// Tests section
/<!--\s*Tests\s*-->\s*\n*```(?:yaml|yml)?\s*([\s\S]*?)```/
```

### Test System Architecture

The test system consists of three main components:

1. **test-context.js**: Creates a snapshot of all game state for tests (player position, direction, inventory, collectibles, mission state)

2. **test-types.js**: Implements individual test types:
   - `position`: Checks player location
   - `inventory`: Checks item counts
   - `collectibles`: Checks collected items
   - `code_regex`: Pattern matches student code
   - `direction`: Checks player facing direction
   - `element_state`: Checks transformed elements

3. **test-runner.js**: Orchestrates test execution with fallback to goalPos when no tests defined

---

## Quick Reference: All Features

A comprehensive summary of every feature available for lesson authoring.

### Level Types

| Type | Title Pattern | State Persistence |
|------|---------------|-------------------|
| Mission | `## MISSION 1: NAME` | Inventory/collected items carry forward |
| Quest | `## QUEST 1: NAME` | Inventory/collected items carry forward |
| Exercise | `## LESSON 1: NAME` | Fresh each run (no persistence) |

### Template Sections

| Section | Required | Purpose |
|---------|----------|---------|
| `## TITLE` | Yes | Level title (determines type) |
| `### AVAILABLE AFTER` | No | Prerequisites |
| `### OBJECTIVE` | Yes | Main goal (use `>` blockquote) |
| `### SUCCESS CRITERIA` | No | Completion requirements |
| `### REWARDS` | No | What player earns |
| `<!-- Starter Code -->` | Yes | Initial editor code |
| `<!-- Solution -->` | No | Reference solution |
| `<!-- Map -->` | Yes | Map layout + config |
| `<!-- Tests -->` | No | Custom completion tests |

### Tile IDs

| ID | Name | Behavior |
|----|------|----------|
| 0 | grass | walkable |
| 1 | grass-dark | walkable |
| 2 | path | walkable |
| 3 | tree | blocked |
| 4 | bush | blocked |
| 5 | water | boat/ship only |
| 6 | rock | blocked |
| 7 | flower | walkable |
| 8 | water-dark | boat/ship only |

### Map Properties

| Property | Syntax | Notes |
|----------|--------|-------|
| startPos | `startPos: X,Y` | Player spawn position |
| goalPos | `goalPos: X,Y` | Star/goal location |
| graphic | `graphic: path/to/bg.png` | Optional background image |
| Map inheritance | Omit `[...]` rows | Level inherits previous mission's map |

### Collectibles Syntax

```
# Simple position list
collectibles: [["coin", [[5,3],[8,9]]]]

# Multiple types
collectibles: [["gem", [[5,3]]], ["coin", [[2,4]]]]

# With config object
collectibles: [["key", {"at": [[4,5]]}]]

# Emit signal on collect
collectibles: [["key", {"at": [[4,5]], "on_collect": "got_key"}]]

# Auto-collect on step
collectibles: [["gem", {"trigger": "on_step", "at": [[5,3]]}]]

# Spawn-gated (starts hidden, appears on signal)
collectibles: [["gem", {"spawn": "unlocked", "at": [[8,8]]}]]

# Remove-gated (disappears on signal)
collectibles: [["barrier", {"remove": "button_pressed", "at": [[10,5]]}]]
```

### Transforms Syntax

```
# Disappear on interact
transforms: [["door", [[6,6]]]]

# Replace with another element
transforms: [["door", "door-open", [[4,4]]]]

# Auto-trigger on step
transforms: [["plate", "plate-down", {"trigger": "on_step", "at": [[7,7]]}]]

# Signal-triggered transform
transforms: [["door", "door-open", {"on": "lever_pulled", "at": [[8,8]]}]]

# Emit signal on interact
transforms: [["lever", "lever-on", {"at": [[3,3]], "on_interact": "lever_pulled"}]]

# Emit signal on step
transforms: [["plate", "plate-down", {"trigger": "on_step", "at": [[5,5]], "on_step": "plate_pressed"}]]
```

### Vehicles Syntax

```
# Simple position
vehicles: [["boat", [[5,3]]]]

# Multiple positions
vehicles: [["boat", [[5,3],[10,8]]]]

# Spawn-gated (hidden until signal)
vehicles: [["boat", {"spawn": "got_key", "at": [[2,7]]}]]
```

### Mega-Elements & Mega-Objects Syntax

```
# Mega-elements (blocking multi-tile structures)
megaElements: [["house", [[15,4]]], ["shop", [[1,4]]]]

# Mega-objects (walkable multi-tile terrain)
megaObjects: [["moderate-mountain", [[5,2]]], ["highland-plateau", [[15,8]]]]
```

### Signal Properties

| Property | Context | Description |
|----------|---------|-------------|
| `on_collect` | collectibles | Emit signal when collected |
| `on_step` | collectibles, transforms | Emit signal when stepped on |
| `on_interact` | transforms | Emit signal when interacted with |
| `spawn` | collectibles, vehicles, transforms | Start hidden; appear on signal |
| `remove` | collectibles, transforms | Disappear on signal |
| `on` | transforms | Trigger transform on signal |

### Test Types

```yaml
# Position at goal
- type: position
  target: goal

# Position at coordinates
- type: position
  target: [5, 3]

# Inventory minimum
- type: inventory
  item: wood
  min: 3

# Inventory exact count
- type: inventory
  item: coin
  exact: 10

# Inventory maximum
- type: inventory
  item: gem
  max: 5

# All collectibles collected
- type: collectibles
  all: true

# Collectible count
- type: collectibles
  count: 5

# Specific collectible types
- type: collectibles
  types: ["wood", "gem"]

# Code pattern match
- type: code_regex
  pattern: "for .* in range"
  message: "Use a for loop"

# Player facing direction
- type: direction
  facing: up  # up, down, left, right

# Element transformed state
- type: element_state
  element: door
  position: [6, 6]
  state: door-open
```

### Python Commands Summary

All commands work with or without the `player.` prefix (e.g., both `move_forward()` and `player.move_forward()` are valid).

| Category | Commands |
|----------|----------|
| Movement | `move_forward(n)`, `turn_left(n)`, `turn_right(n)` |
| Aliases | `forward(n)`, `left(n)`, `right(n)` |
| Interaction | `collect()`, `interact()`, `push()`, `speak("text")` |
| Doors | `open()`, `close()` |
| Building | `build("element")` - requires `cost` in elements.json |
| Farming | `plant("crop")`, `water()`, `harvest()` |
| Backpack | `backpack.append("item")`, `backpack.remove("item")` |
| Inventory | `inventory["item"]`, `inventory["item"] += 1` |

**Farming Growth Cycle:** `plant()` → 10 sec → sprout → `water()` → 10 sec → grown → `harvest()`

### Map Inheritance Example

**Level 1 (defines map):**
```
<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,5,5,5,0,0,3],
[3,0,0,0,5,5,5,0,0,3],
[3,3,3,3,3,3,3,3,3,3]
startPos: 1,1
goalPos: 8,2
collectibles: [["coin", [[3,1]]]]
```
```

**Level 2 (inherits map, no layout rows):**
```
<!-- Map -->
```
startPos: 1,2
goalPos: 8,1
collectibles: [["gem", [[5,2]]]]
vehicles: [["boat", [[4,1]]]]
```
```

Level 2 uses Level 1's tile layout but with different positions and elements.

---

*Last Updated: November 2025*
