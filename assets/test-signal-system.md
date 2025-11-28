# SIGNAL SYSTEM TEST
## TEST CHAPTER

A test level to verify the signal-based cross-element triggering system.

---
## MISSION 1: AXE UNLOCKS BOAT

### OBJECTIVE
> Collect the key to make the boat appear, then use the boat to reach the goal

### SUCCESS CRITERIA
- Collect the key
- Board the boat
- Reach the goal

<!-- Starter Code -->
```
import player

# Collect the key to unlock the boat!
player.move_forward()
```

<!-- Solution -->
```
import player

# Get the key (boat will appear)
player.move_forward(2)
player.collect()

# Go back and board the boat
player.turn_left()
player.turn_left()
player.move_forward(2)
player.turn_left()
player.move_forward(2)
player.interact()

# Cross the water
player.move_forward(3)
player.interact()

# Walk to goal
player.move_forward(2)
```

<!-- Map -->
```
[5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5],
[5,5,0,0,0,0,0,0,5,5],
[5,5,0,0,0,0,0,0,5,5],
[5,5,0,0,0,0,0,0,5,5],
[5,5,5,5,5,5,0,0,5,5],
[5,5,5,5,5,5,0,0,5,5],
[5,5,0,0,0,0,0,0,5,5],
[5,5,0,0,0,0,0,0,5,5],
[5,5,5,5,5,5,5,5,5,5]
```

<!-- Config -->
```
width: 10
height: 10
playerStart: [4, 7]
playerDirection: up
goal: [6, 3]
collectibles: [["key", {"at": [[4, 5]], "on_collect": "got_key"}]]
vehicles: [["boat", {"spawn": "got_key", "at": [[2, 7]]}]]
```

<!-- Tests -->
```
pass_all: true
items:
  - type: position
    target: goal
  - type: inventory
    item: key
    min: 1
```
