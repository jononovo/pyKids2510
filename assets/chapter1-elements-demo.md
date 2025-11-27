# CHAPTER 1 ELEMENTS DEMO
## FARM HOMESTEAD

Welcome to your Farm Homestead! This chapter demonstrates the new Element Interaction System with collectibles, doors, and interactive elements.

--- <!-- Mission 1 -->
## MISSION 1: GATHER RESOURCES

### AVAILABLE AFTER
Starting the game

### OBJECTIVE
> Collect gems and coins scattered around the farm using the new element system

Learn to collect items with `player.collect()`. Walk to each collectible and use the command to add it to your inventory!

### SUCCESS CRITERIA
- Collect all 4 gems
- Collect all 3 coins
- Return to your starting position

### REWARDS
- Gems: +4
- Coins: +3
- Unlocks Mission 2

<!-- Starter Code -->
```
import player

# Walk to collectibles and use collect()
player.move_forward(2)
player.collect()
```

<!-- Solution -->
```
import player

# Collect gem at (9, 7)
player.move_forward(2)
player.collect()

# Collect coin at (11, 7)
player.move_forward(2)
player.collect()

# Collect gem at (11, 5)
player.turn_left()
player.move_forward(2)
player.collect()

# Collect coin at (9, 5)
player.turn_left()
player.move_forward(2)
player.collect()

# Collect gem at (9, 3)
player.turn_right()
player.move_forward(2)
player.collect()

# Collect gem at (11, 3) 
player.turn_right()
player.move_forward(2)
player.collect()

# Collect coin at (13, 5)
player.move_forward(2)
player.turn_right()
player.move_forward(2)
player.collect()

# Return home
player.turn_right()
player.move_forward(6)
player.turn_right()
player.move_forward(2)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,1,0,0,0,0,2,2,2,2,2,2,2,0,0,0,1,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,3],
[3,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,9
goalPos: 7,9
collectibles: [["gem", [[9,3],[11,3],[9,5],[9,7]]], ["coin", [[11,5],[11,7],[13,5]]]]
```
---

--- <!-- Mission 2 -->
## MISSION 2: THE SECRET DOOR

### AVAILABLE AFTER
Completing Mission 1

### OBJECTIVE
> Discover the hidden treasure room by opening a mysterious door!

You've found a locked door blocking a treasure room! Use `player.interact()` to open the door, then collect the treasure inside. The door will swing open when you interact with it!

### SUCCESS CRITERIA
- Navigate to the door
- Use interact() to open the door
- Collect the hidden treasure (a key and 3 gems)
- Exit the room

### REWARDS
- Key: +1 (unlocks special areas!)
- Gems: +3
- Unlocks Mission 3

<!-- Starter Code -->
```
import player

# Find the door and open it!
# Hint: Use player.interact() when standing at the door
player.move_forward()
```

<!-- Solution -->
```
import player

# Navigate to the door at (10, 6)
player.move_forward(3)
player.turn_left()
player.move_forward(3)

# Open the door!
player.interact()

# Enter the treasure room
player.move_forward(3)

# Collect the key at (10, 3)
player.collect()

# Collect gem at (8, 3)
player.turn_left()
player.move_forward(2)
player.collect()

# Collect gem at (12, 3)
player.turn_right()
player.turn_right()
player.move_forward(4)
player.collect()

# Collect gem at (10, 2)
player.turn_left()
player.turn_left()
player.move_forward(2)
player.turn_left()
player.move_forward(1)
player.collect()

# Exit the room
player.turn_left()
player.turn_left()
player.move_forward(4)
player.turn_right()
player.move_forward(3)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,3,3,3,3,3,3,3,0,0,0,0,0,3],
[3,0,1,0,0,0,0,3,0,0,0,0,0,3,0,0,0,1,0,3],
[3,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3],
[3,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3],
[3,0,0,0,0,0,0,3,3,3,0,3,3,3,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,9
goalPos: 7,9
collectibles: [["key", [[10,3]]], ["gem", [[8,3],[12,3],[10,2]]]]
transforms: ["door", "door-open", [[10,5]]]
```
---

--- <!-- Mission 3 -->
## MISSION 3: THE MAGIC STEPPING STONES

### AVAILABLE AFTER
Completing Mission 2

### OBJECTIVE
> Cross the enchanted bridge where doors open automatically as you step on them!

The ancient bridge has magical tiles that transform as you walk on them! Each stepping stone will reveal itself when you step on it. Find your way across to reach the treasure on the other side.

### SUCCESS CRITERIA
- Cross the magical bridge
- Step on all 5 magic tiles (they auto-activate!)
- Collect the star at the end
- The doors will automatically open when you step on them

### REWARDS
- Star: +1
- Magic Bridge Complete!
- Chapter Complete

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
player.move_forward(2)  # Step on third magic tile
player.turn_right()
player.move_forward(2)  # Step on fourth magic tile
player.move_forward(2)  # Step on fifth magic tile

# Collect the star!
player.move_forward(1)
player.collect()
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,5,5,5,3],
[3,5,5,5,5,5,5,5,5,0,0,0,0,0,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,0,0,0,5,5,5,5,5,5,5,3],
[3,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,3],
[3,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1,9
goalPos: 15,3
collectibles: [["star", [[15,3]]]]
transforms: ["door", "door-open", {"trigger": "on_step", "at": [[3,9],[5,9],[9,7],[13,5],[13,3]]}]
```
---
