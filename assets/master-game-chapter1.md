# MASTER GAME - CHAPTER 1
## ISLAND SETTLEMENT

### Master Map Configuration
```
type: master_game
chapter: 1
theme: tropical_island
starting_resources:
  wood: 0
  food: 0
  stone: 0
unlockable_zones:
  - beach
  - forest
  - mountain
  - volcano_island
```

--- <!-- Mission 1.1 -->
## MISSION: Gather Coconuts from the Beach
### After Lesson: Basic Movement

**Objective**: Use your new movement skills to gather your first resources!

**Requirements**:
- Collect 5 coconuts from the beach
- Return to your shelter

**Unlocks**: 
- Ability to plant palm trees
- Access to the eastern beach

<!-- Starter Code -->
```
import player

# Move along the beach and collect coconuts
# Hint: Use player.move_forward() to reach each coconut

```

<!-- Map -->
```
graphic: assets/map/graphic-maps/island-house.svg
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,2,H,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,7,0,0,0,0,7,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
startPos: 2,2
resources_to_collect: [
  {type: "coconut", positions: [[7,4], [12,4], [16,5], [5,8], [11,9]]}
]
success_condition: collect_all_and_return
```
---

--- <!-- Mission 1.2 -->
## MISSION: Navigate the Rocky Shore
### After Lesson: Turning

**Objective**: The tide brought in driftwood! Navigate the winding shore path to collect it.

**Requirements**:
- Collect 10 pieces of driftwood
- Use turning to navigate efficiently

**Unlocks**:
- Build your first shelter
- Crafting menu

<!-- Starter Code -->
```
import player

# The beach path winds around rocks
# Use turn_left() and turn_right() to navigate

```

<!-- Map -->
```
graphic: assets/map/graphic-maps/island-house.svg
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,6,7,2,6,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,H,2,2,2,2,6,0,0,0,6,6,6,6,6,0,0,0,0,0],
[0,0,0,6,7,2,2,2,2,2,2,7,2,2,6,0,0,0,0,0],
[0,0,0,6,6,6,6,6,6,6,2,6,6,2,6,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,6,2,7,2,2,6,0,0,0,0,0],
[3,3,3,3,3,3,3,3,3,6,2,6,6,6,6,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,6,7,6,3,3,3,3,3,3,3,3],
[0,0,0,0,0,0,0,0,0,6,6,6,0,0,0,0,0,0,0,0]
startPos: 1,3
resources_to_collect: [
  {type: "driftwood", positions: [[4,2], [4,4], [11,4], [11,6], [10,8]]}
]
success_condition: collect_threshold
threshold: 10
```
---

--- <!-- Mission 1.3 -->
## MISSION: Efficient Fishing Trip
### After Lesson: Movement with Arguments

**Objective**: Use move_forward(n) to fish more efficiently at the pier!

**Requirements**:
- Catch 8 fish using efficient movement
- Bonus: Complete in under 20 commands

**Unlocks**:
- Fishing rod upgrade
- "Efficiency Master" achievement

<!-- Starter Code -->
```
import player

# The pier has fishing spots at regular intervals
# Try using player.move_forward(3) instead of multiple move_forward()

```

<!-- Map -->
```
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,H,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0],
[0,0,0,F,0,0,F,0,0,F,0,0,F,0,0,F,0,0,0,0],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1,1
resources_to_collect: [
  {type: "fish", positions: [[3,3], [6,3], [9,3], [12,3], [15,3]]}
]
bonus_objective: {type: "command_limit", max_commands: 20}
```
---

--- <!-- Mission 1.4 -->
## MISSION: Clear the Landslide
### After Lesson: Push Objects

**Objective**: Rocks from the mountain blocked the path to the forest. Push them aside!

**Requirements**:
- Clear the path by pushing 5 boulders
- Access the forest zone

**Unlocks**:
- Forest area (better wood, new resources)
- Stone collection ability

<!-- Starter Code -->
```
import player

# Boulders (B) can be pushed one tile at a time
# Face them and use player.push()

```

<!-- Map -->
```
[0,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0],
[0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0],
[0,H,2,2,2,2,B,B,B,B,B,2,2,4,0,0,0,0,0,0],
[0,0,0,0,0,0,4,0,0,0,0,2,0,4,0,0,0,0,0,0],
[0,0,0,0,0,0,4,4,4,4,2,2,0,4,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,4,2,0,0,4,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,4,G,0,0,4,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0]
startPos: 1,2
pushable_objects: [
  {type: "boulder", symbol: "B", positions: [[6,2], [7,2], [8,2], [9,2], [10,2]]}
]
goal: {type: "reach_zone", zone: "forest", position: [10,6]}
```
---

--- <!-- Mission 1.5 -->
## MISSION: Trade with the Merchant
### After Lesson: Speak/Output

**Objective**: A merchant ship arrived! Communicate to trade your coconuts for seeds.

**Requirements**:
- Greet the merchant
- Announce your inventory
- Complete the trade

**Unlocks**:
- Farming ability
- Crop seeds (wheat, corn, carrots)

<!-- Starter Code -->
```
import player

# Use player.speak("message") to communicate
# The merchant needs to know what you have to trade

```

<!-- Map -->
```
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,H,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,2,0,0,0,0,M,M,M,0,0,0,0,0,0,0],
[0,0,0,0,0,2,2,2,2,2,2,2,M,0,0,0,0,0,0,0],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1,1
npcs: [
  {type: "merchant", position: [11,3], requires_speech: ["Hello", "coconuts", "trade"]}
]
success_condition: complete_dialogue
```
---

--- <!-- Mission 1.6 -->
## MISSION: Rescue the Goats!
### After Lesson: Build Objects

**Objective**: The volcano on the nearby island is smoking! Build a raft and rescue the goats!

**Requirements**:
- Build a raft using your driftwood
- Navigate to the island
- Rescue 3 goats before the volcano erupts

**Unlocks**:
- Goat farm (produces milk)
- Advanced building menu

<!-- Starter Code -->
```
import player

# Build a raft at the shore, then sail to save the goats!
# player.build("raft") when you have enough materials

```

<!-- Map -->
```
[0,0,0,0,0,0,0,0,0,0,V,V,V,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,V,V,V,V,V,0,0,0,0,0,0],
[0,H,2,2,X,0,0,0,0,V,G,0,G,V,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,V,0,G,0,V,0,0,0,0,0,0],
[3,3,3,3,3,3,3,3,3,V,V,V,V,V,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 1,2
build_spots: [
  {type: "raft", position: [4,2], requires: {driftwood: 10}}
]
timed_event: {type: "volcano_eruption", turns_until: 30}
rescue_targets: [
  {type: "goat", positions: [[10,2], [11,3], [12,2]]}
]
```
---

--- <!-- Quest -->
## QUEST: The Storm is Coming!
### Chapter 1 Finale - Open Challenge

**Scenario**: Dark clouds gather! A massive storm will hit your island in 50 moves. Use everything you've learned to prepare!

**Open Objectives** (choose your strategy):
- Gather food supplies
- Reinforce your shelter  
- Move animals to safety
- Clear dangerous debris
- Build storm barriers
- Warn other settlers

**No starter code** - This is your chance to combine all Chapter 1 skills creatively!

<!-- Map -->
```
graphic: assets/map/graphic-maps/island-house.svg
[Full 30x30 island map with all zones unlocked]
startPos: 10,15
storm_timer: 50
dynamic_events: true
sandbox_mode: true
```

### Scoring
- Food gathered: 10 points each
- Shelters built: 50 points each  
- Animals saved: 30 points each
- Settlers warned: 20 points each
- Efficiency bonus: Extra points for fewer moves
---