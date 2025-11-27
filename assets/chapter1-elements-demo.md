# CHAPTER 1 ELEMENTS DEMO
## TREASURE ISLAND

Welcome to Treasure Island! A vast island full of secrets, collectibles, and adventure. This chapter demonstrates map inheritance between missions.

--- <!-- Mission 1 -->
## MISSION 1: ISLAND EXPLORER

### AVAILABLE AFTER
Starting the game

### OBJECTIVE
> Explore the island and collect 5 gold coins scattered around the beach and forest paths

You've just arrived on Treasure Island! Use `move_forward()`, `turn_left()`, and `turn_right()` to navigate the paths. Collect coins with `collect()` and return to base camp.

### SUCCESS CRITERIA
- Collect all 5 gold coins
- Return to your starting position (base camp)
- Use the collect() command

### REWARDS
- Coins: +5
- Unlocks Mission 2

<!-- Starter Code -->
```
import player

# Explore the island and collect coins!
player.move_forward()
player.collect()
```

<!-- Solution -->
```
import player

# Coin 1 at (10, 14)
player.move_forward(4)
player.collect()

# Coin 2 at (14, 14)
player.move_forward(4)
player.collect()

# Coin 3 at (18, 10)
player.turn_right()
player.move_forward(4)
player.turn_left()
player.move_forward(4)
player.collect()

# Coin 4 at (22, 6)
player.turn_right()
player.move_forward(4)
player.turn_left()
player.move_forward(4)
player.collect()

# Coin 5 at (18, 6)
player.turn_left()
player.turn_left()
player.move_forward(4)
player.collect()

# Return to base camp
player.turn_left()
player.move_forward(12)
player.turn_left()
player.move_forward(12)
```

<!-- Map -->
```
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,5,5,0,0,3,3,0,0,0,3,3,0,0,0,3,3,0,0,3,3,0,0,3,3,0,0,0,5,5,5,5,5,5],
[5,5,5,5,0,0,3,1,1,3,0,3,1,1,3,0,3,1,1,3,0,1,1,0,0,1,1,0,0,0,0,5,5,5,5,5],
[5,5,5,5,0,0,3,1,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,5,5,5,5,5],
[5,5,5,0,0,3,3,1,1,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,5,5,5,5],
[5,5,5,0,0,0,0,0,0,0,2,0,4,0,4,0,0,4,0,4,0,0,4,0,0,2,0,0,0,0,0,0,5,5,5,5],
[5,5,0,0,0,0,0,0,0,0,2,0,0,0,0,0,7,0,0,0,7,0,0,0,0,2,0,0,0,0,0,0,0,5,5,5],
[5,5,0,0,4,0,0,4,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,4,0,0,0,0,5,5,5],
[5,5,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,5,5,5],
[5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5],
[5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5],
[5,5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,5,5],
[5,5,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,5,5],
[5,5,0,0,2,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,2,0,0,0,0,5,5],
[5,5,0,0,2,0,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,0,0,2,0,0,0,0,5,5],
[5,5,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,5,5,5],
[5,5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,5,5,5],
[5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5],
[5,5,0,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,5,5,5,5],
[5,5,5,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,5,5,5,5,5],
[5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5],
[5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5],
[5,5,5,5,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,5,5,5,5,5,5],
[5,5,5,5,5,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
startPos: 6,18
goalPos: 6,18
collectibles: [["coin", [[10,14],[14,14],[18,10],[22,6],[18,6]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: inventory
    item: coin
    min: 5
  - type: code_regex
    pattern: "collect\\(\\)"
    message: "Use collect() to pick up items"
```
---

--- <!-- Mission 2 -->
## MISSION 2: HIDDEN TREASURES

### AVAILABLE AFTER
Completing Mission 1

### OBJECTIVE
> Find the hidden gems in the forest area of the island

The forest holds precious gems! Navigate through the trees and bushes to find 4 hidden gems. End facing north to signal completion.

### SUCCESS CRITERIA
- Collect all 4 hidden gems
- Return to base camp
- Face upward (north) when done

### REWARDS
- Gems: +4
- Unlocks Mission 3

<!-- Starter Code -->
```
import player

# Find the hidden gems in the forest!
player.move_forward()
```

<!-- Solution -->
```
import player

# Gem 1 at (8, 8)
player.turn_left()
player.move_forward(10)
player.turn_right()
player.move_forward(2)
player.collect()

# Gem 2 at (13, 8)
player.move_forward(5)
player.collect()

# Gem 3 at (8, 5)
player.turn_left()
player.move_forward(3)
player.turn_left()
player.move_forward(5)
player.collect()

# Gem 4 at (13, 5)
player.turn_right()
player.turn_right()
player.move_forward(5)
player.collect()

# Return to base camp facing north
player.turn_left()
player.move_forward(13)
player.turn_right()
player.move_forward(5)
player.turn_left()
```

<!-- Map -->
```
startPos: 6,18
goalPos: 6,18
collectibles: [["gem", [[8,8],[13,8],[8,5],[13,5]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: collectibles
    all: true
  - type: direction
    facing: up
```
---

--- <!-- Mission 3 -->
## MISSION 3: TREASURE HUNT FINALE

### AVAILABLE AFTER
Completing Mission 2

### OBJECTIVE
> Collect the legendary star treasure and escape the island!

You've explored the whole island. Now find the legendary star at the northern tip of the island. Collect it and return victorious!

### SUCCESS CRITERIA
- Find and collect the star
- Return to base camp

### REWARDS
- Star: +1
- Chapter Complete!

<!-- Starter Code -->
```
import player

# Find the legendary star!
player.move_forward()
```

<!-- Solution -->
```
import player

# Navigate to star at (16, 9)
player.turn_left()
player.move_forward(9)
player.turn_right()
player.move_forward(10)
player.collect()

# Return to base
player.turn_right()
player.turn_right()
player.move_forward(10)
player.turn_left()
player.move_forward(9)
player.turn_left()
```

<!-- Map -->
```
startPos: 6,18
goalPos: 6,18
collectibles: [["star", [[16,9]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: inventory
    item: star
    min: 1
```
---
