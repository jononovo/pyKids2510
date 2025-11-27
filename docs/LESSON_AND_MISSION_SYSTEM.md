# Lesson and Mission System Documentation

This document outlines how lessons work, how progress is saved, the differences between missions and normal lessons, and known issues for an AI agent to understand and continue development.

---

## Table of Contents

1. [Lesson System Overview](#lesson-system-overview)
2. [Progress and Data Storage](#progress-and-data-storage)
3. [Mission System](#mission-system)
4. [Level Entry Snapshot (Reset Functionality)](#level-entry-snapshot-reset-functionality)
5. [Known Bugs and Issues](#known-bugs-and-issues)
6. [Outstanding Work to Complete](#outstanding-work-to-complete)
7. [Key Files Reference](#key-files-reference)

---

## Lesson System Overview

### How Lessons Are Defined

Lessons are authored in Markdown files (e.g., `assets/chapter1-master-map.md`). The lesson parser (`js/lesson-parser.js`) extracts:

```javascript
courseData = {
    chapterName: '',      // From "# Chapter Name"
    chapterNumber: 1,     // From "## CHAPTER 1"
    categoryName: '',     // From "## CATEGORY NAME" (all caps)
    levels: []            // Array of level objects
}
```

Each level in the `levels` array contains:

```javascript
level = {
    title: '',            // From "## Level Title"
    type: '',             // 'mission', 'quest', or 'exercise' (detected from title)
    slug: '',             // URL-safe identifier generated from title
    markdown: '',         // Lesson content (objectives, instructions)
    starterCode: '',      // From <!-- Starter Code --> block
    solutionCode: '',     // From <!-- Solution --> block
    hasOwnMap: false,     // Whether this level defines its own map
    map: {
        layout: [],       // 2D array of tile codes
        startPos: {x, y}, // Player starting position
        goalPos: {x, y},  // Goal/star position
        collectibles: [], // Array of {x, y, type} objects
        graphic: null     // Optional background image URL
    }
}
```

### Level Separators in Markdown

Levels are separated by: `--- <!-- Level X -->`

Example:
```markdown
# Python Adventure
## CHAPTER 1
## INTRODUCTION TO PYTHON

--- <!-- Level 1 -->
## MISSION 1: First Steps

### OBJECTIVE
Learn to move forward!

<!-- Starter Code -->
```python
move_forward()
```

<!-- Solution -->
```python
move_forward()
move_forward()
```

<!-- Map -->
```
[1,1,1,1,1]
[1,0,0,0,1]
[1,0,S,0,1]
[1,0,0,G,1]
[1,1,1,1,1]
start: 2,2
goal: 3,3
```

--- <!-- Level 2 -->
## Exercise: Practice Moving
...
```

### Level Type Detection

The `MissionDetector` (`js/mission/mission-detector.js`) determines level type from the title:

- **Mission**: Title contains "MISSION" or matches `## MISSION X:`
- **Quest**: Title contains "QUEST" or matches `## QUEST X:`
- **Exercise**: All other levels (default)

```javascript
MissionDetector.getLevelType("## MISSION 1: Collect Resources") // Returns 'mission'
MissionDetector.getLevelType("## Exercise: Practice") // Returns 'exercise'
```

### Map Inheritance

If a level doesn't define its own map (`hasOwnMap: false`), it inherits from:

1. **For Missions/Quests**: `lastMissionMapCache` (most recent mission's map)
2. **Fallback**: `lastMapCache` (most recent map from any level)

This allows exercises to share the same map as the preceding mission.

---

## Progress and Data Storage

### Storage Locations

| Data Type | Storage Location | Key |
|-----------|-----------------|-----|
| User code per level | `localStorage` | `pythonGameProgress` |
| Level completion | `localStorage` | `pythonGameProgress` |
| Mission/Chapter state | `localStorage` | `missionChapterState` |
| Embedded context | `window.parent.postMessage` | N/A |

### UserProgressManager (`js/user-progress.js`)

Manages saving/loading progress. Key functions:

```javascript
UserProgressManager.setCurrentLevel(chapterNumber, levelIndex, slug)
UserProgressManager.saveCode(code)           // Save current code
UserProgressManager.getSavedCode()           // Get saved code for current level
UserProgressManager.markComplete(levelId)    // Mark level complete
UserProgressManager.sendValidation(checkerId, valid, chapterState) // Send completion message
```

### PostMessage Protocol (Embedded Context)

When embedded in a parent application, the app communicates via `window.parent.postMessage`:

#### Outbound Messages (App → Host)

1. **App Ready**:
```javascript
{
    type: 'app-ready',
    currentLevelId: 'chapter1-level0-mission-1'
}
```

2. **Save Progress** (on code save):
```javascript
{
    type: 'save-progress',
    levelId: 'chapter1-level0-mission-1',
    data: {
        code: 'move_forward()\ncollect()',
        completed: false
    },
    chapterState: { // Only for mission levels
        chapter: 1,
        inventory: { wood: 3, coin: 2 },
        collectedItems: [{x: 2, y: 3, type: 'wood'}],
        structures: []
    }
}
```

3. **Level Completion**:
```javascript
{
    type: 'checker-validation',
    checkerId: 'chapter1-level0',
    valid: true,
    chapterState: { ... } // Only for mission levels
}
```

#### Inbound Messages (Host → App)

1. **Load All Progress**:
```javascript
{
    type: 'load-all-progress',
    progress: {
        'chapter1-level0': { code: '...', completed: true },
        'chapter1-level1': { code: '...', completed: false }
    }
}
```

2. **Load Single Level Progress**:
```javascript
{
    type: 'load-progress',
    levelId: 'chapter1-level0',
    code: 'move_forward()',
    completed: true,
    chapterState: { ... }
}
```

---

## Mission System

### Purpose

Missions provide a story-driven experience where inventory and collected items persist across multiple levels within a chapter. Exercises are sandboxed and don't affect mission progress.

### MissionState (`js/mission/mission-state.js`)

Central state manager for mission persistence:

```javascript
MissionState.init(chapterNumber, savedState) // Initialize for a chapter
MissionState.getState()                       // Get full state object
MissionState.loadState(state)                 // Load state from saved data

// Inventory
MissionState.addToInventory('wood', 1)        // Add item
MissionState.removeFromInventory('wood', 1)   // Remove item
MissionState.getInventory()                   // Get {type: count} object

// Collectibles
MissionState.recordCollectible(x, y, type)    // Mark position as collected
MissionState.isCollected(x, y)                // Check if already collected
MissionState.filterCollectibles(collectibles) // Filter out collected items

// Structures (future use)
MissionState.addStructure(x, y, type)
MissionState.hasStructure(x, y, type)
```

### chapterState Format

```javascript
{
    chapter: 1,
    inventory: {
        wood: 5,
        coin: 10,
        gem: 2
    },
    collectedItems: [
        { x: 3, y: 4, type: 'wood' },
        { x: 5, y: 2, type: 'coin' }
    ],
    structures: [
        { x: 6, y: 6, type: 'campfire' }
    ]
}
```

### How Collect Works in Missions

When `collect()` is called in game code:

1. Find collectible at player's position
2. Mark it as `collected: true` in `gameState.collectibles`
3. Add to `gameState.inventory` (local display)
4. If mission/quest level:
   - Call `MissionState.recordCollectible(x, y, type)` - prevents re-collection
   - Call `MissionState.addToInventory(type, 1)` - persistent inventory

### Mission vs Exercise Comparison

| Feature | Mission/Quest | Exercise |
|---------|--------------|----------|
| Inventory persists | Yes | No (reset on level change) |
| Collected items tracked | Yes (can't re-collect) | No (all items available) |
| chapterState in messages | Included | Not included |
| Map inheritance priority | `lastMissionMapCache` | `lastMapCache` |

---

## Level Entry Snapshot (Reset Functionality)

### Purpose

When a user clicks "Reset", the game should return to the exact state it was in when they first entered the level - including their saved code (not just starter code) and the mission state at entry.

### Implementation (`window.levelEntrySnapshot`)

```javascript
window.levelEntrySnapshot = {
    starterCode: '',     // Code loaded when entering (saved code OR starter code)
    missionState: null,  // Deep copy of MissionState at entry
    levelIndex: -1       // Prevents overwriting on same-level reloads
}
```

### Snapshot Capture Flow

1. `loadLevel(levelIndex)` is called
2. Check if `levelIndex !== levelEntrySnapshot.levelIndex` (new level)
3. If new level:
   - Save `MissionState.getState()` to `levelEntrySnapshot.missionState`
   - Update `levelEntrySnapshot.levelIndex`
4. In setTimeout callback:
   - Load saved code or starter code into editor
   - Save the actual loaded code to `levelEntrySnapshot.starterCode`

### Reset Restoration (`resetGame()` in `js/game-commands.js`)

1. Reset player position and direction
2. Clear all collectible `collected` flags
3. If snapshot has missionState:
   - `MissionState.loadState(levelEntrySnapshot.missionState)`
   - Restore `gameState.inventory` from MissionState
   - Re-synchronize collectibles with `MissionState.isCollected()`
4. Update inventory UI panel
5. Restore code editor to `levelEntrySnapshot.starterCode`
6. Re-render game

---

## Known Bugs and Issues

### Critical Issues

1. **Snapshot timing may cause race conditions**
   - The MissionState snapshot is captured in synchronous `loadLevel()` code
   - The code snapshot is captured in async `setTimeout` callback
   - If any other async operations modify MissionState between these, state could be inconsistent

2. **Exercise levels may incorrectly include chapterState**
   - In `saveProgress()`, the check for mission level uses `window.courseData.levels[window.currentLevel]`
   - This could fail if `currentLevel` or `courseData` is stale

### Medium Issues

3. **Map inheritance doesn't account for chapter changes**
   - `lastMissionMapCache` persists across chapter loads
   - Could cause incorrect map inheritance when switching chapters

4. **No validation of loaded chapterState**
   - `MissionState.loadState()` accepts any object structure
   - Malformed data from host could cause undefined behavior

### Minor Issues

5. **Console warnings on first load**
   - `[MissionState] Initialized for chapter X` logs before any map is loaded
   - Not harmful but could confuse debugging

6. **Inventory panel doesn't use collectible icons**
   - Just shows text like "wood: 3"
   - Could use SVG icons from `assets/map/elements/`

---

## Outstanding Work to Complete

### High Priority

1. **Production Database Integration**
   - Currently uses `localStorage` for persistence
   - Need to implement proper host → app data loading on page load
   - Host should send `load-all-progress` message after receiving `app-ready`

2. **Chapter Transition Handling**
   - When user completes a chapter, need to:
     - Clear `MissionState` for that chapter
     - Send final chapterState to host
     - Initialize fresh state for next chapter

3. **Robust Reset Testing**
   - Test reset with: saved code, collected items, multiple resets, level navigation then reset
   - Verify inventory UI, collectible visuals, and code editor all sync

### Medium Priority

4. **Structure Building System**
   - `MissionState.addStructure()` exists but no game command uses it
   - Need `build(type)` command that:
     - Checks inventory for required resources
     - Removes resources
     - Adds structure to map visually
     - Records in MissionState

5. **Level Slug Consistency**
   - Level IDs are generated as `chapter${num}-level${index}`
   - Should use slugs from lesson titles for better readability
   - Need migration path for existing saved data

6. **Error Recovery**
   - If host sends malformed data, app should gracefully handle
   - If localStorage is corrupted, should reset to defaults

### Low Priority

7. **Visual Feedback for Persistence**
   - Show "Saved" indicator when progress saves
   - Show "Loaded" indicator when progress loads from host
   - Animate inventory changes

8. **Debug Panel**
   - Add developer toggle to show:
     - Current MissionState
     - levelEntrySnapshot contents
     - Message log with host

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `js/lesson-parser.js` | Parses markdown into courseData structure |
| `js/main.js` | Main app logic, loadLevel, map inheritance |
| `js/user-progress.js` | Progress saving/loading, postMessage handling |
| `js/mission/mission-detector.js` | Determines level type from title |
| `js/mission/mission-state.js` | Persistent mission state management |
| `js/game-commands.js` | Game commands including collect(), resetGame() |
| `assets/chapter1-master-map.md` | Example lesson file |

### Global Objects

- `window.courseData` - Current loaded course structure
- `window.currentLevel` - Index of current level
- `window.gameState` - Runtime game state (player position, collectibles, etc.)
- `window.MissionState` - Persistent mission state manager
- `window.MissionDetector` - Level type detection
- `window.UserProgressManager` - Progress save/load manager
- `window.levelEntrySnapshot` - Reset functionality state

---

## Testing Checklist for AI Agent

Before considering the mission system complete:

- [ ] Mission inventory persists when navigating to next mission level
- [ ] Exercise level does NOT affect mission inventory
- [ ] Collected items in missions stay collected after level change
- [ ] Reset restores code to what was loaded on level entry
- [ ] Reset restores inventory to entry state
- [ ] Reset restores collectible visual states
- [ ] Host receives chapterState in save-progress messages for missions
- [ ] Host receives chapterState in checker-validation messages for missions
- [ ] App correctly loads chapterState from host's load-progress message
- [ ] Multiple resets on same level work correctly
- [ ] Chapter change resets MissionState appropriately
