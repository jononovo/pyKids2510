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
7. [Collectibles](#collectibles)
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
- `js/lesson-parser.js` - Parses markdown into game data
- `js/mission/mission-detector.js` - Determines level types

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

Tiles are defined in `assets/map/tiles.json`:

| ID | Name | Description | Walkable |
|----|------|-------------|----------|
| 0 | grass | Light green grass | Yes |
| 1 | grass-dark | Dark green grass (decorative) | Yes |
| 2 | path | Dirt/sand path | Yes |
| 3 | tree | Tree obstacle | No |
| 4 | bush | Bush (overlay on grass) | No |
| 5 | water | Water obstacle | No |
| 6 | rock | Rock obstacle | No |
| 7 | flower | Flower (decorative, overlay) | Yes |

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
      "overlayOnGrass": false
    }
  }
}
```

**Properties:**
- `name`: Identifier for the tile
- `path`: Relative path from `assets/map/`
- `fallbackColor`: Color when SVG fails to load
- `overlayOnGrass`: If true, grass renders underneath

---

## Collectibles

Collectibles are items players can pick up using the `collect()` command.

### Defining Collectibles

In the map section:

```
collectibles: [[14,3,"wood"],[8,7,"wood"],[10,12,"gem"]]
```

Format: `[[X, Y, "type"], ...]`

If type is omitted, defaults to "gem":
```
collectibles: [[7,2],[16,3],[11,4]]  # All become "gem" type
```

### Available Collectible Types

Located in `assets/map/collectibles/`:

| Type | File | Description |
|------|------|-------------|
| coin | collectible-coin.svg | Currency |
| gem | collectible-gem.svg | Default collectible |
| key | key.svg | Key item |
| heart | heart.svg | Health/life |
| star | star.svg | Special item |
| apple | apple.svg | Food resource |
| wood | wood.svg | Building material |

### Adding Custom Collectibles

1. Add SVG file to `assets/map/collectibles/`
2. Use the filename (without extension) as the type:

```
collectibles: [[5,3,"custom-item"]]
```

Ensure `assets/map/collectibles/custom-item.svg` exists.

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
- **Structures:** Built structures (future feature)

### How It Works

1. **Level Load:** MissionState loads saved data from localStorage
2. **Collect Action:** Items added to MissionState inventory
3. **Level Complete:** State saved and carries to next level
4. **Reset Button:** Returns to state when level was first entered

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
3. **Visible Markers:** Consider using flower tiles (7) to mark locations

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

### Validation Checklist

- [ ] Level has separator line before title
- [ ] Title follows naming convention for level type
- [ ] Map layout is valid JSON arrays
- [ ] startPos and goalPos are on walkable tiles
- [ ] Collectible positions are on walkable tiles
- [ ] Starter code includes `import player`
- [ ] Solution code actually solves the level

---

## Technical Reference

### File Locations

```
assets/
├── chapter1-master-map.md     # Main lesson file
├── map/
│   ├── tiles.json             # Tile definitions
│   ├── tiles/                 # Tile SVGs
│   ├── objects/               # Object SVGs (trees, bushes)
│   ├── collectibles/          # Collectible SVGs
│   └── special/               # Special items (star-goal)
└── sprites/                   # Character sprites

js/
├── lesson-parser.js           # Parses markdown to game data
├── mission/
│   ├── mission-detector.js    # Detects level types
│   └── mission-state.js       # Manages persistent state
└── game-commands.js           # Python command implementations
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
