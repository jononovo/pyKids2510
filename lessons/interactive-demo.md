# Interactive Actions Demo

## Introduction
This level demonstrates the new Game Actions Engine capabilities! You can now interact with objects on the map beyond just movement.

## Objectives
- Push the box onto the switch to open the door
- Collect the key to unlock the treasure room
- Build a bridge to cross the water
- Reach the goal!

## Starting Code
```python
import player

# Basic movement
player.move_forward()
player.turn_left()
player.turn_right()

# New actions!
player.push()           # Push objects
player.open()          # Open doors
player.collect()       # Collect items
player.build("bridge") # Build structures
player.speak("Hello!") # Display messages
```

## Instructions
1. **Push the Box**: Use `player.push()` when facing a box to move it
2. **Activate Switch**: Push the box onto the red switch to open the first door
3. **Collect Key**: Walk over the golden key to collect it
4. **Unlock Door**: Use `player.open()` when facing the locked door (requires key)
5. **Build Bridge**: Use `player.build("bridge")` when facing water to create a path
6. **Reach Goal**: Navigate to the star to complete the level!

## Tips
- Some doors require keys to open
- Boxes can only be pushed if there's empty space behind them
- Building requires resources (collected automatically in this demo)
- Try using `player.speak()` to display custom messages!

<!-- Map -->
```javascript
[0,0,0,3,3,3,0,0,0,0,0,0],
[0,2,2,2,0,0,0,0,4,0,0,0],
[0,2,0,2,0,0,0,0,0,0,0,0],
[0,2,2,2,2,2,2,2,2,2,2,0],
[0,0,0,0,0,6,0,0,0,0,2,0],
[0,0,0,0,0,0,0,0,0,0,2,0],
[5,5,5,5,5,5,5,5,0,0,2,0],
[0,0,0,0,0,0,0,0,0,0,2,0],
[0,7,0,0,0,0,0,0,0,0,2,0],
[0,0,0,0,0,0,0,0,0,0,2,0],
[0,0,0,0,0,0,0,0,0,0,2,0],
[0,0,0,0,0,0,0,0,0,0,0,0]

startPos: 1,1
goalPos: 10,10

objects: [
  {id: "box1", type: "box", x: 3, y: 3, pushable: true},
  {id: "switch1", type: "switch", x: 5, y: 4, activated: false},
  {id: "door1", type: "door", x: 7, y: 3, isOpen: false, requiresKey: false},
  {id: "key1", type: "key", x: 1, y: 8, collectable: true, color: "gold"},
  {id: "door2", type: "door", x: 9, y: 6, isOpen: false, isLocked: true, requiresKey: true, keyId: "key1"},
  {id: "gem1", type: "gem", x: 8, y: 8, collectable: true, color: "blue"},
  {id: "gem2", type: "gem", x: 9, y: 9, collectable: true, color: "green"}
]
```

## Solution Hints
<details>
<summary>Hint 1</summary>
Start by moving to the box and pushing it onto the switch.
</details>

<details>
<summary>Hint 2</summary>
Remember to collect the key before trying to open the locked door!
</details>

<details>
<summary>Hint 3</summary>
You'll need to build a bridge to cross the water (row 6).
</details>

<details>
<summary>Full Solution</summary>

```python
import player

# Move to the box
player.move_forward(2)
player.turn_right()
player.move_forward(2)

# Push box onto switch
player.push()
player.move_forward()

# Move through first door
player.turn_left()
player.move_forward(3)

# Collect the key
player.turn_left()
player.move_forward(5)

# Go to locked door
player.turn_right()
player.move_forward(8)
player.turn_right()
player.move_forward(2)

# Open locked door
player.turn_left()
player.open()
player.move_forward()

# Collect gems and reach goal
player.move_forward(2)
player.turn_right()
player.move_forward(3)
```
</details>