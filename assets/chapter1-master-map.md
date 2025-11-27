# CHAPTER 1 MASTER MAP
## FARM HOMESTEAD

Welcome to your Farm Homestead! This is your base where you'll apply everything you learn. Complete missions to gather resources and unlock new abilities.

--- <!-- Mission 1 -->
## MISSION 1: GATHER WOOD

### AVAILABLE AFTER
Completing Lesson 1 (move_forward)

### OBJECTIVE
> Collect 3 wood pieces from the forest to start building your farm

The forest to the east has fallen branches you can collect. Use your newly learned `move_forward()` command to walk over each wood piece (marked with flowers) to collect them.

### SUCCESS CRITERIA
- Collect all 3 wood pieces (flowers on map)
- Return to your starting position

### REWARDS
- Wood: +3
- Unlocks Mission 2

<!-- Starter Code -->
```
import player

# Navigate to collect wood pieces
player.move_forward()
```

<!-- Solution -->
```
import player

# Collect wood 2 at (8, 7) - go right 1, up 2
player.move_forward(1)
player.turn_left()
player.move_forward(2)
player.collect()

# Collect wood 1 at (14, 3) - go right 6, up 4  
player.turn_right()
player.move_forward(6)
player.turn_left()
player.move_forward(4)
player.collect()

# Collect wood 3 at (10, 12) - go left 4, down 9
player.turn_left()
player.turn_left()
player.move_forward(4)
player.turn_left()
player.move_forward(9)
player.collect()

# Return home at (7, 9) - go left 3, up 3
player.turn_right()
player.move_forward(3)
player.turn_right()
player.move_forward(3)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,1,0,0,0,0,0,3,3,3,4,4,4,0,0,0,3],
[3,0,1,0,0,0,1,0,0,0,3,3,4,0,0,0,4,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,3],
[3,1,0,0,2,2,2,2,2,2,2,0,4,0,0,0,4,0,1,3],
[3,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3],
[3,0,0,0,2,0,1,0,0,0,2,2,2,2,2,0,0,1,0,3],
[3,0,1,0,2,0,0,0,7,0,0,0,0,0,2,0,0,0,0,3],
[3,0,0,0,2,0,0,0,0,0,0,1,0,0,2,0,0,0,0,3],
[3,3,0,0,2,2,2,2,0,0,0,0,0,0,2,0,0,0,3,3],
[3,3,3,0,0,0,0,2,0,1,0,0,1,0,2,0,0,3,3,3],
[3,3,3,3,0,0,0,2,0,0,0,0,0,0,2,0,3,3,3,3],
[3,0,0,0,0,1,0,2,0,0,7,0,0,0,2,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,1,0,2,0,1,0,0,3],
[3,0,1,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,9
goalPos: 7,9
collectibles: [["wood", [[14,3],[8,7],[10,12]]]]
```
---

--- <!-- Mission 2 -->
## MISSION 2: NAVIGATE THE MAZE

### AVAILABLE AFTER
Completing Lesson 2 (turn_left and turn_right)

### OBJECTIVE
> Find the hidden stone deposit in the northern maze

Now that you can turn, explore the maze to the north and find the stone deposit (marked with a star). You'll need to turn corners to navigate successfully!

### SUCCESS CRITERIA
- Reach the stone deposit location
- Successfully navigate at least 2 turns

### REWARDS
- Stone: +5
- Unlocks Mission 3

<!-- Starter Code -->
```
import player

# Navigate the maze to find stone
player.move_forward()
player.turn_right()
```

<!-- Solution -->
```
import player

# Navigate north through maze
player.turn_left()
player.move_forward(4)
player.turn_right()
player.move_forward(2)
player.turn_right()
player.move_forward(2)
player.turn_left()
player.move_forward(3)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,1,0,0,0,0,0,3,3,3,4,4,4,0,0,0,3],
[3,0,1,0,0,0,1,0,0,0,3,3,4,0,0,0,4,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,1,0,0,2,2,2,2,2,2,2,0,4,0,0,0,4,0,1,3],
[3,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3],
[3,0,0,0,2,0,1,0,0,0,2,2,2,2,2,0,0,1,0,3],
[3,0,1,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,3],
[3,0,0,0,2,0,0,0,0,0,0,1,0,0,2,0,0,0,0,3],
[3,3,0,0,2,2,2,2,0,0,0,0,0,0,2,0,0,0,3,3],
[3,3,3,0,0,0,0,2,0,1,0,0,1,0,2,0,0,3,3,3],
[3,3,3,3,0,0,0,2,0,0,0,0,0,0,2,0,3,3,3,3],
[3,0,0,0,0,1,0,2,0,0,0,0,0,0,2,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,1,0,2,0,1,0,0,3],
[3,0,1,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,9
goalPos: 10,3
```
---

--- <!-- Mission 3 -->
## MISSION 3: EFFICIENT BERRY GATHERING

### AVAILABLE AFTER
Completing Lesson 3 (move_forward with arguments)

### OBJECTIVE
> Collect scattered berries efficiently using multi-step movement

Berries are scattered around your farm. Instead of writing `move_forward()` many times, use your new skill: `move_forward(n)` to take multiple steps at once!

### SUCCESS CRITERIA
- Collect all 6 berries
- Use `move_forward(n)` with n > 1 at least 3 times

### REWARDS
- Berries: +6
- Unlocks Chapter 1 Quest

<!-- Starter Code -->
```
import player

# Collect berries efficiently
player.move_forward(3)
```

<!-- Solution -->
```
import player

# Efficient berry collection
player.move_forward(3)
player.turn_right()
player.move_forward(2)
player.turn_left()
player.move_forward(4)
player.turn_left()
player.move_forward(5)
player.turn_right()
player.move_forward(3)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,1,0,0,0,0,0,3,3,3,4,4,4,0,0,0,3],
[3,0,1,0,0,0,1,7,0,0,3,3,4,0,0,0,4,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,3],
[3,1,0,0,2,2,2,2,2,2,2,7,4,0,0,0,4,0,1,3],
[3,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,3],
[3,0,0,0,2,0,1,0,0,0,2,2,2,2,2,0,0,1,0,3],
[3,7,1,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,3],
[3,0,0,0,2,0,0,0,0,0,0,1,0,0,2,0,0,7,0,3],
[3,3,0,0,2,2,2,2,0,0,0,0,0,0,2,0,0,0,3,3],
[3,3,3,0,0,0,0,2,0,1,0,0,1,0,2,0,0,3,3,3],
[3,3,3,3,0,0,0,2,0,0,0,0,0,0,2,0,3,3,3,3],
[3,0,0,0,0,1,0,2,0,0,0,7,0,0,2,0,0,0,0,3],
[3,0,0,0,0,0,0,2,0,0,0,0,1,0,2,0,1,0,0,3],
[3,0,1,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,9
goalPos: 7,9
collectibles: [["gem", [[7,2],[16,3],[11,4],[1,7],[17,8],[11,12]]]]
```
---

--- <!-- Quest 1 -->
## QUEST 1: BUILD YOUR STORAGE SHED

### AVAILABLE AFTER
Completing all Chapter 1 Missions

### OBJECTIVE
> Use all your movement skills to gather final resources and build your first structure

This is your first big challenge! You need to collect resources from around your farm to build a storage shed. This is open-ended - plan your route and write efficient code!

### REQUIREMENTS
- Total Wood: 10 (you should have 3 from Mission 1)
- Total Stone: 10 (you should have 5 from Mission 2)  
- Total Berries: 10 (you should have 6 from Mission 3)

### SUCCESS CRITERIA
- Collect enough resources to meet requirements
- Reach the building site (marked with star)
- Code uses move_forward, turn_left/right, and arguments efficiently

### REWARDS
- Building: Storage Shed (unlocked)
- Chapter 1 Complete Badge
- Unlocks Chapter 2

<!-- Starter Code -->
```
import player

# Plan your route to collect all resources!
# You need: 7 more wood, 5 more stone, 4 more berries

```

<!-- Solution -->
```
import player

# This is open-ended - student creates their own solution
# Example solution collecting remaining resources:

# Collect remaining wood
player.move_forward(2)
player.turn_left()
player.move_forward(4)
player.turn_right()
player.move_forward(6)

# Collect remaining stone
player.turn_right()
player.move_forward(3)
player.turn_left()
player.move_forward(2)

# Collect remaining berries
player.move_forward(4)
player.turn_right()
player.move_forward(5)

# Go to building site
player.turn_left()
player.move_forward(8)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,7,0,0,1,0,7,0,0,0,3,3,3,4,4,4,7,0,0,3],
[3,0,1,0,7,0,1,0,0,7,3,3,4,0,0,0,4,0,7,3],
[3,0,0,7,0,0,0,0,0,0,0,7,0,0,0,0,0,7,0,3],
[3,1,0,0,2,2,2,2,2,2,2,0,4,7,0,0,4,0,1,3],
[3,0,7,0,2,0,0,0,0,0,2,0,0,0,7,0,0,0,0,3],
[3,0,0,0,2,0,1,7,0,0,2,2,2,2,2,7,0,1,0,3],
[3,0,1,0,2,7,0,0,0,7,0,0,0,0,2,0,0,7,0,3],
[3,7,0,0,2,0,0,0,7,0,0,1,0,7,2,0,0,0,0,3],
[3,3,0,7,2,2,2,2,0,0,7,0,0,0,2,0,7,0,3,3],
[3,3,3,0,0,0,7,2,0,1,0,7,1,0,2,0,0,3,3,3],
[3,3,3,3,7,0,0,2,0,0,0,0,0,7,2,0,3,3,3,3],
[3,0,7,0,0,1,0,2,0,7,0,0,0,0,2,7,0,0,0,3],
[3,0,0,0,0,0,7,2,0,0,0,7,1,0,2,0,1,0,0,3],
[3,0,1,0,7,0,0,2,2,2,2,2,2,2,2,0,0,7,0,3],
[3,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,3],
[3,7,0,0,1,0,0,7,0,1,7,0,0,1,0,7,0,1,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 7,9
goalPos: 14,4
collectibles: [["gem", [[1,1],[6,1],[16,1],[4,2],[9,2],[18,2],[3,3],[11,3],[17,3],[6,4],[13,4],[2,5],[14,5],[7,6],[15,6],[5,7],[9,7],[17,7],[1,8],[8,8],[13,8],[3,9],[10,9],[16,9],[6,10],[11,10],[1,11],[7,11],[13,11],[15,12],[2,12],[9,12],[6,13],[11,13],[3,14],[17,14],[1,15],[3,15],[18,15],[1,16],[7,16],[10,16],[15,16]]]]
```
---
