# Map Creation Quick Reference

## Instant Map Templates

### Basic 16x11 Tile Map
```javascript
// Copy-paste template
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,2,2,2,2,2,2,2,2,2,2,2,2,0,3],
[3,0,2,0,0,0,0,0,0,0,0,0,0,2,0,3],
[3,0,2,0,1,0,0,0,0,0,0,1,0,2,0,3],
[3,0,2,0,0,0,0,7,0,0,0,0,0,2,0,3],
[3,0,2,0,1,0,0,0,0,0,0,1,0,2,0,3],
[3,0,2,0,0,0,0,0,0,0,0,0,0,2,0,3],
[3,0,2,2,2,2,2,2,2,2,2,2,2,2,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1, 5
goalPos: 14, 5
```

### Graphic Map Template
```javascript
graphic: assets/map/graphic-maps/your-map.svg
// 0 = transparent (shows background)
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0],
[0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0],
[0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
startPos: 3, 4
goalPos: 10, 4
```

## Tile Reference
```
0 = 🟩 Grass (walk)
1 = 🎭 Decoration (block)
2 = 🟫 Path (walk)
3 = 💧 Water/Rock (block)
4 = 🌲 Tree (block)
5 = 🌳 Bush (block)
6 = 🌸 Flower (block)
7 = ⭐ Collectible (walk+collect)
```

## SVG Tile Minimal Template
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#7fc97f"/>
</svg>
```

## Level Markdown Minimal
```markdown
--- <!-- Level -->
## TITLE
### OBJECTIVE
> Goal here
Text here.
### CHALLENGE
Do this.
<!-- Starter Code -->
` ` `
import player
player.move_forward()
` ` `
<!-- Solution -->
` ` `
import player
player.move_forward()
` ` `
<!-- Map -->
` ` `
[3,3,3],
[3,0,3],
[3,3,3]
startPos: 1,1
goalPos: 1,1
` ` `
---
```

## Asset Paths
- Tiles: `assets/map/tiles/*.svg`
- Objects: `assets/map/objects/*.svg`
- Collectibles: `assets/map/collectibles/*.svg`
- Backgrounds: `assets/map/graphic-maps/*.svg`
- Levels: `assets/python-course-chapter*.md`

## Common Errors & Fixes
| Error | Fix |
|-------|-----|
| Character spawns in wall | Check startPos coordinates |
| Can't reach goal | Verify path tiles (2) connect start to goal |
| Background not showing | Add `graphic:` line before map array |
| Collectibles not working | Use value 7, add collectibles array |
| Map too big/small | Adjust array dimensions, canvas auto-resizes |

## Speed Tips
1. Use existing tiles from `assets/map/tiles/`
2. Copy beach tiles for any water edges
3. Test with simple 5x5 maps first
4. Reuse tree/bush/flower objects
5. For complex maps, use graphic background + simple overlay