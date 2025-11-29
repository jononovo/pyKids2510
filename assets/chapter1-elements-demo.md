# CHAPTER 1 ELEMENTS DEMO
## TREASURE ARCHIPELAGO

Welcome to the Treasure Archipelago! A vast collection of islands full of secrets, collectibles, and adventure. This chapter demonstrates map inheritance between missions across multiple unique islands.

--- <!-- Mission 1 -->
## MISSION 1: ISLAND EXPLORER

### AVAILABLE AFTER
Starting the game

### OBJECTIVE
> Explore Starter Island and collect 5 gold coins scattered around the beach and forest paths

You've just arrived at the Archipelago! Use `move_forward()`, `turn_left()`, and `turn_right()` to navigate the paths. Collect coins with `collect()` and return to base camp.

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
# Use move_forward() and turn commands
player.move_forward()
```

<!-- Solution -->
```
import player

# Walk north to first coin
player.move_forward(5)
player.collect()  # Coin 1 at (27,46)

# Continue north to second coin
player.move_forward(2)
player.collect()  # Coin 2 at (27,44)

# Go left to third coin
player.turn_left()
player.move_forward(2)
player.collect()  # Coin 3 at (25,44)

# Go right to fourth coin
player.turn_right()
player.turn_right()
player.move_forward(4)
player.collect()  # Coin 4 at (29,44)

# Go north to fifth coin
player.turn_left()
player.move_forward(2)
player.collect()  # Coin 5 at (29,42)

# Return to base camp (currently at 29,42 facing north)
player.turn_right()
player.turn_right()  # now facing south
player.move_forward(9)  # to (29,51)
player.turn_right()  # facing west
player.move_forward(2)  # to (27,51)
```

<!-- Map -->
```
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,1,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1,3,3,3,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,0,0,0,1,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1,3,3,7,3,3,1,0,0,0,0,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,0,0,0,1,3,3,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1,3,3,3,3,3,3,3,1,0,0,0,0,5,5,5,5,5,5,5,5],
[5,5,5,5,5,0,0,0,1,3,3,3,3,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1,3,3,7,0,0,7,3,3,3,1,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,5,0,0,0,1,3,3,7,3,3,3,1,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1,3,3,0,0,0,0,0,0,3,3,3,1,0,0,0,0,5,5,5,5,5,5],
[5,5,5,5,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1,3,3,0,0,7,0,0,7,0,0,3,3,3,1,0,0,0,5,5,5,5,5,5],
[5,5,5,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,0,0,0,1,3,3,0,0,0,0,0,0,0,0,0,0,3,3,1,0,0,0,0,5,5,5,5,5],
[5,5,5,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5],
[5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,7,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,5,5,5,5],
[5,5,0,0,0,0,0,0,0,0,0,7,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5],
[5,5,0,0,4,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,7,0,0,0,0,0,0,5,5,5,5,5],
[5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5],
[5,5,0,0,0,0,3,3,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,5,5,5,5,5,5],
[5,5,0,0,0,3,3,3,3,0,0,7,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5],
[5,5,0,0,0,0,3,3,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,7,0,0,0,7,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5],
[5,5,5,0,0,0,0,0,0,0,7,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5],
[5,5,5,5,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,0,0,4,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,6,6,0,0,0,0,0,0,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,6,6,6,6,0,0,7,0,0,0,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,6,6,0,0,0,0,0,0,0,0,5,5,5,5],
[5,5,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5],
[5,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5],
[5,0,0,0,1,1,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,5,5,5],
[5,0,0,1,3,3,1,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,6,6,0,0,0,0,0,0,0,0,0,5,5],
[5,0,0,0,1,1,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,0,0,0,0,0,0,0,5,5],
[5,0,0,0,0,0,0,0,7,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,5,5],
[5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5],
[5,0,0,0,0,3,3,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5],
[5,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,0,0,0,0,0,0,5,5,5],
[5,5,0,0,0,3,3,0,0,0,7,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5],
[5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5],
[5,5,5,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,5,5,5,5,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,0,5,5,5,5,5,5],
[5,5,5,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5],
[5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5],
[5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,7,7,3,3,1,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,7,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,7,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
startPos: 27,51
goalPos: 27,51
collectibles: [["coin", [[27,46],[27,44],[25,44],[29,44],[29,42]]], ["key", {"at": [[24,46]], "on_collect": "got_key"}]]
vehicles: [["boat", {"spawn": "got_key", "at": [[17,51]]}]]
megaObjects: [["large-mountain", [[42,8]]], ["moderate-mountain", [[3,33]]], ["highland-plateau", [[22,43]]]]
megaElements: [["house", [[5,12]]]]
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
## MISSION 2: KEY COLLECTION

### AVAILABLE AFTER
Completing Mission 1

### OBJECTIVE
> Learn Python dictionary syntax by collecting keys with `inventory["key"] += 1`

In this mission, you'll learn to track items using Python's dictionary syntax. The `inventory` is a Python dictionary that stores item counts. Instead of using `collect()`, you'll add items directly using:

```python
inventory["key"] += 1
```

Navigate to each key and use this syntax to add it to your inventory. This is how real Python programmers track quantities!

### SUCCESS CRITERIA
- Find both keys on the island
- Use `inventory["key"] += 1` to collect each one
- Return to base camp facing north

### REWARDS
- Keys: +2
- Unlocks Mission 3

<!-- Starter Code -->
```
import player

# Navigate to the keys and collect them using:
# inventory["key"] += 1
player.move_forward()
```

<!-- Solution -->
```
import player

# Navigate to the first key at (24,46)
player.move_forward(5)
player.turn_left()
player.move_forward(3)

# Add the first key using dictionary syntax
inventory["key"] += 1

# Move to the second key at (26,46)
player.turn_left()
player.turn_left()  # facing east
player.move_forward(2)

# Add the second key using dictionary syntax
inventory["key"] += 1

# Return to base camp facing north
player.move_forward(1)  # to (27,46)
player.turn_right()  # facing south
player.move_forward(5)  # to (27,51)
player.turn_left()
player.turn_left()  # facing north
```

<!-- Map -->
```
startPos: 27,51
goalPos: 27,51
collectibles: [["key", [[24,46], [26,46]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: inventory
    item: key
    min: 2
  - type: code_regex
    pattern: "inventory\\[.key.\\]\\s*\\+=\\s*1"
    message: "Use inventory[\"key\"] += 1 to add keys to your inventory"
  - type: direction
    facing: up
```
---

--- <!-- Mission 3 -->
## MISSION 3: BUILD A HOUSE

### AVAILABLE AFTER
Completing Mission 2

### OBJECTIVE
> Collect wood and build your first house!

Now you'll learn to build! Collect 4 pieces of wood scattered near the beach, then use the `build("house")` command to construct a house. Building requires resources from your inventory.

### SUCCESS CRITERIA
- Collect 4 wood pieces
- Build a house using `build("house")`
- Return to base camp

### REWARDS
- House: +1
- Chapter Complete!

<!-- Starter Code -->
```
import player

# Collect wood and build a house!
# Use collect() to gather wood
# Use build("house") to construct
player.move_forward()
```

<!-- Solution -->
```
import player

# Collect the 4 wood pieces near base camp
# Wood 1 at (27,50) - one step north
player.move_forward()
player.collect()

# Wood 2 at (27,49) - continue north
player.move_forward()
player.collect()

# Wood 3 at (28,49) - turn right and move
player.turn_right()
player.move_forward()
player.collect()

# Wood 4 at (28,50) - move south
player.turn_right()
player.move_forward()
player.collect()

# Now we have 4 wood - build a house!
# Face the empty spot and build
player.turn_right()
player.move_forward()
player.build("house")

# Return to base camp
player.turn_left()
player.turn_left()
player.move_forward(2)
```

<!-- Map -->
```
startPos: 27,51
goalPos: 27,51
collectibles: [["wood", [[27,50], [27,49], [28,49], [28,50]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  - type: position
    target: goal
  - type: inventory
    item: wood
    min: 0
```
---
