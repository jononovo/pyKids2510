# CHAPTER TEMPLATE
## FEATURE SHOWCASE

<!-- ============================================================================
     LESSON TEMPLATE FILE
     
     This file demonstrates EVERY feature available for lesson authoring.
     Use it as a reference when creating new chapters.
     
     Features demonstrated:
     - All tile types (grass, path, water, trees, bushes, rocks, flowers)
     - All collectible variations (simple, config, signals, triggers)
     - All transform variations (disappear, replace, signals, triggers)
     - Vehicles with spawn gates
     - Mega-elements (blocking structures)
     - Mega-objects (walkable terrain)
     - Signal system (emit, spawn, remove, on)
     - All test types
     - Map inheritance between levels
     
     Level 1: Defines map, demonstrates all features
     Level 2: Inherits map, shows state persistence
============================================================================ -->

Welcome to the Feature Showcase! This template demonstrates every feature available to lesson authors. Each element below is documented with comments explaining its purpose.

--- <!-- Mission 1 -->
## MISSION 1: FEATURE SHOWCASE

<!-- LEVEL TYPE: Using "MISSION" in title enables state persistence.
     Other options:
     - "QUEST" - also persists state
     - "LESSON" or other - no persistence (exercise mode)
-->

### AVAILABLE AFTER
Starting the game

### OBJECTIVE
<!-- Use blockquote (>) for main goal - it displays prominently -->
> Master all game mechanics by collecting items, triggering signals, and using vehicles!

This level demonstrates every feature available. Collect the key to unlock the boat, pull the lever to open the door, and step on the pressure plate to remove the barrier.

### SUCCESS CRITERIA
- Collect all coins
- Open the door using the lever
- Board the boat
- Reach the goal

### REWARDS
- Coins: +5
- Key: +1
- Unlocks Level 2

<!-- STARTER CODE: Initial code shown in editor -->
<!-- Starter Code -->
```
import player

# Explore and interact with everything!
# Use move_forward(), turn_left(), turn_right()
# Use collect() to pick up items
# Use interact() to activate levers and board vehicles
player.move_forward()
```

<!-- SOLUTION: Reference solution (optional but recommended) -->
<!-- Solution -->
```
import player

# Collect the key (unlocks boat via signal)
player.move_forward(3)
player.turn_right()
player.move_forward(2)
player.collect()  # Key at (7,5) - emits "got_key"

# Pull the lever (opens door via signal)
player.turn_left()
player.move_forward(4)
player.turn_left()
player.move_forward(3)
player.interact()  # Lever at (4,9) - emits "lever_on"

# Go through the opened door
player.turn_right()
player.move_forward(2)  # Door at (6,9) is now open

# Collect coins
player.collect()  # Coin at (6,9)
player.move_forward()
player.collect()  # Coin at (6,10)

# Step on pressure plate (removes barrier via signal)
player.turn_left()
player.move_forward(3)  # Plate at (9,10) - emits "plate_down"

# Collect the gem that was behind the barrier
player.turn_left()
player.move_forward()
player.collect()  # Gem at (9,9)

# Board the boat (spawned when key was collected)
player.turn_right()
player.move_forward(5)
player.interact()  # Board boat at (14,10)

# Sail to goal island
player.move_forward(3)
player.interact()  # Disembark at (17,10)
player.move_forward()  # Goal at (18,10)
```

<!-- MAP SECTION: Defines tile layout and all elements -->
<!-- Map -->
```
<!-- ============================================================================
     TILE REFERENCE:
     0 = grass (walkable)
     1 = grass-dark (walkable, decorative)
     2 = path (walkable)
     3 = tree (blocked)
     4 = bush (blocked)
     5 = water (boat/ship only)
     6 = rock (blocked)
     7 = flower (walkable, decorative)
     8 = water-dark (boat/ship only, variety)
============================================================================ -->
[3,3,3,3,3,3,3,3,3,3,3,3,3,5,5,5,5,5,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,3,5,5,5,5,5,3,3],
[3,0,1,1,0,0,0,0,0,0,0,0,3,5,5,5,5,5,3,3],
[3,0,1,1,0,0,7,0,0,6,0,0,3,5,5,5,5,5,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,3,5,8,8,5,5,3,3],
[3,0,0,0,0,0,0,0,0,4,0,0,3,5,5,5,5,0,0,3],
[3,0,0,0,0,0,2,2,2,2,2,2,2,5,5,5,5,0,0,3],
[3,0,0,0,0,0,2,0,0,0,0,0,3,5,5,5,5,0,0,3],
[3,0,0,0,0,0,2,0,0,0,0,0,3,5,5,5,5,0,7,3],
[3,0,0,0,0,0,2,0,0,0,0,0,3,5,5,5,5,0,0,3],
[3,0,0,0,0,0,2,0,0,0,0,0,5,5,5,5,5,0,0,3],
[3,0,0,0,7,0,2,0,0,0,0,0,3,5,5,5,5,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,3,5,5,5,5,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,5,5,5,5,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 5,8
goalPos: 18,10

<!-- ============================================================================
     COLLECTIBLES
     
     Format options:
     1. Simple: [["type", [[x,y], [x,y]]]]
     2. Config object: [["type", {"at": [[x,y]], "property": "value"}]]
     
     Trigger options:
     - on_collect (default): Emit signal when player uses collect()
     - on_step: Auto-collect when player steps on tile
     
     Signal options:
     - on_collect: "signal_name" - Emit signal when collected
     - spawn: "signal_name" - Start hidden, appear when signal received
     - remove: "signal_name" - Disappear when signal received
============================================================================ -->
collectibles: [["coin", [[2,2],[3,2],[6,9],[6,10],[9,11]]], ["key", {"at": [[7,5]], "on_collect": "got_key"}], ["gem", {"spawn": "plate_down", "at": [[9,9]]}]]

<!-- ============================================================================
     TRANSFORMS
     
     Format options:
     1. Disappear: [["type", [[x,y]]]]
     2. Replace: [["type", "replacement", [[x,y]]]]
     3. With config: [["type", "replacement", {"at": [[x,y]], "property": "value"}]]
     
     Trigger options:
     - on_interact (default): Transform when player uses interact()
     - on_step: Auto-transform when player steps on tile
     
     Signal options:
     - on_interact: "signal_name" - Emit signal when interacted
     - on_step: "signal_name" - Emit signal when stepped on
     - on: "signal_name" - Transform when signal received
============================================================================ -->
transforms: [["lever", "lever-on", {"at": [[4,9]], "on_interact": "lever_on"}], ["door", "door-open", {"on": "lever_on", "at": [[6,8]]}], ["plate", "plate-down", {"trigger": "on_step", "at": [[9,10]], "on_step": "plate_down"}]]

<!-- ============================================================================
     VEHICLES
     
     Format options:
     1. Simple: [["type", [[x,y]]]]
     2. With spawn: [["type", {"spawn": "signal_name", "at": [[x,y]]}]]
     
     Vehicles allow traversing restricted tiles (e.g., water).
     Use interact() to board/disembark.
============================================================================ -->
vehicles: [["boat", {"spawn": "got_key", "at": [[14,10]]}]]

<!-- ============================================================================
     MEGA-ELEMENTS (blocking multi-tile structures)
     
     Format: [["type", [[x,y]]]]
     Position is upper-left corner of the structure.
     Blocked tiles defined in mega-elements.json
============================================================================ -->
megaElements: [["house", [[1,4]]]]

<!-- ============================================================================
     MEGA-OBJECTS (walkable multi-tile terrain)
     
     Format: [["type", [[x,y]]]]
     Position is upper-left corner of the object.
     Player can walk over these (no blocking).
============================================================================ -->
megaObjects: [["highland-plateau", [[15,5]]]]
```

<!-- ============================================================================
     TESTS SECTION
     
     Defines custom completion criteria. If omitted, defaults to goal position.
     
     Available test types:
     - position: Check player location (target: goal, or [x,y])
     - inventory: Check item counts (item, min/exact/max)
     - collectibles: Check collected items (all, count, types)
     - code_regex: Match code pattern (pattern, message)
     - direction: Check facing direction (facing: up/down/left/right)
     - element_state: Check transform state (element, position, state)
     
     pass_all: true means ALL tests must pass (default)
     pass_all: false means ANY test passing is sufficient
============================================================================ -->
<!-- Tests -->
```yaml
pass_all: true
tests:
  # Check player reached the goal
  - type: position
    target: goal
  
  # Check player collected at least 3 coins
  - type: inventory
    item: coin
    min: 3
  
  # Check player has the key
  - type: inventory
    item: key
    min: 1
  
  # Check player used collect() command
  - type: code_regex
    pattern: "collect\\(\\)"
    message: "Use collect() to pick up items"
  
  # Check door was opened
  - type: element_state
    element: door
    position: [6, 8]
    state: door-open
```
---

--- <!-- Mission 2 -->
## MISSION 2: MAP INHERITANCE DEMO

<!-- ============================================================================
     MAP INHERITANCE
     
     This level has NO map layout rows ([...]) in the Map section.
     It automatically inherits the map from the previous mission.
     
     Only metadata is specified:
     - startPos: New starting position
     - goalPos: New goal position  
     - collectibles: New collectibles for this level
     - vehicles: (optional) New vehicles
     
     State persistence:
     - Inventory from Level 1 carries forward (key, coins)
     - Collected items remain collected
     - Transformed elements stay transformed
============================================================================ -->

### AVAILABLE AFTER
Completing Mission 1

### OBJECTIVE
> Use your skills from Mission 1 to collect gems and reach the new goal!

Your inventory persists from Mission 1. The map is the same, but with new challenges. Collect all the gems scattered around.

### SUCCESS CRITERIA
- Collect all 3 gems
- Reach the new goal position
- Face north when complete

### REWARDS
- Gems: +3
- Chapter Complete!

<!-- Starter Code -->
```
import player

# Your inventory carries over from Mission 1!
# Check: You should still have your key and coins
player.move_forward()
```

<!-- Solution -->
```
import player

# Collect gems (map inherited from Mission 1)
player.turn_right()
player.move_forward(4)
player.collect()  # Gem at (9,8)

player.turn_left()
player.move_forward(3)
player.collect()  # Gem at (9,5)

player.turn_left()
player.move_forward(5)
player.collect()  # Gem at (4,5)

# Go to goal
player.move_forward(2)
player.turn_left()  # Face north
```

<!-- MAP INHERITANCE: No layout rows - inherits from Mission 1 -->
<!-- Map -->
```
startPos: 5,8
goalPos: 2,5
collectibles: [["gem", [[9,8],[9,5],[4,5]]]]
```

<!-- Tests -->
```yaml
pass_all: true
tests:
  # Position at new goal
  - type: position
    target: goal
  
  # All gems collected
  - type: collectibles
    all: true
  
  # Facing north
  - type: direction
    facing: up
  
  # Verify inventory persistence - still have key from Mission 1
  - type: inventory
    item: key
    min: 1
```
---
