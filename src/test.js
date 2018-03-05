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

// More usage example than test
test('Adapt multiple reducers to one state.', () => {

  const createCounterReducer = (min, max) => (state, action) => {
    switch(action.type) {
      case 'INCREMENT':
        return {
          ...state,
          count: Math.min(state.count + 1, max),
        }

      case 'DECREMENT':
        return {
          ...state,
          count: Math.max(state.count - 1, min),
        }

      case 'SET_COUNTER_NAME':
        return {
          ...state,
          name: action.name,
        }

      default:
        return state
    }
  }

  const numTabs = 3
  const counterReducer = createCounterReducer(0, numTabs - 1)

  const tabsReducer = (state, action) => {
    switch(action.type) {
      case 'SELECT_TAB':
        return {
          ...state,
          selected: action.tabNumber,
        }
      
      case 'SET_TABS_NAME':
        return {
          ...state,
          name: action.name,
        }

      default:
        return state
    }
  }

  const defaultState = {
    selectedTab: 0,
    tabsName: 'the tabs',
    counterInfo: {
      counterName: 'the counter',
    }
  }

  const counterLens = lensFromPattern({
    counterInfo:{
      counterName: 'name'
    },
    selectedTab: 'count',
  })

  const tabsLens = lensFromPattern({
    tabsName: 'name',
    selectedTab: 'selected'
  })

  const appReducer = (state, action) => {

    const partialCounter = s => counterReducer(s, action)
    const partialTabs =    s => tabsReducer(s, action)

    const state1 = over(counterLens, partialCounter, state)
    const state2 = over(tabsLens,    partialTabs,    state1)
    return state2
  }

  expect(appReducer(defaultState, { type: 'INCREMENT' })).toEqual({
    ...defaultState,
    selectedTab: 1,
  })

  expect(appReducer(defaultState, { type: 'DECREMENT' })).toEqual({
    ...defaultState,
    selectedTab: 0,
  })

  expect(appReducer(defaultState, { type: 'SET_COUNTER_NAME', name: 'new name' })).toEqual({
    ...defaultState,
    counterInfo: {
      counterName: 'new name',
    },
  })

  expect(appReducer(defaultState, { type: 'SELECT_TAB', tabNumber: 2 })).toEqual({
    ...defaultState,
    selectedTab: 2
  })

  expect(appReducer(defaultState, { type: 'SET_TABS_NAME', name: 'the new tabs name' })).toEqual({
    ...defaultState,
    tabsName: 'the new tabs name',
  })
})
