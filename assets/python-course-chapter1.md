# PYTHON DEVELOPMENT COURSE
## CHAPTER 1
## INTRODUCTION TO PYTHON

--- <!-- Level 1 of 3 in Chapter-->
## STARTING OUT

### OBJECTIVE
> Learn the basics of Python by guiding a character through a simple path.

Coding for kids is a learning platform that uses a game to teach Python programming! 🎮

Use the Code Editor below and add the line: `player.move_forward()` to make your way to the exit. This code will allow you to take one step forward.

Press the **Run** button to execute the code you have written in the code editor.

### CHALLENGE
Add more `player.move_forward()` commands to reach the star at the end of the path.

<!-- Starter Code -->
```
import player

player.move_forward()
player.move_forward()
player.move_forward()
```

<!-- Solution -->
```
import player

player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,1,0,4,0,1,0,0,1,0,4,0,1,0,3],
[3,1,0,4,0,1,0,0,4,0,1,0,4,0,1,3],
[3,0,1,0,0,0,1,0,0,1,0,0,0,1,0,3],
[3,4,0,0,0,0,0,0,0,0,4,0,1,0,4,3],
[3,0,0,0,1,0,0,0,1,0,0,1,0,4,0,3],
[3,1,0,0,0,7,0,0,0,0,0,0,0,0,1,3],
[3,0,0,1,0,0,4,0,0,1,0,0,0,0,0,3],
[3,0,2,2,2,2,2,2,2,2,2,2,2,1,4,3],
[3,1,0,4,0,1,0,4,1,0,4,0,1,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 2,8
goalPos: 12,8
```
---

--- <!-- Level 2 of 3 in Chapter-->
## MOVEMENT WITH FUNCTIONS

### OBJECTIVE
> Traverse the forest path and reach the exit to complete the level.

You're lost in the woods! Make your way out and get back to your farm by writing your first lines of Python code! 🌲

Python is an all-use programming language you can use for a variety of apps including games!

Your first task is to make your way to the star using code to complete the level!

If you get stuck, try pressing the **Help** button in the upper right corner of the screen or press the **Code Book** button for illustrated explanations of all the codes used in the game.

You can also receive help from the **Virtual Teacher**, this feature will generate tips via popups in the code editor guiding you through the coding process. You can turn it on and off by switching the teacher icon located on top of the editor. The coin icon next to it informs you of how many tips you are eligible to receive.

How can you get across the forest? By using **Functions** of course!

Functions are useful code commands that influence the world around you. These commands are typed in the editor below.

In the programming language Python, the functions are divided into modules. The `player` module is used to interact with the game world. This is why we need to "import" the `player` module to use its functions.

Functions are executed by writing the word "player" and then a dot, followed by the function name and parentheses.

Functions are executed one by one, from top to bottom - meaning that the order is important.

The following functions are available to you:
- To move forward, you need to type `player.move_forward()`.
- To turn left, you need to type `player.turn_left()`.
- To turn right, you need to type `player.turn_right()`.

Once you finished writing your code, press the "Run" button to execute all commands one by one.

### CHALLENGE
Navigate the maze using `move_forward()`, `turn_left()`, and `turn_right()` commands.

<!-- Starter Code -->
```
import player

player.move_forward()
player.move_forward()
player.turn_left()
player.move_forward()
player.turn_left()
player.move_forward()
player.move_forward()
```

<!-- Solution -->
```
import player

player.move_forward()
player.move_forward()
player.turn_left()
player.move_forward()
player.turn_left()
player.move_forward()
player.move_forward()
player.turn_right()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.move_forward()
player.turn_right()
player.move_forward()
player.move_forward()
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,4,0,0,7,0,0,0,7,0,0,4,0,0,3],
[3,0,0,2,2,2,2,0,0,2,2,2,0,0,0,3],
[3,0,0,2,0,0,2,0,0,2,0,2,0,0,0,3],
[3,0,0,2,0,0,2,2,2,2,0,2,0,0,0,3],
[3,0,0,2,0,0,0,0,0,0,0,2,0,0,0,3],
[3,0,0,2,2,2,2,2,2,2,2,2,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,4,0,0,0,0,0,0,0,0,0,4,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 3,7
goalPos: 11,3
```
---

--- <!-- Level 3 of 3 in Chapter-->
## COLLECTING ITEMS

### OBJECTIVE
> Collect all four berries in the map to complete the level.

Let's get something to eat, those berries look tasty. 🍓

You can walk over them to eat them, you may think it will take a lot of coding but there's an easier way.

Write the number of steps you'd like to take to walk further, add a number to the end of the `move_forward()` function inside the parenthesis to increase the number of steps you take.

This is called a function argument. Function arguments are values that you pass to a function to influence its behavior. For the function `move_forward`, the argument is the number of steps you want to take.

Functions can also receive more than one argument, but for now we will only use one.

### CHALLENGE
Use `player.move_forward(3)` to take multiple steps at once. This is called a function argument!

<!-- Starter Code -->
```
import player

# Add a number at the end of the function to walk forward
player.move_forward(2)
player.turn_right()
player.move_forward()
```

<!-- Solution -->
```
import player

player.move_forward(2)
player.turn_right()
player.move_forward(6)
player.turn_left()
player.move_forward(2)
player.turn_left()
player.move_forward(6)
player.turn_right()
player.move_forward(1)
```

<!-- Map -->
```
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,4,0,0,7,0,0,0,7,0,0,4,0,0,3],
[3,0,0,2,2,2,2,2,2,2,2,2,0,0,0,3],
[3,0,0,2,0,0,0,0,0,0,0,2,0,0,0,3],
[3,0,0,2,0,7,0,0,0,7,0,2,0,0,0,3],
[3,0,0,2,0,0,0,0,0,0,0,2,0,0,0,3],
[3,0,0,2,2,2,2,2,2,2,2,2,0,0,0,3],
[3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
[3,0,4,0,0,0,0,0,0,0,0,0,4,0,0,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 3,7
goalPos: 10,7
collectibles: [[5,2],[9,2],[5,5],[9,5]]
```
---

--- <!-- Level 4 of 4 in Chapter-->
## CASTLE GARDEN ADVENTURE

### OBJECTIVE
> Navigate through the beautiful castle garden using everything you've learned!

Welcome to the Castle Garden! 🏰 This special level features a stunning visual background instead of tiles. The paths are already drawn in the scenery, making it feel like a real adventure!

Notice how the garden has fountains, trees, and hedges creating a maze-like path. You'll need to use all your skills - `move_forward()`, `turn_left()`, and `turn_right()` - to navigate through the garden paths.

### CHALLENGE
Guide your character from the castle entrance through the winding garden paths to reach the golden star. Collect the magical gems along the way!

**Tip:** Use the argument in `move_forward()` to take multiple steps when the path is straight!

<!-- Starter Code -->
```
import player

# Start your castle garden adventure!
player.move_forward(2)
player.turn_right()
player.move_forward()
```

<!-- Solution -->
```
import player

player.move_forward(3)
player.turn_right()
player.move_forward(5)
player.turn_left()
player.move_forward(2)
player.turn_left()
player.move_forward(4)
player.turn_right()
player.move_forward(2)
```

<!-- Map -->
```
graphic: assets/map/graphic-maps/castle-garden.svg
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0]
startPos: 4, 12
goalPos: 12, 14
collectibles: [[7, 10], [10, 12], [12, 12]]
```
---

--- <!-- Level 5 - Island House -->
## ISLAND ADVENTURE

### OBJECTIVE
> Explore the tropical island and find your way to the cozy house!

Welcome to your own private island! 🏝️ You've just arrived at the dock and need to make your way to your beach house.

This level uses our new modular island tile system - notice how the beach edges smoothly transition from sand to water!

### CHALLENGE
Navigate from the dock to reach the front door of your island house. Take the scenic path through the garden!

**Tip:** The island has a nice stone path - follow it to find your way home!

<!-- Starter Code -->
```
import player

# Start your island adventure!
player.move_forward(2)
player.turn_left()
player.move_forward()
```

<!-- Solution -->
```
import player

player.move_forward(3)
player.turn_left()
player.move_forward(3)
player.turn_right()
player.move_forward(2)
player.turn_left()
player.move_forward(2)
```

<!-- Map -->
```
graphic: assets/map/graphic-maps/island-house.svg
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3],
[3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3],
[3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3],
[3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3],
[3,3,3,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3,3,3],
[3,3,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,3,3],
[3,3,0,0,0,0,0,4,0,0,2,0,2,0,0,4,0,0,0,0,0,0,3,3],
[3,3,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,3,3],
[3,3,0,0,0,0,2,2,2,2,2,0,2,2,2,2,2,0,0,0,0,0,3,3],
[3,3,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,3,3],
[3,3,0,0,0,0,2,2,2,2,2,0,2,2,2,2,2,0,0,0,0,0,3,3],
[3,3,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,3,3],
[3,3,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,3,3],
[3,3,3,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,3,3,3],
[3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3],
[3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3],
[3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
startPos: 11, 18
goalPos: 11, 10
```
---