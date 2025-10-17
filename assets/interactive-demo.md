# INTERACTIVE ACTIONS DEMO
## CHAPTER 1
## GAME ACTIONS ENGINE

--- <!-- Level 1 of 1 in Chapter-->
## PUSH PUZZLES & INTERACTIVE OBJECTS

### OBJECTIVE
> Test the new Game Actions Engine capabilities! Push boxes, collect keys, open doors, and build bridges!

This level demonstrates all the new interactive features of the enhanced game engine. You'll need to use various actions beyond just movement to complete the challenge.

### FEATURES
- **Push objects**: Move boxes onto switches to trigger doors
- **Collect items**: Pick up keys, gems, and other collectibles
- **Open doors**: Some doors require keys, others are activated by switches
- **Build structures**: Create bridges to cross water
- **Display messages**: Use speak() to show custom messages

### AVAILABLE ACTIONS
```python
# Basic movement
player.move_forward()
player.turn_left()
player.turn_right()

# New actions!
player.push()           # Push objects in front of you
player.open()          # Open doors (may require key)
player.collect()       # Collect items (automatic when walking over)
player.build("bridge") # Build structures
player.speak("Hello!") # Display messages
```

### CHALLENGE
1. Push the box onto the switch to open the first door
2. Collect the golden key
3. Use the key to open the locked door
4. Build a bridge to cross the water
5. Reach the goal star!

<!-- Starter Code -->
```
import player

# Movement commands
player.move_forward()
player.turn_left()
player.turn_right()

# Action commands
player.push()
player.open()
player.build("bridge")
player.speak("Let's go!")
```

<!-- Solution -->
```
import player

# Move to the box
player.move_forward()
player.move_forward()
player.turn_right()
player.move_forward()
player.move_forward()

# Push box onto switch (this opens door at 7,3)
player.push()

# Go through opened door
player.turn_left()
player.move_forward()
player.move_forward()
player.move_forward()
player.turn_right()
player.move_forward()

# Collect the key (at position 1,8) 
player.turn_left()
player.turn_left()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()

# Head to the locked door
player.turn_left()
player.turn_left()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.turn_right()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()

# Open the locked door with key
player.turn_right()
player.open()
player.move_forward()

# Collect gems and reach the goal
player.move_forward()
player.move_forward()
player.turn_right()
player.move_forward()
player.move_forward()

player.speak("Victory!")
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,4,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,2,2,2,0,2,2,2,3],
[3,0,0,0,0,0,0,0,0,0,2,3],
[3,0,0,0,0,0,0,0,0,0,2,3],
[5,5,5,5,5,5,5,5,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,2,3],
[3,0,0,0,0,0,0,0,0,0,2,3],
[3,0,0,0,0,0,0,0,0,0,2,3],
[3,0,0,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1,1
goalPos: 10,10
objects: [
  {"id": "box1", "type": "box", "x": 3, "y": 3, "pushable": true},
  {"id": "switch1", "type": "switch", "x": 5, "y": 4, "activated": false},
  {"id": "door1", "type": "door", "x": 7, "y": 3, "isOpen": false, "requiresKey": false},
  {"id": "key1", "type": "key", "x": 1, "y": 8, "color": "gold", "collectable": true},
  {"id": "door2", "type": "door", "x": 10, "y": 6, "isOpen": false, "isLocked": true, "requiresKey": true, "keyId": "key1"},
  {"id": "gem1", "type": "gem", "x": 8, "y": 8, "color": "blue", "collectable": true},
  {"id": "gem2", "type": "gem", "x": 9, "y": 9, "color": "green", "collectable": true}
]
```
---