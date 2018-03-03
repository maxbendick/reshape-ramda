// @ts-check
import { makePaths, makeGetter, makeSetter, lensFromPattern } from './index'
import { over } from 'ramda'

test('paths', () => {
  expect(
    makePaths({
      a: { b: 'x' },
      c: 'y'
    })
  ).toEqual(
    {
      x: ['a', 'b'],
      y: ['c'],
    }
  )
})

const pattern1 = {
  a: 'alph',
  b: 'better',
  c: {
    x: 'xena',
    y: 'yee',
  },
}

const data1 = {
  a: 1,
  b: 2,
  c: {
    x: 3,
    y: { yeeeah: 4 },
    z: 77,
    zz: {},
  },
}

test('getter', () => {
  const paths = makePaths(pattern1)
  const getter = makeGetter(paths)
  const gotten = getter(data1)

  expect(gotten).toEqual({
    alph: 1,
    better: 2,
    xena: 3,
    yee: { yeeeah: 4 }
  })
})

test('setter', () => {
  const paths = makePaths(pattern1)
  const setter = makeSetter(paths)
  const newInner = {
    alph: 9,
    better: 8,
    xena: 7,
    yee: { yeeeah: 6 },
  }
  const newOutter = setter(newInner, data1)

  expect(newOutter).toEqual({
    a: 9,
    b: 8,
    c: {
      x: 7,
      y: { yeeeah: 6 },
      z: 77,
      zz: {},
    },
  })
})

test('lens creation', () => {
  const lens = lensFromPattern(pattern1)

  const update = oldInner => ({
    alph: oldInner.alph + 1,
    better: oldInner.better + 1,
    xena: oldInner.xena + 1,
    yee: oldInner.yee,
  })

  const result = over(lens, update, data1)

  expect(result).toEqual({
    a: 1 + 1,
    b: 2 + 1,
    c: {
      x: 3 + 1,
      y: { yeeeah: 4 },
      z: 77,
      zz: {},
    },
  })
})

test('video game example', () => {
  
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
      x: 5,
      y: 9,
    },
  }

  // Adapt the entity to work with `updateLocation` with a lens
  const playerLocationLens = lensFromPattern({
    location: {
      x: 'x',
      y: 'y',
    },
  })

  // Do the update (returns a new wizard without changing the old one)
  const newWizard = over(playerLocationLens, updateLocation, oldWizard)

  expect(newWizard).toEqual({
    type: 'player',
    name: 'al',
    class: 'wizard',
    location: {
      x: 6,
      y: 7,
    },
  })


  // Adapt another kind of entity to work with `updateLocation`
  const oldSwarm = {
    type: 'monster',
    class: 'bee swarm',
    state: {
      centroid: {
        distanceFromTop: 15,
        distanceFromLeft: 20,
      }
    }
  }

  const swarmCentroidLens = lensFromPattern({
    state: {
      centroid: {
        distanceFromTop: 'x',
        distanceFromLeft: 'y',
      }
    }
  })

  const newSwarm = over(swarmCentroidLens, updateLocation, oldSwarm)

  expect(newSwarm).toEqual({
    type: 'monster',
    class: 'bee swarm',
    state: {
      centroid: {
        distanceFromTop: 16,
        distanceFromLeft: 18,
      }
    }
  })
})
