# Map Creation Technical Guide

## System Overview
- **Tile Size**: 32x32 pixels
- **Canvas**: 640x480px (20x15 tiles default), customizable via map dimensions
- **Rendering**: HTML5 Canvas with SVG/PNG support
- **Map Types**: Tile-based or graphic background with overlay

## Map Types

### 1. Tile-Based Maps
Traditional grid where each cell references a tile type.

**Tile Values:**
```
0 = Grass (walkable)
1 = Decoration (non-walkable) 
2 = Path (walkable)
3 = Water/Rock (non-walkable)
4 = Tree (non-walkable)
5 = Bush (non-walkable)
6 = Flower (non-walkable)
7 = Collectible (walkable, auto-collected)
```

**Example:**
```javascript
[3,3,3,3,3],
[3,0,2,0,3],
[3,2,7,2,3],
[3,0,2,0,3],
[3,3,3,3,3]
```

### 2. Graphic Background Maps
Full background image with transparent tile overlay.

**Configuration:**
```javascript
graphic: assets/map/graphic-maps/filename.svg
// Followed by tile grid where 0 = transparent
```

## Asset Structure

```
assets/
├── map/
│   ├── tiles/          # Basic tile components
│   │   ├── grass.svg
│   │   ├── path.svg
│   │   ├── water.svg
│   │   ├── rock.svg
│   │   ├── sand.svg
│   │   ├── beach-edge-[top|bottom|left|right].svg
│   │   └── beach-corner-[top|bottom]-[left|right].svg
│   ├── objects/        # Static decorative elements
│   │   ├── tree.svg
│   │   ├── bush.svg
│   │   └── flower.svg
│   ├── special/        # Special elements
│   │   └── goal.svg
│   ├── elements/       # Interactive elements (collectibles, doors, etc.)
│   │   ├── collectible-[type].svg
│   │   ├── door.svg
│   │   └── door-open.svg
│   └── graphic-maps/   # Full background images
│       └── [map-name].svg
```

## Level Definition in Markdown

### Required Structure
```markdown
--- <!-- Level N -->
## LEVEL TITLE

### OBJECTIVE
> Brief objective description

Level narrative text.

### CHALLENGE
Specific challenge description.

<!-- Starter Code -->
` ` `
import player
player.move_forward()
` ` `

<!-- Solution -->
` ` `
import player
player.move_forward()
player.turn_left()
` ` `

<!-- Map -->
` ` `
[optional: graphic: path/to/background.svg]
[tile,grid,here],
[tile,grid,here]
startPos: x, y
goalPos: x, y
[optional: collectibles: [[x1,y1], [x2,y2]]]
` ` `
---
```

## Creating Modular Tiles

### Beach/Water Transitions
Create 8 tiles minimum for smooth coastlines:
1. **Edge tiles** (4): Straight borders
2. **Outer corners** (4): Convex curves
3. **Optional inner corners** (4): Concave curves for bays

### SVG Tile Template
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- Base layer -->
  <rect width="32" height="32" fill="#baseColor"/>
  
  <!-- Texture/Pattern -->
  <circle cx="x" cy="y" r="size" fill="#color" opacity="0.4"/>
  
  <!-- Edge transitions (if applicable) -->
  <path d="..." fill="#transitionColor"/>
</svg>
```

## Map Dimensions

### Standard Sizes
- **Small**: 16x11 tiles (512x352px)
- **Medium**: 20x15 tiles (640x480px) 
- **Large**: 24x24 tiles (768x768px)

### Custom Dimensions
Specify in map array - engine auto-adjusts canvas:
```javascript
// 10x10 custom map
[[3,3,3,3,3,3,3,3,3,3],
 [3,0,0,0,0,0,0,0,0,3],
 ...8 more rows...]
```

## Quick Implementation Checklist

### Tile-Based Map
1. Define tile grid array
2. Set startPos & goalPos
3. Add collectibles array (optional)
4. Write starter/solution code

### Graphic Map
1. Create background SVG/PNG (match tile dimensions)
2. Save to `assets/map/graphic-maps/`
3. Add `graphic: path` to map config
4. Create overlay grid (0 = transparent)
5. Set positions as normal

### Modular Island/Water Map
1. Use water (3) for ocean
2. Place beach tiles at edges:
   - `beach-edge-*` for straight shores
   - `beach-corner-*` for corners
3. Use sand tiles for beach interior
4. Add grass (0) for inland areas

## Performance Notes
- SVGs are cached after first load
- Preload graphics in game initialization
- Keep background images under 2MB
- Use PNG for complex scenes, SVG for simple graphics

## Testing
1. Load level via markdown file
2. Verify collision detection (walkable vs non-walkable)
3. Test character spawn position
4. Confirm goal triggers completion
5. Check collectibles register pickup

## Common Patterns

### Path Maze
```
3,2,3,3,3
3,2,2,2,3
3,3,3,2,3
3,0,0,2,3
3,3,3,3,3
```

### Open Field with Obstacles
```
0,0,4,0,0
0,1,0,1,0
2,2,2,2,2
0,1,0,1,0
0,0,4,0,0
```

### Island Template
```
3,3,3,3,3,3,3
3,3,BE,BS,BE,3,3
3,BL,0,0,0,BR,3
3,BL,0,H,0,BR,3
3,BL,0,0,0,BR,3
3,3,BE,BN,BE,3,3
3,3,3,3,3,3,3

BE=Beach Edge, BL/BR=Beach Left/Right
BS/BN=Beach South/North, H=House
```