# reshape-ramda
Lenses in Ramda made even easier.

Lenses can be incredibly helpful, but sometimes syntax and ceremony can get in the way. 
The goal of Reshape is to rethink how developers create lenses.

```JavaScript
import { lensFromPattern } from 'reshape-ramda'
import { over } from 'ramda'

// This is a general location update function. In a game, it might be
// used in several places on several kinds of entities.
const updateLocation = ({x, y}) => ({
  x: x + 1,
  y: y - 2,
})

// Here's the first kind of entity
const oldWizard = {
  type: 'player',
  name: 'al',
  class: 'wizard',
  location: {
    xCoord: 5,
    yCoord: 9,
  },
}

// Adapt the entity to work with `updateLocation` with a lens
const playerLocationLens = lensFromPattern({
  location: {
    xCoord: 'x', // Binds the value at this path to the 'x' attribute
    yCoord: 'y',
  },
})

// Do the update (returns a new wizard without changing the old one)
const newWizard = over(playerLocationLens, updateLocation, oldWizard)

/*
newWizard is
{
  type: 'player',
  name: 'al',
  class: 'wizard',
  location: {
    xCoord: 6,
    yCoord: 7,
  },
}


playerLocationLens is a lens from anything implementing
{
  location: {
    xCoord: any,
    yCoord: any,
  },
}

to

{
  x: any,
  y: any,
}

*/

```

Check out the tests for `lensFromPattern`.

## Background
### Pattern matching in reverse

Pattern matching is awesome for getting values out of data structures.
A single pattern can work on an infinite amount of structures - as long as the matched structures have the required pieces.

Interestingly, there's enough information in a pattern to create a setter, too. As long as we know the path to a piece
of a structure, we can get it and set it. Because JavaScript doesn't have easy-to-use macros, Reshape uses objects 
instead of actual pattern matching from ES+.

Now that we can get AND set values using patterns, it's sensical to make lenses with the getters and setters.
A lens not only provides convenient access to getters and setters, it also allows for sweet combinators like
`compose` and `over`.

### Why lenses can be extra useful in JavaScript land

Lenses provide views on data. Lots of people think of them as functional setters and getters,
but if you connect the dots, it's a functional version of the adapter pattern. You can use lenses
to adapt a data structure to work with functions that don't know anything about your data structure.

I think they're especially ripe for improving reusability when working with 
Redux and functions from state to state generally. You can make general 
functions that take simple states and return simple states, then create lenses to adapt your 
store's own state to work with those functions.
