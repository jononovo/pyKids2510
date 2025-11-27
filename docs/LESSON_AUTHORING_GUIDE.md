# Lesson and Mission Authoring Guide

This comprehensive guide covers everything you need to know about creating lessons, missions, and quests for the Python Learning Platform. It includes the lesson template structure, map design, collectibles, available commands, and technical implementation details.

---

## Table of Contents

1. [Overview](#overview)
2. [Level Types](#level-types)
3. [Lesson File Structure](#lesson-file-structure)
4. [Lesson Template](#lesson-template)
5. [Map System](#map-system)
6. [Tile Reference](#tile-reference)
7. [Elements System](#elements-system)
8. [Available Python Commands](#available-python-commands)
9. [Mission State System](#mission-state-system)
10. [Best Practices](#best-practices)
11. [Complete Examples](#complete-examples)

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

### Annotated Tiles

You can mark tiles as interactive by adding an asterisk (`*`):

```
[0,0,1*,0,0]  # The tile at index 2 becomes a collectible
```

This automatically adds the position to the collectibles array.

---

## Tile Reference

Tiles are defined in `assets/map/tiles.json`. All tiles are **walkable by default** unless an `access` property is specified.

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
    "8": { 
      "name": "custom-tile", 
      "path": "tiles/custom.svg", 
      "fallbackColor": "#hexcolor",
      "overlayOnGrass": false,
      "access": "blocked"
    }
  }
}
```

**Properties:**
- `name`: Identifier for the tile (used for dynamic lookup)
- `path`: Relative path from `assets/map/`
- `fallbackColor`: Color when SVG fails to load
- `overlayOnGrass`: If true, grass renders underneath
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
| `forward()` or `forward(n)` | `player.move_forward(n)` |
| `left()` or `left(n)` | `player.turn_left(n)` |
| `right()` or `right(n)` | `player.turn_right(n)` |

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
| `player.water()` | Water plants |

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

### Validation Checklist

- [ ] Level has separator line before title
- [ ] Title follows naming convention for level type
- [ ] Map layout is valid JSON arrays
- [ ] startPos and goalPos are on walkable tiles
- [ ] Collectible positions are on walkable tiles
- [ ] Element/transform positions are on walkable tiles
- [ ] Trigger objects use double-quoted keys (valid JSON)
- [ ] Starter code includes `import player`
- [ ] Solution code actually solves the level

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
├── game-engine/
│   └── element-interaction-logic.js  # Element interaction system
└── mission/
    ├── mission-detector.js    # Detects level types
    └── mission-state.js       # Manages persistent state
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
```

---

*Last Updated: November 2025*
