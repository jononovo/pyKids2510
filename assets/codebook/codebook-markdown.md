# 📖 CODE BOOK

Here are all the functions you can use in the game. Feel free to experiment with them and try to complete the level by learning how to use these functions!

---

## move_forward()

**Syntax**

`player.move_forward([number of steps])`

This function is used to have player move forward in the direction they're facing provided there is not a collision blocking the player's trajectory. You can assign the amount of steps you would like for this function to repeat or you can leave it blank and it will execute the action only once.

If the function is not provided with any arguments, then it will move the player forward by one step.

It answers with the number of steps the player really took. That's fewer than you asked for when something blocks the way, and 0 when the tile in front is blocked.

**Example**

```python
player.move_forward(3)
```

This code will have player move three steps forward in the map.

```python
steps = player.move_forward(5)
if steps < 5:
    print("Something is in the way")
```

This code tries to walk five steps and prints a warning when something stopped the player sooner.

![move forward](assets/codebook/move_forward.png)

---

## turn_left()

**Syntax**

`player.turn_left()`

This function is used to have player turn left, altering their direction towards the left of their current direction.

**Example**

```python
player.turn_left()
player.move_forward()
```

This code will have player turn towards the left of their current facing direction and move forward in that direction with the follow up code.

![turn left](assets/codebook/turn_left.png)

---

## turn_right()

**Syntax**

`player.turn_right()`

This function is used to have player turn right, altering their direction towards the right of their current direction.

**Example**

```python
player.turn_right()
player.move_forward()
```

This code will have player turn towards the right of their current facing direction and move forward in that direction with the follow up code.

![turn right](assets/codebook/turn_right.png)

---

## position()

**Syntax**

`player.position()`

This function answers where the player stands, as `(x, y)`. x counts the tiles from the left edge of the map and y from the top, both starting at 0. It's a question: it answers at once, and the player doesn't move.

**Example**

```python
x, y = player.position()
print(x, y)
```

This code puts the player's place in two variables and prints it, for example `3 1`.

---

## path_clear()

**Syntax**

`player.path_clear()`

This function answers `True` when the player can take a step forward, and `False` when the tile in front is blocked: a tree, a rock, water, a closed door or the edge of the map. It uses the same check as `move_forward()`, so the two always agree. It's a question: it answers at once, and the player doesn't move.

**Example**

```python
while player.path_clear():
    player.move_forward()
```

This code walks forward until something is in the way, however far that is.

---

## find()

**Syntax**

`player.find(name)`

This function answers where the nearest thing with that name is, as `(x, y)`: an item such as `"coin"`, an element such as `"door"`, a `"boat"`, or a kind of tile such as `"water"` or `"tree"`. Nearest means the fewest steps along the grid. A tile is named after what lies on it, so a coin on grass is a `"coin"`. When there is none, it answers `None`, so `while player.find("coin"):` keeps going until every coin is collected. It's a question: it answers at once, and the player doesn't move.

**Example**

```python
coin_x, coin_y = player.find("coin")
x, y = player.position()
print(coin_x - x, coin_y - y)
```

This code prints how far the nearest coin is across and down from the player.

---

## at_goal()

**Syntax**

`player.at_goal()`

This function answers `True` when the player stands on the star, and `False` when they don't. It's the game's own check for reaching the star. It's a question: it answers at once, and the player doesn't move.

**Example**

```python
while not player.at_goal():
    if player.path_clear():
        player.move_forward()
    else:
        player.turn_right()
```

This code follows the path, turning right at every wall, until the player stands on the star.

---

## facing()

**Syntax**

`player.facing()`

This function answers which way the player is facing: `"up"`, `"down"`, `"left"` or `"right"`. It's a question: it answers at once, and the player doesn't move.

**Example**

```python
while player.facing() != "up":
    player.turn_left()
player.move_forward(3)
```

This code turns until the player faces up, whatever way it started, then walks 3 steps up.

---

## speak()

**Syntax**

`player.speak([string to speak])`

This function is used to have player call out a string that is specified in this function's argument. In game this is expressed by the string being written in the Console Log.

**Example**

```python
player.speak("Hello World")
```

This code will have the phrase "Hello World" written in the Console Log.

![speak](assets/codebook/speak.png)

---

## build()

**Syntax**

`player.build([object to build])`

This function is used to have player build an object that is specified in this function's argument. There is a limited selection of objects that the player can build using this function and there are certain requirements tied to building each object. Objects will be built in front of the player's facing direction provided the area is not occupied by a different object or the object cannot be built in the type of terrain it's being built over.

| Object      | Cost                 | Argument        | Description                              |
| ----------- | -------------------- | --------------- | ---------------------------------------- |
| Bridge      | - 4 wood             | - "bridge"      | - Builds a bridge to walk across water   |
| House       | - 6 wood             | - "house"       | - Builds a 3 x 3 house                   |
| Small house | - 4 wood             | - "house-small" | - Builds a 2 x 2 house                   |
| Shop        | - 6 wood and 5 coins | - "shop"        | - Builds a 3 x 3 shop stand              |
| Small shop  | - 4 wood and 3 coins | - "shop-small"  | - Builds a 2 x 2 shop stand              |

**Example**

```python
player.build("bridge")
```

This code will have player build a bridge in front of the player in the direction they are facing.

![build](assets/codebook/build.png)

---

## water()

**Syntax**

`player.water()`

The function can be used to water objects in game, such as watering crops and refilling water trays. In game this is usually used for farming and homesteading.

**Example**

```python
player.water()
```

Using this code the player can water an object in the direction they are facing.

![water](assets/codebook/water.png)

---

## collect()

**Syntax**

`player.collect()`

This function is used to pick up an item, such as a coin, a gem or a piece of wood, and add it to your inventory. It picks up the item the player is standing on, or else the one in front of them.

**Example**

```python
player.move_forward(2)
player.collect()
```

This code will have the player walk two steps, then pick up the item there.

![collect](assets/codebook/collect.png)

---

## open()

**Syntax**

`player.open()`

This function is used to open doors and containers, this can be useful for crossing entryways or opening containers to pick up or place objects.

**Example**

```python
player.turn_left()
player.open()
player.move_forward()
```

This code will have player turn left to open a door and then cross through it.

![open](assets/codebook/open.png)

---

## close()

**Syntax**

`player.close()`

This function is used to close doors and containers, this can be useful for closing doors behind you or closing a container after you've placed something inside.

**Example**

```python
player.open()
player.collect("item")
player.close()
```

This code will have player open a chest, pick up an item and then close the chest afterwards.

![close](assets/codebook/close.png)

---

## plant()

**Syntax**

`player.plant([crop name])`

This function is used to plant objects in the ground, this is usually reserved for planting crops. It takes 1 argument, the name of the crop, and plants it in the soil in front of the player. If you leave it blank, it plants wheat.

**Example**

```python
player.plant("eggplant")
time.sleep(5)
player.water()
```

In the above code the player plants eggplant in the soil in front of them, waits 5 seconds for the sprout, and then waters it.

![plant](assets/codebook/plant.png)

---