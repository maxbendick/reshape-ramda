'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // @ts-check


var _index = require('./index');

var _ramda = require('ramda');

test('paths', function () {
  expect((0, _index.makePaths)({
    a: { b: 'x' },
    c: 'y'
  })).toEqual({
    x: ['a', 'b'],
    y: ['c']
  });
});

var pattern1 = {
  a: 'alph',
  b: 'better',
  c: {
    x: 'xena',
    y: 'yee'
  }
};

var data1 = {
  a: 1,
  b: 2,
  c: {
    x: 3,
    y: { yeeeah: 4 },
    z: 77,
    zz: {}
  }
};

test('getter', function () {
  var paths = (0, _index.makePaths)(pattern1);
  var getter = (0, _index.makeGetter)(paths);
  var gotten = getter(data1);

  expect(gotten).toEqual({
    alph: 1,
    better: 2,
    xena: 3,
    yee: { yeeeah: 4 }
  });
});

test('setter', function () {
  var paths = (0, _index.makePaths)(pattern1);
  var setter = (0, _index.makeSetter)(paths);
  var newInner = {
    alph: 9,
    better: 8,
    xena: 7,
    yee: { yeeeah: 6 }
  };
  var newOutter = setter(newInner, data1);

  expect(newOutter).toEqual({
    a: 9,
    b: 8,
    c: {
      x: 7,
      y: { yeeeah: 6 },
      z: 77,
      zz: {}
    }
  });
});

test('lens creation', function () {
  var lens = (0, _index.lensFromPattern)(pattern1);

  var update = function update(oldInner) {
    return {
      alph: oldInner.alph + 1,
      better: oldInner.better + 1,
      xena: oldInner.xena + 1,
      yee: oldInner.yee
    };
  };

  var result = (0, _ramda.over)(lens, update, data1);

  expect(result).toEqual({
    a: 1 + 1,
    b: 2 + 1,
    c: {
      x: 3 + 1,
      y: { yeeeah: 4 },
      z: 77,
      zz: {}
    }
  });
});

test('video game example', function () {

  // This is a general location update function. In a game, it might be
  // used in several places on several kinds of entities.
  var updateLocation = function updateLocation(_ref) {
    var x = _ref.x,
        y = _ref.y;
    return {
      x: x + 1,
      y: y - 2
    };
  };

  // Here's the first kind of entity
  var oldWizard = {
    type: 'player',
    name: 'al',
    class: 'wizard',
    location: {
      x: 5,
      y: 9
    }

    // Adapt the entity to work with `updateLocation` with a lens
  };var playerLocationLens = (0, _index.lensFromPattern)({
    location: {
      x: 'x',
      y: 'y'
    }
  });

  // Do the update (returns a new wizard without changing the old one)
  var newWizard = (0, _ramda.over)(playerLocationLens, updateLocation, oldWizard);

  expect(newWizard).toEqual({
    type: 'player',
    name: 'al',
    class: 'wizard',
    location: {
      x: 6,
      y: 7
    }
  });

  // Adapt another kind of entity to work with `updateLocation`
  var oldSwarm = {
    type: 'monster',
    class: 'bee swarm',
    state: {
      centroid: {
        distanceFromTop: 15,
        distanceFromLeft: 20
      }
    }
  };

  var swarmCentroidLens = (0, _index.lensFromPattern)({
    state: {
      centroid: {
        distanceFromTop: 'x',
        distanceFromLeft: 'y'
      }
    }
  });

  var newSwarm = (0, _ramda.over)(swarmCentroidLens, updateLocation, oldSwarm);

  expect(newSwarm).toEqual({
    type: 'monster',
    class: 'bee swarm',
    state: {
      centroid: {
        distanceFromTop: 16,
        distanceFromLeft: 18
      }
    }
  });
});

// More usage example than test
test('Adapt multiple reducers to one state.', function () {

  var createCounterReducer = function createCounterReducer(min, max) {
    return function (state, action) {
      switch (action.type) {
        case 'INCREMENT':
          return _extends({}, state, {
            count: Math.min(state.count + 1, max)
          });

        case 'DECREMENT':
          return _extends({}, state, {
            count: Math.max(state.count - 1, min)
          });

        case 'SET_COUNTER_NAME':
          return _extends({}, state, {
            name: action.name
          });

        default:
          return state;
      }
    };
  };

  var numTabs = 3;
  var counterReducer = createCounterReducer(0, numTabs - 1);

  var tabsReducer = function tabsReducer(state, action) {
    switch (action.type) {
      case 'SELECT_TAB':
        return _extends({}, state, {
          selected: action.tabNumber
        });

      case 'SET_TABS_NAME':
        return _extends({}, state, {
          name: action.name
        });

      default:
        return state;
    }
  };

  var defaultState = {
    selectedTab: 0,
    tabsName: 'the tabs',
    counterInfo: {
      counterName: 'the counter'
    }
  };

  var counterLens = (0, _index.lensFromPattern)({
    counterInfo: {
      counterName: 'name'
    },
    selectedTab: 'count'
  });

  var tabsLens = (0, _index.lensFromPattern)({
    tabsName: 'name',
    selectedTab: 'selected'
  });

  var appReducer = function appReducer(state, action) {

    var partialCounter = function partialCounter(s) {
      return counterReducer(s, action);
    };
    var partialTabs = function partialTabs(s) {
      return tabsReducer(s, action);
    };

    var state1 = (0, _ramda.over)(counterLens, partialCounter, state);
    var state2 = (0, _ramda.over)(tabsLens, partialTabs, state1);
    return state2;
  };

  expect(appReducer(defaultState, { type: 'INCREMENT' })).toEqual(_extends({}, defaultState, {
    selectedTab: 1
  }));

  expect(appReducer(defaultState, { type: 'DECREMENT' })).toEqual(_extends({}, defaultState, {
    selectedTab: 0
  }));

  expect(appReducer(defaultState, { type: 'SET_COUNTER_NAME', name: 'new name' })).toEqual(_extends({}, defaultState, {
    counterInfo: {
      counterName: 'new name'
    }
  }));

  expect(appReducer(defaultState, { type: 'SELECT_TAB', tabNumber: 2 })).toEqual(_extends({}, defaultState, {
    selectedTab: 2
  }));

  expect(appReducer(defaultState, { type: 'SET_TABS_NAME', name: 'the new tabs name' })).toEqual(_extends({}, defaultState, {
    tabsName: 'the new tabs name'
  }));
});