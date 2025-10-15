# Python Adventure - Castle Garden

## CHAPTER 5
## ADVANCED GRAPHICS

--- <!-- Level 1 Start -->

## Level 1: Castle Garden Exploration

### OBJECTIVE

Navigate through the castle garden using the beautiful pre-drawn background! The paths are already drawn in the background image, so we just define where you can walk.

Your goal: Get from the castle entrance to the magical star at the end of the garden path!

**What You'll Learn:**
- How to navigate on a graphic map
- Using move_forward() and turn commands
- Following pre-drawn paths

<!-- Starter Code -->
```
# Help the character explore the castle garden!
# Use move_forward(), turn_left(), and turn_right()

move_forward()
move_forward()

```

<!-- Solution -->
```
# Navigate through the castle garden
move_forward()
move_forward()
move_forward()
turn_right()
move_forward()
move_forward()
move_forward()
move_forward()
turn_left()
move_forward()
move_forward()
```

<!-- Map -->
```
graphic: assets/map/graphic-maps/castle-garden.svg
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0],
[0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0],
[0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
startPos: 4, 12
goalPos: 14, 12
collectibles: [[7, 10], [10, 12]]
```

--- <!-- Level 1 End -->

--- <!-- Level 2 Start -->

## Level 2: Garden Maze

### OBJECTIVE

The castle garden has a more complex path system! Navigate through the maze-like garden paths to reach the goal. Watch out for the hedges blocking some paths!

**Challenge:**
- Some tiles are blocked (hedges and fountains)
- Multiple path options
- Collect all the gems along the way!

<!-- Starter Code -->
```
# Navigate the garden maze
# Be careful of blocked paths!

```

<!-- Solution -->
```
# Solution for the garden maze
move_forward()
move_forward()
turn_left()
move_forward()
move_forward()
turn_right()
move_forward()
move_forward()
move_forward()
turn_right()
move_forward()
move_forward()
turn_left()
move_forward()
move_forward()
```

<!-- Map -->
```
graphic: assets/map/graphic-maps/castle-garden.svg
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
[0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],
[0,0,0,0,2,2,2,2,2,0,0,0,2,0,0,0,2,0,0,0],
[0,0,0,0,2,0,4,0,2,2,2,2,2,0,0,0,2,0,0,0],
[0,0,0,0,2,2,2,2,2,0,0,0,2,2,2,2,2,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
startPos: 4, 10
goalPos: 16, 12
collectibles: [[8, 10], [12, 11], [16, 10]]
```

--- <!-- Level 2 End -->