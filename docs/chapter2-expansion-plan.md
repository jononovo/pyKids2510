# Chapter 2 Expansion Plan - Mountain Settlement

## Overview
Chapter 2 transitions from the Island Settlement to a Mountain Settlement, introducing variables and data storage as the core programming concepts.

## Programming Concepts → Mission Mapping

### Lesson 2.1: Variables - Storing Values
**Concept**: `treasure = 5`
**Mission**: "Mining for Gems"
- Store different gem types in variables
- Track inventory quantities
- Resources unlock storage chests

### Lesson 2.2: Variable Operations
**Concept**: `gold = gold + 10`
**Mission**: "Mountain Trading Post"
- Calculate trade values
- Update resource counts
- Build market stall with accumulated wealth

### Lesson 2.3: String Variables
**Concept**: `name = "Explorer"`
**Mission**: "Village Census"
- Record villager names
- Create signposts with text
- Unlock naming system for buildings

### Lesson 2.4: Multiple Variables
**Concept**: Working with several variables
**Mission**: "Resource Management"
- Balance wood, stone, and food
- Optimize storage allocation
- Unlock advanced inventory system

### Lesson 2.5: Variable Scope
**Concept**: Local vs global variables
**Mission**: "Mountain Zones"
- Different resource rules per zone
- Manage zone-specific inventories
- Unlock multi-zone travel

### Lesson 2.6: Constants
**Concept**: `MAX_CAPACITY = 100`
**Mission**: "Building the Warehouse"
- Set building capacity limits
- Manage overflow rules
- Unlock permanent structures

## Chapter 2 QUEST: "The Avalanche!"
**Open-ended challenge using all Chapter 2 concepts**
- Dynamic resource management under pressure
- Variable-based decision making
- Save the mountain village using inventory management

## Technical Implementation Steps

### 1. Create Master Game File
```
assets/master-game-chapter2.md
```
- Follow same structure as Chapter 1
- Update theme to "mountain_settlement"
- New resource types: gems, stone, iron

### 2. Update Mission Mode UI
- Add new resource types to counter
- Mountain-themed background graphics
- Altitude/zone indicators

### 3. New Game Mechanics
- **Inventory System**: Variables directly affect carrying capacity
- **Trading System**: Use variables to calculate exchanges
- **Zone System**: Different areas with unique resources

### 4. Asset Requirements
- Mountain terrain tiles
- Cave entrance graphics
- Mining equipment sprites
- Village building assets

### 5. Progressive Unlocks
```javascript
Chapter 2 Unlocks:
- Variable declarations → Storage buildings
- Math operations → Trading system
- String variables → Naming/labeling
- Multiple variables → Complex inventory
- Scope → Multi-zone access
- Constants → Permanent upgrades
```

## Integration Checklist

- [ ] Create `master-game-chapter2.md` with 6 missions + quest
- [ ] Add mountain tile set to `assets/map/tiles/`
- [ ] Update `missionMode.resources` to include new types
- [ ] Create mountain settlement base map
- [ ] Add variable-based game mechanics
- [ ] Test lesson → mission flow
- [ ] Implement trading UI overlay
- [ ] Add zone transition effects

## Future Chapter Themes

- **Chapter 3-4**: Desert Oasis (Loops & Conditionals)
  - Irrigation systems using loops
  - Weather-based conditional logic
  
- **Chapter 5-6**: Sky Citadel (Functions & Lists)
  - Building automation with functions
  - Managing fleets with lists

## Success Metrics

1. **Learning Reinforcement**: Each mission directly practices the lesson concept
2. **Progressive Difficulty**: Missions become more complex within chapter
3. **Resource Persistence**: Player progress carries between missions
4. **Open Exploration**: Quest allows creative problem-solving

## Timeline Estimate

- Master game markdown creation: 2 hours
- Asset creation/gathering: 3 hours
- Mission mode UI updates: 2 hours
- Testing and refinement: 2 hours
- **Total: ~9 hours for full Chapter 2**

## Notes for Developers

The system is designed to be highly extensible:

1. **Markdown-Driven**: All mission content lives in markdown files
2. **Parser-Ready**: Both parsers handle decorated tile values (1*, 2*, etc.)
3. **UI Separation**: Mission mode UI is completely separate from lesson mode
4. **Resource System**: Flexible resource tracking supports any collectible type
5. **State Persistence**: LocalStorage saves progress between sessions

The architecture supports rapid chapter development once assets are available.